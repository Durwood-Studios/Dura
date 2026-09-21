> September 21 update: 001 and 021–023 are applied and archived under `supabase/migrations/Already Ran/`. Only 024 is queued; see the migration index. Historical proposal descriptions below are not execution instructions.

# Dura live reconciliation proposal

The reviewed SQL now lives in [Need To Run](../../migrations/Already%20Ran/001-dura-contract-reconciliation.sql). Follow [the migration index](../../migrations/INDEX.md); do not execute historical staged files as a batch.

Target verified in authenticated dashboard: Durwood Studios (`sloptkiwuwwiioifujfy`), Dura (`ytputzzqubbaaztowyoz`), main PRODUCTION, GitHub `Durwood-Studios/Dura`.

The primary agent observed 24 tables with RLS enabled, existing tenant composite keys, `analytics_events`, profile email, and the optional learner tables. Historical staged014/015 must **not** be applied. The existing `sync_progress` already guards caller ownership and uses millisecond timestamps; this patch leaves it unchanged.

`001-dura-contract-reconciliation.sql` is a single transaction proposed against the observed schema, not a general baseline migration. No hosted application is claimed in this document.

- Adds absent retry-safe feedback RPC with input validation and `auth.uid()` attribution. Preserves existing rows and legacy direct INSERT policy during frontend rollout.
- Closes annotation self-approval on INSERT; permits owners to read pending entries. Existing admin policies remain intact. Column UPDATE grants restrict edits to content, status, and timestamp.
- Restricts votes to published annotations and maintains/backfills totals from existing votes.
- Removes nonapplication table privileges (including TRUNCATE, which RLS does not protect) from public client roles; restores required operations. Leaves service_role unchanged.
- Adds nullable bounded signed credential storage and extends the existing hash-lookup result without cascading dependent-object removal. Stored artifacts remain independently signature-verified.

The patch uses five-second lock and thirty-second statement timeouts. Unknown dependencies or existing new functions cause rollback. It is intentionally not blindly replayable. Reinspect metadata after any uncertain execution outcome. Preexisting feedback rows are not subjected to new NOT NULL or validation constraints.

Run `bash scripts/check-live-supabase-reconciliation.sh` only with a fresh disposable local database. Tests reconstruct the observed subset; they are not a complete hosted schema dump. PGlite validation passed legacy insertion, retry idempotence, input rejection, attribution, owner/admin isolation, counter protection, vote maintenance, and credential storage/lookup. Native PostgreSQL harness remains available for CI/integration validation. Hosted PostgREST/JWT behavior still requires verification after an approved application.

Before applying, the primary agent must inspect the exact patch and current target, preserve the existing function definition for recovery, and confirm that the metadata observations remain current. A transaction failure rolls back all changes. After commit, preserve new feedback and credential data; application rollback should retain additive columns/functions. Do not undo moderation protections simply to revert a release.

## Manual run queue for this Dura project

No hosted write is confirmed. This is a manual queue for project `ytputzzqubbaaztowyoz`, based on the observed schema; recheck the target and metadata before execution.

| SQL                                                              | Action for existing Dura        | Reason                                                                                                                 |
| ---------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `../migrations/Already Ran/001-dura-contract-reconciliation.sql` | Review and run manually once    | Narrow transaction for the observed missing/unsafe contracts.                                                          |
| Baseline `001`–`013`                                             | Do not replay                   | Existing production objects differ from historical source; an empty dashboard migration list is not an empty database. |
| Staged `014`                                                     | Skip                            | Analytics naming and tenant composite keys already match.                                                              |
| Staged `015`                                                     | Skip                            | Optional learner stores already exist.                                                                                 |
| Staged `016`                                                     | Do not run separately           | Feedback already exists; the narrow patch adds its absent retry RPC while preserving legacy INSERT.                    |
| Staged `017`                                                     | Do not run separately           | Observed admin policies already exist; blindly recreating them collides.                                               |
| Staged `018`                                                     | Do not run separately           | The narrow patch reconciles existing annotation policy names, grants and absent vote maintenance.                      |
| Staged `019`                                                     | Skip                            | Observed profile email/signup handling and caller-guarded millisecond progress RPC already exist.                      |
| Staged `020`                                                     | Do not run separately           | Signed-proof column and lookup extension are included in the narrow patch.                                             |
| `tests/supabase/schema-inventory.sql`                            | Optional read-only inspection   | Metadata only; no learner rows or writes.                                                                              |
| Other `tests/supabase/*.sql` and database harnesses              | Local disposable databases only | Fixtures and regression tests create or mutate synthetic data; never run them in production.                           |

Reviewed patch SHA-256: `66d831da811b17ea322275b70790f0bbafb000b827c3d42dca3f1a90367b032d`. Verify the file checksum before running. If it differs, review the changed SQL rather than relying on this record. After any uncertain outcome, inspect the schema before retrying; the patch is intentionally not blindly replayable.
