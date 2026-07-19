import { supabase } from "./supabaseClient";
import type { LeaderboardRow, TopSpenderRow } from "../types/leaderboard";

interface LeaderboardRpcRow {
  display_name: string;
  avatar_color: string;
  wins: number;
  total_kills: number;
  total_earnings: number;
}

interface TopSpenderRpcRow {
  display_name: string;
  avatar_color: string;
  total_invested: number;
}

// Ranked by wins/kills/prize earnings — real match performance.
export async function fetchLeaderboard(
  limit = 20
): Promise<{ rows: LeaderboardRow[]; error: string | null }> {
  const { data, error } = await supabase.rpc("get_leaderboard", {
    result_limit: limit,
  });

  if (error) {
    return { rows: [], error: error.message };
  }

  const rows = (data as LeaderboardRpcRow[]).map((row) => ({
    displayName: row.display_name,
    avatarColor: row.avatar_color,
    wins: row.wins,
    totalKills: row.total_kills,
    totalEarnings: row.total_earnings,
  }));

  return { rows, error: null };
}

// Ranked by total entry fees paid — a spend ranking, not a performance one.
export async function fetchTopSpenders(
  limit = 20
): Promise<{ rows: TopSpenderRow[]; error: string | null }> {
  const { data, error } = await supabase.rpc("get_top_spenders", {
    result_limit: limit,
  });

  if (error) {
    return { rows: [], error: error.message };
  }

  const rows = (data as TopSpenderRpcRow[]).map((row) => ({
    displayName: row.display_name,
    avatarColor: row.avatar_color,
    totalInvested: row.total_invested,
  }));

  return { rows, error: null };
}
