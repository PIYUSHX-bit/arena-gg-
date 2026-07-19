-- ARENA.GG — Admin manual prize payouts
-- Run after 0017_prize_distribution.sql
--
-- entries.kills/placement/prize_won (from 0007) were always meant to be
-- filled in by an admin panel, but prize_won was only ever a record —
-- nothing credited the wallet. This closes that gap: recording results
-- and paying out happen together, atomically, and a prize can only be
-- paid once per entry.

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

grant execute on function pay_entry_prize(uuid, integer, integer, integer) to authenticated;
