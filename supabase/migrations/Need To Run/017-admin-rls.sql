-- ============================================================================
-- 017-admin-rls.sql  (STAGED — apply during the Supabase go-live one-shot)
--
-- Adds admin read policies to feedback, analytics, profiles, and
-- lesson_progress tables. Admin status is read from the JWT
-- app_metadata.is_admin flag — set server-side only (cannot be
-- self-modified by users).
--
-- To grant admin access to a user, run in Supabase Studio SQL editor:
--   UPDATE auth.users
--   SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'
--   WHERE email = 'your@email.com';
--
-- Then ask the user to sign out and back in so their JWT refreshes.
-- ============================================================================

begin;

-- ── Helper: inline admin check (avoids a function lookup per-row) ──
-- Reads (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean
-- This is safe — app_metadata is admin-managed, not user-writable.

-- ── feedback ─────────────────────────────────────────────────────────────────
-- The existing insert policy is untouched. Add read-only for admins.
create policy "admin_read_feedback" on public.feedback
  for select to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

-- ── analytics_events ─────────────────────────────────────────────────────────
-- CORRECTED 2026-07-05: original block targeted "public.analytics", which does
-- not exist — the table is analytics_events. An equivalent policy
-- ("analytics: admin select all") was applied manually on 2026-07-05, so this
-- block is a no-op guard kept for fresh environments.
do $$ begin
  if not exists (
    select 1 from pg_policy pol join pg_class c on c.oid = pol.polrelid
    where c.relname = 'analytics_events' and pol.polname in ('analytics: admin select all','admin_read_analytics_events')
  ) then
    create policy "admin_read_analytics_events" on public.analytics_events
      for select to authenticated
      using (
        user_id = auth.uid()
        or (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
      );
  end if;
end $$;

-- ── profiles ──────────────────────────────────────────────────────────────────
-- Existing: users select own row. Add admin reads all.
create policy "admin_read_profiles" on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

-- ── annotations ──────────────────────────────────────────────────────────────
-- ADDED 2026-07-05: the moderation queue needs admins to read ALL statuses
-- (the public policy only exposes approved/promoted, hiding pending items).
create policy "admin_read_annotations" on public.annotations
  for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);

-- ── lesson_progress ───────────────────────────────────────────────────────────
-- Useful for admin debugging; own-row read likely already exists.
create policy "admin_read_lesson_progress" on public.lesson_progress
  for select to authenticated
  using (
    user_id = auth.uid()
    or (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

commit;
