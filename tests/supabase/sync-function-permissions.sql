-- Disposable local database only, after 022 and 024. Never run hosted fixtures.
DO $$
DECLARE signature text;
BEGIN
  FOREACH signature IN ARRAY ARRAY[
    'public.sync_learner_records(text,jsonb)',
    'public.delete_learner_record(uuid,text,text,bigint)',
    'public.sync_progress_v2(uuid,jsonb)'
  ] LOOP
    IF has_function_privilege('anon', signature, 'EXECUTE') THEN
      RAISE EXCEPTION 'Anonymous execution remains on %', signature;
    END IF;
    IF NOT has_function_privilege('authenticated', signature, 'EXECUTE') THEN
      RAISE EXCEPTION 'Authenticated execution was removed from %', signature;
    END IF;
  END LOOP;
END $$;
