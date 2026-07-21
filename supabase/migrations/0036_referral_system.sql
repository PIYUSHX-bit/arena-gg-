-- ARENA.GG — Referral system (doubles as the invite gate)
-- Run after 0035_push_subscriptions.sql

alter table profiles
  add column if not exists referral_code text unique,
  add column if not exists referred_by uuid references profiles(id);

-- Allow the new wallet_transactions type
alter table wallet_transactions
  drop constraint if exists wallet_transactions_type_check,
  add constraint wallet_transactions_type_check
    check (type in ('deposit', 'tournament_entry', 'prize_payout', 'withdrawal', 'refund', 'adjustment', 'referral_bonus'));

-- Short, unique-enough code derived from the user's own id — no separate
-- generation/collision-retry logic needed, the id is already unique.
create or replace function generate_referral_code(p_user_id uuid)
returns text as $$
  select upper(substr(replace(p_user_id::text, '-', ''), 1, 6));
$$ language sql immutable;

-- Give every existing account a code (anyone who signed up before this
-- migration, including your own admin account).
update profiles
set referral_code = generate_referral_code(id)
where referral_code is null;

-- Extend the signup trigger to also assign a code to brand-new accounts.
-- Deliberately does NOT touch referred_by or enforce a code at signup —
-- that gate lives in redeem_referral_code() below instead, since Google
-- OAuth signups have no way to submit a code during account creation.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, phone_number, ff_ign, ff_uid, referral_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'Player'),
    new.raw_user_meta_data->>'phone_number',
    new.raw_user_meta_data->>'ff_ign',
    new.raw_user_meta_data->>'ff_uid',
    generate_referral_code(new.id)
  );

  insert into public.wallets (id, balance)
  values (new.id, 0);

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- ── redeem_referral_code ─────────────────────────────────────
-- This is the actual gate: the frontend blocks access to /dashboard
-- until this succeeds. Idempotent — once redeemed, calling again fails
-- cleanly rather than farming bonuses twice.
create or replace function redeem_referral_code(p_code text)
returns void as $$
declare
  v_user_id uuid := auth.uid();
  v_already_referred uuid;
  v_referrer_id uuid;
  v_bonus integer := 10; -- rupees, adjust freely
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select referred_by into v_already_referred from profiles where id = v_user_id;
  if v_already_referred is not null then
    raise exception 'You have already redeemed a referral code';
  end if;

  select id into v_referrer_id from profiles where referral_code = upper(trim(p_code));
  if v_referrer_id is null then
    raise exception 'Invalid referral code';
  end if;
  if v_referrer_id = v_user_id then
    raise exception 'You cannot use your own referral code';
  end if;

  update profiles set referred_by = v_referrer_id where id = v_user_id;

  insert into wallet_transactions (user_id, amount, type, reference, description)
  values
    (v_user_id, v_bonus, 'referral_bonus', v_referrer_id::text, 'Referral signup bonus'),
    (v_referrer_id, v_bonus, 'referral_bonus', v_user_id::text, 'Referred a new player');
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function redeem_referral_code(text) to authenticated;
