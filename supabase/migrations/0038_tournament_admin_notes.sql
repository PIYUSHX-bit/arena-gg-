-- ARENA.GG — Admin-only per-match notes
-- Run after 0037_push_subscriptions_update_policy.sql
--
-- Payouts tab needs a place for the admin to jot a note against a
-- specific match (e.g. "kills verified from stream VOD", "2 squads
-- disqualified for teaming"). This is deliberately its own table rather
-- than a column on `tournaments` — that table is publicly readable
-- (`select("*")` from the player-facing dashboard/registration flow), so
-- an admin-only note living there would leak to every player fetching
-- the match. Keeping it separate lets RLS restrict it to admins only,
-- both to read and to write.

create table if not exists tournament_admin_notes (
  tournament_id uuid primary key references tournaments(id) on delete cascade,
  note text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table tournament_admin_notes enable row level security;

create policy "Admins can view tournament notes"
  on tournament_admin_notes for select
  using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can insert tournament notes"
  on tournament_admin_notes for insert
  with check (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can update tournament notes"
  on tournament_admin_notes for update
  using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
