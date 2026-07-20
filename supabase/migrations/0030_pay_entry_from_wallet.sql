-- ARENA.GG — Pay tournament entry from wallet balance
-- Run after 0029_tournament_active_flag.sql
--
-- Temporary primary payment path while Razorpay isn't live yet — lets
-- the full registration flow be tested end-to-end using wallet coins.
-- Same atomic pattern as request_withdrawal: lock the wallet, check
-- balance, debit, and confirm the entry all in one transaction.

create or replace function pay_entry_from_wallet(p_entry_id uuid)
returns void as $$
declare
  v_user_id uuid := auth.uid();
  v_entry entries%rowtype;
  v_entry_fee integer;
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

  select entry_fee into v_entry_fee from tournaments where id = v_entry.tournament_id;
  v_player_count := jsonb_array_length(v_entry.players);
  v_required := v_entry_fee * v_player_count;

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

grant execute on function pay_entry_from_wallet(uuid) to authenticated;
