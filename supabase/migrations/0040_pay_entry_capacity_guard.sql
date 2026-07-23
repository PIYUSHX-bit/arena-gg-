-- ARENA.GG — Fix entry-confirmation race/state bugs
-- Run after 0039_gift_card_redemption.sql
--
-- pay_entry_from_wallet (0030) confirmed an entry without ever checking
-- the tournament's slot capacity or its current status/active flag. Two
-- real bugs followed: (1) a tournament could be oversold past
-- slots_total — nothing stopped two players paying for the last slot at
-- the same moment, since the function never even read slots_total; (2) a
-- player who sat on the payment screen while a tournament went
-- live/completed, or got deactivated by an admin, could still pay and
-- get confirmed after the fact.
--
-- Fix: lock the tournament row (`for update`) before checking capacity
-- and state, so two simultaneous payments for the same tournament
-- serialize on that lock instead of both reading a stale slots_filled —
-- the classic check-then-act race this bug was.

create or replace function pay_entry_from_wallet(p_entry_id uuid)
returns void as $$
declare
  v_user_id uuid := auth.uid();
  v_entry entries%rowtype;
  v_tournament tournaments%rowtype;
  v_player_count integer;
  v_required integer;
  v_balance integer;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_entry from entries where id = p_entry_id for update;
  if v_entry.id is null then
    raise exception 'Entry not found';
  end if;
  if v_entry.user_id != v_user_id then
    raise exception 'This entry does not belong to you';
  end if;
  if v_entry.status != 'pending_payment' then
    raise exception 'This entry is not awaiting payment';
  end if;

  select * into v_tournament from tournaments where id = v_entry.tournament_id for update;
  if v_tournament.id is null then
    raise exception 'Tournament not found';
  end if;
  if v_tournament.status != 'upcoming' or not v_tournament.is_active then
    raise exception 'This tournament is no longer accepting entries';
  end if;
  if v_tournament.slots_filled >= v_tournament.slots_total then
    raise exception 'This tournament is full';
  end if;

  v_player_count := jsonb_array_length(v_entry.players);
  v_required := v_tournament.entry_fee * v_player_count;

  select balance into v_balance from wallets where id = v_user_id for update;
  if v_balance is null or v_balance < v_required then
    raise exception 'Insufficient balance — need %, have %', v_required, coalesce(v_balance, 0);
  end if;

  insert into wallet_transactions (user_id, amount, type, reference, description)
  values (
    v_user_id, -v_required, 'tournament_entry', p_entry_id::text,
    'Entry fee — ' || v_entry.squad_name
  );

  update entries
  set status = 'confirmed', amount_paid = v_required
  where id = p_entry_id;
end;
$$ language plpgsql security definer set search_path = public;
