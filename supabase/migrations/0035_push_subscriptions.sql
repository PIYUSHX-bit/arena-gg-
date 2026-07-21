-- ARENA.GG — Web push subscriptions
-- Run after 0034_leaderboard_avatar_and_id.sql
--
-- Broadcasts (0027) only ever wrote a row into `notifications` — a
-- player had to open the app to see it. This table lets the app
-- register the browser's push endpoint so an Edge Function can deliver
-- an actual OS-level notification to the device, app open or not.

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

create policy "Users can view their own push subscriptions"
  on push_subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own push subscriptions"
  on push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own push subscriptions"
  on push_subscriptions for delete
  using (auth.uid() = user_id);

create index if not exists idx_push_subscriptions_user on push_subscriptions(user_id);
