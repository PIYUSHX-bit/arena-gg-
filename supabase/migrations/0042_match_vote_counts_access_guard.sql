-- ARENA.GG — Restrict get_match_vote_counts to match participants/admins
-- Run after 0041_notifications_enabled_by_default.sql
--
-- toggle_ban_vote (0032) correctly enforces "only confirmed players in
-- this match can vote," but the read side — get_match_vote_counts — had
-- no such check at all. Any authenticated user could call it with an
-- arbitrary tournament_id (participant or not, even for a match they
-- never played) and see exactly who has how many flags against them.
-- That's exactly the information the UI's own copy ("Only players from
-- this match can vote") implies is private to that match's participants.
-- Fix: require the caller be either an admin or a confirmed participant
-- in that tournament, same trust boundary as the write path.

create or replace function get_match_vote_counts(p_tournament_id uuid)
returns table (
  target_user_id uuid,
  display_name text,
  avatar_color text,
  vote_count bigint,
  voted_by_me boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
  v_is_admin boolean;
  v_is_participant boolean;
begin
  if v_caller is null then
    raise exception 'Not authenticated';
  end if;

  select coalesce(is_admin, false) into v_is_admin
  from profiles where id = v_caller;

  select exists(
    select 1 from entries
    where tournament_id = p_tournament_id and user_id = v_caller and status = 'confirmed'
  ) into v_is_participant;

  if not v_is_admin and not v_is_participant then
    raise exception 'Only players in this match can view flag counts';
  end if;

  return query
    select
      e.user_id as target_user_id,
      p.display_name,
      p.avatar_color,
      coalesce(v.vote_count, 0) as vote_count,
      exists(
        select 1 from match_votes mv
        where mv.tournament_id = p_tournament_id
          and mv.voter_user_id = v_caller
          and mv.target_user_id = e.user_id
      ) as voted_by_me
    from entries e
    join profiles p on p.id = e.user_id
    left join (
      select target_user_id, count(*) as vote_count
      from match_votes
      where tournament_id = p_tournament_id
      group by target_user_id
    ) v on v.target_user_id = e.user_id
    where e.tournament_id = p_tournament_id and e.status = 'confirmed'
    order by coalesce(v.vote_count, 0) desc, p.display_name asc;
end;
$$;

grant execute on function get_match_vote_counts(uuid) to authenticated;
