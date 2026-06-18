-- ============================================================
-- Stride RLS policies — run once in Supabase → SQL Editor
-- Fixes: 401 / "new row violates row-level security policy".
--
-- These tables are written by the app using the public anon key
-- (keyed by wallet_address / guest id, not an auth session), so we
-- allow the anon + authenticated roles to read/write them. This
-- matches the app's existing trust model. The `profiles` table
-- (real accounts) stays locked down — see auth_schema.sql.
-- ============================================================

-- Helper: make a table readable + writable by anon + authenticated.
-- (Run the block below; it enables RLS then adds a permissive policy.)

do $$
declare t text;
begin
  foreach t in array array[
    'users',
    'commitments',
    'sessions',
    'routes',
    'challenges',
    'challenge_participants',
    'groups',
    'group_members'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "app_anon_all" on public.%I;', t);
    execute format(
      'create policy "app_anon_all" on public.%I for all to anon, authenticated using (true) with check (true);',
      t
    );
  end loop;
end $$;

-- Guides / articles are read-only content — allow reads only.
alter table public.content enable row level security;
drop policy if exists "content_read" on public.content;
create policy "content_read" on public.content for select to anon, authenticated using (true);
