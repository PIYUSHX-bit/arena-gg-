export interface LeaderboardRow {
  userId: string;
  displayName: string;
  avatarColor: string;
  avatarUrl: string | null;
  wins: number;
  totalKills: number;
  totalEarnings: number; // rupees actually won
}

export interface TopSpenderRow {
  displayName: string;
  avatarColor: string;
  totalInvested: number; // rupees spent on entry fees
}
