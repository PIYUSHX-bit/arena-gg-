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
  status: TournamentStatus;
  roomId: string | null;
  roomPassword: string | null;
}
