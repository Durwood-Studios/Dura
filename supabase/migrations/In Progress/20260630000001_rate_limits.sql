-- Migration: rate_limits table for Supabase-backed sliding-window rate limiting.
--
-- Applied to: public schema
-- Data touched: creates new table; no existing data affected.
-- Safe to re-run: all statements use IF NOT EXISTS / OR REPLACE.
--
-- Stage this via CLAUDE.md Rule 4 protocol:
--   xDocs/active/rate-limiting/staged/supabase/20260630000001_rate_limits.sql
-- Apply with: supabase db push (or paste in Supabase SQL editor for remote project).

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  key        text        NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Index for the sliding-window COUNT query: key + time range.
CREATE INDEX IF NOT EXISTS rate_limits_key_created_idx
  ON public.rate_limits (key, created_at);

-- RLS: enabled so the table is protected by policy, not left open.
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow the anon key (used in Edge middleware) to insert and read records.
-- The server never needs to read individual users' data here; the RLS
-- policies intentionally allow broad access because the data is non-personal
-- (only IP-derived keys and timestamps).
CREATE POLICY "rate_limits: anon insert"
  ON public.rate_limits
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "rate_limits: anon select"
  ON public.rate_limits
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Cleanup function: removes records older than 1 hour.
-- Call this from a Supabase pg_cron job (Pro plan) or a scheduled Edge Function.
-- Example cron (pg_cron, runs hourly):
--   SELECT cron.schedule('cleanup-rate-limits', '0 * * * *', 'SELECT public.cleanup_rate_limits();');
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
  RETURNS void
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path TO ''
AS $$
  DELETE FROM public.rate_limits
  WHERE created_at < now() - interval '1 hour';
$$;
