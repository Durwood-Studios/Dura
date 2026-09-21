#!/usr/bin/env bash
# Fresh disposable LOCAL database only; never connects to the hosted project.
set -euo pipefail
: "${DURA_TEST_DATABASE_URL:?Set DURA_TEST_DATABASE_URL to a fresh disposable local database}"
node scripts/assert-local-test-database.mjs
psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/supabase/bootstrap.sql
for migration in supabase/migrations/00[1-6]-*.sql supabase/migrations/013-*.sql; do
  psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f "$migration"
done
psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/supabase/live-reconciliation-fixture.sql
psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f "supabase/migrations/Already Ran/001-dura-contract-reconciliation.sql"
psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/supabase/live-reconciliation.sql
psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/supabase/credential-storage.sql
