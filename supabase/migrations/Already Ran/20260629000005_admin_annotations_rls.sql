-- ============================================================================
-- 20260629000005_admin_annotations_rls.sql
-- (STAGED — apply during next Supabase maintenance window)
--
-- Adds admin SELECT and UPDATE policies to public.annotations so that
-- users with app_metadata.is_admin = true can review and moderate all
-- community annotations regardless of their current status.
--
-- Admin status is read from the JWT app_metadata — set server-side only
-- via Supabase Dashboard or service-role SQL. Users cannot self-modify
-- app_metadata (it is raw_app_meta_data on auth.users, distinct from the
-- user-writable raw_user_meta_data).
--
-- This policy does NOT grant any access to the anon role or to the
-- authenticated role broadly — only users whose JWT contains
-- app_metadata.is_admin = true are affected.
--
-- To grant admin access to a user:
--   UPDATE auth.users
--   SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'
--   WHERE email = 'your@email.com';
-- Then ask the user to sign out and sign back in so their JWT refreshes.
--
-- Data touched: public.annotations (policy addition only — zero schema
-- changes, zero row mutations, zero new columns).
-- ============================================================================

begin;

-- Admin can read all annotations regardless of status
-- (pending / approved / rejected / promoted)
create policy "admin_read_annotations" on public.annotations
  for select to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );

-- Admin can update annotation status (approve / reject / promote).
-- WITH CHECK ensures the status column can only be set to a value inside
-- the existing CHECK constraint — belt-and-suspenders guard if the DB
-- constraint ever widens before this policy is revisited.
create policy "admin_update_annotations" on public.annotations
  for update to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
    and status in ('pending', 'approved', 'rejected', 'promoted')
  );

commit;
