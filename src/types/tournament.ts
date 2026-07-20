export type TournamentMode = "Solo" | "Duo" | "Squad";

export const PLAYERS_PER_MODE: Record<TournamentMode, number> = {
  Solo: 1,
  Duo: 2,
  Squad: 4,
};

export type TournamentStatus = "upcoming" | "live" | "completed";

export interface PrizeTier {
  label: string; // e.g. "1st", "Top 4"
  amount: number; // in rupees
}

export interface Tournament {
  id: string;
  name: string;
  mode: TournamentMode;
  map: string;
  entryFee: number; // in rupees, per player
  prizePool: number; // in rupees
  perKill: number; // in rupees, per elimination
  entryPerPlayer: number;
  prizeDistribution: PrizeTier[];
  category: string | null; // e.g. "br-survival" — matches a GameModeCard id
  bannerImageUrl: string | null;
  status: TournamentStatus;
  isActive: boolean;
  startsAt: string; // human-readable for now, ISO string once wired to Supabase
  slotsTotal: number;
  slotsFilled: number;
  slotsLeft?: number; // if undefined, card shows "Filling" instead of a slot count
}

export interface PlayerInfo {
  ign: string; // in-game name
  uid: string; // Free Fire numeric UID
}

export type EntryStatus = "pending_payment" | "confirmed" | "cancelled";

export interface Entry {
  id: string;
  tournamentId: string;
  userId: string;
  squadName: string;
  players: PlayerInfo[];
  status: EntryStatus;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  squadName: string;
  wins: number;
  eliminations: number;
  points: number;
  earnings: number;
}

export interface HudStat {
  label: string;
  value: string;
}
