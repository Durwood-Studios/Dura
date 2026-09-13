#!/usr/bin/env bash
# Only run against a fresh, disposable local PostgreSQL database.
set -euo pipefail
: "${DURA_TEST_DATABASE_URL:?Set DURA_TEST_DATABASE_URL to a disposable local database}"
node scripts/assert-local-test-database.mjs
psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/supabase/bootstrap.sql
psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/supabase/storage-bootstrap.sql
# Auth/storage/realtime services are not simulated. Apply only the baseline
# dependencies of the staged contracts; storage/vector migration tests are separate.
for migration in supabase/migrations/00[1-6]-*.sql supabase/migrations/013-*.sql supabase/staged/*.sql; do
  psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f "$migration"
done
psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/supabase/staged-behavior.sql
psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/supabase/conflict-safe-sync.sql

psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/supabase/credential-storage.sql

psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/supabase/account-deletion.sql

psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/supabase/admin-report.sql

node --test tests/supabase/readiness.test.mjs
snapshot=$(mktemp)
trap 'rm -f "$snapshot"' EXIT
psql "$DURA_TEST_DATABASE_URL" -X -qAt -v ON_ERROR_STOP=1 \
  -f tests/supabase/schema-inventory.sql > "$snapshot"
node scripts/check-supabase-readiness.mjs "$snapshot"
