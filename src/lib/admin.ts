import { supabase } from "./supabaseClient";
import type {
  TournamentMode,
  TournamentStatus,
  PrizeTier,
} from "../types/tournament";

export interface AdminTournament {
  id: string;
  name: string;
  mode: TournamentMode;
  map: string;
  entryFee: number;
  prizePool: number;
  perKill: number;
  entryPerPlayer: number;
  category: string | null;
  bannerImageUrl: string | null;
  status: TournamentStatus;
  isActive: boolean;
  startsAt: string; // ISO, unformatted — this is for editing, not display
  slotsTotal: number;
  slotsFilled: number;
  prizeDistribution: PrizeTier[];
}

export interface TournamentInput {
  name: string;
  mode: TournamentMode;
  map: string;
  entryFee: number;
  prizePool: number;
  perKill: number;
  entryPerPlayer: number;
  category: string | null;
  bannerImageUrl: string | null;
  status: TournamentStatus;
  isActive: boolean;
  startsAt: string; // ISO
  slotsTotal: number;
  prizeDistribution: PrizeTier[];
}

interface AdminTournamentRow {
  id: string;
  name: string;
  mode: TournamentMode;
  map: string;
  entry_fee: number;
  prize_pool: number;
  per_kill: number;
  entry_per_player: number;
  category: string | null;
  banner_image_url: string | null;
  status: TournamentStatus;
  is_active: boolean;
  starts_at: string;
  slots_total: number;
  slots_filled: number;
  prize_distribution: PrizeTier[];
}

function mapAdminTournamentRow(row: AdminTournamentRow): AdminTournament {
  return {
    id: row.id,
    name: row.name,
    mode: row.mode,
    map: row.map,
    entryFee: row.entry_fee,
    prizePool: row.prize_pool,
    perKill: row.per_kill,
    entryPerPlayer: row.entry_per_player,
    category: row.category,
    bannerImageUrl: row.banner_image_url,
    status: row.status,
    isActive: row.is_active,
    startsAt: row.starts_at,
    slotsTotal: row.slots_total,
    slotsFilled: row.slots_filled,
    prizeDistribution: row.prize_distribution,
  };
}

function toRow(input: TournamentInput) {
  return {
    name: input.name,
    mode: input.mode,
    map: input.map,
    entry_fee: input.entryFee,
    prize_pool: input.prizePool,
    per_kill: input.perKill,
    entry_per_player: input.entryPerPlayer,
    category: input.category,
    banner_image_url: input.bannerImageUrl,
    status: input.status,
    is_active: input.isActive,
    starts_at: input.startsAt,
    slots_total: input.slotsTotal,
    prize_distribution: input.prizeDistribution,
  };
}

export async function fetchAllTournaments(): Promise<{
  tournaments: AdminTournament[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .order("starts_at", { ascending: false });

  if (error) {
    return { tournaments: [], error: error.message };
  }

  return {
    tournaments: (data as AdminTournamentRow[]).map(mapAdminTournamentRow),
    error: null,
  };
}

export async function createTournament(
  input: TournamentInput
): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from("tournaments")
    .insert(toRow(input))
    .select("id")
    .single();

  if (error) {
    return { id: null, error: error.message };
  }

  return { id: data.id, error: null };
}

export async function updateTournament(
  id: string,
  input: TournamentInput
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("tournaments")
    .update(toRow(input))
    .eq("id", id);

  return { error: error?.message ?? null };
}

// One-tap activate/deactivate — doesn't require reopening the full edit
// form just to flip visibility to players.
export async function setTournamentActive(
  id: string,
  isActive: boolean
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("tournaments")
    .update({ is_active: isActive })
    .eq("id", id);

  return { error: error?.message ?? null };
}

export interface TournamentRoom {
  roomId: string | null;
  roomPassword: string | null;
}

export async function fetchTournamentRoom(
  tournamentId: string
): Promise<{ room: TournamentRoom | null; error: string | null }> {
  const { data, error } = await supabase
    .from("tournament_rooms")
    .select("room_id, room_password")
    .eq("tournament_id", tournamentId)
    .maybeSingle();

  if (error) {
    return { room: null, error: error.message };
  }

  return {
    room: data
      ? { roomId: data.room_id, roomPassword: data.room_password }
      : { roomId: null, roomPassword: null },
    error: null,
  };
}

export async function setTournamentRoom(
  tournamentId: string,
  roomId: string,
  roomPassword: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("tournament_rooms").upsert({
    tournament_id: tournamentId,
    room_id: roomId,
    room_password: roomPassword,
    updated_at: new Date().toISOString(),
  });

  return { error: error?.message ?? null };
}

export interface TournamentEntry {
  id: string;
  userId: string;
  displayName: string;
  squadName: string;
  players: { ign: string; uid: string }[];
  kills: number;
  placement: number | null;
  prizeWon: number;
}

export async function fetchTournamentEntries(tournamentId: string): Promise<{
  entries: TournamentEntry[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("entries")
    .select("id, user_id, squad_name, players, kills, placement, prize_won")
    .eq("tournament_id", tournamentId)
    .eq("status", "confirmed")
    .order("created_at", { ascending: true });

  if (error) {
    return { entries: [], error: error.message };
  }

  const userIds = [...new Set(data.map((row) => row.user_id))];
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", userIds);

  if (profilesError) {
    return { entries: [], error: profilesError.message };
  }

  const nameById = new Map(profiles.map((p) => [p.id, p.display_name as string]));

  const entries = data.map((row) => ({
    id: row.id,
    userId: row.user_id,
    displayName: nameById.get(row.user_id) ?? "Unknown",
    squadName: row.squad_name,
    players: row.players,
    kills: row.kills,
    placement: row.placement,
    prizeWon: row.prize_won,
  }));

  return { entries, error: null };
}

export async function payEntryPrize(
  entryId: string,
  kills: number,
  placement: number | null,
  prizeAmount: number
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("pay_entry_prize", {
    p_entry_id: entryId,
    p_kills: kills,
    p_placement: placement,
    p_prize_amount: prizeAmount,
  });

  return { error: error?.message ?? null };
}

export async function broadcastNotification(
  title: string,
  body: string
): Promise<{ recipientCount: number | null; error: string | null }> {
  const { data, error } = await supabase.rpc("broadcast_notification", {
    p_title: title,
    p_body: body,
  });

  if (error) {
    return { recipientCount: null, error: error.message };
  }

  return { recipientCount: data as number, error: null };
}

export interface PendingWithdrawal {
  id: string;
  userId: string;
  displayName: string;
  amount: number;
  upiId: string;
  createdAt: string;
}

export async function fetchIsAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  return data?.is_admin === true;
}

export async function fetchPendingWithdrawals(): Promise<{
  requests: PendingWithdrawal[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .select("id, user_id, amount, upi_id, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    return { requests: [], error: error.message };
  }

  const userIds = [...new Set(data.map((row) => row.user_id))];
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", userIds);

  if (profilesError) {
    return { requests: [], error: profilesError.message };
  }

  const nameById = new Map(profiles.map((p) => [p.id, p.display_name as string]));

  const requests = data.map((row) => ({
    id: row.id,
    userId: row.user_id,
    displayName: nameById.get(row.user_id) ?? "Unknown",
    amount: row.amount,
    upiId: row.upi_id,
    createdAt: row.created_at,
  }));

  return { requests, error: null };
}

export async function processWithdrawal(
  requestId: string,
  action: "paid" | "rejected"
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("process_withdrawal", {
    p_request_id: requestId,
    p_action: action,
  });

  return { error: error?.message ?? null };
}
