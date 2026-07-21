import type { TournamentMode, TournamentStatus } from "./tournament";

export type { TournamentStatus };

export interface Match {
  entryId: string;
  squadName: string;
  players: { ign: string; uid: string }[];
  tournamentId: string;
  tournamentName: string;
  mode: TournamentMode;
  map: string;
  startsAt: string; // formatted for display
  startsAtIso: string;
  status: TournamentStatus;
  roomId: string | null;
  roomPassword: string | null;
  // Same fields TournamentDetailCard needs — carried along so My Matches
  // can render the identical card instead of a separate, thinner one.
  entryFee: number;
  prizePool: number;
  perKill: number;
  entryPerPlayer: number;
  category: string | null;
  bannerImageUrl: string | null;
  slotsTotal: number;
  slotsFilled: number;
}
