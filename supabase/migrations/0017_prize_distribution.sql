-- ARENA.GG — Per-rank prize breakdown
-- Run after 0016_test_tournament_seed.sql
--
-- Stored as jsonb rather than a separate table: it's a small, fixed-shape
-- list per tournament ([{ label, amount }, ...]) that's only ever read or
-- replaced wholesale, never queried by rank individually.

alter table tournaments
  add column if not exists prize_distribution jsonb not null default '[]';

-- Give the temporary test tournament a distribution too, so the new
-- Prize Details UI has something to render.
update tournaments
set prize_distribution = '[
  {"label": "1st", "amount": 80},
  {"label": "2nd", "amount": 50},
  {"label": "3rd", "amount": 30},
  {"label": "4th", "amount": 15},
  {"label": "5th", "amount": 15},
  {"label": "6th", "amount": 10},
  {"label": "7th", "amount": 10},
  {"label": "8th", "amount": 5},
  {"label": "9th", "amount": 5}
]'::jsonb
where name = 'TEST - Solo Survival Match #001';
