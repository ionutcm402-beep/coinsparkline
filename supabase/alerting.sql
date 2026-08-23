create extension if not exists pgcrypto;

create table if not exists public.alert_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  coin_id text not null,
  type text not null check (type in ('regime-change','enters-awakening','enters-volatile','spark-above')),
  threshold integer,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, coin_id, type)
);

create table if not exists public.alert_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rule_id uuid references public.alert_rules(id) on delete cascade,
  coin_id text not null,
  title text not null,
  body text not null,
  event_key text not null,
  delivered_email boolean not null default false,
  created_at timestamptz not null default now(),
  unique(user_id, event_key)
);

alter table public.alert_rules enable row level security;
alter table public.alert_events enable row level security;

create policy "Users read own alert rules" on public.alert_rules for select using (auth.uid() = user_id);
create policy "Users insert own alert rules" on public.alert_rules for insert with check (auth.uid() = user_id);
create policy "Users update own alert rules" on public.alert_rules for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own alert rules" on public.alert_rules for delete using (auth.uid() = user_id);
create policy "Users read own alert events" on public.alert_events for select using (auth.uid() = user_id);

create index if not exists alert_rules_user_idx on public.alert_rules(user_id);
create index if not exists alert_rules_coin_idx on public.alert_rules(coin_id) where enabled = true;
create index if not exists alert_events_user_created_idx on public.alert_events(user_id, created_at desc);
