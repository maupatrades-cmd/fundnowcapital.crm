-- 005 — leads + funder_submissions
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  ref_code text unique not null,
  client_id uuid references public.profiles(id) on delete set null,
  business_id uuid references public.businesses(id) on delete set null,
  source text not null check (source in (
    'client_portal','admin_manual','consultant_referral','marketing_io','website_form'
  )),
  consultant_id uuid references public.profiles(id) on delete set null,
  funding_type text not null check (funding_type in (
    'working_capital','merchant_cash_advance','purchase_order_finance',
    'invoice_discounting','asset_finance','equipment_finance',
    'property_finance','bridging_finance','growth_capital'
  )),
  funding_amount numeric not null,
  funding_purpose text,
  urgency text check (urgency in ('within_24h','one_week','two_weeks','one_month','flexible')),
  preferred_term_months int,
  status text not null default 'new' check (status in (
    'new','documents_pending','under_review','submitted_to_funder',
    'funder_review','approved','declined','disbursed','closed_lost'
  )),
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_status_idx on public.leads(status);
create index leads_client_id_idx on public.leads(client_id);
create index leads_consultant_id_idx on public.leads(consultant_id);
create index leads_created_at_idx on public.leads(created_at desc);

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function app.set_updated_at();

create or replace function app.generate_ref_code()
returns text
language plpgsql
set search_path = ''
as $$
declare
  v_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  v_letters text;
  v_digits text;
  v_ref text;
  v_exists boolean;
begin
  loop
    v_letters :=
      substr(v_chars, 1 + floor(random()*length(v_chars))::int, 1) ||
      substr(v_chars, 1 + floor(random()*length(v_chars))::int, 1) ||
      substr(v_chars, 1 + floor(random()*length(v_chars))::int, 1);
    v_digits := lpad(floor(random()*10000)::text, 4, '0');
    v_ref := 'FNC-' || v_letters || v_digits;
    select exists(select 1 from public.leads where ref_code = v_ref) into v_exists;
    exit when not v_exists;
  end loop;
  return v_ref;
end;
$$;

create or replace function app.set_lead_ref_code()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.ref_code is null or new.ref_code = '' then
    new.ref_code := app.generate_ref_code();
  end if;
  return new;
end;
$$;

create trigger leads_set_ref_code
  before insert on public.leads
  for each row execute function app.set_lead_ref_code();

create table public.funder_submissions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  funder_id text not null references public.funders(id),
  submitted_at timestamptz,
  submitted_by uuid references public.profiles(id) on delete set null,
  status text not null default 'preparing' check (status in (
    'preparing','submitted','in_credit_review','request_info',
    'approved','declined','funded','expired'
  )),
  funder_reference text,
  funded_amount numeric,
  funded_at date,
  margin_or_fee numeric,
  decline_reason text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index funder_submissions_lead_id_idx on public.funder_submissions(lead_id);
create index funder_submissions_funder_id_idx on public.funder_submissions(funder_id);
create index funder_submissions_status_idx on public.funder_submissions(status);

create trigger funder_submissions_set_updated_at
  before update on public.funder_submissions
  for each row execute function app.set_updated_at();
