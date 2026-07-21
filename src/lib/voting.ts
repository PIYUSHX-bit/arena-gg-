import { supabase } from "./supabaseClient";

export interface MatchVote {
  targetUserId: string;
  displayName: string;
  avatarColor: string;
  voteCount: number;
  votedByMe: boolean;
}

interface MatchVoteRow {
  target_user_id: string;
  display_name: string;
  avatar_color: string;
  vote_count: number;
  voted_by_me: boolean;
}

export async function fetchMatchVotes(
  tournamentId: string
): Promise<{ votes: MatchVote[]; error: string | null }> {
  const { data, error } = await supabase.rpc("get_match_vote_counts", {
    p_tournament_id: tournamentId,
  });

  if (error) {
    return { votes: [], error: error.message };
  }

  const votes = (data as MatchVoteRow[]).map((row) => ({
    targetUserId: row.target_user_id,
    displayName: row.display_name,
    avatarColor: row.avatar_color,
    voteCount: row.vote_count,
    votedByMe: row.voted_by_me,
  }));

  return { votes, error: null };
}

export async function toggleBanVote(
  tournamentId: string,
  targetUserId: string
): Promise<{ voted: boolean | null; error: string | null }> {
  const { data, error } = await supabase.rpc("toggle_ban_vote", {
    p_tournament_id: tournamentId,
    p_target_user_id: targetUserId,
  });

  if (error) {
    return { voted: null, error: error.message };
  }

  return { voted: data as boolean, error: null };
}
