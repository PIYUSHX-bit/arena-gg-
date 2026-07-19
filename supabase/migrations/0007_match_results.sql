-- ARENA.GG — Match results
-- Run in Supabase SQL editor after 0006_leaderboard.sql
--
-- Same manual pattern as tournaments.status: these fields start at zero/null
-- and you (or later, an admin panel) fill them in after a match completes,
-- using whatever the match server / in-game results screen reports.

alter table entries
  add column if not exists kills integer not null default 0,
  add column if not exists placement integer,  -- 1 = won the match, null = not yet recorded
  add column if not exists prize_won integer not null default 0; -- rupees actually paid out to this entry

comment on column entries.placement is 'Final match placement (1 = win). Null until results are recorded.';
comment on column entries.prize_won is 'Rupees actually paid out for this entry — distinct from amount_paid, which is what they spent on entry fees.';
