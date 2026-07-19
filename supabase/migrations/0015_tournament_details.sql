-- ARENA.GG — Tournament detail fields for the per-category contest browse UI
-- Run after 0014_admin_view_withdrawals.sql

alter table tournaments
  add column if not exists category text
    check (category in (
      'br-survival', 'br-full-map', 'clash-squad', 'lone-wolf',
      'free-tournaments', 'lone-wolf-2v2', 'gun-pro-1v1', 'br-only-survival'
    )),
  add column if not exists banner_image_url text,
  add column if not exists per_kill integer not null default 0,
  add column if not exists entry_per_player integer not null default 1;
