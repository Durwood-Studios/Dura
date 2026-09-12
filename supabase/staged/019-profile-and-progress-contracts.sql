-- STAGED: repair signup's missing profile column and enforce RLS in progress RPC.
begin;

alter table public.profiles add column if not exists email text;
-- Keep existing data intact. New signups use the existing handle_new_user trigger.
-- Existing profile email can be populated separately if needed; no auth data is
-- copied into previously empty profile rows by this migration.

-- The original SECURITY DEFINER RPC accepted a caller-selected user ID and
-- bypassed row policies. Execute as the caller so existing owner policies apply.
alter function public.sync_progress(uuid, jsonb) security invoker;
revoke all on function public.sync_progress(uuid, jsonb) from public, anon;
grant execute on function public.sync_progress(uuid, jsonb) to authenticated;

commit;
