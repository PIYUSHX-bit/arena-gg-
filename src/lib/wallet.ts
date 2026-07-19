import { supabase } from "./supabaseClient";
import type { WalletTransaction } from "../types/wallet";

interface WalletTransactionRow {
  id: string;
  amount: number;
  type: WalletTransaction["type"];
  description: string;
  created_at: string;
}

export async function fetchWalletBalance(
  userId: string
): Promise<{ balance: number; error: string | null }> {
  const { data, error } = await supabase
    .from("wallets")
    .select("balance")
    .eq("id", userId)
    .single();

  if (error) {
    return { balance: 0, error: error.message };
  }

  return { balance: data.balance, error: null };
}

export async function fetchWalletTransactions(
  userId: string,
  limit = 30
): Promise<{ transactions: WalletTransaction[]; error: string | null }> {
  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("id, amount, type, description, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { transactions: [], error: error.message };
  }

  const transactions = (data as WalletTransactionRow[]).map((row) => ({
    id: row.id,
    amount: row.amount,
    type: row.type,
    description: row.description,
    createdAt: row.created_at,
  }));

  return { transactions, error: null };
}

// Requires the caller's session token, since the Edge Function verifies
// identity from the JWT rather than trusting a client-supplied user id.
export async function createWalletTopupOrder(amount: number): Promise<{
  orderId: string | null;
  amountPaise: number | null;
  currency: string | null;
  keyId: string | null;
  error: string | null;
}> {
  const { data, error } = await supabase.functions.invoke(
    "create-wallet-topup-order",
    { body: { amount } }
  );

  if (error || data?.error) {
    return {
      orderId: null,
      amountPaise: null,
      currency: null,
      keyId: null,
      error: data?.error ?? error?.message ?? "Could not start top-up",
    };
  }

  return {
    orderId: data.orderId,
    amountPaise: data.amount,
    currency: data.currency,
    keyId: data.keyId,
    error: null,
  };
}

export async function requestWithdrawal(
  amount: number,
  upiId: string
): Promise<{ requestId: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc("request_withdrawal", {
    p_amount: amount,
    p_upi_id: upiId,
  });

  if (error) {
    return { requestId: null, error: error.message };
  }

  return { requestId: data as string, error: null };
}

export async function verifyWalletTopup(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<{ confirmed: boolean; error: string | null }> {
  const { data, error } = await supabase.functions.invoke(
    "verify-wallet-topup",
    { body: params }
  );

  if (error || data?.error) {
    return {
      confirmed: false,
      error: data?.error ?? error?.message ?? "Verification failed",
    };
  }

  return { confirmed: true, error: null };
}
