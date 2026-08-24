-- Mirrors the live production migration applied on 2026-08-24.
-- Tightens Data API grants and adds abuse controls for chat and alert tests.

revoke all on table public.alert_rules from anon;
revoke all on table public.alert_events from anon;
revoke all on table public.community_messages from anon, authenticated;

grant select on table public.community_messages to anon, authenticated;
grant insert, delete on table public.community_messages to authenticated;
grant select, insert, update, delete on table public.alert_rules to authenticated;
grant select on table public.alert_events to authenticated;

drop policy if exists "Users read own alert rules" on public.alert_rules;
drop policy if exists "Users insert own alert rules" on public.alert_rules;
drop policy if exists "Users update own alert rules" on public.alert_rules;
drop policy if exists "Users delete own alert rules" on public.alert_rules;
drop policy if exists "Users read own alert events" on public.alert_events;

create policy "Users read own alert rules"
on public.alert_rules for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users insert own alert rules"
on public.alert_rules for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users update own alert rules"
on public.alert_rules for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users delete own alert rules"
on public.alert_rules for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users read own alert events"
on public.alert_events for select
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.enforce_community_message_rate_limit()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  actor uuid := auth.uid();
  recent_10s integer;
  recent_5m integer;
begin
  if actor is null or actor <> new.user_id then
    raise exception 'Not authorized to post this message';
  end if;

  select count(*) into recent_10s
  from public.community_messages
  where user_id = actor and created_at >= now() - interval '10 seconds';

  if recent_10s >= 5 then
    raise exception 'Message rate limit exceeded. Please wait a few seconds.';
  end if;

  select count(*) into recent_5m
  from public.community_messages
  where user_id = actor and created_at >= now() - interval '5 minutes';

  if recent_5m >= 30 then
    raise exception 'Message rate limit exceeded. Please try again later.';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_community_message_rate_limit() from public;

drop trigger if exists community_messages_rate_limit on public.community_messages;
create trigger community_messages_rate_limit
before insert on public.community_messages
for each row execute function public.enforce_community_message_rate_limit();

create table if not exists public.alert_test_requests (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.alert_test_requests enable row level security;
revoke all on table public.alert_test_requests from anon, authenticated;
create index if not exists alert_test_requests_user_created_idx
  on public.alert_test_requests(user_id, created_at desc);
