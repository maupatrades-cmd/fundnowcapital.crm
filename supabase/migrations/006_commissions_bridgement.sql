-- 006 — commissions, bridgement tier tracker, business_funding referrals
create table public.commissions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  funder_submission_id uuid references public.funder_submissions(id) on delete set null,
  funder_id text not null references public.funders(id),
  funded_amount numeric,
  basis text not null check (basis in (
    'pct_funded','pct_margin','pct_interest','pct_profit',
    'flat_per_approval','tiered_funded','pct_their_commission'
  )),
  rate numeric,
  base_amount numeric,
  gross_commission numeric not null default 0,
  per_approval_bonus numeric not null default 0,
  vat_inclusive boolean not null default true,
  vat numeric not null default 0,
  net_commission numeric not null default 0,
  total_due numeric not null default 0,
  invoice_number text,
  invoice_issued_at date,
  expected_payment_date date,
  paid_at date,
  paid_amount numeric,
  payment_reference text,
  status text not null default 'pending' check (status in (
    'pending','invoiced','overdue','paid','short_paid','disputed'
  )),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index commissions_funder_id_idx on public.commissions(funder_id);
create index commissions_status_idx on public.commissions(status);
create index commissions_paid_at_idx on public.commissions(paid_at);

create trigger commissions_set_updated_at
  before update on public.commissions
  for each row execute function app.set_updated_at();

create table public.bridgement_book_size (
  id int primary key default 1 check (id = 1),
  cumulative_funded numeric not null default 0,
  current_tier text not null default 'Bronze' check (current_tier in ('Bronze','Silver','Gold')),
  last_updated timestamptz not null default now()
);
insert into public.bridgement_book_size (id, cumulative_funded, current_tier) values (1, 0, 'Bronze');

create or replace function app.recompute_bridgement_tier()
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_total numeric;
  v_tier text;
begin
  select coalesce(sum(funded_amount), 0) into v_total
  from public.funder_submissions
  where funder_id = 'bridgement' and status = 'funded';

  if v_total < 1000000 then v_tier := 'Bronze';
  elsif v_total < 4000000 then v_tier := 'Silver';
  else v_tier := 'Gold';
  end if;

  update public.bridgement_book_size
  set cumulative_funded = v_total, current_tier = v_tier, last_updated = now()
  where id = 1;
end;
$$;

create or replace function app.trg_recompute_bridgement_tier()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (tg_op = 'DELETE' and old.funder_id = 'bridgement')
     or (tg_op in ('INSERT','UPDATE') and new.funder_id = 'bridgement') then
    perform app.recompute_bridgement_tier();
  end if;
  return null;
end;
$$;

create trigger funder_submissions_bridgement_tier
  after insert or update or delete on public.funder_submissions
  for each row execute function app.trg_recompute_bridgement_tier();

create table public.business_funding_referrals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  their_funder_used text,
  their_commission_amount numeric,
  our_share_pct numeric not null default 45,
  our_commission numeric,
  status text check (status in ('pending','confirmed','paid')) default 'pending',
  paid_at date,
  created_at timestamptz not null default now()
);
