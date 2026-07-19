// supabase/functions/create-razorpay-order/index.ts
//
// Deploy with: supabase functions deploy create-razorpay-order
// Requires these secrets set via `supabase secrets set`:
//   RAZORPAY_KEY_ID
//   RAZORPAY_KEY_SECRET
//   SUPABASE_URL              (auto-provided by Supabase)
//   SUPABASE_SERVICE_ROLE_KEY (set manually — needed to read entries bypassing RLS)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { entryId } = await req.json();

    if (!entryId) {
      return new Response(JSON.stringify({ error: "entryId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up the entry + its tournament server-side so the client can never
    // spoof the amount being charged.
    const { data: entry, error: entryError } = await supabaseAdmin
      .from("entries")
      .select("id, status, players, tournaments(entry_fee)")
      .eq("id", entryId)
      .single();

    if (entryError || !entry) {
      return new Response(JSON.stringify({ error: "Entry not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (entry.status !== "pending_payment") {
      return new Response(
        JSON.stringify({ error: "This entry is not awaiting payment" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const playerCount = Array.isArray(entry.players) ? entry.players.length : 1;
    // @ts-expect-error — Supabase's join typing collapses to an object here, not an array
    const entryFee = entry.tournaments?.entry_fee ?? 0;
    const amountInPaise = entryFee * playerCount * 100; // Razorpay expects paise

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
        amount: amountInPaise,
        currency: "INR",
        receipt: entryId,
        notes: { entry_id: entryId },
      }),
    });

    if (!orderRes.ok) {
      const errBody = await orderRes.text();
      return new Response(
        JSON.stringify({ error: `Razorpay order creation failed: ${errBody}` }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const order = await orderRes.json();

    // Save the order ID on the entry now so the webhook can look this
    // entry up later without needing to call Razorpay's API again.
    const { error: saveOrderIdError } = await supabaseAdmin
      .from("entries")
      .update({ razorpay_order_id: order.id })
      .eq("id", entryId);

    if (saveOrderIdError) {
      return new Response(
        JSON.stringify({ error: saveOrderIdError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId, // public key — safe to expose to the client Checkout widget
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
