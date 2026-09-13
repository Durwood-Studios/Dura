# Hosted rollout readiness

Repository: `Durwood-Studios/Dura`. Read-only SQL inspection verified the hosted Dura schema. No hosted migration or deployment is confirmed; the current workflow is for the user to run the reviewed SQL manually. The repository’s existing production deployment is visible in GitHub; its Vercel project settings and required environment configuration remain unverified.

## Verified target and schema

Authenticated dashboard: Durwood Studios (`sloptkiwuwwiioifujfy`), Dura (`ytputzzqubbaaztowyoz`), main PRODUCTION, GitHub integration `Durwood-Studios/Dura`. The primary agent inspected catalog metadata in read-only transactions; no learner records were selected. See [live schema review](LIVE-SCHEMA-REVIEW.md) for observations.

The database has 24 public base tables, all with RLS enabled, and four views. Tenant composite keys, `analytics_events`, `profiles.email`, the optional learner stores, admin policies, and the guarded millisecond-based `sync_progress` already exist. Feedback exists, but its retry RPC does not. Annotation creation permits self-approval, client table grants include TRUNCATE, vote totals lack maintenance triggers, and certificate signed-proof storage is absent. RLS alone does not protect TRUNCATE.

The dashboard's empty migration listing does not mean an empty schema. Do not replay repository migrations based on that label. No Supabase/Vercel connector or CLI credentials were available during local inspection; the authenticated dashboard supplied the actual read-only evidence. Never copy secret keys into this report.

## What needs to run manually

Use the [run/skip matrix](live/README.md#manual-run-queue-for-this-dura-project). The initial target-specific reconciliation script for this observed project is [001-dura-contract-reconciliation.sql](live/001-dura-contract-reconciliation.sql). It combines the missing feedback, moderation, vote and signed-proof changes while preserving legacy feedback insertion during frontend rollout. Do not run staged 014–020 separately against this project.

After that base reconciliation, the current frontend has three additional manual proposals, in this order:

1. `021-account-deletion.sql`: existing-account restrictions and owner-parameter/recent-auth deletion RPCs. Requires the real Storage schema, bucket ownership/delete policies and verified auth-user cascades. Missing deployment disables account deletion; it does not block guest learning.
2. `022-conflict-safe-sync.sql`: activity/daily-time fields, goal references, deletion tombstones and conditional mutation RPCs. It rejects mismatched account identities and revokes old direct mutable-table writes. Coordinate its application with this frontend release: an old frontend cannot continue writing those tables afterward, while this frontend cannot cloud-sync those records beforehand. An app-only rollback to the former sync client is not compatible with these grants.
3. `023-admin-report.sql`: exact server aggregation for the admin dashboard. It depends on `current_account_exists()` from 021 and the observed admin RLS policies. Missing deployment displays an unavailable report; it must not silently fall back to truncated counts.

These are separate reviewed proposals; the initial live-specific patch does not contain 021–023. Each runs in a transaction and is not a blind replay script. No hosted application is confirmed. The judgment journal and downloadable teaching labs need no hosted migration.

Before running it, verify the same organization/project and inspect the current metadata again if anything may have changed. Review the complete transaction and retain the existing certificate lookup definition for recovery. The patch refuses blind replay: after an uncertain execution result, inspect metadata before retrying. No SQL in this documentation is executed automatically.

## Frontend release attestation

After verifying the correct project, committed SQL transactions and resulting functions/grants, set server-only `DURA_SUPABASE_CONTRACT_VERSION=2026-09-023` in the production deployment environment. The build gate requires this exact value when accounts are configured, together with both server-only Upstash Redis settings and successful CI for the deployed commit. Until then, the previous production deployment stays live. Do not set the flag in advance to bypass the coordinated sync cutover.

This is an explicit operator attestation of completed verification, not an automatic live-schema check or proof against later drift. No secret database key is required. Preview/local builds remain available for reviewing and testing the implementation before the manual database rollout.

## Read-only checks

[schema-inventory.sql](../../tests/supabase/schema-inventory.sql) returns metadata in a read-only transaction. It does not select learner records. Save its JSON output locally, then optionally run:

```bash
node scripts/check-supabase-readiness.mjs /path/to/schema-snapshot.json
```

This generic checker cannot apply migrations. Its baseline expectations are stricter than the target-specific transition: the live patch intentionally retains direct legacy feedback INSERT, and leaves the existing owner-guarded progress RPC unchanged. Evaluate findings against the reviewed target patch; do not change live permissions merely to silence this checker. A passing fixture is not hosted deployment evidence. Without a snapshot the command exits nonzero with `hosted-schema-unavailable`.

## Isolated checks

`bash scripts/check-staged-supabase.sh` runs only against an explicit local disposable PostgreSQL URL. It rejects query parameters that could override the hostname. The harness applies relevant baseline/staged SQL, checks owner isolation, administrator claims, feedback replay, moderation, progress RPC ownership, signed-proof storage and the read-only preflight. Node-only guard tests run with:

```bash
node --test tests/supabase/readiness.test.mjs
```

The same SQL was validated locally in disposable PGlite: historical-only schema was rejected; staged schema passed the checked contracts; behavior/RLS and credential storage tests passed; 014/019/020 replay succeeded. PGlite does not prove hosted JWT issuance, PostgREST behavior, storage or realtime configuration.

## Verification after the user's manual application

1. Record the SQL checksum and result; recapture metadata on the same project to verify the exact functions, column, grants, policies and triggers. A failed transaction must not be treated as applied.
2. Validate feedback retries, owner/admin annotation behavior, vote totals and signed-proof lookup with dedicated disposable test records. Local SQL tests do not establish hosted PostgREST/JWT behavior.
3. Verify the deployment target, public Supabase configuration, auth redirect URLs and server-only signing configuration without printing secrets. The production deployment target remains unverified.
4. Complete build, lint, typecheck and browser/offline checks before publishing the reviewed application revision. Keep the previous release available; application rollback should preserve additive feedback and credential data and moderation protections.
