-- =============================================================================
-- 001-profiles.sql — User profiles
-- =============================================================================
-- Sync strategy: Profile is created server-side via trigger on auth.users insert.
-- Client reads profile after login to display name/avatar. Updates flow from
-- client → Supabase directly (no IDB mirror needed for profiles).
-- =============================================================================

-- Reusable trigger function: set updated_at to now() on every UPDATE.
-- Shared across all tables that have an updated_at column.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  preferences  jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.profiles is
  'User profile, auto-created on signup. Stores display name, avatar, and synced preferences.';

-- RLS -----------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Users can read only their own profile
create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can insert their own profile (fallback if trigger misses)
create policy "profiles: insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can update only their own profile
create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Users can delete their own profile (account deletion)
create policy "profiles: delete own"
  on public.profiles for delete
  using (auth.uid() = id);

-- Trigger: auto-update updated_at ----------------------------------------
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- Trigger: auto-create profile on signup ----------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
