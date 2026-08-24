create table if not exists public.community_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  body text not null check (char_length(body) between 1 and 500),
  coin_symbol text null check (coin_symbol is null or char_length(coin_symbol) between 2 and 10),
  created_at timestamptz not null default now()
);

create index if not exists community_messages_created_at_idx on public.community_messages(created_at desc);
create index if not exists community_messages_user_id_idx on public.community_messages(user_id);

alter table public.community_messages enable row level security;

drop policy if exists "community messages are readable" on public.community_messages;
create policy "community messages are readable"
on public.community_messages for select
to anon, authenticated
using (true);

drop policy if exists "authenticated users can post their own messages" on public.community_messages;
create policy "authenticated users can post their own messages"
on public.community_messages for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can delete their own messages" on public.community_messages;
create policy "users can delete their own messages"
on public.community_messages for delete
to authenticated
using (auth.uid() = user_id);

-- Realtime publication. Safe when the table is not already included.
do $$
begin
  alter publication supabase_realtime add table public.community_messages;
exception when duplicate_object then
  null;
end $$;
