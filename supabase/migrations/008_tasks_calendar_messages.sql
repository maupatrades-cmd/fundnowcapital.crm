-- 008 — tasks, calendar_events, messages
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  due_date timestamptz,
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  status text not null default 'todo' check (status in ('todo','in_progress','done','cancelled')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_assigned_to_idx on public.tasks(assigned_to);
create index tasks_status_idx on public.tasks(status);
create index tasks_due_date_idx on public.tasks(due_date);

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function app.set_updated_at();

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz,
  event_type text not null check (event_type in (
    'meeting','call','follow_up','submission_deadline','payment_due','personal'
  )),
  reminder_minutes_before int default 30,
  created_at timestamptz not null default now()
);

create index calendar_events_user_id_idx on public.calendar_events(user_id);
create index calendar_events_start_time_idx on public.calendar_events(start_time);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid references public.profiles(id) on delete set null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index messages_lead_id_idx on public.messages(lead_id);
create index messages_sender_id_idx on public.messages(sender_id);
create index messages_recipient_id_idx on public.messages(recipient_id);
