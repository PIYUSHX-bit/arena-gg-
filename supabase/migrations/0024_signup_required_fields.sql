-- ARENA.GG — Required signup fields (phone, Free Fire IGN/UID)
-- Run after 0023_pay_entry_prize_guards.sql

alter table profiles
  add column if not exists phone_number text;

-- Updates the existing signup trigger (from 0003_profiles.sql) to also
-- capture phone_number, ff_ign, and ff_uid from signup metadata, not
-- just display_name. Google OAuth signups won't have these in metadata
-- (Google doesn't know your Free Fire UID) — they'll come through as
-- null, which the frontend's ProfileCompletionGuard checks for and
-- blocks access until filled in.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, phone_number, ff_ign, ff_uid)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'Player'),
    new.raw_user_meta_data->>'phone_number',
    new.raw_user_meta_data->>'ff_ign',
    new.raw_user_meta_data->>'ff_uid'
  );

  insert into public.wallets (id, balance)
  values (new.id, 0);

  return new;
end;
$$ language plpgsql security definer set search_path = public;
