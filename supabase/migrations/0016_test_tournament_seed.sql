-- ARENA.GG — Temporary test tournament for UI testing
-- Not real: safe to delete once the category browse page has been
-- eyeballed. Delete with:
--   delete from tournaments where name like 'TEST - %';

insert into tournaments (
  name, mode, map, entry_fee, prize_pool, per_kill, entry_per_player,
  category, status, starts_at, slots_total, slots_filled
) values (
  'TEST - Solo Survival Match #001', 'Solo', 'Bermuda', 12, 220, 10, 1,
  'br-survival', 'upcoming', now() + interval '2 days', 20, 1
);
