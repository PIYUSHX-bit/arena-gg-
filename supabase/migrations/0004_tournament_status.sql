-- ARENA.GG — Tournament lifecycle status
-- Run in Supabase SQL editor after 0003_profiles.sql

-- Deriving "ongoing" purely from starts_at is fragile — a match running
-- late would incorrectly show as "upcoming", and there's no clean way to
-- know when it ended. Instead, status is a real column you (or later, an
-- admin panel / scheduled job) flip explicitly at each stage.
alter table tournaments
  add column if not exists status text not null default 'upcoming'
    check (status in ('upcoming', 'live', 'completed'));

-- Index since match-status pages will filter on this constantly
create index if not exists idx_tournaments_status on tournaments(status);
