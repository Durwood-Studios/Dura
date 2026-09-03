-- ============================================================================
-- 015-function-fixes.sql  (STAGED — apply during the Supabase go-live one-shot)
--
-- Fixes the two broken RPC functions found in the audit (RUNBOOK §2).
-- These REPLACE the definitions in 006 / 012 — promote into those files (or
-- apply as a later migration) at one-shot time. Both are SECURITY DEFINER and
-- scoped to auth.uid(); no service-role involved.
-- ============================================================================

begin;

-- ─────────────────────────────────────────────────────────────────────────
-- 015a. sync_progress — store epoch-ms bigints, not timestamptz.
--
-- BUG: the 006 body wrote `to_timestamp((item->>'startedAt')::bigint / 1000.0)`
-- (a timestamptz) into `lesson_progress.started_at` / `completed_at`, which are
-- `bigint` epoch-ms columns (002:20-21). Postgres errors on the type mismatch,
-- so every lesson-progress push via this RPC fails. Fix: insert the raw bigints.
-- Everything else (column list, ON CONFLICT monotonic merge) is unchanged.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.sync_progress(p_user_id uuid, p_data jsonb)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  item jsonb;
begin
  -- Security: reject if caller is not the user being written for.
  -- Without this check any authenticated user could corrupt another user's progress.
  if p_user_id is distinct from auth.uid() then
    raise exception 'unauthorized';
  end if;

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
      (item ->> 'startedAt')::bigint,                                    -- FIX: raw epoch ms
      case when item ->> 'completedAt' is not null
        then (item ->> 'completedAt')::bigint                            -- FIX: raw epoch ms
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

-- ─────────────────────────────────────────────────────────────────────────
-- 015b. update_user_preferences — accept the jsonb the client actually sends.
--
-- BUG: the client (queries/preferences-sync.ts) calls
--   rpc("update_user_preferences", { prefs: <object> })
-- but 012 signed the function for named scalar params (p_theme, p_font_size, …)
-- with no `prefs` param, so PostgREST can't resolve the call and it fails.
-- Fix: add a jsonb overload with the param name `prefs` that deep-merges the
-- whole preferences object into auth.users metadata, preserving other keys.
-- (Keep the scalar overload from 012; PostgREST selects by argument names, so
--  the `{ prefs }` call resolves to this one unambiguously.)
--
-- CONFIRM before applying: that the client arg key is exactly `prefs`
-- (grep queries/preferences-sync.ts). If it sends `p_prefs`, rename accordingly.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.update_user_preferences(prefs jsonb)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  current_meta jsonb;
begin
  select raw_user_meta_data into current_meta
    from auth.users where id = auth.uid();

  update auth.users
     set raw_user_meta_data =
           coalesce(current_meta, '{}'::jsonb)
           || jsonb_build_object(
                'preferences',
                coalesce(current_meta -> 'preferences', '{}'::jsonb) || prefs
              )
   where id = auth.uid();
end;
$$;

commit;
