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
//
// SECURITY: the entry to confirm is looked up by `razorpay_order_id` —
// the value stamped on it back when create-razorpay-order made the order
// — never by a client-supplied `entryId`. A signature only proves *some*
// real payment happened for that specific order_id/payment_id pair; if
// the entry were looked up by a separate client-supplied id instead, a
// valid signature from any real (even tiny) payment could be replayed to
// confirm an unrelated, unpaid entry for free. The caller's identity is
// also verified from their JWT and checked against the entry's owner —
// never trust a client-sent user id.

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the JWT and get the real caller — never trust a client-sent user id.
    const jwt = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(jwt);

    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
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

    // Look the entry up by the order_id this exact signature was verified
    // against — never by a client-supplied entryId — so a valid signature
    // can only ever confirm the one entry it was actually issued for.
    const { data: entry, error: entryError } = await supabaseAdmin
      .from("entries")
      .select("id, user_id, status, players, tournaments(entry_fee)")
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (entryError || !entry) {
      return new Response(JSON.stringify({ error: "Entry not found for this order" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (entry.user_id !== userId) {
      return new Response(JSON.stringify({ error: "This entry does not belong to you" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (entry.status === "confirmed") {
      return new Response(JSON.stringify({ alreadyConfirmed: true }), {
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
      .eq("id", entry.id);

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
