-- ARENA.GG — Lower referral bonus from ₹10 to ₹5
-- Run after 0042_match_vote_counts_access_guard.sql

create or replace function redeem_referral_code(p_code text)
returns void as $$
declare
  v_user_id uuid := auth.uid();
  v_already_referred uuid;
  v_referrer_id uuid;
  v_bonus integer := 5; -- rupees, adjust freely
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
