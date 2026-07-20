-- ARENA.GG — pay_entry_prize guardrails
-- Run after 0022_remove_test_tournament.sql
--
-- Closes two gaps in the original 0018 version: it never checked that
-- the entry was actually a confirmed (paid) registration, or that the
-- tournament itself was marked completed. Both were "an admin wouldn't
-- do that on purpose" gaps, not enforced ones — this makes them real.

create or replace function pay_entry_prize(
  p_entry_id uuid,
  p_kills integer,
  p_placement integer,
  p_prize_amount integer
)
returns void as $$
declare
  v_caller uuid := auth.uid();
  v_is_admin boolean;
  v_entry entries%rowtype;
  v_tournament_status text;
begin
  select is_admin into v_is_admin from profiles where id = v_caller;
  if v_is_admin is not true then
    raise exception 'Not authorized';
  end if;

  if p_prize_amount < 0 then
    raise exception 'Prize amount cannot be negative';
  end if;

  select * into v_entry from entries where id = p_entry_id for update;
  if v_entry.id is null then
    raise exception 'Entry not found';
  end if;

  if v_entry.status != 'confirmed' then
    raise exception 'Cannot record results for an entry that was never confirmed (status: %)', v_entry.status;
  end if;

  select status into v_tournament_status from tournaments where id = v_entry.tournament_id;
  if v_tournament_status != 'completed' then
    raise exception 'Cannot pay out a tournament that is not marked completed (current status: %)', v_tournament_status;
  end if;

  if v_entry.prize_won > 0 then
    raise exception 'This entry has already been paid';
  end if;

  update entries
  set kills = p_kills, placement = p_placement, prize_won = p_prize_amount
  where id = p_entry_id;

  if p_prize_amount > 0 then
    insert into wallet_transactions (user_id, amount, type, reference, description)
    values (
      v_entry.user_id,
      p_prize_amount,
      'prize_payout',
      p_entry_id::text,
      'Prize payout — ' || v_entry.squad_name
    );
  end if;
end;
$$ language plpgsql security definer set search_path = public;
