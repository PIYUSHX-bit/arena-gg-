-- ARENA.GG — Editable dashboard announcement banner
-- Run after 0025_site_rules.sql
--
-- The dashboard's marquee banner used to be hardcoded to "read the
-- rules" text; rules content has since moved to Terms & Conditions
-- (see 0025_site_rules.sql). This is a separate singleton, since the
-- dashboard banner is a general announcement slot, not rules content —
-- an admin should be able to change it to anything (a promo, a downtime
-- notice, etc.) independently of the rules text.

create table if not exists dashboard_announcement (
  id integer primary key default 1 check (id = 1),
  text text not null default '',
  updated_at timestamptz not null default now()
);

alter table dashboard_announcement enable row level security;

create policy "Dashboard announcement is publicly readable"
  on dashboard_announcement for select
  using (true);

create policy "Admins can update the dashboard announcement"
  on dashboard_announcement for update
  using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

insert into dashboard_announcement (id, text)
values (1, '📢 Welcome to ARENA.GG — new tournaments added daily!')
on conflict (id) do nothing;
