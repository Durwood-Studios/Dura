-- ============================================================================
-- 20260629000004_tutorial_progress.sql  (STAGED — apply during go-live one-shot)
--
-- Ensures the tutorial_progress table exists with correct schema, RLS, and
-- indexes. Uses CREATE TABLE IF NOT EXISTS throughout so this is safe to re-run
-- even if 014-reconciliation.sql has already been applied.
--
-- Mirrors: src/types/tutorial.ts → TutorialProgress
--          src/lib/db/tutorial-progress.ts (IDB store: "tutorial-progress")
--          src/lib/supabase/queries/tutorial.ts (syncTutorialProgress)
-- ============================================================================

begin;

create table if not exists public.tutorial_progress (
  user_id        uuid    not null references public.profiles(id) on delete cascade,
  id             text    not null,          -- stable key: "tutorial:<slug>"
  slug           text    not null,
  type           text    not null,          -- "tutorial" | "howto"
  current_step   int     not null default 0,
  total_steps    int     not null default 0,
  checkpoints    jsonb   not null default '[]'::jsonb,
  started_at     bigint  not null,          -- epoch ms, matches IDB
  completed_at   bigint,                    -- epoch ms; null if incomplete
  last_active_at bigint  not null,
  updated_at     timestamptz not null default now(),
  primary key (user_id, id)
);

-- RLS — must match the pattern in 014-reconciliation.sql §3a.
alter table public.tutorial_progress enable row level security;

-- Policies are CREATE OR REPLACE-safe via the IF NOT EXISTS guard; Postgres
-- policy names must be unique per table so we only create them when absent.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tutorial_progress'
      and policyname = 'tutorial_progress: owner select'
  ) then
    execute $pol$
      create policy "tutorial_progress: owner select" on public.tutorial_progress
        for select using (auth.uid() = user_id)
    $pol$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tutorial_progress'
      and policyname = 'tutorial_progress: owner insert'
  ) then
    execute $pol$
      create policy "tutorial_progress: owner insert" on public.tutorial_progress
        for insert with check (auth.uid() = user_id)
    $pol$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tutorial_progress'
      and policyname = 'tutorial_progress: owner update'
  ) then
    execute $pol$
      create policy "tutorial_progress: owner update" on public.tutorial_progress
        for update using (auth.uid() = user_id) with check (auth.uid() = user_id)
    $pol$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tutorial_progress'
      and policyname = 'tutorial_progress: owner delete'
  ) then
    execute $pol$
      create policy "tutorial_progress: owner delete" on public.tutorial_progress
        for delete using (auth.uid() = user_id)
    $pol$;
  end if;
end $$;

-- Indexes — conditional so repeated runs don't error.
create index if not exists tutorial_progress_by_slug
  on public.tutorial_progress (user_id, slug);

create index if not exists tutorial_progress_by_active
  on public.tutorial_progress (user_id, last_active_at);

commit;

-- Verification (run after commit):
--   select relname, relrowsecurity from pg_class
--     where relname = 'tutorial_progress';   -- relrowsecurity = true
--   select count(*) from pg_policies
--     where tablename = 'tutorial_progress'; -- >= 4
