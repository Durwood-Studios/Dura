-- =============================================================================
-- 004-goals-and-assessments.sql — Goals, skill assessments, assessment results, certificates
-- =============================================================================
-- Sync strategy:
--   - goals: upsert from IDB, latest updated_at wins
--   - skill_assessments: upsert, one per user (latest replaces)
--   - assessment_results: append-only log of all attempts
--   - certificates: upsert by (user_id, phase_id), publicly readable by hash
-- =============================================================================

-- ---------------------------------------------------------------------------
-- goals — mirrors IDB "goals" store
-- ---------------------------------------------------------------------------
create table public.goals (
  id          text not null,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null
              check (type in ('daily', 'weekly', 'phase', 'career', 'custom')),
  unit        text not null
              check (unit in ('minutes', 'lessons', 'hours', 'xp')),
  target      integer not null,
  current     integer not null default 0,
  started_at  bigint not null,                    -- epoch ms
  deadline    bigint,                             -- epoch ms
  achieved_at bigint,                             -- epoch ms
  label       text not null,
  updated_at  timestamptz not null default now(),

  primary key (user_id, id)
);

comment on table public.goals is
  'User goals (daily/weekly/phase/career/custom). Mirrors IDB goals store.';

alter table public.goals enable row level security;

create policy "goals: select own"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "goals: insert own"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "goals: update own"
  on public.goals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "goals: delete own"
  on public.goals for delete
  using (auth.uid() = user_id);

create index goals_by_type on public.goals (user_id, type);

create trigger goals_updated_at
  before update on public.goals
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- skill_assessments — mirrors IDB preferences["skill-assessment"]
-- ---------------------------------------------------------------------------
-- The 35-question placement quiz. One result per user (latest replaces).
create table public.skill_assessments (
  user_id           uuid primary key references public.profiles(id) on delete cascade,
  completed_at      bigint not null,              -- epoch ms
  answers           jsonb not null default '[]'::jsonb,   -- SkillAnswer[]
  score             jsonb not null default '{}'::jsonb,   -- SkillScore
  recommended_path  text not null,
  selected_path     text not null,
  updated_at        timestamptz not null default now()
);

comment on table public.skill_assessments is
  'Skill placement assessment result. One per user, overwritten on retake.';

alter table public.skill_assessments enable row level security;

create policy "skill_assessments: select own"
  on public.skill_assessments for select
  using (auth.uid() = user_id);

create policy "skill_assessments: insert own"
  on public.skill_assessments for insert
  with check (auth.uid() = user_id);

create policy "skill_assessments: update own"
  on public.skill_assessments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "skill_assessments: delete own"
  on public.skill_assessments for delete
  using (auth.uid() = user_id);

create trigger skill_assessments_updated_at
  before update on public.skill_assessments
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- assessment_results — mirrors IDB "assessment-results" store
-- ---------------------------------------------------------------------------
create table public.assessment_results (
  id                text not null,
  user_id           uuid not null references public.profiles(id) on delete cascade,
  type              text not null
                    check (type in ('mastery-gate', 'phase-verification', 'skill-assessment')),
  target_id         text not null,                -- module or phase ID
  score             real not null,                -- 0.0–1.0
  total_questions   integer not null,
  correct_count     integer not null,
  passed            boolean not null,
  started_at        bigint not null,              -- epoch ms
  completed_at      bigint not null,              -- epoch ms
  time_spent_ms     bigint not null,
  question_results  jsonb not null default '[]'::jsonb,  -- QuestionResult[]
  created_at        timestamptz not null default now(),

  primary key (user_id, id)
);

comment on table public.assessment_results is
  'All assessment attempts (mastery gates, phase verification, skill assessment). Append-only.';

alter table public.assessment_results enable row level security;

create policy "assessment_results: select own"
  on public.assessment_results for select
  using (auth.uid() = user_id);

create policy "assessment_results: insert own"
  on public.assessment_results for insert
  with check (auth.uid() = user_id);

-- Append-only: no update policy
create policy "assessment_results: delete own"
  on public.assessment_results for delete
  using (auth.uid() = user_id);

create index assessment_results_by_target on public.assessment_results (user_id, target_id);
create index assessment_results_by_type on public.assessment_results (user_id, type);
create index assessment_results_by_completed on public.assessment_results (user_id, completed_at);

-- ---------------------------------------------------------------------------
-- certificates — mirrors IDB "certificates" store
-- ---------------------------------------------------------------------------
create table public.certificates (
  id                  text not null,
  user_id             uuid not null references public.profiles(id) on delete cascade,
  phase_id            text not null,
  display_name        text not null,
  phase_title         text not null,
  score               real not null,              -- 0.0–1.0
  total_questions     integer not null,
  completed_at        bigint not null,            -- epoch ms
  verification_hash   text not null unique,       -- used for /verify/[hash]
  standards           text[] not null default '{}',
  created_at          timestamptz not null default now(),

  primary key (user_id, id)
);

comment on table public.certificates is
  'Verified phase-completion certificates. Publicly readable by verification hash for /verify/[hash].';

alter table public.certificates enable row level security;

-- Owner can do everything
create policy "certificates: select own"
  on public.certificates for select
  using (auth.uid() = user_id);

create policy "certificates: insert own"
  on public.certificates for insert
  with check (auth.uid() = user_id);

create policy "certificates: update own"
  on public.certificates for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "certificates: delete own"
  on public.certificates for delete
  using (auth.uid() = user_id);

-- Public verification: anyone can look up a certificate by its hash
-- This powers the /verify/[hash] page without requiring authentication
create policy "certificates: public verify by hash"
  on public.certificates for select
  using (true);
  -- NOTE: The above allows public reads of all certificates. This is intentional —
  -- certificates are meant to be shareable. The verification_hash in the URL acts
  -- as an unguessable capability token. If stricter access is needed later, replace
  -- with: using (verification_hash = current_setting('request.headers')::jsonb->>'x-verify-hash')

create index certificates_by_phase on public.certificates (user_id, phase_id);
create index certificates_by_hash on public.certificates (verification_hash);
