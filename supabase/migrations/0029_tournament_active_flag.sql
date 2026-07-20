-- ARENA.GG — Draft/active toggle for tournaments
-- Run after 0028_tournament_banner_upload.sql
--
-- Lets an admin fill in a match's full details and save it without it
-- being visible to players yet, then flip it live with one tap instead
-- of re-entering everything. Default true so every existing (already
-- visible) tournament keeps showing exactly as before — only newly
-- created drafts start hidden.

alter table tournaments
  add column if not exists is_active boolean not null default true;

create index if not exists idx_tournaments_is_active on tournaments(is_active);
