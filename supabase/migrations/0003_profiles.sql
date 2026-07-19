-- ARENA.GG — Profile system
-- Run in Supabase SQL editor after schema.sql and 0002_add_razorpay_order_id.sql

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Player',
  ff_ign text,           -- Free Fire in-game name — prefills registration forms
  ff_uid text,           -- Free Fire numeric UID
  avatar_color text not null default '#FF4A1C', -- used for the initials avatar
  important_notice_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Public read: profile display names show up on the leaderboard and in
-- match rosters, so anyone needs to be able to look them up.
create policy "Profiles are publicly readable"
  on profiles for select
  using (true);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- ── Auto-create a profile row whenever someone signs up ────────
-- Pulls display_name out of the signup metadata (set in AuthContext's
-- signUp call) so email signups get a real name instead of "Player".
-- Phone OTP signups have no metadata, so they fall back to the default
-- and can set a name from the profile page afterward.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'Player')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();

-- Keep updated_at current on every edit
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profile_updated
  before update on profiles
  for each row
  execute function set_updated_at();

-- Backfill: anyone who signed up before this migration existed has no
-- profile row yet. Safe to run even if profiles already exist.
insert into profiles (id, display_name)
select id, coalesce(raw_user_meta_data->>'display_name', 'Player')
from auth.users
on conflict (id) do nothing;

