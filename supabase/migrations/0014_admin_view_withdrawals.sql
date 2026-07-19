-- ARENA.GG — Let admins view withdrawal requests
-- Run after 0013_withdrawal_min_and_admin.sql
--
-- 0011 only gave users a select policy for their own withdrawal requests.
-- The admin panel needs to list every pending request, so add an
-- admin-only select policy alongside it (doesn't replace the existing one).

create policy "Admins can view all withdrawal requests"
  on withdrawal_requests for select
  using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
