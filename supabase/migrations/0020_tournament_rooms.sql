-- ARENA.GG — Room ID / password delivery
-- Run after 0019_notifications.sql
--
-- Deliberately a separate table from `tournaments`, which is publicly
-- readable (`using (true)`) so the landing page and browse pages work
-- for logged-out visitors. Room credentials must only reach people who
-- actually paid to enter, so they get their own table with tighter RLS.

create table if not exists tournament_rooms (
  tournament_id uuid primary key references tournaments(id) on delete cascade,
  room_id text,
  room_password text,
  updated_at timestamptz not null default now()
);

alter table tournament_rooms enable row level security;

create policy "Confirmed entrants can view their match room"
  on tournament_rooms for select
  using (
    exists (
      select 1 from entries
      where entries.tournament_id = tournament_rooms.tournament_id
        and entries.user_id = auth.uid()
        and entries.status = 'confirmed'
    )
  );

create policy "Admins can view all rooms"
  on tournament_rooms for select
  using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can insert rooms"
  on tournament_rooms for insert
  with check (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can update rooms"
  on tournament_rooms for update
  using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- Notify confirmed entrants once the room is actually set (not on every
-- edit — only the first time room_id goes from null to something).
create or replace function notify_room_details_set()
returns trigger as $$
begin
  if new.room_id is not null and (tg_op = 'INSERT' or old.room_id is null) then
    insert into notifications (user_id, title, body, type)
    select
      entries.user_id,
      'Room ID Dropped',
      'Room ID and password are ready — check My Matches.',
      'info'
    from entries
    where entries.tournament_id = new.tournament_id
      and entries.status = 'confirmed';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_room_details_set_notify
  after insert or update on tournament_rooms
  for each row
  execute function notify_room_details_set();
