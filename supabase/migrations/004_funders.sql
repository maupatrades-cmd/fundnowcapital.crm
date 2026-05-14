-- 004 — funders reference table
create table public.funders (
  id text primary key,
  name text not null,
  active boolean not null default true,
  funding_types text[] not null default '{}',
  min_amount numeric,
  max_amount numeric,
  min_turnover numeric,
  min_trading_months int,
  turnaround_hours int,
  commission_basis text not null check (commission_basis in (
    'pct_funded', 'pct_margin', 'pct_interest', 'pct_profit',
    'flat_per_approval', 'tiered_funded', 'pct_their_commission'
  )),
  commission_rate numeric,
  commission_notes text,
  contact_email text,
  contact_phone text,
  partnership_manager text,
  contract_signed boolean not null default false,
  contract_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger funders_set_updated_at
  before update on public.funders
  for each row execute function app.set_updated_at();
