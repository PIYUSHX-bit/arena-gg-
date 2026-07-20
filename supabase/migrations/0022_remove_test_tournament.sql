-- ARENA.GG — Remove temporary test tournament
-- Cleans up the throwaway row seeded by 0016_test_tournament_seed.sql for
-- UI testing. entries.tournament_id already has ON DELETE CASCADE (see
-- schema.sql), so deleting the tournament alone would take its entries
-- with it — but entries are deleted explicitly first for clarity.

delete from entries
where tournament_id in (
  select id from tournaments where name = 'TEST - Solo Survival Match #001'
);

delete from tournaments
where name = 'TEST - Solo Survival Match #001';
