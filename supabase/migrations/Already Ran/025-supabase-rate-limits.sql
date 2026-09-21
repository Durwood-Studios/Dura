-- Dura: private, server-authorized sliding-window request limits; no learner data.
-- After applying, privately copy the secret into Vercel DURA_RATE_LIMIT_SECRET:
-- SELECT secret FROM dura_private.rate_limit_config WHERE singleton;
-- Never put that result in source control, client configuration, or shared logs.
BEGIN;
CREATE SCHEMA IF NOT EXISTS dura_private;
REVOKE ALL ON SCHEMA dura_private FROM PUBLIC, anon, authenticated;
CREATE TABLE IF NOT EXISTS dura_private.rate_limit_config (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  secret text NOT NULL CHECK (secret ~ '^[0-9a-f]{64}$')
);
INSERT INTO dura_private.rate_limit_config(singleton, secret)
VALUES (true, replace(pg_catalog.gen_random_uuid()::text, '-', '') || replace(pg_catalog.gen_random_uuid()::text, '-', ''))
ON CONFLICT (singleton) DO NOTHING;
CREATE TABLE IF NOT EXISTS dura_private.rate_limit_buckets (
  key text PRIMARY KEY CHECK (key ~ '^[0-9a-f]{64}$'),
  hits bigint[] NOT NULL DEFAULT '{}',
  expires_at bigint NOT NULL
);
CREATE INDEX IF NOT EXISTS rate_limit_buckets_expiry_idx ON dura_private.rate_limit_buckets(expires_at);
ALTER TABLE dura_private.rate_limit_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE dura_private.rate_limit_buckets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE dura_private.rate_limit_config, dura_private.rate_limit_buckets FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_rate_limit(p_secret text, p_key text, p_limit integer, p_window_ms integer)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  current_ms bigint;
  recent_hits bigint[];
  allowed boolean;
BEGIN
  -- Authorization precedes writes and never echoes supplied credentials.
  IF p_secret IS NULL OR p_secret !~ '^[0-9a-f]{64}$' OR NOT EXISTS (
    SELECT 1 FROM dura_private.rate_limit_config WHERE singleton AND secret = p_secret
  ) THEN
    RAISE EXCEPTION 'Rate limiter authorization failed' USING ERRCODE = '42501';
  END IF;
  IF p_key IS NULL OR p_key !~ '^[0-9a-f]{64}$'
     OR p_limit IS NULL OR p_limit NOT BETWEEN 1 AND 1000
     OR p_window_ms IS NULL OR p_window_ms NOT BETWEEN 1 AND 86400000 THEN
    RAISE EXCEPTION 'Invalid rate limiter parameters' USING ERRCODE = '22023';
  END IF;

  INSERT INTO dura_private.rate_limit_buckets(key, expires_at) VALUES (p_key, 0)
  -- The no-op update locks an existing bucket before cleanup can remove it.
  ON CONFLICT (key) DO UPDATE SET key = EXCLUDED.key;
  -- Serialize consumption per key. Read the clock after acquiring the lock.
  SELECT hits INTO recent_hits FROM dura_private.rate_limit_buckets WHERE key = p_key FOR UPDATE;
  current_ms := floor(extract(epoch FROM pg_catalog.clock_timestamp()) * 1000)::bigint;
  SELECT coalesce(array_agg(hit ORDER BY hit), '{}'::bigint[]) INTO recent_hits
  FROM unnest(recent_hits) AS hit WHERE hit > current_ms - p_window_ms;
  allowed := cardinality(recent_hits) < p_limit;
  IF allowed THEN recent_hits := array_append(recent_hits, current_ms); END IF;
  UPDATE dura_private.rate_limit_buckets
  SET hits = recent_hits, expires_at = recent_hits[cardinality(recent_hits)] + p_window_ms
  WHERE key = p_key;

  -- Bounded opportunistic cleanup avoids a scheduler and skips in-flight keys.
  DELETE FROM dura_private.rate_limit_buckets WHERE key IN (
    SELECT key FROM dura_private.rate_limit_buckets
    WHERE expires_at <= current_ms AND key <> p_key
    ORDER BY expires_at LIMIT 32 FOR UPDATE SKIP LOCKED
  );
  RETURN jsonb_build_object(
    'success', allowed,
    'remaining', greatest(0, p_limit - cardinality(recent_hits)),
    'retryAfter', CASE WHEN allowed THEN 0 ELSE greatest(1, ceil((recent_hits[1] + p_window_ms - current_ms)::numeric / 1000)::integer) END
  );
END;
$$;
REVOKE ALL ON FUNCTION public.consume_rate_limit(text,text,integer,integer) FROM PUBLIC, anon, authenticated;
-- Public API transport is necessary before login; the separate server secret authorizes consumption.
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text,text,integer,integer) TO anon, authenticated;
COMMIT;
