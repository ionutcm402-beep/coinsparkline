drop policy if exists "authenticated users can post their own messages" on public.community_messages;
create policy "authenticated users can post their own messages"
on public.community_messages for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "users can delete their own messages" on public.community_messages;
create policy "users can delete their own messages"
on public.community_messages for delete to authenticated
using ((select auth.uid()) = user_id);

create index if not exists alert_events_rule_id_idx on public.alert_events(rule_id);
