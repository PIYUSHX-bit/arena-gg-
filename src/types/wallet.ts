export type WalletTransactionType =
  | "deposit"
  | "tournament_entry"
  | "prize_payout"
  | "withdrawal"
  | "refund"
  | "adjustment";

export interface WalletTransaction {
  id: string;
  amount: number; // signed — positive credit, negative debit
  type: WalletTransactionType;
  description: string;
  createdAt: string;
}
