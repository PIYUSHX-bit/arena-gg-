-- ARENA.GG — Vote-to-flag suspicious players (post-match)
-- Run after 0031_tournament_roster.sql
--
-- Players who were in the same completed match can flag each other.
-- This is deliberately advisory only — nothing here ever touches
-- profiles.banned. An admin reviews vote counts and bans manually,
-- same as every other moderation action in this app.

create table if not exists match_votes (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  voter_user_id uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (tournament_id, voter_user_id, target_user_id),
  check (voter_user_id != target_user_id)
);

alter table match_votes enable row level security;

-- No direct client policies for insert/delete — all writes go through
-- toggle_ban_vote() below, which enforces "same match, both confirmed,
-- match completed" before touching this table.
create policy "Admins can view all match votes"
  on match_votes for select
  using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create index if not exists idx_match_votes_tournament on match_votes(tournament_id);

-- ── toggle_ban_vote ──────────────────────────────────────────
-- Tap to vote, tap again to remove it. Returns true if a vote now
-- exists, false if it was just removed.
create or replace function toggle_ban_vote(p_tournament_id uuid, p_target_user_id uuid)
returns boolean as $$
declare
  v_voter uuid := auth.uid();
  v_status text;
  v_voter_confirmed boolean;
  v_target_confirmed boolean;
  v_existing uuid;
begin
  if v_voter is null then
    raise exception 'Not authenticated';
  end if;
  if v_voter = p_target_user_id then
    raise exception 'You cannot vote for yourself';
  end if;

  select status into v_status from tournaments where id = p_tournament_id;
  if v_status is null then
    raise exception 'Tournament not found';
  end if;
  if v_status != 'completed' then
    raise exception 'Voting opens once the match is completed';
  end if;

  select exists(
    select 1 from entries
    where tournament_id = p_tournament_id and user_id = v_voter and status = 'confirmed'
  ) into v_voter_confirmed;
  if not v_voter_confirmed then
    raise exception 'Only players in this match can vote';
  end if;

  select exists(
    select 1 from entries
    where tournament_id = p_tournament_id and user_id = p_target_user_id and status = 'confirmed'
  ) into v_target_confirmed;
  if not v_target_confirmed then
    raise exception 'That player was not in this match';
  end if;

  select id into v_existing from match_votes
    where tournament_id = p_tournament_id
      and voter_user_id = v_voter
      and target_user_id = p_target_user_id;

  if v_existing is not null then
    delete from match_votes where id = v_existing;
    return false;
  end if;

  insert into match_votes (tournament_id, voter_user_id, target_user_id)
  values (p_tournament_id, v_voter, p_target_user_id);
  return true;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function toggle_ban_vote(uuid, uuid) to authenticated;

-- ── get_match_vote_counts ────────────────────────────────────
-- Every confirmed participant in the match, ranked by vote count
-- (highest first) so the flagged players surface to the top, along with
-- whether the calling player has already voted for each one.
create or replace function get_match_vote_counts(p_tournament_id uuid)
returns table (
  target_user_id uuid,
  display_name text,
  avatar_color text,
  vote_count bigint,
  voted_by_me boolean
)
language sql
security definer
set search_path = public
as $$
  select
    e.user_id as target_user_id,
    p.display_name,
    p.avatar_color,
    coalesce(v.vote_count, 0) as vote_count,
    exists(
      select 1 from match_votes mv
      where mv.tournament_id = p_tournament_id
        and mv.voter_user_id = auth.uid()
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
$$;

grant execute on function get_match_vote_counts(uuid) to authenticated;
