-- ARENA.GG — Leaderboard v2: performance ranking + separate spend ranking
-- Run in Supabase SQL editor after 0007_match_results.sql

-- Replaces the old tournaments-joined ranking with the real performance
-- metrics now that entries.kills/placement/prize_won exist. Still
-- SECURITY DEFINER for the same reason as before — RLS on entries only
-- allows a user to see their own rows, so this bypasses that safely,
-- returning only aggregates, never per-entry details.
-- Postgres won't let CREATE OR REPLACE change a function's return type,
-- and the old version returned (display_name, avatar_color, tournaments_joined)
-- — different shape from what's below — so drop it first.
drop function if exists get_leaderboard(int);

create or replace function get_leaderboard(result_limit int default 20)
returns table (
  display_name text,
  avatar_color text,
  wins bigint,
  total_kills bigint,
  total_earnings bigint
)
language sql
security definer
set search_path = public
as $$
  select
    p.display_name,
    p.avatar_color,
    count(e.id) filter (where e.placement = 1) as wins,
    coalesce(sum(e.kills), 0) as total_kills,
    coalesce(sum(e.prize_won), 0) as total_earnings
  from profiles p
  join entries e on e.user_id = p.id
  where e.status = 'confirmed'
  group by p.id, p.display_name, p.avatar_color
  order by total_earnings desc, wins desc, total_kills desc
  limit result_limit;
$$;

grant execute on function get_leaderboard(int) to anon, authenticated;

-- Separate ranking for the Menu's "Top Players" — how much each player
-- has put into entry fees, not how well they've performed. Different
-- metric, different function, so the two pages can't accidentally get
-- confused with each other in the query layer.
create or replace function get_top_spenders(result_limit int default 20)
returns table (
  display_name text,
  avatar_color text,
  total_invested bigint
)
language sql
security definer
set search_path = public
as $$
  select
    p.display_name,
    p.avatar_color,
    coalesce(sum(e.amount_paid), 0) as total_invested
  from profiles p
  join entries e on e.user_id = p.id
  where e.status = 'confirmed'
  group by p.id, p.display_name, p.avatar_color
  order by total_invested desc, p.display_name asc
  limit result_limit;
$$;

grant execute on function get_top_spenders(int) to anon, authenticated;
