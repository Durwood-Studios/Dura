-- =============================================================================
-- 005-analytics-and-xp.sql — Analytics events, XP log, sandbox saves, track progress
-- =============================================================================
-- Sync strategy:
--   - analytics: batch-synced from IDB every 5s (see src/lib/analytics.ts).
--     IDB synced flag (0/1) tracks which events need pushing. Append-only.
--   - xp_events: append-only, synced alongside analytics batches
--   - sandbox_saves: upsert from IDB, latest updated_at wins
--   - track_progress: career track skill checklist, upsert per (user, role, skill)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- analytics — mirrors IDB "analytics" store
-- ---------------------------------------------------------------------------
create table public.analytics (
  id          text not null,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,                      -- AnalyticsEventName
  timestamp   bigint not null,                    -- epoch ms
  properties  jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),

  primary key (user_id, id)
);

comment on table public.analytics is
  'Privacy-first analytics events. No PII. Batch-synced from IDB. Append-only.';

alter table public.analytics enable row level security;

create policy "analytics: select own"
  on public.analytics for select
  using (auth.uid() = user_id);

create policy "analytics: insert own"
  on public.analytics for insert
  with check (auth.uid() = user_id);

-- Append-only: no update policy
create policy "analytics: delete own"
  on public.analytics for delete
  using (auth.uid() = user_id);

-- Query: "events in time range" for activity charts
create index analytics_by_timestamp on public.analytics (user_id, timestamp);
-- Query: "count of specific event type"
create index analytics_by_name on public.analytics (user_id, name);

-- ---------------------------------------------------------------------------
-- xp_events — mirrors IDB "xp-events" store
-- ---------------------------------------------------------------------------
create table public.xp_events (
  id          text not null,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  source      text not null
              check (source in (
                'lesson', 'quiz', 'flashcard', 'sandbox',
                'mastery-gate', 'verification', 'phase-complete', 'module-complete'
              )),
  amount      integer not null,
  source_id   text not null,                      -- lesson/quiz/card ID that earned XP
  awarded_at  bigint not null,                    -- epoch ms
  created_at  timestamptz not null default now(),

  primary key (user_id, id)
);

comment on table public.xp_events is
  'XP award log. Append-only. Mirrors IDB xp-events store.';

alter table public.xp_events enable row level security;

create policy "xp_events: select own"
  on public.xp_events for select
  using (auth.uid() = user_id);

create policy "xp_events: insert own"
  on public.xp_events for insert
  with check (auth.uid() = user_id);

-- Append-only: no update policy
create policy "xp_events: delete own"
  on public.xp_events for delete
  using (auth.uid() = user_id);

create index xp_events_by_source on public.xp_events (user_id, source);
create index xp_events_by_awarded on public.xp_events (user_id, awarded_at);

-- ---------------------------------------------------------------------------
-- sandbox_saves — mirrors IDB "sandbox-saves" store
-- ---------------------------------------------------------------------------
create table public.sandbox_saves (
  id          text not null,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  language    text not null
              check (language in ('javascript', 'typescript', 'html', 'react')),
  code        text not null,
  created_at  bigint not null,                    -- epoch ms
  updated_at  bigint not null,                    -- epoch ms
  synced_at   timestamptz not null default now(),

  primary key (user_id, id)
);

comment on table public.sandbox_saves is
  'Saved code snippets from the sandbox editor. Mirrors IDB sandbox-saves store.';

alter table public.sandbox_saves enable row level security;

create policy "sandbox_saves: select own"
  on public.sandbox_saves for select
  using (auth.uid() = user_id);

create policy "sandbox_saves: insert own"
  on public.sandbox_saves for insert
  with check (auth.uid() = user_id);

create policy "sandbox_saves: update own"
  on public.sandbox_saves for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "sandbox_saves: delete own"
  on public.sandbox_saves for delete
  using (auth.uid() = user_id);

create index sandbox_saves_by_updated on public.sandbox_saves (user_id, updated_at);

-- ---------------------------------------------------------------------------
-- track_progress — career track skill checklist state
-- ---------------------------------------------------------------------------
-- No IDB mirror yet. This table tracks which skills a user has checked off
-- within a career track role, enabling cross-device persistence of the
-- skill checklist on /tracks/[role] pages.
create table public.track_progress (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  role_id     text not null,                      -- career track role slug
  skill_id    text not null,                      -- skill identifier
  completed   boolean not null default false,
  completed_at bigint,                            -- epoch ms
  updated_at  timestamptz not null default now(),

  primary key (user_id, role_id, skill_id)
);

comment on table public.track_progress is
  'Career track skill checklist state. Tracks which skills a user has completed per role.';

alter table public.track_progress enable row level security;

create policy "track_progress: select own"
  on public.track_progress for select
  using (auth.uid() = user_id);

create policy "track_progress: insert own"
  on public.track_progress for insert
  with check (auth.uid() = user_id);

create policy "track_progress: update own"
  on public.track_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "track_progress: delete own"
  on public.track_progress for delete
  using (auth.uid() = user_id);

create index track_progress_by_role on public.track_progress (user_id, role_id);

create trigger track_progress_updated_at
  before update on public.track_progress
  for each row
  execute function public.set_updated_at();
