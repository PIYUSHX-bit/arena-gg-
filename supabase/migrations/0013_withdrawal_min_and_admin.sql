-- ARENA.GG — Withdrawal minimum + admin processing
-- Run after 0012_admin.sql

-- Lower the minimum from ₹100 to ₹50. CREATE OR REPLACE keeps everything
-- else from the original function identical — same locking, same checks.
create or replace function request_withdrawal(p_amount integer, p_upi_id text)
returns uuid as $$
declare
  v_user_id uuid := auth.uid();
  v_balance integer;
  v_request_id uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;
  if p_amount < 50 then
    raise exception 'Minimum withdrawal is ₹50';
  end if;
  if p_upi_id is null or length(trim(p_upi_id)) = 0 then
    raise exception 'UPI ID is required';
  end if;
  select balance into v_balance from wallets where id = v_user_id for update;
  if v_balance is null or v_balance < p_amount then
    raise exception 'Insufficient balance';
  end if;
  insert into withdrawal_requests (user_id, amount, upi_id)
  values (v_user_id, p_amount, p_upi_id)
  returning id into v_request_id;
  insert into wallet_transactions (user_id, amount, type, reference, description)
  values (
    v_user_id,
    -p_amount,
    'withdrawal',
    v_request_id::text,
    'Withdrawal to ' || p_upi_id
  );
  return v_request_id;
end;
$$ language plpgsql security definer set search_path = public;

-- ── process_withdrawal ───────────────────────────────────────
-- Admin-only. Marking a request 'paid' just closes it out (money already
-- left the wallet when it was requested — the admin sent it manually via
-- UPI outside this system). Marking it 'rejected' is the ONLY way a
-- refund happens — deliberately manual, triggered by this exact action,
-- never automatic.
create or replace function process_withdrawal(p_request_id uuid, p_action text)
returns void as $$
declare
  v_caller uuid := auth.uid();
  v_is_admin boolean;
  v_request withdrawal_requests%rowtype;
begin
  select is_admin into v_is_admin from profiles where id = v_caller;
  if v_is_admin is not true then
    raise exception 'Not authorized';
  end if;

  if p_action not in ('paid', 'rejected') then
    raise exception 'Invalid action — must be paid or rejected';
  end if;

  select * into v_request from withdrawal_requests where id = p_request_id for update;
  if v_request.id is null then
    raise exception 'Withdrawal request not found';
  end if;
  if v_request.status != 'pending' then
    raise exception 'This request has already been processed';
  end if;

  update withdrawal_requests
  set status = p_action, processed_at = now()
  where id = p_request_id;

  if p_action = 'rejected' then
    insert into wallet_transactions (user_id, amount, type, reference, description)
    values (
      v_request.user_id,
      v_request.amount,
      'refund',
      p_request_id::text,
      'Withdrawal request rejected — refunded'
    );
  end if;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function process_withdrawal(uuid, text) to authenticated;
