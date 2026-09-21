-- Dura ytputzzqubbaaztowyoz: apply after 022. Reviewed against live ACLs.
-- Removes anonymous RPC access; authenticated access and learner rows are unchanged.
-- Explicit anon grants survive REVOKE FROM PUBLIC on hosted Supabase.
BEGIN;
REVOKE EXECUTE ON FUNCTION public.sync_learner_records(text,jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.delete_learner_record(uuid,text,text,bigint) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.sync_progress_v2(uuid,jsonb) FROM PUBLIC, anon;
COMMIT;
