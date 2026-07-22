-- ARENA.GG — Fix push_subscriptions re-subscribe bug
-- Run after the latest existing migration
--
-- The original 0035 migration only had SELECT/INSERT/DELETE policies.
-- enablePushNotifications() upserts on conflict with `endpoint`, and
-- Postgres RLS treats that conflict path as an UPDATE — with no UPDATE
-- policy, re-subscribing on an already-registered device was silently
-- blocked. This adds the missing policy, scoped the same way as the
-- existing ones (a user can only touch their own subscription rows).

create policy "Users can update their own push subscriptions"
  on push_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
