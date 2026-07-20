-- ARENA.GG — Admin broadcast notifications
-- Run after 0026_dashboard_announcement.sql
--
-- Everything in the notifications table so far (0019) came from triggers
-- reacting to something that already happened. This is the first
-- direct, admin-initiated write — one row per player, all in one
-- transaction, via a SECURITY DEFINER function since regular users have
-- no insert policy on notifications (by design, per 0019).

alter table notifications
  drop constraint notifications_type_check,
  add constraint notifications_type_check
    check (type in ('info', 'registration', 'payment', 'prize', 'withdrawal', 'announcement'));

create or replace function broadcast_notification(p_title text, p_body text)
returns integer as $$
declare
  v_caller uuid := auth.uid();
  v_is_admin boolean;
  v_count integer;
begin
  select is_admin into v_is_admin from profiles where id = v_caller;
  if v_is_admin is not true then
    raise exception 'Not authorized';
  end if;

  if p_title is null or length(trim(p_title)) = 0 then
    raise exception 'Title is required';
  end if;

  insert into notifications (user_id, title, body, type)
  select id, p_title, p_body, 'announcement'
  from profiles;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function broadcast_notification(text, text) to authenticated;
