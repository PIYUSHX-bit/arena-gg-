-- ARENA.GG — Google Play gift card redemption
-- Run after the latest existing migration
--
-- No API exists for generating real Google Play codes — this manages an
-- admin-purchased inventory instead. A code either exists in stock or it
-- doesn't, so redemption can be instant and atomic, unlike withdrawals
-- (which need manual UPI payout and are reversible on rejection).

create table if not exists gift_card_codes (
  id uuid primary key default gen_random_uuid(),
  denomination integer not null, -- rupees, e.g. 200, 500, 1000
  code text not null,
  status text not null default 'available' check (status in ('available', 'assigned')),
  assigned_to_user_id uuid references auth.users(id),
  assigned_at timestamptz,
  created_at timestamptz not null default now()
);

alter table gift_card_codes enable row level security;

-- Admins can see everything (stock levels, who got what, for support).
create policy "Admins can view all gift card codes"
  on gift_card_codes for select
  using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can insert gift card codes"
  on gift_card_codes for insert
  with check (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- Regular users can only ever see codes assigned specifically to them —
-- never anyone else's, never the unassigned pool.
create policy "Users can view their own assigned codes"
  on gift_card_codes for select
  using (auth.uid() = assigned_to_user_id);

create index if not exists idx_gift_card_codes_denom_status
  on gift_card_codes(denomination, status);

alter table wallet_transactions
  drop constraint if exists wallet_transactions_type_check,
  add constraint wallet_transactions_type_check
    check (type in ('deposit', 'tournament_entry', 'prize_payout', 'withdrawal', 'refund', 'adjustment', 'referral_bonus', 'gift_card_redemption'));

-- ── Public stock check ───────────────────────────────────────
-- Lets the frontend show "₹500 (3 available)" without exposing actual
-- codes or who redeemed what.
create or replace function get_gift_card_stock()
returns table (denomination integer, available_count bigint)
language sql
security definer
set search_path = public
as $$
  select denomination, count(*) as available_count
  from gift_card_codes
  where status = 'available'
  group by denomination
  order by denomination asc;
$$;

grant execute on function get_gift_card_stock() to authenticated;

-- ── redeem_gift_card ─────────────────────────────────────────
-- Locks the wallet, locks one available code of the requested
-- denomination (skip locked = two simultaneous requests can't grab the
-- same code), debits the wallet, assigns the code, returns it directly.
create or replace function redeem_gift_card(p_denomination integer)
returns text as $$
declare
  v_user_id uuid := auth.uid();
  v_balance integer;
  v_code_id uuid;
  v_code text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select balance into v_balance from wallets where id = v_user_id for update;
  if v_balance is null or v_balance < p_denomination then
    raise exception 'Insufficient balance — need %, have %', p_denomination, coalesce(v_balance, 0);
  end if;

  select id, code into v_code_id, v_code
  from gift_card_codes
  where denomination = p_denomination and status = 'available'
  for update skip locked
  limit 1;

  if v_code_id is null then
    raise exception 'No ₹% gift cards available right now — try another amount or check back later', p_denomination;
  end if;

  update gift_card_codes
  set status = 'assigned', assigned_to_user_id = v_user_id, assigned_at = now()
  where id = v_code_id;

  insert into wallet_transactions (user_id, amount, type, reference, description)
  values (
    v_user_id, -p_denomination, 'gift_card_redemption', v_code_id::text,
    'Redeemed ₹' || p_denomination || ' Google Play gift card'
  );

  return v_code;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function redeem_gift_card(integer) to authenticated;
