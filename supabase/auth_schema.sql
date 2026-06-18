-- ============================================================
-- Stride auth schema — run once in Supabase → SQL Editor
-- Enables username+email+password signup and login-by-username.
-- ============================================================

-- 1) Profile row per auth user (username is the public handle, unique)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text unique not null,
  email      text,
  city       text,
  activity   text default 'walk' check (activity in ('walk','run','both')),
  created_at timestamptz default now()
);

-- Case-insensitive uniqueness for usernames (so "Dee" and "dee" can't both exist)
create unique index if not exists profiles_username_lower_idx on public.profiles (lower(username));

alter table public.profiles enable row level security;

-- Users may read and edit only their own profile
drop policy if exists "profiles_own_select" on public.profiles;
create policy "profiles_own_select" on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles_own_insert" on public.profiles;
create policy "profiles_own_insert" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "profiles_own_update" on public.profiles;
create policy "profiles_own_update" on public.profiles for update using (auth.uid() = id);

-- 2) Auto-create the profile from signUp metadata (works with or without email confirmation)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, email, city, activity)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'mover_' || substr(new.id::text, 1, 8)),
    new.email,
    new.raw_user_meta_data->>'city',
    coalesce(new.raw_user_meta_data->>'activity', 'walk')
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3) Lookup helpers (SECURITY DEFINER — bypass RLS but only return what's needed)
create or replace function public.username_available(p_username text)
returns boolean language sql security definer set search_path = public as $$
  select not exists (select 1 from public.profiles where lower(username) = lower(trim(p_username)));
$$;

create or replace function public.email_available(p_email text)
returns boolean language sql security definer set search_path = public as $$
  select not exists (select 1 from public.profiles where lower(email) = lower(trim(p_email)));
$$;

create or replace function public.email_for_username(p_username text)
returns text language sql security definer set search_path = public as $$
  select email from public.profiles where lower(username) = lower(trim(p_username)) limit 1;
$$;

grant execute on function public.username_available(text) to anon, authenticated;
grant execute on function public.email_available(text)    to anon, authenticated;
grant execute on function public.email_for_username(text)  to anon, authenticated;
