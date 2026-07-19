export interface LeaderboardRow {
  displayName: string;
  avatarColor: string;
  wins: number;
  totalKills: number;
  totalEarnings: number; // rupees actually won
}

export interface TopSpenderRow {
  displayName: string;
  avatarColor: string;
  totalInvested: number; // rupees spent on entry fees
}
