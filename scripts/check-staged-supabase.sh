#!/usr/bin/env bash
# Only run against a fresh, disposable local PostgreSQL database.
set -euo pipefail
: "${DURA_TEST_DATABASE_URL:?Set DURA_TEST_DATABASE_URL to a disposable local database}"
case "$DURA_TEST_DATABASE_URL" in
  postgres://*@localhost:*/*|postgres://*@127.0.0.1:*/*) ;;
  *) echo "Refusing a non-local database; this script is only a test harness." >&2; exit 1 ;;
esac
psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/supabase/bootstrap.sql
# Auth/storage/realtime services are not simulated. Apply only the baseline
# dependencies of the staged contracts; storage/vector migration tests are separate.
for migration in supabase/migrations/00[1-6]-*.sql supabase/migrations/013-*.sql supabase/staged/*.sql; do
  psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f "$migration"
done
psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/supabase/staged-behavior.sql
