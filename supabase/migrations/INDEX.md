# Dura migration status

Verified target: Durwood Studios / Dura `ytputzzqubbaaztowyoz`, September 21, 2026. Dustin executes SQL; agents inspect the hosted database read-only. The folder name is a review status, not automatic permission to execute.

## Current queue — empty

025 was applied by Dustin and independently checked in Dura on September 21. The RPC body matches the tested source; both private tables have RLS, client schema access is denied, and the generated credential exists with the expected format (not retrieved). The RPC's intended transport grants exist; its server-secret guard is confirmed by the matching body. All prior migrations are archived unchanged. No queued SQL remains.

Vercel DURA_RATE_LIMIT_SECRET configuration and deployment remain outstanding. Follow [deployment instructions](../staged/DEPLOYMENT-READINESS.md). No Redis account or settings are needed.

## Original reviewed sequence (do not replay)

These four files have already been applied. This table records their historical sequence; do not execute them again.

| Order | File                                                                                       | Changes and acceptance                                                                                                                                                                                 |
| ----- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | [001-dura-contract-reconciliation.sql](Already%20Ran/001-dura-contract-reconciliation.sql) | Adds feedback retry, fixes annotation/vote permissions and counters, removes excessive client table grants and adds signed credential storage. Preserves existing learner rows; backfills vote totals. |
| 2     | [021-account-deletion.sql](Already%20Ran/021-account-deletion.sql)                         | Adds existing-account restrictions and recent-auth owner deletion/file inventory. Verify real Storage policies and auth-user cascades.                                                                 |
| 3     | [022-conflict-safe-sync.sql](Already%20Ran/022-conflict-safe-sync.sql)                     | Adds conflict-safe synchronization, activity/daily-time fields and deletion history. Revokes old direct mutable writes: the old frontend cannot continue its former sync writes afterward.             |
| 4     | [023-admin-report.sql](Already%20Ran/023-admin-report.sql)                                 | Adds exact admin report aggregation; depends on 021.                                                                                                                                                   |

Do not run historical 014–020 alongside this target-specific reconciliation. Do not run SQL test fixtures in production. After Dustin runs a transaction, inspect its actual functions, columns, grants and policies; then move that file to `Already Ran/` and update this index. Do not move files merely because execution was attempted.

After all four are verified, set `DURA_SUPABASE_CONTRACT_VERSION=2026-09-023` in Vercel production, then deploy the matching commit after its Release readiness check passes. This setting is an operator attestation, not a live schema checker. An app-only rollback after 022 is not compatible with the old sync grants.

Reviewed SHA-256 values (SQL bytes unchanged from the tested staged proposals):

```text
66d831da811b17ea322275b70790f0bbafb000b827c3d42dca3f1a90367b032d  001-dura-contract-reconciliation.sql
677ee17d7ee5a17ece1c8ea5792d8d2917bd4c778793d50197e6e2ce97011555  021-account-deletion.sql
01781bdd17561dd4d2e8eb3ea613fcfdc0d29be9a70e30fda06d5b5d638024f3  022-conflict-safe-sync.sql
5773680d485db36ffba75ee28a3ccdb9461e73faca00a1e61e4da55383af48d4  023-admin-report.sql
```

## Already Ran — effects verified in live metadata

These preserved historical scripts came from the `Coding Projects/Dura` checkout. September 21 inspection established their intended effects, not the original execution timestamp or an exact historical migration ledger. Do not replay them.

| File                                       | Live evidence                                                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `015-function-fixes.sql`                   | Both sync_progress's ownership/epoch-ms fixes and the preferences JSON overload are present.                              |
| `017-admin-rls.sql`                        | All intended admin read policies exist; some owner-read composition differs. Recreating the named policies would collide. |
| `20260629000003_infrastructure.sql`        | annotation_votes_user_id_idx exists as btree(user_id).                                                                    |
| `20260629000005_admin_annotations_rls.sql` | Admin annotation SELECT and UPDATE policies, including the allowed-status check, exist.                                   |

## In Progress — do not execute

| File                                    | Reason held                                                                                                                                                                                                       |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `20260629000001_security_hardening.sql` | View/storage changes are already present. Remaining RPC permission hardening needs a targeted delta: revoking anon does not remove inherited PUBLIC EXECUTE. Unconditional storage policy creation also collides. |
| `20260629000002_rls_performance.sql`    | SELECT auth.uid optimization already appears in 71 of 72 relevant live public policies. Replaying the old annotation/vote rules would undo the newer moderation reconciliation.                                   |
| `20260630000001_rate_limits.sql`        | Obsolete for current main's Redis limiter. Public read/insert policies expose limiter keys and allow fabricated hits; the script is not replay-safe despite its comment. Preserve only for historical review.     |

## Observed incident and release prerequisites

The live API logs contain repeated 404s for `/rest/v1/rate_limits`; the table is absent. The older app expects that table. Current main uses atomic Redis limiting and hashes identifiers before storing them. Creating the old broadly accessible table is not the chosen repair.

Vercel production must have server-only `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Keep secrets out of source and chat. The last inspected deployment is held by the missing Redis settings and incomplete database permission verification. Guest/local learning remains independent of Supabase.

The detailed release sequence and hosted acceptance requirements are in [DEPLOYMENT-READINESS.md](../staged/DEPLOYMENT-READINESS.md). Local SQL checks exercise these canonical queue files; passing local checks does not mark them applied remotely.
