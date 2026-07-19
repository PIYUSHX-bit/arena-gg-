-- ARENA.GG — Admin panel foundation
-- Run via: npx supabase db push (or paste into Supabase SQL editor)

-- ── Admin flag ───────────────────────────────────────────────
alter table profiles
  add column if not exists is_admin boolean not null default false;

-- IMPORTANT: after running this, make yourself an admin manually — this
-- is deliberately not something the app can do to itself:
--
--   update profiles set is_admin = true where id = 'YOUR_USER_ID';
--
-- Find your user id in Supabase → Authentication → Users, or:
--   select id from profiles where display_name = 'PIYUSH-BIT';

-- ── Tournaments: allow admins to create/edit ────────────────
create policy "Admins can insert tournaments"
  on tournaments for insert
  with check (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can update tournaments"
  on tournaments for update
  using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- ── Entries: allow admins to view all + record results ──────
-- Regular users can already view/insert their own entries (from earlier
-- migrations) — these add admin-only access on top, they don't replace
-- the existing policies.
create policy "Admins can view all entries"
  on entries for select
  using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can update any entry"
  on entries for update
  using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
