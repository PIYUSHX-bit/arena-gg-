export type WalletTransactionType =
  | "deposit"
  | "tournament_entry"
  | "prize_payout"
  | "withdrawal"
  | "refund"
  | "adjustment"
  | "referral_bonus"
  | "gift_card_redemption";

export interface WalletTransaction {
  id: string;
  amount: number; // signed — positive credit, negative debit
  type: WalletTransactionType;
  description: string;
  reference: string | null;
  createdAt: string;
}
