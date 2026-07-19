-- ARENA.GG — Menu preferences
-- Run in Supabase SQL editor after 0004_tournament_status.sql

alter table profiles
  add column if not exists important_notice_enabled boolean not null default false;
