-- Difficulty calibration (aggregated from user data)
create table public.lesson_difficulty (
  lesson_id text primary key,
  author_rating smallint not null default 3,
  actual_median_time_ms bigint default 0,
  quiz_first_pass_rate real default 0,
  retake_rate real default 0,
  sample_size int default 0,
  calibrated_difficulty real default 0,
  last_updated timestamptz default now()
);

-- Public read (anyone can see difficulty data)
alter table public.lesson_difficulty enable row level security;
create policy "Difficulty data is public" on public.lesson_difficulty
  for select to public using (true);

-- Only system can write (via aggregate function, not direct user writes)
-- We'll use a database function to recalculate

-- Community annotations (post-Supabase auth)
create table public.annotations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null,
  annotation_type text not null check (annotation_type in ('tip', 'gotcha', 'alternative', 'explanation')),
  content text not null,
  upvotes int default 0,
  downvotes int default 0,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'promoted')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.annotations enable row level security;

-- Users can read approved annotations
create policy "Read approved annotations" on public.annotations
  for select to public using (status in ('approved', 'promoted'));

-- Users can create their own
create policy "Create own annotations" on public.annotations
  for insert to authenticated with check (user_id = auth.uid());

-- Users can update their own pending annotations
create policy "Update own pending" on public.annotations
  for update to authenticated
  using (user_id = auth.uid() and status = 'pending');

-- Users can delete their own
create policy "Delete own annotations" on public.annotations
  for delete to authenticated using (user_id = auth.uid());

create index idx_annotations_lesson on public.annotations(lesson_id, status);
create index idx_annotations_user on public.annotations(user_id);

-- Annotation votes (prevent double-voting)
create table public.annotation_votes (
  annotation_id uuid not null references public.annotations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  vote smallint not null check (vote in (-1, 1)),
  primary key (annotation_id, user_id)
);

alter table public.annotation_votes enable row level security;

create policy "Users vote once" on public.annotation_votes
  for all to authenticated using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Function to recalculate difficulty from lesson_progress data
create or replace function public.recalculate_difficulty(p_lesson_id text)
returns void as $$
declare
  v_median_time bigint;
  v_pass_rate real;
  v_retake real;
  v_count int;
  v_calibrated real;
begin
  select
    percentile_cont(0.5) within group (order by time_spent_ms),
    avg(case when quiz_passed then 1.0 else 0.0 end),
    count(*) filter (where completed_at > 0)
  into v_median_time, v_pass_rate, v_count
  from public.lesson_progress
  where lesson_id = p_lesson_id and completed_at is not null and completed_at > 0;

  if v_count is null or v_count < 5 then return; end if;

  -- Calibrated difficulty: blend of time and pass rate
  -- Higher time + lower pass rate = harder
  v_calibrated := least(5, greatest(1,
    3.0 - (v_pass_rate - 0.5) * 4.0 + (v_median_time::real / 600000.0 - 1.0)
  ));

  insert into public.lesson_difficulty (lesson_id, actual_median_time_ms, quiz_first_pass_rate, sample_size, calibrated_difficulty, last_updated)
  values (p_lesson_id, coalesce(v_median_time, 0), coalesce(v_pass_rate, 0), v_count, v_calibrated, now())
  on conflict (lesson_id) do update set
    actual_median_time_ms = excluded.actual_median_time_ms,
    quiz_first_pass_rate = excluded.quiz_first_pass_rate,
    sample_size = excluded.sample_size,
    calibrated_difficulty = excluded.calibrated_difficulty,
    last_updated = excluded.last_updated;
end;
$$ language plpgsql security definer;

-- Research analytics view (anonymized, aggregated)
create or replace view public.learning_insights as
select
  lp.phase_id,
  lp.module_id,
  lp.lesson_id,
  count(*) as completions,
  avg(lp.time_spent_ms)::bigint as avg_time_ms,
  percentile_cont(0.5) within group (order by lp.time_spent_ms)::bigint as median_time_ms,
  avg(case when lp.quiz_passed then 1.0 else 0.0 end)::real as quiz_pass_rate,
  avg(lp.quiz_score)::real as avg_quiz_score
from public.lesson_progress lp
where lp.completed_at is not null and lp.completed_at > 0
group by lp.phase_id, lp.module_id, lp.lesson_id
having count(*) >= 5;
