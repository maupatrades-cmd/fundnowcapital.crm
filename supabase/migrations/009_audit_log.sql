-- 009 — audit_log + generic trigger for leads, businesses, documents, commissions
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null check (action in ('insert','update','delete')),
  entity_type text not null,
  entity_id uuid,
  changes jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index audit_log_entity_idx on public.audit_log(entity_type, entity_id);
create index audit_log_user_idx on public.audit_log(user_id);
create index audit_log_created_at_idx on public.audit_log(created_at desc);

create or replace function app.audit_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_action text;
  v_entity_id uuid;
  v_changes jsonb;
begin
  if tg_op = 'INSERT' then
    v_action := 'insert';
    v_entity_id := (to_jsonb(new) ->> 'id')::uuid;
    v_changes := to_jsonb(new);
  elsif tg_op = 'UPDATE' then
    v_action := 'update';
    v_entity_id := (to_jsonb(new) ->> 'id')::uuid;
    v_changes := jsonb_build_object('before', to_jsonb(old), 'after', to_jsonb(new));
  else
    v_action := 'delete';
    v_entity_id := (to_jsonb(old) ->> 'id')::uuid;
    v_changes := to_jsonb(old);
  end if;

  insert into public.audit_log (user_id, action, entity_type, entity_id, changes)
  values (auth.uid(), v_action, tg_table_name, v_entity_id, v_changes);

  return coalesce(new, old);
end;
$$;

create trigger leads_audit
  after insert or update or delete on public.leads
  for each row execute function app.audit_trigger();

create trigger businesses_audit
  after insert or update or delete on public.businesses
  for each row execute function app.audit_trigger();

create trigger documents_audit
  after insert or update or delete on public.documents
  for each row execute function app.audit_trigger();

create trigger commissions_audit
  after insert or update or delete on public.commissions
  for each row execute function app.audit_trigger();
