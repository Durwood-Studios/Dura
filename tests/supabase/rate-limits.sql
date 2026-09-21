-- Disposable local database only. No hosted execution.
BEGIN;
DO $$
DECLARE secret_value text; result jsonb; old_count bigint;
BEGIN
  SELECT secret INTO secret_value FROM dura_private.rate_limit_config WHERE singleton;
  IF secret_value !~ '^[0-9a-f]{64}$' THEN RAISE EXCEPTION 'Invalid generated secret'; END IF;
  IF has_schema_privilege('anon', 'dura_private', 'USAGE') OR
     has_table_privilege('authenticated', 'dura_private.rate_limit_buckets', 'SELECT') OR
     has_table_privilege('anon', 'dura_private.rate_limit_config', 'SELECT') THEN
    RAISE EXCEPTION 'Private rate limiter tables exposed';
  END IF;
  SELECT count(*) INTO old_count FROM dura_private.rate_limit_buckets;
  BEGIN
    PERFORM public.consume_rate_limit(NULL, repeat('a',64), 2, 60000);
    RAISE EXCEPTION 'Missing secret accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    PERFORM public.consume_rate_limit(repeat('0',64), repeat('a',64), 2, 60000);
    RAISE EXCEPTION 'Wrong secret accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  IF (SELECT count(*) FROM dura_private.rate_limit_buckets) <> old_count THEN
    RAISE EXCEPTION 'Unauthorized request wrote a bucket';
  END IF;
  BEGIN
    PERFORM public.consume_rate_limit(secret_value, 'raw personal identifier', 2, 60000);
    RAISE EXCEPTION 'Unhashed identifier accepted';
  EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
  BEGIN
    PERFORM public.consume_rate_limit(secret_value, repeat('a',64), 1001, 60000);
    RAISE EXCEPTION 'Unbounded limit accepted';
  EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
  BEGIN
    PERFORM public.consume_rate_limit(secret_value, repeat('a',64), 1, NULL);
    RAISE EXCEPTION 'Null window accepted';
  EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
  result := public.consume_rate_limit(secret_value, repeat('a',64), 2, 60000);
  IF result <> '{"success":true,"remaining":1,"retryAfter":0}'::jsonb THEN RAISE EXCEPTION 'First consumption wrong: %', result; END IF;
  result := public.consume_rate_limit(secret_value, repeat('a',64), 2, 60000);
  IF result <> '{"success":true,"remaining":0,"retryAfter":0}'::jsonb THEN RAISE EXCEPTION 'Second consumption wrong: %', result; END IF;
  result := public.consume_rate_limit(secret_value, repeat('a',64), 2, 60000);
  IF (result->>'success')::boolean OR (result->>'remaining')::integer <> 0 OR (result->>'retryAfter')::integer NOT BETWEEN 1 AND 60 THEN RAISE EXCEPTION 'Exhausted window wrong: %', result; END IF;
  UPDATE dura_private.rate_limit_buckets SET hits = ARRAY[1::bigint], expires_at = 2 WHERE key = repeat('a',64);
  result := public.consume_rate_limit(secret_value, repeat('a',64), 2, 60000);
  IF result->>'remaining' <> '1' THEN RAISE EXCEPTION 'Expired hits counted'; END IF;
  INSERT INTO dura_private.rate_limit_buckets(key,hits,expires_at) VALUES(repeat('b',64), ARRAY[1::bigint], 2);
  PERFORM public.consume_rate_limit(secret_value, repeat('c',64), 1, 60000);
  IF EXISTS(SELECT 1 FROM dura_private.rate_limit_buckets WHERE key=repeat('b',64)) THEN RAISE EXCEPTION 'Expired bucket not cleaned'; END IF;
END $$;
-- Exercise the actual public transport role, not just the privileged owner.
DO $$ BEGIN PERFORM set_config('dura.test_limiter_secret', (SELECT secret FROM dura_private.rate_limit_config WHERE singleton), true); END $$;
SET LOCAL ROLE anon;
DO $$
DECLARE result jsonb;
BEGIN
  BEGIN
    PERFORM secret FROM dura_private.rate_limit_config;
    RAISE EXCEPTION 'Anonymous direct secret read succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    PERFORM public.consume_rate_limit(NULL, repeat('e',64), 1, 60000);
    RAISE EXCEPTION 'Anonymous missing-secret RPC succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  result := public.consume_rate_limit(current_setting('dura.test_limiter_secret'), repeat('e',64), 1, 60000);
  IF result->>'success' <> 'true' THEN RAISE EXCEPTION 'Authorized public transport rejected'; END IF;
END $$;
RESET ROLE;
ROLLBACK;
