export type MatchStatus = "ongoing" | "upcoming" | "completed";

export interface GameModeCard {
  id: string;
  title: string;
  category: string; // e.g. "BR SURVIVAL" — the small label bottom-left
  liveCount: number;
  accentFrom: string; // tailwind gradient stop, e.g. "from-ember"
  accentTo: string;
}
