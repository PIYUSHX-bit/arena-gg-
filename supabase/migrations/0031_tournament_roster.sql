-- ARENA.GG — Public tournament roster
-- Run after 0030_pay_entry_from_wallet.sql
--
-- entries has no public select policy (only "view your own" + admin),
-- so there's currently no way for a browsing (or already-registered)
-- player to see who else has joined a match. Rather than widen RLS on
-- the whole entries table, this is a narrow SECURITY DEFINER function
-- that only exposes what a public participant list needs — squad name
-- and roster, never user_id or payment details.

create or replace function get_tournament_roster(p_tournament_id uuid)
returns table (squad_name text, players jsonb, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select squad_name, players, created_at
  from entries
  where tournament_id = p_tournament_id and status = 'confirmed'
  order by created_at asc;
$$;

grant execute on function get_tournament_roster(uuid) to anon, authenticated;
