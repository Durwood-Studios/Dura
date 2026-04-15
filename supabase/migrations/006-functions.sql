-- 006-functions.sql
-- Database functions and triggers for DURA

-- ============================================================
-- handle_new_user()
-- Triggered on auth.users INSERT to auto-create a profile row.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, email, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.email,
    now(),
    now()
  );
  return new;
end;
$$;

-- Attach the trigger (drop first to make migration re-runnable)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- update_updated_at()
-- Generic trigger to auto-set updated_at on any row update.
-- Attach to any table that has an updated_at column.
-- ============================================================
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply to profiles (add more tables as needed)
drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();


-- ============================================================
-- get_certificate_by_hash(hash text)
-- Public function used by /verify/[hash] to look up a certificate.
-- Returns a single row or null. No auth required.
-- ============================================================
create or replace function public.get_certificate_by_hash(hash text)
returns table (
  id uuid,
  phase_id text,
  user_id uuid,
  display_name text,
  phase_title text,
  score numeric,
  total_questions integer,
  completed_at timestamptz,
  verification_hash text,
  standards text[]
)
language sql
stable
security definer set search_path = ''
as $$
  select
    c.id,
    c.phase_id,
    c.user_id,
    c.display_name,
    c.phase_title,
    c.score,
    c.total_questions,
    c.completed_at,
    c.verification_hash,
    c.standards
  from public.certificates c
  where c.verification_hash = hash
  limit 1;
$$;


-- ============================================================
-- sync_progress(p_user_id uuid, p_data jsonb)
-- Batch upsert progress rows from the client.
-- Expects p_data to be a JSON array of lesson_progress objects.
-- Uses ON CONFLICT to merge: keeps the greater time_spent_ms,
-- preserves remote completed_at if local is null.
-- ============================================================
create or replace function public.sync_progress(p_user_id uuid, p_data jsonb)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  item jsonb;
begin
  for item in select * from jsonb_array_elements(p_data)
  loop
    insert into public.lesson_progress (
      user_id, lesson_id, phase_id, module_id,
      started_at, completed_at, scroll_percent,
      time_spent_ms, quiz_passed, quiz_score, xp_earned
    ) values (
      p_user_id,
      item ->> 'lessonId',
      item ->> 'phaseId',
      item ->> 'moduleId',
      to_timestamp((item ->> 'startedAt')::bigint / 1000.0),
      case when item ->> 'completedAt' is not null
        then to_timestamp((item ->> 'completedAt')::bigint / 1000.0)
        else null
      end,
      (item ->> 'scrollPercent')::numeric,
      (item ->> 'timeSpentMs')::bigint,
      (item ->> 'quizPassed')::boolean,
      case when item ->> 'quizScore' is not null
        then (item ->> 'quizScore')::numeric
        else null
      end,
      (item ->> 'xpEarned')::integer
    )
    on conflict (user_id, lesson_id) do update set
      scroll_percent  = greatest(lesson_progress.scroll_percent, excluded.scroll_percent),
      time_spent_ms   = greatest(lesson_progress.time_spent_ms, excluded.time_spent_ms),
      quiz_passed     = lesson_progress.quiz_passed or excluded.quiz_passed,
      quiz_score      = greatest(lesson_progress.quiz_score, excluded.quiz_score),
      xp_earned       = greatest(lesson_progress.xp_earned, excluded.xp_earned),
      completed_at    = coalesce(lesson_progress.completed_at, excluded.completed_at),
      updated_at      = now();
  end loop;
end;
$$;
