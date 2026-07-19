# ARENA.GG

Free Fire tournament platform — React + Vite + TypeScript + Tailwind + Supabase.

## 1. Install

```bash
npm install
```

## 2. Environment variables

```bash
cp .env.example .env
```

Fill in your Supabase project's URL and anon key (Supabase dashboard → Settings → API):

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

## 3. Database setup

Run every file in `supabase/migrations/` **in order** (0001 → highest number) in the Supabase SQL editor. `supabase/schema.sql` is the original base schema — only run it instead of the migrations if you're setting up completely fresh; if you've already run any migrations, skip it and just keep going from the next unrun migration number.

## 4. Edge Functions

Deploy each function in `supabase/functions/`:

```bash
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
supabase functions deploy razorpay-webhook --no-verify-jwt
supabase functions deploy create-wallet-topup-order
supabase functions deploy verify-wallet-topup
```

Then set the secrets they need:

```bash
supabase secrets set RAZORPAY_KEY_ID=rzp_xxxxx
supabase secrets set RAZORPAY_KEY_SECRET=xxxxx
supabase secrets set RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

`SUPABASE_URL` is auto-provided by Supabase — you don't set that one yourself.

In the Razorpay dashboard, add a webhook pointing at:
`https://<your-project-ref>.functions.supabase.co/razorpay-webhook`, active event `payment.captured`.

## 5. Run it

```bash
npm run dev
```

Opens at `http://localhost:5173`.

## 6. Add a test tournament

The `tournaments` table starts empty — nothing will show up in the app until you insert at least one row:

```sql
insert into tournaments (name, mode, map, entry_fee, prize_pool, starts_at, slots_total)
values ('Bermuda Blitz #14', 'Squad', 'Bermuda', 40, 18000, now() + interval '2 hours', 25);
```
