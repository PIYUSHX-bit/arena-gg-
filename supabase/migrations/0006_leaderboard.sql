-- ARENA.GG — Leaderboard
-- Run in Supabase SQL editor after 0005_menu_preferences.sql
--
-- entries' RLS only lets a user see their own rows, so a plain cross-user
-- query would return nothing for anyone but each individual user. This
-- function runs as SECURITY DEFINER (bypasses RLS internally) but only
-- ever returns an aggregate count per user — never exposes which specific
-- tournaments, squad names, or player data any entry contains.

create or replace function get_leaderboard(result_limit int default 20)
returns table (
  display_name text,
  avatar_color text,
  tournaments_joined bigint
)
language sql
security definer
set search_path = public
as $$
  select
    p.display_name,
    p.avatar_color,
    count(e.id) as tournaments_joined
  from profiles p
  join entries e on e.user_id = p.id
  where e.status = 'confirmed'
  group by p.id, p.display_name, p.avatar_color
  order by tournaments_joined desc, p.display_name asc
  limit result_limit;
$$;

-- Anyone (including anonymous visitors) can call this — it only returns
-- aggregate counts, nothing per-entry or per-tournament.
grant execute on function get_leaderboard(int) to anon, authenticated;
