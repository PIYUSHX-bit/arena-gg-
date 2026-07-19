-- ARENA.GG — Ban flag for profiles

alter table profiles
  add column if not exists banned boolean not null default false;
