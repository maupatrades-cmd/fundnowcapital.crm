-- 013 — Dashboard KPI aggregation as a single RPC (admin only)
create or replace function public.dashboard_stats()
returns table (
  open_leads bigint,
  submitted_this_week bigint,
  funded_mtd_amount numeric,
  funded_mtd_count bigint,
  commission_mtd_total numeric,
  commission_pending_total numeric,
  bridgement_book_size numeric,
  bridgement_tier text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not app.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return query
  with
    week_start as (select date_trunc('week', now()) as ts),
    month_start as (select date_trunc('month', now()) as ts)
  select
    (select count(*) from public.leads
       where status not in ('disbursed','closed_lost','declined'))::bigint as open_leads,
    (select count(*) from public.funder_submissions, week_start
       where submitted_at >= week_start.ts)::bigint as submitted_this_week,
    coalesce((select sum(funded_amount) from public.funder_submissions, month_start
       where status = 'funded' and funded_at >= month_start.ts::date), 0)::numeric as funded_mtd_amount,
    (select count(*) from public.funder_submissions, month_start
       where status = 'funded' and funded_at >= month_start.ts::date)::bigint as funded_mtd_count,
    coalesce((select sum(total_due) from public.commissions, month_start
       where created_at >= month_start.ts), 0)::numeric as commission_mtd_total,
    coalesce((select sum(total_due) from public.commissions
       where status in ('pending','invoiced','overdue')), 0)::numeric as commission_pending_total,
    coalesce((select cumulative_funded from public.bridgement_book_size where id = 1), 0)::numeric as bridgement_book_size,
    coalesce((select current_tier from public.bridgement_book_size where id = 1), 'Bronze')::text as bridgement_tier;
end;
$$;

revoke all on function public.dashboard_stats() from public;
grant execute on function public.dashboard_stats() to authenticated;
