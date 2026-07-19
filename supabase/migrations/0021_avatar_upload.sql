-- ARENA.GG — Custom profile avatar images
-- Run after 0020_tournament_rooms.sql

alter table profiles
  add column if not exists avatar_url text;

-- Public bucket: avatars aren't sensitive, and serving them without an
-- auth header keeps <img> tags simple everywhere they're shown.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Object path convention: `${user_id}/${filename}` — the folder name
-- doubles as the ownership check below.
create policy "Avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
