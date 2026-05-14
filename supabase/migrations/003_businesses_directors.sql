-- 003 — businesses + directors
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id) on delete cascade,
  trading_name text,
  registered_name text not null,
  cipc_number text,
  vat_number text,
  industry text,
  province text,
  city text,
  trading_address text,
  operating_address text,
  date_business_started date,
  years_trading numeric,
  monthly_turnover numeric,
  annual_turnover numeric,
  monthly_net_profit numeric,
  num_employees int,
  bank_name text,
  account_type text check (account_type in ('cheque','savings','business')),
  account_holder_name text,
  bank_account_number bytea, -- encrypted
  bank_branch_code text,
  has_existing_finance boolean default false,
  existing_finance_lender text,
  existing_finance_balance numeric,
  existing_finance_monthly numeric,
  business_logo_url text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index businesses_client_id_idx on public.businesses(client_id);

create trigger businesses_set_updated_at
  before update on public.businesses
  for each row execute function app.set_updated_at();

create table public.directors (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  full_name text not null,
  id_number bytea, -- encrypted
  role text check (role in ('director','member','shareholder')),
  shareholding_pct numeric check (shareholding_pct >= 0 and shareholding_pct <= 100),
  email text,
  phone text,
  is_signatory boolean default false,
  created_at timestamptz not null default now()
);

create index directors_business_id_idx on public.directors(business_id);
