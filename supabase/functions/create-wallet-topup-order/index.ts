// supabase/functions/create-wallet-topup-order/index.ts
//
// Deploy with: supabase functions deploy create-wallet-topup-order
// Same secrets as create-razorpay-order (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET,
// SUPABASE_SERVICE_ROLE_KEY).
//
// Unlike create-razorpay-order, this verifies the caller's identity from
// their JWT rather than trusting a client-supplied user id — worth
// applying the same fix to create-razorpay-order at some point, since
// right now it doesn't check that the caller owns the entry they're
// paying for.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const MIN_TOPUP = 10;
const MAX_TOPUP = 50000;

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
    const { amount } = await req.json();

    if (!Number.isInteger(amount) || amount < MIN_TOPUP || amount > MAX_TOPUP) {
      return new Response(
        JSON.stringify({ error: `Amount must be between ₹${MIN_TOPUP} and ₹${MAX_TOPUP}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const keyId = Deno.env.get("RAZORPAY_KEY_ID")!;
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const basicAuth = btoa(`${keyId}:${keySecret}`);

    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount * 100, // paise
        currency: "INR",
        notes: { user_id: userId, purpose: "wallet_topup" },
      }),
    });

    if (!orderRes.ok) {
      const errBody = await orderRes.text();
      return new Response(
        JSON.stringify({ error: `Razorpay order creation failed: ${errBody}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const order = await orderRes.json();

    const { error: insertError } = await supabaseAdmin.from("wallet_topups").insert({
      user_id: userId,
      razorpay_order_id: order.id,
      amount,
      status: "pending",
    });

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
