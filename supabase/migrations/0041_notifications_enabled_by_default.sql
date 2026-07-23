-- ARENA.GG — Notifications on by default for every player
-- Run after 0040_pay_entry_capacity_guard.sql
--
-- important_notice_enabled (0005) now drives the actual push-notification
-- subscription (surfaced as the "Notifications" toggle in the menu,
-- moved off NotificationsPage) rather than being an inert flag nobody
-- read. It should default to on for every player — new signups and
-- everyone already registered.

alter table profiles
  alter column important_notice_enabled set default true;

update profiles
set important_notice_enabled = true
where important_notice_enabled = false;
