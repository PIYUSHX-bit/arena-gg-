-- ARENA.GG — Notifications
-- Run after 0018_pay_entry_prize.sql
--
-- A real feed generated from events that already happen elsewhere
-- (registration confirmed, money in/out of the wallet) rather than a
-- second source of truth an admin has to remember to write to.

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  type text not null default 'info'
    check (type in ('info', 'registration', 'payment', 'prize', 'withdrawal')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table notifications enable row level security;

create policy "Users can view their own notifications"
  on notifications for select
  using (auth.uid() = user_id);

-- Only used to flip is_read — inserts are always via the triggers below
-- (security definer), never directly from the client.
create policy "Users can mark their own notifications read"
  on notifications for update
  using (auth.uid() = user_id);

create index if not exists idx_notifications_user on notifications(user_id, created_at desc);

-- ── Registration confirmed ───────────────────────────────────
create or replace function notify_entry_confirmed()
returns trigger as $$
declare
  v_name text;
begin
  if new.status = 'confirmed' and old.status != 'confirmed' then
    select name into v_name from tournaments where id = new.tournament_id;
    insert into notifications (user_id, title, body, type)
    values (
      new.user_id,
      'Registration Confirmed',
      'You''re in! ' || coalesce(v_name, 'Your match') ||
        ' — room ID drops 15 minutes before start.',
      'registration'
    );
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_entry_confirmed_notify
  after update on entries
  for each row
  execute function notify_entry_confirmed();

-- ── Wallet activity ──────────────────────────────────────────
create or replace function notify_wallet_transaction()
returns trigger as $$
begin
  if new.type = 'prize_payout' then
    insert into notifications (user_id, title, body, type)
    values (
      new.user_id, 'Prize Paid Out',
      'You won ₹' || new.amount || '! ' || new.description, 'prize'
    );
  elsif new.type = 'deposit' then
    insert into notifications (user_id, title, body, type)
    values (
      new.user_id, 'Money Added',
      '₹' || new.amount || ' added to your wallet.', 'payment'
    );
  elsif new.type = 'withdrawal' then
    insert into notifications (user_id, title, body, type)
    values (new.user_id, 'Withdrawal Requested', new.description, 'withdrawal');
  elsif new.type = 'refund' then
    insert into notifications (user_id, title, body, type)
    values (
      new.user_id, 'Withdrawal Rejected & Refunded', new.description, 'withdrawal'
    );
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_wallet_transaction_notify
  after insert on wallet_transactions
  for each row
  execute function notify_wallet_transaction();

-- ── Withdrawal paid ──────────────────────────────────────────
-- Marking a withdrawal 'paid' doesn't touch wallet_transactions (the
-- debit already happened when it was requested), so it needs its own
-- trigger rather than reusing the one above.
create or replace function notify_withdrawal_processed()
returns trigger as $$
begin
  if new.status = 'paid' and old.status = 'pending' then
    insert into notifications (user_id, title, body, type)
    values (
      new.user_id, 'Withdrawal Paid',
      '₹' || new.amount || ' sent to ' || new.upi_id || '.', 'withdrawal'
    );
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_withdrawal_processed_notify
  after update on withdrawal_requests
  for each row
  execute function notify_withdrawal_processed();
