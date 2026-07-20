-- ARENA.GG — Editable rules content
-- Run after 0024_signup_required_fields.sql
--
-- The marquee banner text and the Rules page body were both hardcoded in
-- the frontend. Singleton row (id always 1) rather than a full table,
-- since there's exactly one rules document for the whole app — same
-- pattern you'd use for a settings table.

create table if not exists site_rules (
  id integer primary key default 1 check (id = 1),
  banner_text text not null default '',
  sections jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

alter table site_rules enable row level security;

create policy "Rules are publicly readable"
  on site_rules for select
  using (true);

create policy "Admins can update rules"
  on site_rules for update
  using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- Seed with the content that was previously hardcoded in RulesBanner.tsx
-- and RulesPage.tsx, so moving to the DB doesn't blank the page out.
insert into site_rules (id, banner_text, sections)
values (
  1,
  'CLICK HERE TO READ ALL THE RULES 📌🎮 Every player of Free Fire...',
  '[
    {
      "title": "Registration",
      "points": [
        "Enter your correct Free Fire IGN and UID at registration — mismatched details can get your entry rejected without refund.",
        "Squad size must match the tournament mode exactly (Solo: 1, Duo: 2, Squad: 4).",
        "Check in within the check-in window before the match starts, or your slot may be forfeited."
      ]
    },
    {
      "title": "Match Conduct",
      "points": [
        "Join the custom room using the exact in-game name you registered with.",
        "Room ID and password are sent 15 minutes before the match — do not share them outside your squad.",
        "Stream sniping, teaming with opposing squads, or intentionally feeding kills is grounds for disqualification."
      ]
    },
    {
      "title": "Fair Play",
      "points": [
        "Use of emulators is not allowed in mobile-only tournaments unless explicitly stated otherwise.",
        "Any hacks, mod menus, macros, or third-party software that alters gameplay result in an immediate ban.",
        "Multiple accounts entered by the same player into one tournament will have all related entries disqualified."
      ]
    },
    {
      "title": "Results & Disputes",
      "points": [
        "Match results are pulled from the server — screenshots are not accepted as proof of placement or kills.",
        "Disputes must be raised within 24 hours of the match ending, via Contact Us.",
        "ARENA.GG''s admin decision on disputes is final."
      ]
    },
    {
      "title": "Payouts",
      "points": [
        "Prize winnings are credited after results are verified — typically within 24 hours.",
        "Payouts may be withheld pending investigation of a suspected rule violation."
      ]
    }
  ]'::jsonb
)
on conflict (id) do nothing;
