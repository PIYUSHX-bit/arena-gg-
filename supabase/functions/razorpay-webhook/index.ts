// supabase/functions/razorpay-webhook/index.ts
//
// This is the SOURCE OF TRUTH for payment confirmation — unlike
// verify-razorpay-payment (which only runs if the user's browser is still
// open), Razorpay calls this directly from their servers, so it fires even
// if the user closes the tab right after paying.
//
// Setup:
//   1. Deploy: supabase functions deploy razorpay-webhook --no-verify-jwt
//      (--no-verify-jwt is required — Razorpay can't send a Supabase auth
//      token, it authenticates via the signature check below instead)
//   2. In Razorpay Dashboard → Settings → Webhooks → Add New Webhook:
//        URL: https://<your-project-ref>.functions.supabase.co/razorpay-webhook
//        Active events: payment.captured
//        Set a webhook secret (different from your API key secret)
//   3. supabase secrets set RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Signature is computed over the exact raw body, so read it as text
  // BEFORE any JSON parsing — re-serializing would change whitespace/key
  // order and break verification.
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");
  const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!;

  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const expectedSignature = await hmacSha256Hex(rawBody, webhookSecret);
  if (expectedSignature !== signature) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(rawBody);

  // We only care about successful captures. Razorpay sends many event
  // types (order.paid, payment.authorized, payment.failed, etc) — ignore
  // anything else with a 200 so Razorpay doesn't keep retrying it.
  if (event.event !== "payment.captured") {
    return new Response(JSON.stringify({ ignored: event.event }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const payment = event.payload?.payment?.entity;
  const orderId: string | undefined = payment?.order_id;
  const amountPaidRupees = payment?.amount ? payment.amount / 100 : 0;

  if (!orderId) {
    return new Response(JSON.stringify({ error: "No order_id in payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Try tournament entries first, then wallet top-ups — one webhook
  // endpoint covers both payment types rather than registering two
  // separate webhooks in the Razorpay dashboard.
  const { data: entry } = await supabaseAdmin
    .from("entries")
    .select("id, status")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();

  if (entry) {
    if (entry.status === "confirmed") {
      return new Response(JSON.stringify({ alreadyConfirmed: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { error: updateError } = await supabaseAdmin
      .from("entries")
      .update({ status: "confirmed", amount_paid: amountPaidRupees })
      .eq("id", entry.id);

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ confirmed: true, type: "entry" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: topup } = await supabaseAdmin
    .from("wallet_topups")
    .select("id, user_id, amount, status")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();

  if (topup) {
    if (topup.status === "completed") {
      return new Response(JSON.stringify({ alreadyConfirmed: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { error: txError } = await supabaseAdmin.from("wallet_transactions").insert({
      user_id: topup.user_id,
      amount: topup.amount,
      type: "deposit",
      reference: orderId,
      description: "Wallet top-up",
    });

    if (txError) {
      return new Response(JSON.stringify({ error: txError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    await supabaseAdmin
      .from("wallet_topups")
      .update({ status: "completed" })
      .eq("id", topup.id);

    return new Response(JSON.stringify({ confirmed: true, type: "wallet_topup" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Don't 500 here — Razorpay will retry indefinitely on 5xx. An order_id
  // matching neither an entry nor a top-up is a data problem to
  // investigate manually, not something retrying will fix.
  return new Response(
    JSON.stringify({ error: `No entry or top-up found for order ${orderId}` }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
