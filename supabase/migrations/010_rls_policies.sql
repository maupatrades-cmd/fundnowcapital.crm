-- 010 — Enable RLS + policies on every public table
alter table public.profiles                  enable row level security;
alter table public.businesses                enable row level security;
alter table public.directors                 enable row level security;
alter table public.funders                   enable row level security;
alter table public.leads                     enable row level security;
alter table public.funder_submissions        enable row level security;
alter table public.commissions               enable row level security;
alter table public.documents                 enable row level security;
alter table public.tasks                     enable row level security;
alter table public.calendar_events           enable row level security;
alter table public.messages                  enable row level security;
alter table public.audit_log                 enable row level security;
alter table public.bridgement_book_size      enable row level security;
alter table public.business_funding_referrals enable row level security;

-- profiles
create policy profiles_self_select on public.profiles
  for select to authenticated using (id = (select auth.uid()) or app.is_admin());
create policy profiles_self_update on public.profiles
  for update to authenticated using (id = (select auth.uid()) or app.is_admin())
  with check (id = (select auth.uid()) or app.is_admin());
create policy profiles_admin_all on public.profiles
  for all to authenticated using (app.is_admin()) with check (app.is_admin());

-- businesses
create policy businesses_admin_all on public.businesses
  for all to authenticated using (app.is_admin()) with check (app.is_admin());
create policy businesses_client_read on public.businesses
  for select to authenticated using (client_id = (select auth.uid()));
create policy businesses_client_insert on public.businesses
  for insert to authenticated with check (client_id = (select auth.uid()));
create policy businesses_client_update on public.businesses
  for update to authenticated using (client_id = (select auth.uid()))
  with check (client_id = (select auth.uid()));

-- directors
create policy directors_admin_all on public.directors
  for all to authenticated using (app.is_admin()) with check (app.is_admin());
create policy directors_client_via_business on public.directors
  for all to authenticated
  using (exists (select 1 from public.businesses b where b.id = directors.business_id and b.client_id = (select auth.uid())))
  with check (exists (select 1 from public.businesses b where b.id = directors.business_id and b.client_id = (select auth.uid())));

-- funders (everyone authenticated reads; admin writes)
create policy funders_read_all on public.funders
  for select to authenticated using (true);
create policy funders_admin_write on public.funders
  for all to authenticated using (app.is_admin()) with check (app.is_admin());

-- leads
create policy leads_admin_all on public.leads
  for all to authenticated using (app.is_admin()) with check (app.is_admin());
create policy leads_client_own on public.leads
  for select to authenticated using (client_id = (select auth.uid()));
create policy leads_consultant_own on public.leads
  for select to authenticated using (consultant_id = (select auth.uid()));

-- funder_submissions
create policy funder_submissions_admin_all on public.funder_submissions
  for all to authenticated using (app.is_admin()) with check (app.is_admin());
create policy funder_submissions_client_read on public.funder_submissions
  for select to authenticated
  using (exists (select 1 from public.leads l where l.id = funder_submissions.lead_id and l.client_id = (select auth.uid())));

-- commissions (admin only)
create policy commissions_admin_all on public.commissions
  for all to authenticated using (app.is_admin()) with check (app.is_admin());

-- documents
create policy documents_admin_all on public.documents
  for all to authenticated using (app.is_admin()) with check (app.is_admin());
create policy documents_client_own on public.documents
  for all to authenticated
  using (client_id = (select auth.uid()))
  with check (client_id = (select auth.uid()));

-- tasks
create policy tasks_admin_all on public.tasks
  for all to authenticated using (app.is_admin()) with check (app.is_admin());
create policy tasks_assignee on public.tasks
  for select to authenticated using (assigned_to = (select auth.uid()));

-- calendar_events
create policy calendar_events_admin_all on public.calendar_events
  for all to authenticated using (app.is_admin()) with check (app.is_admin());
create policy calendar_events_own on public.calendar_events
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- messages
create policy messages_admin_all on public.messages
  for all to authenticated using (app.is_admin()) with check (app.is_admin());
create policy messages_participant on public.messages
  for select to authenticated
  using (sender_id = (select auth.uid()) or recipient_id = (select auth.uid()));
create policy messages_insert_as_self on public.messages
  for insert to authenticated with check (sender_id = (select auth.uid()));

-- audit_log (admin read only; trigger writes via SECURITY DEFINER)
create policy audit_log_admin_read on public.audit_log
  for select to authenticated using (app.is_admin());

-- bridgement_book_size
create policy bridgement_book_size_admin on public.bridgement_book_size
  for all to authenticated using (app.is_admin()) with check (app.is_admin());

-- business_funding_referrals
create policy business_funding_referrals_admin on public.business_funding_referrals
  for all to authenticated using (app.is_admin()) with check (app.is_admin());
