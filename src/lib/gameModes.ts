import type { GameModeCard } from "../types/dashboard";

export const GAME_MODES: GameModeCard[] = [
  {
    id: "br-survival",
    title: "Solo Survival Tournaments",
    category: "BR SURVIVAL",
    liveCount: 0,
    accentFrom: "from-ember",
    accentTo: "to-[#7A1F0A]",
  },
  {
    id: "br-full-map",
    title: "BR Full Map Tournaments",
    category: "BR FULL MAP",
    liveCount: 0,
    accentFrom: "from-zone",
    accentTo: "to-[#2E1A6B]",
  },
  {
    id: "clash-squad",
    title: "Clash Squad 1v1 Tournaments",
    category: "CLASH SQUAD",
    liveCount: 0,
    accentFrom: "from-amber",
    accentTo: "to-[#7A4B00]",
  },
  {
    id: "lone-wolf",
    title: "Lone Wolf 1v1 Tournaments",
    category: "LONE WOLF",
    liveCount: 0,
    accentFrom: "from-safe",
    accentTo: "to-[#0F5A32]",
  },
  {
    id: "free-tournaments",
    title: "Free Entry Tournaments",
    category: "FREE ENTRY",
    liveCount: 0,
    accentFrom: "from-safe",
    accentTo: "to-[#2E1A6B]",
  },
  {
    id: "lone-wolf-2v2",
    title: "Lone Wolf 2v2 Tournaments",
    category: "LONE WOLF 2V2",
    liveCount: 0,
    accentFrom: "from-zone",
    accentTo: "to-[#7A1F0A]",
  },
  {
    id: "gun-pro-1v1",
    title: "Gun Pro Head Only 1v1",
    category: "HEAD ONLY 1V1",
    liveCount: 0,
    accentFrom: "from-amber",
    accentTo: "to-[#7A1F0A]",
  },
  {
    id: "br-only-survival",
    title: "BR Only Survival Tournaments",
    category: "BR ONLY",
    liveCount: 0,
    accentFrom: "from-ember",
    accentTo: "to-[#7A4B00]",
  },
];

export function getGameModeById(id: string): GameModeCard | undefined {
  return GAME_MODES.find((m) => m.id === id);
}
