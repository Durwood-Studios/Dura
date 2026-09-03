-- ============================================================================
-- 014-reconciliation.sql  (STAGED — apply during the Supabase go-live one-shot)
--
-- Brings the schema in line with the full app data model + closes the gaps and
-- security issues found in the 2026-06-16 audit (see AUDIT.md / RUNBOOK.md).
-- Apply AFTER 001–013, in a single transaction where possible. Every new table
-- has RLS enabled with owner-scoped policies. No service-role anywhere.
--
-- Sections:
--   1. P0 functional fixes (schema is currently broken without these)
--   2. P1 security hardening (close PII exposure + view RLS-bypass)
--   3. P2 close sync gaps (new tables for unsynced learner stores)
-- ============================================================================

begin;

-- ─────────────────────────────────────────────────────────────────────────
-- 1. P0 — functional fixes
-- ─────────────────────────────────────────────────────────────────────────

-- 1a. profiles.email — handle_new_user() (006) inserts it and profile.ts reads
--     it, but 001 never created the column. Signup trigger fails without this.
alter table public.profiles add column if not exists email text;

-- 1b. streaks — user_stats view (007) joins public.streaks, which no migration
--     creates, so the view fails to build. Create it, owner-scoped.
create table if not exists public.streaks (
  user_id          uuid primary key references public.profiles(id) on delete cascade,
  current_streak   int not null default 0,
  longest_streak   int not null default 0,
  last_active_date date,
  updated_at       timestamptz not null default now()
);
alter table public.streaks enable row level security;
create policy "streaks: owner select" on public.streaks
  for select using (auth.uid() = user_id);
create policy "streaks: owner upsert" on public.streaks
  for insert with check (auth.uid() = user_id);
create policy "streaks: owner update" on public.streaks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 1c. Table-name drift — the query layer (analytics.ts, activity.ts) targets
--     names that differ from the migrations. Rename the tables to what the code
--     already expects so no app code has to change. (RLS policies + indexes
--     follow the table automatically.)
alter table if exists public.analytics     rename to analytics_events;  -- code: analytics.ts
alter table if exists public.activity_feed rename to activity;          -- code: activity.ts
-- NOTE: `content_index` (search.ts) vs `content_embeddings` (011) is NOT a
-- rename — they are different concepts. See RUNBOOK §3 for the view/decision.

-- 1d. sync_progress + update_user_preferences function fixes are documented in
--     RUNBOOK §2 (they require editing the existing function bodies in 006/012;
--     staged separately so they can be reviewed against the full definitions).

-- ─────────────────────────────────────────────────────────────────────────
-- 2. P1 — security hardening
-- ─────────────────────────────────────────────────────────────────────────

-- 2a. certificates: drop the `using (true)` public-read policy. It exposes
--     every certificate's user_id + display_name + scores to anonymous users.
--     Public verification already runs through the hash-scoped
--     get_certificate_by_hash() SECURITY DEFINER RPC (006) — the blanket policy
--     is redundant AND a PII leak. Drop any permissive SELECT policy by shape.
do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'certificates'
      and cmd = 'SELECT' and qual = 'true'
  loop
    execute format('drop policy %I on public.certificates', pol.policyname);
  end loop;
end $$;

-- 2b. Views bypass RLS unless security_invoker is on (Postgres 15+, Supabase).
--     Without it, user_stats / phase_completion / leaderboard / learning_insights
--     return cross-user data to any caller. Make them honor underlying RLS.
alter view if exists public.user_stats        set (security_invoker = on);
alter view if exists public.phase_completion  set (security_invoker = on);
alter view if exists public.leaderboard       set (security_invoker = on);
alter view if exists public.learning_insights set (security_invoker = on);
-- leaderboard is intentionally cross-user; if it must stay public, expose it via
-- a column-minimized SECURITY DEFINER function instead and revoke the view:
-- revoke select on public.leaderboard from anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- 3. P2 — close the sync gaps (learner stores with no backing table)
--    Shapes mirror src/types/{tutorial,dojo}.ts and the concept-retention query.
-- ─────────────────────────────────────────────────────────────────────────

-- 3a. tutorial_progress  ←→  IDB "tutorial-progress" (src/types/tutorial.ts)
create table if not exists public.tutorial_progress (
  user_id        uuid not null references public.profiles(id) on delete cascade,
  id             text not null,
  slug           text not null,
  type           text not null,
  current_step   int  not null default 0,
  total_steps    int  not null default 0,
  checkpoints    jsonb not null default '[]'::jsonb,
  started_at     bigint not null,             -- epoch ms, matches IDB
  completed_at   bigint,                       -- epoch ms, null if incomplete
  last_active_at bigint not null,
  updated_at     timestamptz not null default now(),
  primary key (user_id, id)
);
alter table public.tutorial_progress enable row level security;
create policy "tutorial_progress: owner select" on public.tutorial_progress
  for select using (auth.uid() = user_id);
