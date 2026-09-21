#!/usr/bin/env bash
# Only run against a fresh, disposable local PostgreSQL database.
set -euo pipefail
: "${DURA_TEST_DATABASE_URL:?Set DURA_TEST_DATABASE_URL to a disposable local database}"
node scripts/assert-local-test-database.mjs
psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/supabase/bootstrap.sql
psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/supabase/storage-bootstrap.sql
# Auth/storage/realtime services are not simulated. Apply only the baseline
# dependencies of the staged contracts; storage/vector migration tests are separate.
for migration in supabase/migrations/00[1-6]-*.sql supabase/migrations/013-*.sql supabase/staged/*.sql "supabase/migrations/Already Ran/"02[1-3]-*.sql; do
  psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f "$migration"
done
psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/supabase/staged-behavior.sql
# Reproduce hosted explicit grants before testing the correction and its replay.
psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -c 'GRANT EXECUTE ON FUNCTION public.sync_learner_records(text,jsonb), public.delete_learner_record(uuid,text,text,bigint), public.sync_progress_v2(uuid,jsonb) TO anon;'
for attempt in 1 2; do
  psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f "supabase/migrations/Already Ran/024-sync-function-permissions.sql"
  psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/supabase/sync-function-permissions.sql
done
psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/supabase/conflict-safe-sync.sql

psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/supabase/credential-storage.sql

psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/supabase/account-deletion.sql

psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/supabase/admin-report.sql

# Replay must preserve the private configuration and remain safe after use.
for attempt in 1 2; do
  psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f 'supabase/migrations/Already Ran/025-supabase-rate-limits.sql'
  psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/supabase/rate-limits.sql
done

node --test tests/supabase/readiness.test.mjs
snapshot=$(mktemp)
trap 'rm -f "$snapshot"' EXIT
psql "$DURA_TEST_DATABASE_URL" -X -qAt -v ON_ERROR_STOP=1 \
  -f tests/supabase/schema-inventory.sql > "$snapshot"
node scripts/check-supabase-readiness.mjs "$snapshot"
