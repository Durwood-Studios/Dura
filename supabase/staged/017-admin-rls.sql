-- STAGED: admin reads only; app_metadata must be set by the project owner.
-- Never trust raw_user_meta_data or user_metadata for administrator privileges.
begin;

create policy "feedback: admin read" on public.feedback
  for select to authenticated
  using ((auth.jwt() -> 'app_metadata' -> 'is_admin') = 'true'::jsonb);
grant select on public.feedback to authenticated;

create policy "analytics_events: admin read" on public.analytics_events
  for select to authenticated
  using ((auth.jwt() -> 'app_metadata' -> 'is_admin') = 'true'::jsonb);
create policy "profiles: admin read" on public.profiles
  for select to authenticated
  using ((auth.jwt() -> 'app_metadata' -> 'is_admin') = 'true'::jsonb);
create policy "lesson_progress: admin read" on public.lesson_progress
  for select to authenticated
  using ((auth.jwt() -> 'app_metadata' -> 'is_admin') = 'true'::jsonb);

commit;
