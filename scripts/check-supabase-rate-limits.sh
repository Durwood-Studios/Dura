#!/usr/bin/env bash
# Fresh disposable LOCAL database only; never connects to the hosted project.
set -euo pipefail
: "${DURA_TEST_DATABASE_URL:?Set DURA_TEST_DATABASE_URL to a fresh disposable local database}"
node scripts/assert-local-test-database.mjs
psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/supabase/bootstrap.sql
for attempt in 1 2; do
  psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f 'supabase/migrations/Already Ran/025-supabase-rate-limits.sql'
  psql "$DURA_TEST_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f tests/supabase/rate-limits.sql
done
# Independent transactions sharing a key must admit exactly five consumers.
results=$(mktemp -d)
trap 'rm -rf "$results"' EXIT
for attempt in $(seq 1 16); do
  psql "$DURA_TEST_DATABASE_URL" -X -qAt -v ON_ERROR_STOP=1 -c "SELECT public.consume_rate_limit((SELECT secret FROM dura_private.rate_limit_config WHERE singleton), repeat('d',64), 5, 60000)->>'success';" > "$results/$attempt" &
done
wait
node -e 'const fs=require("node:fs"); const files=fs.readdirSync(process.argv[1]); const rows=files.map(f=>fs.readFileSync(`${process.argv[1]}/${f}`,"utf8").trim()); if(rows.length!==16||rows.filter(v=>v==="true").length!==5||rows.filter(v=>v==="false").length!==11) throw Error("Concurrent admission contract failed");' "$results"
