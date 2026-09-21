-- ============================================================
-- DURA: Security Hardening
-- Fixes: SECURITY DEFINER views, anon RPC exposure,
--        mutable search_path on functions, storage listing
-- Apply via: Supabase Dashboard → SQL Editor, or supabase db push
-- ============================================================

-- ── 1. SECURITY DEFINER views → SECURITY INVOKER ─────────────────────────────
-- Both views are intentionally cross-user aggregates but SECURITY DEFINER
-- bypasses RLS. Switching to INVOKER until we implement a proper cross-user
-- access pattern (materialized cache). Safe now: 0 users have synced yet.

CREATE OR REPLACE VIEW public.leaderboard
  WITH (security_invoker = true) AS
  SELECT
    p.display_name,
    COALESCE(xp.total_xp, 0::bigint) AS total_xp,
    floor(sqrt(COALESCE(xp.total_xp, 0::bigint)::numeric / 100.0)) AS level,
    COALESCE(lp.lessons_completed, 0::bigint) AS lessons_completed
  FROM profiles p
  JOIN (
    SELECT user_id, sum(amount) AS total_xp
    FROM xp_events
    GROUP BY user_id
  ) xp ON xp.user_id = p.id
  LEFT JOIN (
    SELECT user_id, count(*) FILTER (WHERE completed_at IS NOT NULL) AS lessons_completed
    FROM lesson_progress
    GROUP BY user_id
  ) lp ON lp.user_id = p.id
  ORDER BY xp.total_xp DESC
  LIMIT 100;

CREATE OR REPLACE VIEW public.learning_insights
  WITH (security_invoker = true) AS
  SELECT
    phase_id,
    module_id,
    lesson_id,
    count(*) AS completions,
    avg(time_spent_ms)::bigint AS avg_time_ms,
    (percentile_cont(0.5) WITHIN GROUP (ORDER BY time_spent_ms::double precision))::bigint AS median_time_ms,
    avg(CASE WHEN quiz_passed THEN 1.0 ELSE 0.0 END)::real AS quiz_pass_rate,
    avg(quiz_score)::real AS avg_quiz_score
  FROM lesson_progress lp
  WHERE completed_at IS NOT NULL AND completed_at > 0
  GROUP BY phase_id, module_id, lesson_id
  HAVING count(*) >= 5;

-- ── 2. Revoke anon EXECUTE on SECURITY DEFINER functions ─────────────────────
-- These require an authenticated session. Trigger functions should never be
-- callable by anonymous users via the REST RPC endpoint.

REVOKE EXECUTE ON FUNCTION public.sync_progress(uuid, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_user_preferences(jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_user_preferences(text, text, text, boolean, boolean, boolean, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_lesson_completed() FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon;
REVOKE EXECUTE ON FUNCTION public.recalculate_difficulty(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;

-- ── 3. Fix mutable search_path on DEFINER functions ──────────────────────────

CREATE OR REPLACE FUNCTION public.handle_lesson_completed()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
AS $$
begin
  if NEW.completed_at is not null and OLD.completed_at is null then
    insert into public.activity (user_id, event_type, title, detail, metadata)
    values (
      NEW.user_id,
      'lesson_completed',
      'Completed a lesson',
      'Lesson ' || NEW.lesson_id || ' in Phase ' || NEW.phase_id,
      jsonb_build_object(
        'lesson_id', NEW.lesson_id,
        'phase_id',  NEW.phase_id,
        'module_id', NEW.module_id
      )
    );
  end if;
  return NEW;
end;
$$;

CREATE OR REPLACE FUNCTION public.recalculate_difficulty(p_lesson_id text)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
AS $$
declare
  v_median_time bigint;
  v_pass_rate   real;
  v_count       int;
  v_calibrated  real;
begin
  select
    percentile_cont(0.5) within group (order by time_spent_ms),
    avg(case when quiz_passed then 1.0 else 0.0 end),
    count(*) filter (where completed_at > 0)
  into v_median_time, v_pass_rate, v_count
  from public.lesson_progress
  where lesson_id = p_lesson_id and completed_at is not null and completed_at > 0;

  if v_count is null or v_count < 5 then return; end if;

  v_calibrated := least(5, greatest(1,
    3.0 - (v_pass_rate - 0.5) * 4.0 + (v_median_time::real / 600000.0 - 1.0)
  ));

  insert into public.lesson_difficulty (
    lesson_id, actual_median_time_ms, quiz_first_pass_rate,
    sample_size, calibrated_difficulty, last_updated
  )
  values (
    p_lesson_id, coalesce(v_median_time, 0), coalesce(v_pass_rate, 0),
    v_count, v_calibrated, now()
  )
  on conflict (lesson_id) do update set
    actual_median_time_ms = excluded.actual_median_time_ms,
    quiz_first_pass_rate  = excluded.quiz_first_pass_rate,
    sample_size           = excluded.sample_size,
    calibrated_difficulty = excluded.calibrated_difficulty,
    last_updated          = excluded.last_updated;
end;
$$;

CREATE OR REPLACE FUNCTION public.update_user_preferences(
  p_theme              text    DEFAULT NULL,
  p_font_size          text    DEFAULT NULL,
  p_study_mode         text    DEFAULT NULL,
  p_reduced_motion     boolean DEFAULT NULL,
  p_high_contrast      boolean DEFAULT NULL,
  p_dyslexia_font      boolean DEFAULT NULL,
  p_daily_goal_minutes integer DEFAULT NULL
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
AS $$
declare
  current_meta jsonb;
  prefs        jsonb;
begin
  select raw_user_meta_data into current_meta
    from auth.users where id = auth.uid();

  prefs := coalesce(current_meta -> 'preferences', '{}'::jsonb);

  if p_theme              is not null then prefs := prefs || jsonb_build_object('theme', p_theme); end if;
  if p_font_size          is not null then prefs := prefs || jsonb_build_object('fontSize', p_font_size); end if;
  if p_study_mode         is not null then prefs := prefs || jsonb_build_object('studyMode', p_study_mode); end if;
  if p_reduced_motion     is not null then prefs := prefs || jsonb_build_object('reducedMotion', p_reduced_motion); end if;
  if p_high_contrast      is not null then prefs := prefs || jsonb_build_object('highContrast', p_high_contrast); end if;
  if p_dyslexia_font      is not null then prefs := prefs || jsonb_build_object('dyslexiaFont', p_dyslexia_font); end if;
  if p_daily_goal_minutes is not null then prefs := prefs || jsonb_build_object('dailyGoalMinutes', p_daily_goal_minutes); end if;

  update auth.users
     set raw_user_meta_data = coalesce(current_meta, '{}'::jsonb)
                              || jsonb_build_object('preferences', prefs)
   where id = auth.uid();
end;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO ''
AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── 4. Storage: prevent anonymous file listing ────────────────────────────────
-- Replace broad SELECT (allows listing all files via the API) with own-folder only.
-- Public bucket CDN URLs still work for anyone — RLS only gates the storage API.

DROP POLICY IF EXISTS "Avatars public read" ON storage.objects;
CREATE POLICY "Avatars own read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "Certificates public read" ON storage.objects;
CREATE POLICY "Certificates own read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'certificates'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
