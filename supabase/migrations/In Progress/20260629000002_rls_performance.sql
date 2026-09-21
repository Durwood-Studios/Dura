-- ============================================================
-- DURA: RLS Performance — auth.uid() → (select auth.uid())
-- Replaces per-row function re-evaluation with a single
-- subquery evaluated once per statement. Critical at scale.
-- ============================================================

-- activity
DROP POLICY IF EXISTS "Users insert own feed" ON public.activity;
DROP POLICY IF EXISTS "Users read own feed"   ON public.activity;
CREATE POLICY "Users insert own feed" ON public.activity FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Users read own feed"   ON public.activity FOR SELECT TO authenticated USING  (user_id = (SELECT auth.uid()));

-- analytics_events
DROP POLICY IF EXISTS "analytics: delete own" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics: insert own" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics: select own" ON public.analytics_events;
CREATE POLICY "analytics: delete own" ON public.analytics_events FOR DELETE USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "analytics: insert own" ON public.analytics_events FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "analytics: select own" ON public.analytics_events FOR SELECT USING  ((SELECT auth.uid()) = user_id);

-- annotation_votes
DROP POLICY IF EXISTS "Users vote once" ON public.annotation_votes;
CREATE POLICY "Users vote once" ON public.annotation_votes TO authenticated
  USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

-- annotations (leave "Read approved annotations" alone — no auth.uid() call)
DROP POLICY IF EXISTS "Create own annotations" ON public.annotations;
DROP POLICY IF EXISTS "Delete own annotations" ON public.annotations;
DROP POLICY IF EXISTS "Update own pending"     ON public.annotations;
CREATE POLICY "Create own annotations" ON public.annotations FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Delete own annotations" ON public.annotations FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Update own pending" ON public.annotations FOR UPDATE TO authenticated
  USING  ((user_id = (SELECT auth.uid())) AND status = 'pending')
  WITH CHECK ((user_id = (SELECT auth.uid())) AND status = 'pending');

-- assessment_results
DROP POLICY IF EXISTS "assessment_results: delete own" ON public.assessment_results;
DROP POLICY IF EXISTS "assessment_results: insert own" ON public.assessment_results;
DROP POLICY IF EXISTS "assessment_results: select own" ON public.assessment_results;
CREATE POLICY "assessment_results: delete own" ON public.assessment_results FOR DELETE USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "assessment_results: insert own" ON public.assessment_results FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "assessment_results: select own" ON public.assessment_results FOR SELECT USING  ((SELECT auth.uid()) = user_id);

-- certificates
DROP POLICY IF EXISTS "certificates: delete own" ON public.certificates;
DROP POLICY IF EXISTS "certificates: insert own" ON public.certificates;
DROP POLICY IF EXISTS "certificates: select own" ON public.certificates;
DROP POLICY IF EXISTS "certificates: update own" ON public.certificates;
CREATE POLICY "certificates: delete own" ON public.certificates FOR DELETE USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "certificates: insert own" ON public.certificates FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "certificates: select own" ON public.certificates FOR SELECT USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "certificates: update own" ON public.certificates FOR UPDATE
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- concept_retention
DROP POLICY IF EXISTS "concept_retention: owner insert" ON public.concept_retention;
DROP POLICY IF EXISTS "concept_retention: owner select" ON public.concept_retention;
DROP POLICY IF EXISTS "concept_retention: owner update" ON public.concept_retention;
CREATE POLICY "concept_retention: owner insert" ON public.concept_retention FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "concept_retention: owner select" ON public.concept_retention FOR SELECT USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "concept_retention: owner update" ON public.concept_retention FOR UPDATE
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- dojo_sessions
DROP POLICY IF EXISTS "dojo_sessions: owner delete" ON public.dojo_sessions;
DROP POLICY IF EXISTS "dojo_sessions: owner insert" ON public.dojo_sessions;
DROP POLICY IF EXISTS "dojo_sessions: owner select" ON public.dojo_sessions;
CREATE POLICY "dojo_sessions: owner delete" ON public.dojo_sessions FOR DELETE USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "dojo_sessions: owner insert" ON public.dojo_sessions FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "dojo_sessions: owner select" ON public.dojo_sessions FOR SELECT USING  ((SELECT auth.uid()) = user_id);

