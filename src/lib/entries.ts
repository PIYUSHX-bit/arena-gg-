import { supabase } from "./supabaseClient";
import type { Tournament, TournamentStatus, PrizeTier, PlayerInfo } from "../types/tournament";
import type { Match } from "../types/match";

// Supabase returns snake_case columns — map to our camelCase app types here,
// in one place, so components never deal with raw DB row shapes.
interface TournamentRow {
  id: string;
  name: string;
  mode: "Solo" | "Duo" | "Squad";
  map: string;
  entry_fee: number;
  prize_pool: number;
  per_kill: number;
  entry_per_player: number;
  prize_distribution: PrizeTier[];
  category: string | null;
  banner_image_url: string | null;
  status: TournamentStatus;
  is_active: boolean;
  starts_at: string;
  slots_total: number;
  slots_filled: number;
}

function mapTournamentRow(row: TournamentRow): Tournament {
  return {
    id: row.id,
    name: row.name,
    mode: row.mode,
    map: row.map,
    entryFee: row.entry_fee,
    prizePool: row.prize_pool,
    perKill: row.per_kill,
    entryPerPlayer: row.entry_per_player,
    prizeDistribution: row.prize_distribution,
    category: row.category,
    bannerImageUrl: row.banner_image_url,
    status: row.status,
    isActive: row.is_active,
    startsAt: new Date(row.starts_at).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }),
    slotsTotal: row.slots_total,
    slotsFilled: row.slots_filled,
    slotsLeft: row.slots_total - row.slots_filled,
  };
}

export async function fetchTournamentById(
  id: string
): Promise<{ tournament: Tournament | null; error: string | null }> {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error) {
    return { tournament: null, error: error.message };
  }

  return { tournament: mapTournamentRow(data), error: null };
}

// Lists upcoming tournaments open for registration — used by both the
// public landing page and the in-app browse page.
export async function fetchTournaments(): Promise<{
  tournaments: Tournament[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("status", "upcoming")
    .eq("is_active", true)
    .order("starts_at", { ascending: true });

  if (error) {
    return { tournaments: [], error: error.message };
  }

  return { tournaments: (data as TournamentRow[]).map(mapTournamentRow), error: null };
}

// Lists tournaments for one game-mode category (e.g. "br-survival"),
// filtered to a single status tab — used by the per-category contest page.
export async function fetchTournamentsByCategory(
  category: string,
  status: TournamentStatus
): Promise<{ tournaments: Tournament[]; error: string | null }> {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("category", category)
    .eq("status", status)
    .eq("is_active", true)
    .order("starts_at", { ascending: status !== "completed" });

  if (error) {
    return { tournaments: [], error: error.message };
  }

  return { tournaments: (data as TournamentRow[]).map(mapTournamentRow), error: null };
}

export async function createEntry(params: {
  tournamentId: string;
  userId: string;
  squadName: string;
  players: PlayerInfo[];
}): Promise<{ entryId: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from("entries")
    .insert({
      tournament_id: params.tournamentId,
      user_id: params.userId,
      squad_name: params.squadName,
      players: params.players,
      status: "pending_payment",
    })
    .select("id")
    .single();

  if (error) {
    // Unique constraint violation = already registered for this tournament
    if (error.code === "23505") {
      return {
        entryId: null,
        error: "You've already registered for this tournament.",
      };
    }
    return { entryId: null, error: error.message };
  }

  return { entryId: data.id, error: null };
}

interface MatchRow {
  id: string;
  squad_name: string;
  players: PlayerInfo[];
  tournament_id: string;
  tournaments: {
    name: string;
    mode: "Solo" | "Duo" | "Squad";
    map: string;
    starts_at: string;
    status: TournamentStatus;
  };
}

function mapMatchRow(row: MatchRow): Match {
  return {
    entryId: row.id,
    squadName: row.squad_name,
    players: row.players,
    tournamentId: row.tournament_id,
    tournamentName: row.tournaments.name,
    mode: row.tournaments.mode,
    map: row.tournaments.map,
    startsAt: new Date(row.tournaments.starts_at).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }),
    status: row.tournaments.status,
    roomId: null,
    roomPassword: null,
  };
}

// Only confirmed entries count as real matches — pending_payment entries
// haven't actually secured a slot yet, and cancelled ones are dead.
export async function fetchMyMatches(
  userId: string,
  status?: TournamentStatus
): Promise<{ matches: Match[]; error: string | null }> {
  const { data, error } = await supabase
    .from("entries")
    .select(
      "id, squad_name, players, tournament_id, tournaments(name, mode, map, starts_at, status)"
    )
    .eq("user_id", userId)
    .eq("status", "confirmed")
    .order("created_at", { ascending: false });

  if (error) {
    return { matches: [], error: error.message };
  }

  // Supabase's join typing collapses to an object here, not an array —
  // cast is safe given the select() shape above.
  let matches = (data as unknown as MatchRow[])
    // Guard in case a tournament was deleted out from under an entry
    .filter((row) => row.tournaments)
    .map(mapMatchRow);

  // Filtered client-side rather than via PostgREST's embedded-resource
  // filter (`.eq("tournaments.status", ...)`), whose semantics for
  // to-one joins aren't reliable — and this dataset is just one user's
  // own entries, so it's cheap either way.
  if (status) {
    matches = matches.filter((m) => m.status === status);
  }

  // Room credentials live in a separate, tighter-RLS table (see
  // 0020_tournament_rooms.sql) rather than being embedded here — no FK
  // links entries to tournament_rooms, so this is a second query merged
  // client-side, same pattern as the withdrawal_requests → profiles join.
  if (matches.length > 0) {
    const tournamentIds = [...new Set(matches.map((m) => m.tournamentId))];
    const { data: rooms } = await supabase
      .from("tournament_rooms")
      .select("tournament_id, room_id, room_password")
      .in("tournament_id", tournamentIds);

    const roomById = new Map(
      (rooms ?? []).map((r) => [r.tournament_id, r])
    );

    matches = matches.map((m) => {
      const room = roomById.get(m.tournamentId);
      return room
        ? { ...m, roomId: room.room_id, roomPassword: room.room_password }
        : m;
    });
  }

  return { matches, error: null };
}
