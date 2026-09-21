# Learner-data implementation evidence

Implementation and local evidence, updated September21: migrations through025 were applied by Dustin and independently verified, and releaseac96abf is live. Hosted cross-device and deletion acceptance remains separate. Historical test counts below describe earlier snapshots.

## Implemented contracts

- Root owner/key readiness blocks persistent access while preserving server-rendered public content. Separate guest/account IndexedDB names, keys and OPFS snapshots isolate later account sessions. Account transitions reload volatile stores; guest adoption is explicit, copies validated records and preserves the source.
- Judgment practice uses a dedicated encrypted `judgmentAttempts` store (IndexedDB v9), bounded validated attempts, immutable submitted reasoning, compare-and-swap saves and visible stale-save errors. It is included in portable export/import and shadow recovery; no cloud sync is claimed.
- Portable ZIP version 2 hydrates encrypted records and validates the full learner inventory. Restore merges before one write transaction, rejects concurrent local changes and encrypts for the destination key. Invalid recovery aborts the entire transaction. Credentials and API keys are excluded.
- Synchronization serializes passes and drains before reset. Progress acknowledgement compares the uploaded encrypted envelope, so an in-flight response cannot mark a newer edit synced. Remote encrypted merges use compare-and-swap; plaintext mutable merges and deletion checks share one transaction. Deletes persist tombstones; XP is pulled; fetched tables paginate.
- Backup reads share one readonly transaction and restore shares one write transaction. Storage writes propagate errors. Preference patches transact atomically. Analytics without a sink remains pending; imported analytics never become new telemetry. Consent is owner-scoped and disabled before initialization.

## Local evidence

- `tests/learner-record/data-integrity.test.ts`: real WebCrypto hydration, cross-key ZIP restore, fresh-card difficulty, acknowledgement race and analytics no-op regression.
- `tests/learner-record/owner-isolation.test.ts`: legacy ownership, account separation and initialization barrier.
- `node scripts/check-data-browser.mjs`: real Chromium IndexedDB, guest→A explicit copy, A→B isolation, encrypted ZIP import under a different key, preserved guest records, invalid recovery rollback. Passed after final snapshot consistency change.
- `scripts/check-conflict-safe-sync.sh` and `tests/supabase/conflict-safe-sync.sql`: disposable SQL reconciliation and stale-write/tombstone/activity evidence tests. PGlite fixture passed. This is not a hosted multi-device test.
- Focused learner-record, IDB, Supabase, judgment and reset suite: 150 tests passed after final reset-mock alignment. Root performs full integration verification.
- MCP lab is separately executable under `public/labs/mcp-server`; tested through the official SDK's real stdio transport, without a model or external service.
- Full Vitest integration after the 695-lesson curriculum freeze: 110 files / 1,474 tests passed. The recovery memory adapter now implements the native IndexedDB `count()` contract used by the atomic empty-store guard.
- Browser diagnosis reproduced a route-transition remount deleting unsaved judgment input approximately 350 ms after navigation. `PageTransition` now retains its live DOM subtree during entry animations and motion-preference changes; a DOM-identity regression passes. The rebuilt production browser workflow remains a separate integration check.

## Deployment dependency and limits

`supabase/migrations/Already Ran/022-conflict-safe-sync.sql` has been applied and verified with the matching frontend release. It adds owner tombstones, conflict-safe mutation/progress RPCs, activity/daily-time JSON fields and goal references, and removes direct mutable-table write grants from client roles. That rollout is complete. Account deletion021 is also applied; actual hosted multi-device and deletion behavior still needs acceptance. Do not rerun archived SQL.

No claim is made that hosted account deletion, hosted two-device convergence, browser private-mode persistence, or every tutorial's external runtime has been exercised. Legacy canonical-only exports cannot reconstruct missing flashcard text; the importer reports the recoverable subset. Browser-managed storage can still be removed by the user or browser; downloadable exports remain the independent recovery mechanism.
