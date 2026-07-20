-- ARENA.GG — Direct banner image upload for tournaments
-- Run after 0027_broadcast_notification.sql
--
-- The admin "Banner Image URL" field previously required pasting a URL
-- from somewhere else. This adds a bucket admins can upload directly
-- into instead — same public-bucket pattern as avatars (0021), but
-- scoped to admins rather than per-user folders since only admins ever
-- write here.

insert into storage.buckets (id, name, public)
values ('tournament-banners', 'tournament-banners', true)
on conflict (id) do nothing;

create policy "Tournament banners are publicly readable"
  on storage.objects for select
  using (bucket_id = 'tournament-banners');

create policy "Admins can upload tournament banners"
  on storage.objects for insert
  with check (
    bucket_id = 'tournament-banners'
    and exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can update tournament banners"
  on storage.objects for update
  using (
    bucket_id = 'tournament-banners'
    and exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can delete tournament banners"
  on storage.objects for delete
  using (
    bucket_id = 'tournament-banners'
    and exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
