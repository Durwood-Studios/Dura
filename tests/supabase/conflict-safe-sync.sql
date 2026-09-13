-- Disposable test database only.
INSERT INTO auth.users(id) VALUES('22222222-2222-4222-8222-222222222222');
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',false);
SELECT public.sync_learner_records('sandbox_saves','[{"user_id":"22222222-2222-4222-8222-222222222222","id":"sandbox-test","title":"New","language":"javascript","code":"new code","created_at":100,"updated_at":200}]');
SELECT public.sync_learner_records('sandbox_saves','[{"user_id":"22222222-2222-4222-8222-222222222222","id":"sandbox-test","title":"Old","language":"javascript","code":"old code","created_at":100,"updated_at":100}]');
DO $$ BEGIN
 IF (SELECT code FROM public.sandbox_saves WHERE id='sandbox-test') <> 'new code' THEN RAISE EXCEPTION 'Stale device overwrote newer code'; END IF;
END $$;
SELECT public.delete_learner_record('22222222-2222-4222-8222-222222222222','sandbox_saves','sandbox-test',300);
SELECT public.sync_learner_records('sandbox_saves','[{"user_id":"22222222-2222-4222-8222-222222222222","id":"sandbox-test","title":"Stale","language":"javascript","code":"resurrected","created_at":100,"updated_at":400}]');
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.sandbox_saves WHERE id='sandbox-test') THEN RAISE EXCEPTION 'Deleted work resurrected'; END IF;
 BEGIN
  PERFORM public.sync_learner_records('profiles','[]');
  RAISE EXCEPTION 'Unsafe table accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM='Unsafe table accepted' THEN RAISE; END IF; END;
END $$;
RESET ROLE;
SET ROLE authenticated;
SELECT public.sync_learner_records('goals','[{"user_id":"22222222-2222-4222-8222-222222222222","id":"goal-test","type":"custom","unit":"lessons","target":10,"current":10,"started_at":1,"achieved_at":200,"label":"Done"}]');
SELECT public.sync_learner_records('goals','[{"user_id":"22222222-2222-4222-8222-222222222222","id":"goal-test","type":"custom","unit":"lessons","target":10,"current":2,"started_at":1,"achieved_at":null,"label":"Old"}]');
DO $$ BEGIN
 IF (SELECT current FROM public.goals WHERE id='goal-test')<>10 OR (SELECT achieved_at FROM public.goals WHERE id='goal-test')<>200 THEN RAISE EXCEPTION 'Goal achievement regressed'; END IF;
END $$;
SELECT public.sync_progress_v2('22222222-2222-4222-8222-222222222222','[{"lessonId":"1/1-1/01","phaseId":"1","moduleId":"1-1","startedAt":1,"completedAt":null,"scrollPercent":10,"timeSpentMs":20,"quizPassed":false,"quizScore":null,"xpEarned":0,"activityEvidence":{"task":{"kind":"self-reviewed","updatedAt":20,"completedAt":20}},"dailyTimeMs":{"2026-09-12":20}}]');
SELECT public.sync_progress_v2('22222222-2222-4222-8222-222222222222','[{"lessonId":"1/1-1/01","phaseId":"1","moduleId":"1-1","startedAt":1,"completedAt":null,"scrollPercent":10,"timeSpentMs":20,"quizPassed":false,"quizScore":null,"xpEarned":0,"activityEvidence":{"task":{"kind":"self-reviewed","updatedAt":10,"completedAt":null}},"dailyTimeMs":{"2026-09-12":10}}]');
DO $$ BEGIN
 IF (SELECT activity_evidence->'task'->>'completedAt' FROM public.lesson_progress WHERE lesson_id='1/1-1/01') <> '20' THEN RAISE EXCEPTION 'Evidence regressed'; END IF;
 IF (SELECT daily_time_ms->>'2026-09-12' FROM public.lesson_progress WHERE lesson_id='1/1-1/01') <> '20' THEN RAISE EXCEPTION 'Daily time regressed'; END IF;
END $$;
RESET ROLE;

SET ROLE authenticated;
DO $$ BEGIN
 BEGIN
  PERFORM public.sync_learner_records('goals','[{"user_id":"33333333-3333-4333-8333-333333333333","id":"wrong-owner"}]');
  RAISE EXCEPTION 'Mismatched owner accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM='Mismatched owner accepted' THEN RAISE; END IF; END;
 BEGIN
  PERFORM public.delete_learner_record('33333333-3333-4333-8333-333333333333','goals','goal-test',300);
  RAISE EXCEPTION 'Mismatched deletion accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM='Mismatched deletion accepted' THEN RAISE; END IF; END;
END $$;
RESET ROLE;
