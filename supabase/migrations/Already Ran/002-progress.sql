-- =============================================================================
-- 002-progress.sql — Lesson, module, and phase progress
-- =============================================================================
-- Sync strategy: IDB is the source of truth. On connectivity, the client
-- upserts rows here. Conflict resolution:
--   - completion flags: OR merge (completed anywhere = completed everywhere)
--   - scores: keep highest (greatest())
--   - time/scroll: keep max
--   - synced flag in IDB tracks which rows need pushing
-- =============================================================================

-- ---------------------------------------------------------------------------
-- lesson_progress — mirrors IDB "progress" store
-- ---------------------------------------------------------------------------
create table public.lesson_progress (
  user_id        uuid not null references public.profiles(id) on delete cascade,
  lesson_id      text not null,
  phase_id       text not null,
  module_id      text not null,
  started_at     bigint not null,                -- epoch ms, matches IDB
  completed_at   bigint,                         -- epoch ms, null if not completed
  scroll_percent real not null default 0,         -- 0.0–1.0
  time_spent_ms  bigint not null default 0,
  quiz_passed    boolean not null default false,
  quiz_score     real,                            -- 0.0–1.0, null if no quiz attempted
  xp_earned      integer not null default 0,
  updated_at     timestamptz not null default now(),

  primary key (user_id, lesson_id)
);

comment on table public.lesson_progress is
  'Per-lesson progress tracking. Mirrors IDB progress store for cross-device sync.';

alter table public.lesson_progress enable row level security;

create policy "lesson_progress: select own"
  on public.lesson_progress for select
  using (auth.uid() = user_id);

create policy "lesson_progress: insert own"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);

create policy "lesson_progress: update own"
  on public.lesson_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "lesson_progress: delete own"
  on public.lesson_progress for delete
  using (auth.uid() = user_id);

-- Indexes for common queries
create index lesson_progress_by_phase on public.lesson_progress (user_id, phase_id);
create index lesson_progress_by_module on public.lesson_progress (user_id, module_id);
create index lesson_progress_by_completed on public.lesson_progress (user_id, completed_at)
  where completed_at is not null;

create trigger lesson_progress_updated_at
  before update on public.lesson_progress
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- module_progress — mirrors IDB "moduleProgress" store
-- ---------------------------------------------------------------------------
create table public.module_progress (
  user_id            uuid not null references public.profiles(id) on delete cascade,
  module_id          text not null,
  phase_id           text not null,
  completed_lessons  integer not null default 0,
  total_lessons      integer not null default 0,
  mastery_gate_passed boolean not null default false,
  unlocked_at        bigint not null,             -- epoch ms
  updated_at         timestamptz not null default now(),

  primary key (user_id, module_id)
);

comment on table public.module_progress is
  'Aggregated module-level progress. Mirrors IDB moduleProgress store.';

alter table public.module_progress enable row level security;

create policy "module_progress: select own"
  on public.module_progress for select
  using (auth.uid() = user_id);

create policy "module_progress: insert own"
  on public.module_progress for insert
  with check (auth.uid() = user_id);

create policy "module_progress: update own"
  on public.module_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "module_progress: delete own"
  on public.module_progress for delete
  using (auth.uid() = user_id);

create index module_progress_by_phase on public.module_progress (user_id, phase_id);

create trigger module_progress_updated_at
  before update on public.module_progress
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- phase_progress — mirrors IDB "phaseProgress" store
-- ---------------------------------------------------------------------------
create table public.phase_progress (
  user_id              uuid not null references public.profiles(id) on delete cascade,
  phase_id             text not null,
  unlocked             boolean not null default false,
  unlocked_at          bigint,                    -- epoch ms
  completed_at         bigint,                    -- epoch ms
  verification_score   real,                      -- 0.0–1.0
  updated_at           timestamptz not null default now(),

  primary key (user_id, phase_id)
);

comment on table public.phase_progress is
  'Phase-level unlock/completion state. Mirrors IDB phaseProgress store.';

alter table public.phase_progress enable row level security;

create policy "phase_progress: select own"
  on public.phase_progress for select
  using (auth.uid() = user_id);

create policy "phase_progress: insert own"
  on public.phase_progress for insert
  with check (auth.uid() = user_id);

create policy "phase_progress: update own"
  on public.phase_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "phase_progress: delete own"
  on public.phase_progress for delete
  using (auth.uid() = user_id);

create trigger phase_progress_updated_at
  before update on public.phase_progress
  for each row
  execute function public.set_updated_at();
