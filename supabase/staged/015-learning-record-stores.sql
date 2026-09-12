-- STAGED: additive tables used by existing tutorial / Dojo / retention clients.
-- Existing tables intentionally cause an error so drift is reviewed, not hidden.
begin;

create table public.tutorial_progress (
  id text not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null,
  type text not null check (type in ('howto', 'tutorial')),
  current_step integer not null check (current_step >= 0),
  total_steps integer not null check (total_steps >= 0),
  checkpoints jsonb not null default '[]'::jsonb check (jsonb_typeof(checkpoints) = 'array'),
  started_at bigint not null,
  completed_at bigint,
  last_active_at bigint not null,
  primary key (user_id, id)
);
alter table public.tutorial_progress enable row level security;
create policy "tutorial_progress: own records" on public.tutorial_progress
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.tutorial_progress to authenticated;

create table public.dojo_sessions (
  id text not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  started_at bigint not null,
  completed_at bigint not null,
  tier text not null check (tier in ('T1', 'T3')),
  phase_filter text,
  results jsonb not null default '[]'::jsonb check (jsonb_typeof(results) = 'array'),
  avg_score double precision not null check (avg_score >= 0 and avg_score <= 10),
  primary key (user_id, id)
);
alter table public.dojo_sessions enable row level security;
create policy "dojo_sessions: own records" on public.dojo_sessions
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.dojo_sessions to authenticated;

create table public.concept_retention (
  user_id uuid not null references public.profiles(id) on delete cascade,
  concept_id text not null,
  last_practiced timestamptz not null default now(),
  strength double precision not null check (strength >= 0 and strength <= 1),
  primary key (user_id, concept_id)
);
alter table public.concept_retention enable row level security;
create policy "concept_retention: own records" on public.concept_retention
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.concept_retention to authenticated;

commit;