create policy "tutorial_progress: owner insert" on public.tutorial_progress
  for insert with check (auth.uid() = user_id);
create policy "tutorial_progress: owner update" on public.tutorial_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tutorial_progress: owner delete" on public.tutorial_progress
  for delete using (auth.uid() = user_id);
create index tutorial_progress_by_slug on public.tutorial_progress (user_id, slug);
create index tutorial_progress_by_active on public.tutorial_progress (user_id, last_active_at);

-- 3b. dojo_sessions  ←→  IDB "dojo-sessions" (src/types/dojo.ts). Append-only
--     history (immutable completed sessions) — no UPDATE policy by design.
create table if not exists public.dojo_sessions (
  user_id      uuid not null references public.profiles(id) on delete cascade,
  id           text not null,
  started_at   bigint not null,               -- epoch ms
  completed_at bigint not null,               -- epoch ms
  tier         text not null check (tier in ('T1','T3')),
  phase_filter text,                            -- null = mixed
  results      jsonb not null default '[]'::jsonb,
  avg_score    real not null default 0,        -- 1–10
  created_at   timestamptz not null default now(),
  primary key (user_id, id)
);
alter table public.dojo_sessions enable row level security;
create policy "dojo_sessions: owner select" on public.dojo_sessions
  for select using (auth.uid() = user_id);
create policy "dojo_sessions: owner insert" on public.dojo_sessions
  for insert with check (auth.uid() = user_id);
create policy "dojo_sessions: owner delete" on public.dojo_sessions
  for delete using (auth.uid() = user_id);
create index dojo_sessions_by_completed on public.dojo_sessions (user_id, completed_at);
create index dojo_sessions_by_phase on public.dojo_sessions (user_id, phase_filter);

-- 3c. concept_retention  ←→  queries/concept-retention.ts
--     (.from("concept_retention").select("concept_id, last_practiced, strength"))
create table if not exists public.concept_retention (
  user_id       uuid not null references public.profiles(id) on delete cascade,
  concept_id    text not null,
  last_practiced timestamptz not null default now(),
  strength      real not null default 0,        -- 0.0–1.0, decays over time
  updated_at    timestamptz not null default now(),
  primary key (user_id, concept_id)
);
alter table public.concept_retention enable row level security;
create policy "concept_retention: owner select" on public.concept_retention
  for select using (auth.uid() = user_id);
create policy "concept_retention: owner insert" on public.concept_retention
  for insert with check (auth.uid() = user_id);
create policy "concept_retention: owner update" on public.concept_retention
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index concept_retention_by_strength on public.concept_retention (user_id, strength);

-- NOTE: sandbox_saves + assessment_results tables already exist with correct RLS
-- (005, 004) but sync.ts never wires them. That is an app-code change (add
-- push/pull + a queries/*.ts module), not a migration — see RUNBOOK §3.

-- ─────────────────────────────────────────────────────────────────────────
-- 4. user_stats view (deferred from 007 — requires streaks created above)
-- ─────────────────────────────────────────────────────────────────────────
create or replace view public.user_stats as
select
  p.id as user_id,
  p.display_name,
  coalesce(xp.total_xp, 0)                         as total_xp,
  floor(sqrt(coalesce(xp.total_xp, 0) / 100.0))    as level,
  coalesce(lp.lessons_completed, 0)                  as lessons_completed,
  coalesce(lp.total_time_spent_ms, 0)                as total_time_spent_ms,
  coalesce(s.current_streak, 0)                      as current_streak,
  coalesce(s.longest_streak, 0)                      as longest_streak
from public.profiles p
left join (
  select user_id, sum(amount) as total_xp
  from public.xp_events
  group by user_id
) xp on xp.user_id = p.id
left join (
  select
    user_id,
    count(*) filter (where completed_at is not null) as lessons_completed,
    sum(time_spent_ms) as total_time_spent_ms
  from public.lesson_progress
  group by user_id
) lp on lp.user_id = p.id
left join (
  select user_id, current_streak, longest_streak
  from public.streaks
) s on s.user_id = p.id;

commit;

-- Verification (run after commit; all should return expected results):
--   select count(*) from pg_policies where schemaname='public'
--     and tablename in ('streaks','tutorial_progress','dojo_sessions','concept_retention');  -- > 0 each
--   select relname, relrowsecurity from pg_class where relname in
--     ('streaks','tutorial_progress','dojo_sessions','concept_retention') and relrowsecurity;  -- all true
--   select count(*) from pg_policies where tablename='certificates' and qual='true';  -- 0
