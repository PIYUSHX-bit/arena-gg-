export interface Profile {
  id: string;
  displayName: string;
  ffIgn: string | null;
  ffUid: string | null;
  phoneNumber: string | null;
  referralCode: string | null;
  referredBy: string | null;
  avatarColor: string;
  avatarUrl: string | null;
  importantNoticeEnabled: boolean;
  isAdmin: boolean;
  createdAt: string;
}

export interface ProfileStats {
  totalEntries: number;
  confirmedEntries: number;
  totalSpent: number; // rupees
  totalKills: number;
  totalWins: number;
  totalEarnings: number; // rupees actually won
}
