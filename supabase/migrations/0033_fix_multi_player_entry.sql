-- ARENA.GG — Trim a stale 2-player entry down to its real registrant
-- Run after 0032_match_ban_votes.sql
--
-- Registration was simplified to single-player entries (squad system
-- removed), but one entry created beforehand still has two players
-- saved in its roster. squad_name matches the first player's IGN
-- exactly (it's auto-derived from players[0].ign), confirming that's
-- the real registrant and the second player is leftover squad data.

update entries
set players = jsonb_build_array(players->0)
where id = 'a097b35e-673e-4b3b-a379-c22442544caf'
  and jsonb_array_length(players) > 1;
