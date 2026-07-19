-- ARENA.GG — Withdrawal requests
-- Run after 0009_wallet.sql

-- ── withdrawal_requests ──────────────────────────────────────
-- One row per withdrawal request. The wallet debit happens immediately
-- (via wallet_transactions, same as any other transaction) so the balance
-- shown to the user always reflects money that's spoken for; this table
-- just tracks payout status for whoever processes payouts manually.
create table if not exists withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  upi_id text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'rejected')),
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

alter table withdrawal_requests enable row level security;

create policy "Users can view their own withdrawal requests"
  on withdrawal_requests for select
  using (auth.uid() = user_id);

-- No insert/update policy for regular users — rows are only created via
-- request_withdrawal() below (security definer) and only updated by
-- whoever processes payouts, using the service role.

create index if not exists idx_withdrawal_requests_user on withdrawal_requests(user_id);

-- ── request_withdrawal ───────────────────────────────────────
-- Atomically checks balance, records the debit, and opens a withdrawal
-- request — all in one transaction so a user can never end up with two
-- concurrent requests draining the same balance.
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

  if p_amount < 100 then
    raise exception 'Minimum withdrawal is ₹100';
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

grant execute on function request_withdrawal(integer, text) to authenticated;