-- flashcards
DROP POLICY IF EXISTS "flashcards: delete own" ON public.flashcards;
DROP POLICY IF EXISTS "flashcards: insert own" ON public.flashcards;
DROP POLICY IF EXISTS "flashcards: select own" ON public.flashcards;
DROP POLICY IF EXISTS "flashcards: update own" ON public.flashcards;
CREATE POLICY "flashcards: delete own" ON public.flashcards FOR DELETE USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "flashcards: insert own" ON public.flashcards FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "flashcards: select own" ON public.flashcards FOR SELECT USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "flashcards: update own" ON public.flashcards FOR UPDATE
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- goals
DROP POLICY IF EXISTS "goals: delete own" ON public.goals;
DROP POLICY IF EXISTS "goals: insert own" ON public.goals;
DROP POLICY IF EXISTS "goals: select own" ON public.goals;
DROP POLICY IF EXISTS "goals: update own" ON public.goals;
CREATE POLICY "goals: delete own" ON public.goals FOR DELETE USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "goals: insert own" ON public.goals FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "goals: select own" ON public.goals FOR SELECT USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "goals: update own" ON public.goals FOR UPDATE
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- lesson_progress
DROP POLICY IF EXISTS "lesson_progress: delete own" ON public.lesson_progress;
DROP POLICY IF EXISTS "lesson_progress: insert own" ON public.lesson_progress;
DROP POLICY IF EXISTS "lesson_progress: select own" ON public.lesson_progress;
DROP POLICY IF EXISTS "lesson_progress: update own" ON public.lesson_progress;
CREATE POLICY "lesson_progress: delete own" ON public.lesson_progress FOR DELETE USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "lesson_progress: insert own" ON public.lesson_progress FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "lesson_progress: select own" ON public.lesson_progress FOR SELECT USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "lesson_progress: update own" ON public.lesson_progress FOR UPDATE
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- module_progress
DROP POLICY IF EXISTS "module_progress: delete own" ON public.module_progress;
DROP POLICY IF EXISTS "module_progress: insert own" ON public.module_progress;
DROP POLICY IF EXISTS "module_progress: select own" ON public.module_progress;
DROP POLICY IF EXISTS "module_progress: update own" ON public.module_progress;
CREATE POLICY "module_progress: delete own" ON public.module_progress FOR DELETE USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "module_progress: insert own" ON public.module_progress FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "module_progress: select own" ON public.module_progress FOR SELECT USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "module_progress: update own" ON public.module_progress FOR UPDATE
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- phase_progress
DROP POLICY IF EXISTS "phase_progress: delete own" ON public.phase_progress;
DROP POLICY IF EXISTS "phase_progress: insert own" ON public.phase_progress;
DROP POLICY IF EXISTS "phase_progress: select own" ON public.phase_progress;
DROP POLICY IF EXISTS "phase_progress: update own" ON public.phase_progress;
CREATE POLICY "phase_progress: delete own" ON public.phase_progress FOR DELETE USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "phase_progress: insert own" ON public.phase_progress FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "phase_progress: select own" ON public.phase_progress FOR SELECT USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "phase_progress: update own" ON public.phase_progress FOR UPDATE
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- profiles
DROP POLICY IF EXISTS "profiles: delete own" ON public.profiles;
DROP POLICY IF EXISTS "profiles: insert own" ON public.profiles;
DROP POLICY IF EXISTS "profiles: select own" ON public.profiles;
DROP POLICY IF EXISTS "profiles: update own" ON public.profiles;
CREATE POLICY "profiles: delete own" ON public.profiles FOR DELETE USING  ((SELECT auth.uid()) = id);
CREATE POLICY "profiles: insert own" ON public.profiles FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);
CREATE POLICY "profiles: select own" ON public.profiles FOR SELECT USING  ((SELECT auth.uid()) = id);
CREATE POLICY "profiles: update own" ON public.profiles FOR UPDATE
  USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);

