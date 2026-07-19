-- ARENA.GG — Registration schema
-- Run this in the Supabase SQL editor (or as a migration).

-- ── tournaments ──────────────────────────────────────────────
create table if not exists tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mode text not null check (mode in ('Solo', 'Duo', 'Squad')),
  map text not null,
  entry_fee integer not null,       -- rupees, per player
  prize_pool integer not null,      -- rupees, total
  starts_at timestamptz not null,
  slots_total integer not null,
  slots_filled integer not null default 0,
  status text not null default 'upcoming'
    check (status in ('upcoming', 'live', 'completed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_tournaments_status on tournaments(status);

-- ── entries ──────────────────────────────────────────────────
-- One row per squad/duo/solo registration into a tournament.
-- `players` holds the full roster as JSON: [{ ign, uid }, ...]
-- Simpler than a join table at this scale — squads are per-tournament,
-- not reusable entities yet.
create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  squad_name text not null,
  players jsonb not null,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'confirmed', 'cancelled')),
  amount_paid integer not null default 0,
  razorpay_order_id text unique,
  created_at timestamptz not null default now(),

  -- one active entry per user per tournament (re-registering after
  -- cancellation requires deleting the old row first, by design)
  unique (tournament_id, user_id)
);

-- ── Row Level Security ───────────────────────────────────────
alter table tournaments enable row level security;
alter table entries enable row level security;

-- Anyone (including anonymous visitors browsing the landing page) can read tournaments
create policy "Tournaments are publicly readable"
  on tournaments for select
  using (true);

-- Users can only see and manage their own entries
create policy "Users can view their own entries"
  on entries for select
  using (auth.uid() = user_id);

create policy "Users can create their own entries"
  on entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own pending entries"
  on entries for update
  using (auth.uid() = user_id and status = 'pending_payment');

-- ── Slot counting ────────────────────────────────────────────
-- Keeps tournaments.slots_filled in sync when an entry is confirmed
-- (i.e. after payment succeeds via the Razorpay webhook).
create or replace function increment_slots_filled()
returns trigger as $$
begin
  if new.status = 'confirmed' and old.status != 'confirmed' then
    update tournaments
    set slots_filled = slots_filled + 1
    where id = new.tournament_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_entry_confirmed
  after update on entries
  for each row
  execute function increment_slots_filled();
