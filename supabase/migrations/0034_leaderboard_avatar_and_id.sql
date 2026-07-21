-- ARENA.GG — Leaderboard: expose avatar_url + user id
-- Run after 0033_fix_multi_player_entry.sql
--
-- get_leaderboard never returned avatar_url (added later, in 0021) or a
-- stable id, so the leaderboard could only ever show colored initials
-- and had nothing to link a row to that player's profile with.

drop function if exists get_leaderboard(int);

create or replace function get_leaderboard(result_limit int default 20)
returns table (
  id uuid,
  display_name text,
  avatar_color text,
  avatar_url text,
  wins bigint,
  total_kills bigint,
  total_earnings bigint
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.display_name,
    p.avatar_color,
    p.avatar_url,
    count(e.id) filter (where e.placement = 1) as wins,
    coalesce(sum(e.kills), 0) as total_kills,
    coalesce(sum(e.prize_won), 0) as total_earnings
  from profiles p
  join entries e on e.user_id = p.id
  where e.status = 'confirmed'
  group by p.id, p.display_name, p.avatar_color, p.avatar_url
  order by total_earnings desc, wins desc, total_kills desc
  limit result_limit;
$$;

grant execute on function get_leaderboard(int) to anon, authenticated;