-- review_logs
DROP POLICY IF EXISTS "review_logs: delete own" ON public.review_logs;
DROP POLICY IF EXISTS "review_logs: insert own" ON public.review_logs;
DROP POLICY IF EXISTS "review_logs: select own" ON public.review_logs;
CREATE POLICY "review_logs: delete own" ON public.review_logs FOR DELETE USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "review_logs: insert own" ON public.review_logs FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "review_logs: select own" ON public.review_logs FOR SELECT USING  ((SELECT auth.uid()) = user_id);

-- sandbox_saves
DROP POLICY IF EXISTS "sandbox_saves: delete own" ON public.sandbox_saves;
DROP POLICY IF EXISTS "sandbox_saves: insert own" ON public.sandbox_saves;
DROP POLICY IF EXISTS "sandbox_saves: select own" ON public.sandbox_saves;
DROP POLICY IF EXISTS "sandbox_saves: update own" ON public.sandbox_saves;
CREATE POLICY "sandbox_saves: delete own" ON public.sandbox_saves FOR DELETE USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "sandbox_saves: insert own" ON public.sandbox_saves FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "sandbox_saves: select own" ON public.sandbox_saves FOR SELECT USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "sandbox_saves: update own" ON public.sandbox_saves FOR UPDATE
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- skill_assessments
DROP POLICY IF EXISTS "skill_assessments: delete own" ON public.skill_assessments;
DROP POLICY IF EXISTS "skill_assessments: insert own" ON public.skill_assessments;
DROP POLICY IF EXISTS "skill_assessments: select own" ON public.skill_assessments;
DROP POLICY IF EXISTS "skill_assessments: update own" ON public.skill_assessments;
CREATE POLICY "skill_assessments: delete own" ON public.skill_assessments FOR DELETE USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "skill_assessments: insert own" ON public.skill_assessments FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "skill_assessments: select own" ON public.skill_assessments FOR SELECT USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "skill_assessments: update own" ON public.skill_assessments FOR UPDATE
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- streaks
DROP POLICY IF EXISTS "streaks: owner select" ON public.streaks;
DROP POLICY IF EXISTS "streaks: owner update" ON public.streaks;
DROP POLICY IF EXISTS "streaks: owner upsert" ON public.streaks;
CREATE POLICY "streaks: owner select" ON public.streaks FOR SELECT USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "streaks: owner update" ON public.streaks FOR UPDATE
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "streaks: owner upsert" ON public.streaks FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

-- track_progress
DROP POLICY IF EXISTS "track_progress: delete own" ON public.track_progress;
DROP POLICY IF EXISTS "track_progress: insert own" ON public.track_progress;
DROP POLICY IF EXISTS "track_progress: select own" ON public.track_progress;
DROP POLICY IF EXISTS "track_progress: update own" ON public.track_progress;
CREATE POLICY "track_progress: delete own" ON public.track_progress FOR DELETE USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "track_progress: insert own" ON public.track_progress FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "track_progress: select own" ON public.track_progress FOR SELECT USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "track_progress: update own" ON public.track_progress FOR UPDATE
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- tutorial_progress
DROP POLICY IF EXISTS "tutorial_progress: owner delete" ON public.tutorial_progress;
DROP POLICY IF EXISTS "tutorial_progress: owner insert" ON public.tutorial_progress;
DROP POLICY IF EXISTS "tutorial_progress: owner select" ON public.tutorial_progress;
DROP POLICY IF EXISTS "tutorial_progress: owner update" ON public.tutorial_progress;
CREATE POLICY "tutorial_progress: owner delete" ON public.tutorial_progress FOR DELETE USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "tutorial_progress: owner insert" ON public.tutorial_progress FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "tutorial_progress: owner select" ON public.tutorial_progress FOR SELECT USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "tutorial_progress: owner update" ON public.tutorial_progress FOR UPDATE
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- xp_events
DROP POLICY IF EXISTS "xp_events: delete own" ON public.xp_events;
DROP POLICY IF EXISTS "xp_events: insert own" ON public.xp_events;
DROP POLICY IF EXISTS "xp_events: select own" ON public.xp_events;
CREATE POLICY "xp_events: delete own" ON public.xp_events FOR DELETE USING  ((SELECT auth.uid()) = user_id);
CREATE POLICY "xp_events: insert own" ON public.xp_events FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "xp_events: select own" ON public.xp_events FOR SELECT USING  ((SELECT auth.uid()) = user_id);
