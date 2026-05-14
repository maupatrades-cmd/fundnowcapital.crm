-- 015 — app.create_full_lead RPC + public.create_full_lead PostgREST proxy
-- Atomic admin-only insert: auth.users + profile + business + directors + lead + initial task.
-- Encrypts id_numbers and bank_account_number server-side via app.encrypt_pii.
create or replace function app.create_full_lead(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_client_id uuid;
  v_business_id uuid;
  v_lead_id uuid;
  v_lead_ref text;
  v_director jsonb;
  v_email text;
begin
  if not app.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  v_email := nullif(p_payload->'client'->>'email', '');

  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change,
    email_change_token_new, recovery_token
  ) values (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    v_email,
    extensions.crypt(encode(extensions.gen_random_bytes(24), 'hex'), extensions.gen_salt('bf')),
    null,
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'full_name', p_payload->'client'->>'full_name',
      'role', 'client'
    ),
    now(), now(), '', '', '', ''
  ) returning id into v_client_id;

  update public.profiles
  set
    full_name = p_payload->'client'->>'full_name',
    phone = p_payload->'client'->>'phone',
    email = v_email,
    province = p_payload->'client'->>'province',
    marital_status = nullif(p_payload->'client'->>'marital_status', ''),
    physical_address = p_payload->'client'->>'physical_address',
    id_number = app.encrypt_pii(p_payload->'client'->>'id_number')
  where id = v_client_id;

  insert into public.businesses (
    client_id, registered_name, trading_name, cipc_number, vat_number,
    industry, province, city, trading_address, operating_address,
    date_business_started, num_employees, monthly_turnover, annual_turnover,
    monthly_net_profit, bank_name, account_type, account_holder_name,
    bank_account_number, bank_branch_code,
    has_existing_finance, existing_finance_lender, existing_finance_balance,
    existing_finance_monthly, business_logo_url, description
  ) values (
    v_client_id,
    p_payload->'business'->>'registered_name',
    nullif(p_payload->'business'->>'trading_name', ''),
    nullif(p_payload->'business'->>'cipc_number', ''),
    nullif(p_payload->'business'->>'vat_number', ''),
    nullif(p_payload->'business'->>'industry', ''),
    nullif(p_payload->'business'->>'province', ''),
    nullif(p_payload->'business'->>'city', ''),
    nullif(p_payload->'business'->>'trading_address', ''),
    nullif(p_payload->'business'->>'operating_address', ''),
    nullif(p_payload->'business'->>'date_business_started', '')::date,
    nullif(p_payload->'business'->>'num_employees', '')::int,
    nullif(p_payload->'business'->>'monthly_turnover', '')::numeric,
    nullif(p_payload->'business'->>'annual_turnover', '')::numeric,
    nullif(p_payload->'business'->>'monthly_net_profit', '')::numeric,
    nullif(p_payload->'business'->>'bank_name', ''),
    nullif(p_payload->'business'->>'account_type', ''),
    nullif(p_payload->'business'->>'account_holder_name', ''),
    app.encrypt_pii(p_payload->'business'->>'bank_account_number'),
    nullif(p_payload->'business'->>'bank_branch_code', ''),
    coalesce((p_payload->'business'->>'has_existing_finance')::boolean, false),
    nullif(p_payload->'business'->>'existing_finance_lender', ''),
    nullif(p_payload->'business'->>'existing_finance_balance', '')::numeric,
    nullif(p_payload->'business'->>'existing_finance_monthly', '')::numeric,
    nullif(p_payload->'business'->>'business_logo_url', ''),
    nullif(p_payload->'business'->>'description', '')
  ) returning id into v_business_id;

  for v_director in select * from jsonb_array_elements(coalesce(p_payload->'directors', '[]'::jsonb))
  loop
    insert into public.directors (
      business_id, full_name, id_number, role, shareholding_pct,
      email, phone, is_signatory
    ) values (
      v_business_id,
      v_director->>'full_name',
      app.encrypt_pii(v_director->>'id_number'),
      nullif(v_director->>'role', ''),
      nullif(v_director->>'shareholding_pct', '')::numeric,
      nullif(v_director->>'email', ''),
      nullif(v_director->>'phone', ''),
      coalesce((v_director->>'is_signatory')::boolean, false)
    );
  end loop;

  insert into public.leads (
    client_id, business_id, source, consultant_id, funding_type,
    funding_amount, funding_purpose, urgency, preferred_term_months,
    priority, notes
  ) values (
    v_client_id, v_business_id,
    p_payload->'lead'->>'source',
    nullif(p_payload->'lead'->>'consultant_id', '')::uuid,
    p_payload->'lead'->>'funding_type',
    (p_payload->'lead'->>'funding_amount')::numeric,
    nullif(p_payload->'lead'->>'funding_purpose', ''),
    nullif(p_payload->'lead'->>'urgency', ''),
    nullif(p_payload->'lead'->>'preferred_term_months', '')::int,
    coalesce(nullif(p_payload->'lead'->>'priority', ''), 'medium'),
    nullif(p_payload->'lead'->>'notes', '')
  ) returning id, ref_code into v_lead_id, v_lead_ref;

  insert into public.tasks (lead_id, assigned_to, title, priority)
  values (v_lead_id, auth.uid(), 'Review documents and recommend funders', 'high');

  return jsonb_build_object(
    'lead_id', v_lead_id,
    'ref_code', v_lead_ref,
    'client_id', v_client_id,
    'business_id', v_business_id
  );
end;
$$;

revoke all on function app.create_full_lead(jsonb) from public;
grant execute on function app.create_full_lead(jsonb) to authenticated;

-- PostgREST proxy in public schema (PostgREST only exposes public schema RPCs by default)
create or replace function public.create_full_lead(p_payload jsonb)
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select app.create_full_lead(p_payload);
$$;

revoke all on function public.create_full_lead(jsonb) from public;
grant execute on function public.create_full_lead(jsonb) to authenticated;
