create table if not exists public.intelligence_events (
  id bigint generated always as identity primary key,
  asset_class text not null check (asset_class in ('crypto','nft','fx','commodity','stock')),
  asset_id text not null,
  symbol text not null,
  name text not null,
  event_type text not null check (event_type in ('regime_change','tier_change','spark_cross','spark_jump','confidence_jump')),
  title text not null,
  body text not null,
  previous_value double precision,
  current_value double precision,
  previous_state text,
  current_state text,
  importance integer not null default 50 check (importance between 0 and 100),
  event_key text not null unique,
  created_at timestamptz not null default now()
);

alter table public.intelligence_events enable row level security;
revoke all on table public.intelligence_events from anon, authenticated;
create index if not exists intelligence_events_created_idx on public.intelligence_events(created_at desc);
create index if not exists intelligence_events_asset_idx on public.intelligence_events(asset_class, asset_id, created_at desc);
create index if not exists intelligence_events_importance_idx on public.intelligence_events(importance desc, created_at desc);
