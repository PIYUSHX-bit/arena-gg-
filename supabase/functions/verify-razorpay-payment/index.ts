// supabase/functions/verify-razorpay-payment/index.ts
//
// Deploy with: supabase functions deploy verify-razorpay-payment
// Called from the client immediately after Razorpay Checkout's success
// handler fires. This is a convenience path for fast UI feedback — you
// should ALSO configure a Razorpay webhook pointing at a third function
// (not included here) as the source of truth, since a user can close the
// browser tab after paying but before this call completes.
//
// Requires the same secrets as create-razorpay-order.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

async function hmacSha256Hex(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      entryId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    if (
      !entryId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const expectedSignature = await hmacSha256Hex(
      `${razorpay_order_id}|${razorpay_payment_id}`,
      keySecret
    );

    if (expectedSignature !== razorpay_signature) {
      return new Response(
        JSON.stringify({ error: "Payment signature verification failed" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Re-fetch amount server-side rather than trusting anything from the client
    const { data: entry, error: entryError } = await supabaseAdmin
      .from("entries")
      .select("id, players, tournaments(entry_fee)")
      .eq("id", entryId)
      .single();

    if (entryError || !entry) {
      return new Response(JSON.stringify({ error: "Entry not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const playerCount = Array.isArray(entry.players) ? entry.players.length : 1;
    // @ts-expect-error — Supabase's join typing collapses to an object here, not an array
    const entryFee = entry.tournaments?.entry_fee ?? 0;
    const amountPaid = entryFee * playerCount;

    const { error: updateError } = await supabaseAdmin
      .from("entries")
      .update({ status: "confirmed", amount_paid: amountPaid })
      .eq("id", entryId);

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ confirmed: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
