-- ARENA.GG — Prevent duplicate gift card codes
-- Run after 0043_referral_bonus_amount.sql
--
-- addGiftCardCode() had no server-side guard against adding the same
-- code twice (e.g. an admin double-submitting the "Add to Stock" form,
-- or pasting the same code into two denominations by mistake). Two rows
-- with an identical code could then be redeemed by two different
-- players, and whoever redeems second gets a code Google Play already
-- rejects as used — an undetectable-until-a-support-ticket way to hand
-- out a broken prize. Verified no duplicates exist in current data
-- before adding this, so the constraint applies cleanly.

alter table gift_card_codes
  add constraint gift_card_codes_code_key unique (code);
