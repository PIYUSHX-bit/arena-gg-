-- ARENA.GG — Wallet system
-- Run in Supabase SQL editor after 0008_leaderboard_v2.sql

-- ── wallets ──────────────────────────────────────────────────
-- One row per user, balance kept in sync by a trigger on wallet_transactions
-- rather than computed on every read.
create table if not exists wallets (
  id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0, -- rupees
  updated_at timestamptz not null default now()
);

alter table wallets enable row level security;

create policy "Users can view their own wallet"
  on wallets for select
  using (auth.uid() = id);

-- No insert/update policy for regular users — balance only changes via
-- the trigger below, triggered by wallet_transactions rows that only
-- server-side (service role) code can insert. This is deliberate: a user
-- being able to directly update their own balance would be a real-money
-- exploit.

-- ── wallet_transactions ──────────────────────────────────────
-- Append-only ledger. amount is signed: positive = credit, negative = debit.
create table if not exists wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  type text not null check (type in ('deposit', 'tournament_entry', 'prize_payout', 'withdrawal', 'refund', 'adjustment')),
  reference text, -- e.g. razorpay_order_id or entries.id, for tracing
  description text not null,
  created_at timestamptz not null default now()
);

alter table wallet_transactions enable row level security;

create policy "Users can view their own transactions"
  on wallet_transactions for select
  using (auth.uid() = user_id);

-- Deliberately no insert policy here either — only service-role (Edge
-- Functions) can write transactions, which bypasses RLS entirely.

create index if not exists idx_wallet_transactions_user on wallet_transactions(user_id);

-- ── wallet_topups ────────────────────────────────────────────
-- Tracks a Razorpay order from creation through webhook confirmation,
-- mirroring how entries.razorpay_order_id works for tournament payments.
create table if not exists wallet_topups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  razorpay_order_id text unique not null,
  amount integer not null,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  created_at timestamptz not null default now()
);

alter table wallet_topups enable row level security;

create policy "Users can view their own topups"
  on wallet_topups for select
  using (auth.uid() = user_id);

-- ── Keep wallets.balance in sync ────────────────────────────
create or replace function apply_wallet_transaction()
returns trigger as $$
begin
  update wallets
  set balance = balance + new.amount, updated_at = now()
  where id = new.user_id;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_wallet_transaction_insert
  after insert on wallet_transactions
  for each row
  execute function apply_wallet_transaction();

-- ── Auto-create a wallet on signup, same pattern as profiles ────
-- Extends the existing handle_new_user() from 0003_profiles.sql to also
-- create a wallet row — one trigger function, both side effects.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'Player')
  );

  insert into public.wallets (id, balance)
  values (new.id, 0);

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Backfill wallets for anyone who signed up before this migration existed
insert into wallets (id, balance)
select id, 0 from auth.users
on conflict (id) do nothing;
