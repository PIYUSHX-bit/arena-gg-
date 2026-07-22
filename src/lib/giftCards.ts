import { supabase } from "./supabaseClient";

export interface GiftCardStock {
  denomination: number;
  availableCount: number;
}

export interface MyGiftCard {
  id: string;
  denomination: number;
  code: string;
  assignedAt: string;
}

export async function fetchGiftCardStock(): Promise<{
  stock: GiftCardStock[];
  error: string | null;
}> {
  const { data, error } = await supabase.rpc("get_gift_card_stock");

  if (error) {
    return { stock: [], error: error.message };
  }

  const stock = (
    data as { denomination: number; available_count: number }[]
  ).map((row) => ({
    denomination: row.denomination,
    availableCount: Number(row.available_count),
  }));

  return { stock, error: null };
}

export async function redeemGiftCard(
  denomination: number
): Promise<{ code: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc("redeem_gift_card", {
    p_denomination: denomination,
  });

  if (error) {
    return { code: null, error: error.message };
  }

  return { code: data as string, error: null };
}

// RLS already restricts this to rows where assigned_to_user_id = auth.uid()
// — no explicit filter needed, a regular user's policy can't see anyone
// else's codes or the unassigned pool.
export async function fetchMyGiftCards(): Promise<{
  cards: MyGiftCard[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("gift_card_codes")
    .select("id, denomination, code, assigned_at")
    .order("assigned_at", { ascending: false });

  if (error) {
    return { cards: [], error: error.message };
  }

  const cards = (
    data as {
      id: string;
      denomination: number;
      code: string;
      assigned_at: string;
    }[]
  ).map((row) => ({
    id: row.id,
    denomination: row.denomination,
    code: row.code,
    assignedAt: row.assigned_at,
  }));

  return { cards, error: null };
}
