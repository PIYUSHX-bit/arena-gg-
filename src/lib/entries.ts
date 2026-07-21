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
    startsAtIso: row.starts_at,
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

export interface MyEntryStatus {
  entryId: string;
  status: "pending_payment" | "confirmed" | "cancelled";
}

// Checks whether the current user already has an entry for this
// tournament — entries has a unique (tournament_id, user_id) constraint,
// so this also tells the registration form whether to resume a pending
// payment or show "already joined" instead of the roster form.
export async function fetchMyEntryForTournament(
  tournamentId: string,
  userId: string
): Promise<{ entry: MyEntryStatus | null; error: string | null }> {
  const { data, error } = await supabase
    .from("entries")
    .select("id, status")
    .eq("tournament_id", tournamentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { entry: null, error: error.message };
  }

  return {
    entry: data ? { entryId: data.id, status: data.status } : null,
    error: null,
  };
}

// Batched version for a listing page (e.g. a category's tournament
// list): which of these tournaments does the player already hold a
// confirmed entry for? Powers the per-card "Joined" badge/Enter button
// there, updating only for tournaments the player has actually joined.
export async function fetchMyConfirmedTournamentIds(
  userId: string,
  tournamentIds: string[]
): Promise<{ tournamentIds: Set<string>; error: string | null }> {
  if (tournamentIds.length === 0) {
    return { tournamentIds: new Set(), error: null };
  }

  const { data, error } = await supabase
    .from("entries")
    .select("tournament_id")
    .eq("user_id", userId)
    .eq("status", "confirmed")
    .in("tournament_id", tournamentIds);

  if (error) {
    return { tournamentIds: new Set(), error: error.message };
  }

  return {
    tournamentIds: new Set(data.map((row) => row.tournament_id)),
    error: null,
  };
}

export interface RosterEntry {
  squadName: string;
  players: PlayerInfo[];
  createdAt: string;
}

interface RosterRow {
  squad_name: string;
  players: PlayerInfo[];
  created_at: string;
}

// Public participant list for a match — confirmed entries only, via the
// get_tournament_roster RPC since entries has no public select policy.
export async function fetchTournamentRoster(
  tournamentId: string
): Promise<{ roster: RosterEntry[]; error: string | null }> {
  const { data, error } = await supabase.rpc("get_tournament_roster", {
    p_tournament_id: tournamentId,
  });

  if (error) {
    return { roster: [], error: error.message };
  }

  const roster = (data as RosterRow[]).map((row) => ({
    squadName: row.squad_name,
    players: row.players,
    createdAt: row.created_at,
  }));

  return { roster, error: null };
}

export interface TournamentRoomInfo {
  roomId: string | null;
  roomPassword: string | null;
}

// RLS on tournament_rooms (0020) restricts reads to confirmed entrants
// of this tournament + admins — a non-entrant calling this just gets no
// row back, no error, so the UI naturally shows nothing to unregistered
// players without needing to check permission first.
export async function fetchTournamentRoom(
  tournamentId: string
): Promise<{ room: TournamentRoomInfo | null; error: string | null }> {
  const { data, error } = await supabase
    .from("tournament_rooms")
    .select("room_id, room_password")
    .eq("tournament_id", tournamentId)
    .maybeSingle();

  if (error) {
    return { room: null, error: error.message };
  }

  return {
    room: data ? { roomId: data.room_id, roomPassword: data.room_password } : null,
    error: null,
  };
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
    entry_fee: number;
    prize_pool: number;
    per_kill: number;
    entry_per_player: number;
    category: string | null;
    banner_image_url: string | null;
    slots_total: number;
    slots_filled: number;
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
    startsAtIso: row.tournaments.starts_at,
    status: row.tournaments.status,
    roomId: null,
    roomPassword: null,
    entryFee: row.tournaments.entry_fee,
    prizePool: row.tournaments.prize_pool,
    perKill: row.tournaments.per_kill,
    entryPerPlayer: row.tournaments.entry_per_player,
    category: row.tournaments.category,
    bannerImageUrl: row.tournaments.banner_image_url,
    slotsTotal: row.tournaments.slots_total,
    slotsFilled: row.tournaments.slots_filled,
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
      "id, squad_name, players, tournament_id, tournaments(name, mode, map, starts_at, status, entry_fee, prize_pool, per_kill, entry_per_player, category, banner_image_url, slots_total, slots_filled)"
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
