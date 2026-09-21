# Dura resume report

Updated September 21, 2026. Read this before restarting implementation. This records completed source work, outstanding rollout, and evidence limits; it is not a production-completion claim.

## Current position

Latest user report: all four queued SQL transactions returned "Success. No rows returned." DO NOT RERUN. Post-application verification is pending after three browser-control timeouts; files have not been marked independently verified or moved. Restore browser access, check functions/columns/policies/grants, then move the four files and update harness paths. Prioritize matching frontend/Redis deployment because 022 is reportedly applied.

September 21 queue cleanup: both this checkout and `/Users/dustinsnellings/Coding Projects/Dura` now have only the four reviewed SQL files in `supabase/migrations/Need To Run/`. Four verified historical files were preserved in `Already Ran/`; three held scripts in `In Progress/`. Read `supabase/migrations/INDEX.md`. Harnesses now reference the canonical queue. No hosted SQL ran and no commit/deployment was performed for this cleanup. Earlier path/status descriptions below are historical.

- Workspace: `/Users/dustinsnellings/Documents/ChatGPT/Dura`.
- Local `main`: `c39919253ef95b6b6399bc5494bc8d5b4e66a2ae`; local tracking ref matches. No pull or commit was performed for this report.
- GitHub checked September 21: latest main CI is successful, [run 34853491553](https://github.com/Durwood-Studios/Dura/actions/runs/34853491553), for that same commit.
- GitHub checked September 21: latest Production deployment remains failed, deployment `6421308440`, also for that commit. [Vercel failure](https://vercel.com/dustin-snellings-projects/dura/GxSnZccMhhvz2tZ8D3P77FC5n24w).
- Last direct Vercel inspection, September 14: `dura.dev` served the older successful `19b5ec2` release. Recheck live domain assignment before claiming its current revision.
- Two uncommitted implementation files remain: `scripts/check-production-release.mjs` and `tests/release/guards.test.mjs`. Preserve them. This report is also uncommitted.

## Completed source work to preserve

The seven original priorities have substantial implemented changes on main. See `DURA-COMPLETION.md` and the historical `DURA-PROMISE-AUDIT.md` for scope.

| Area                         | Implemented / established evidence                                                                                                                                                                                |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Curriculum                   | 749 phase lessons, 120 modules, 1,806 assessment questions, 11 downloadable teaching projects. All 106 historical career-topic gaps have specific introductory study links.                                       |
| Learner records              | Account-owned encrypted local stores, guest adoption, portable archive, atomic recovery, revision-aware sync and deletion proposals.                                                                              |
| Engineering judgment         | Eight versioned cases; initial decision, counterevidence, revision, worked examples, anchored self-review, delayed return, export and teacher materials.                                                          |
| Viewport containment         | Portal/collision positioning for popovers and bounded fixed surfaces; all 749 lessons plus guides and curriculum navigation checked at 320px in Chromium. Selected critical flows also checked in Firefox/WebKit. |
| Privacy and account features | Consent controls, auth rate-limit implementation, recent-auth deletion and owned-file cleanup implementation; hosted prerequisites remain.                                                                        |
| Release checks               | Native PostgreSQL contract tests, executable teaching projects, browser/offline regressions, exact-commit production gate and named CODEOWNER.                                                                    |

Prior clean CI evidence included 1,568 unit tests across 121 files and one complete 52-scenario browser run. The local-run paragraph in `DURA-COMPLETION.md` predates that clean CI result; reconcile the documentation when publishing the next change. Do not rerun the entire suite merely to recreate existing evidence.

## First priority: complete the hosted rollout

### Confirmed cause, not a speculative build error

The September 14 Vercel log for `c399192` stopped at the production guard because `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` were missing. The project environment screen showed public Supabase configuration and Stripe configuration, but no Redis settings or database-contract attestation. No existing team database was listed in the connection picker. No Redis resource was created, credentials entered, or deployment retried during that investigation.

The guard is intentionally preventing a release whose configured services would not work. Do not remove the guard or set a false database attestation to make deployment green.

### Database target and execution boundary

- Organization: Durwood Studios, `sloptkiwuwwiioifujfy`.
- Project: Dura, `ytputzzqubbaaztowyoz`.
- Agent access remains read-only; Dustin runs migrations.
- September 14 catalog SELECTs confirmed that the target-specific reconciliation and 021–023 were unapplied. This is dated evidence: re-inspect before running anything.
- Existing tenant keys, analytics naming, profile email, learner tables, and owner-guarded millisecond progress RPC already exist. Do not replay historical migrations based on an empty dashboard migration list.
- Missing contracts included feedback retry RPC, annotation vote maintenance, signed credential storage, current-account/deletion functions, conflict-safe sync functions/fields/tombstones and admin aggregation. Legacy client TRUNCATE grants and annotation self-approval also remained; these are part of the reconciliation, not just new-feature setup.
- Detailed local evidence: `xDocs/active/supabase-golive-2026-06/evidence/2026-09-14-readonly-metadata.md` (ignored local file; no learner rows or secrets).

### Required work in order

1. Recheck target metadata and current Vercel settings without selecting learner records or exposing secrets.
2. Organize reviewed, ready SQL into Dustin's required `supabase/migrations/Need To Run/` queue with an execution index, dependencies and checksums. These folders are not yet present in this checkout. Update references and harnesses carefully; do not create ambiguous duplicate execution copies.
3. The last verified minimal manual sequence is:
   - `supabase/staged/live/001-dura-contract-reconciliation.sql` — feedback, moderation, votes, grants and signed-proof reconciliation.
   - `supabase/staged/021-account-deletion.sql` — current-account checks, recent-auth deletion and owned-storage access.
   - `supabase/staged/022-conflict-safe-sync.sql` — conditional sync, evidence fields and deletion history; revokes old direct mutable writes.
   - `supabase/staged/023-admin-report.sql` — exact admin aggregation.
4. Do not separately stack staged 014–020 onto this target-specific sequence. Read `supabase/staged/DEPLOYMENT-READINESS.md` and `supabase/staged/live/README.md` before preparing the queue.
5. Coordinate 022 with frontend release: the old frontend loses its former write permissions afterward. Prepare the release prerequisites first. An app-only rollback is not sufficient to restore old sync behavior.
6. Provision/connect the appropriate Redis service and securely configure both server-only Upstash REST variables. Confirm account, plan and scope before any billing commitment; do not put tokens into chat or source.
7. Dustin executes reviewed SQL; verify actual outcomes and update the index. Move files to `Already Ran/` only after verification. `In Progress/` is for drafts, not Dustin's execution queue.
8. Only after verified database rollout, set server-only `DURA_SUPABASE_CONTRACT_VERSION=2026-09-023`, verify exact-commit CI, deploy and check the real production domain.
9. Complete hosted acceptance with agreed disposable test accounts: two-device sync/conflicts/deletions, feedback retry, annotation/vote permissions, credential verification, account deletion/Storage/JWT behavior and admin aggregates. Local fixtures do not prove these hosted integrations.

## Uncommitted diagnostics improvement

The two modified files aggregate all missing release prerequisites into one error, name only missing Redis settings, and link to `supabase/staged/DEPLOYMENT-READINESS.md`. They preserve fail-closed behavior and trusted CI verification. Agent verification on September 14: 10 targeted tests passed, plus scoped lint and formatting. No commit or push followed.

Before committing on resume, inspect the diff, preserve unrelated work, run Dustin's required `git pull --rebase origin main`, resolve conflicts and verify the resulting change. Work directly on main; do not introduce feature branches. The release script is CODEOWNERS-listed: flag it and identify Dustin / `@Dub5991` as the human reviewer without claiming a review has happened. Include the AI provenance trailer.

## Dependency PR follow-up

These are September 14 findings; refresh PR state before action. No PR was closed, merged, commented on or updated during this investigation.

| PRs                    | Finding and next action                                                                                                                                                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 5, 6, 8, 9, 10, 17, 20 | Versions already met or exceeded by main. Confirm supersession and clean up stale PRs rather than merging obsolete changes.                                                                                                                                                                                  |
| 26                     | Grouped updates remain a separate review. Its preview compiled, then failed on tests importing ignored `xDocs` JSON fixtures; main already fixes that. CI also found formatter changes and an outdated SQL fixture. Reconcile with current main, review dependency changes, and validate before integrating. |
| 11                     | ESLint 10 upgrade conflicts with current React/import/accessibility plugin peer ranges. Needs coordinated compatibility work. Historical logs expired, so do not claim an exact recovered historical cause.                                                                                                  |
| 7                      | Node 25 type definitions do not match the project's Node 22 runtime baseline. Keep runtime and types aligned.                                                                                                                                                                                                |

PR26 evidence: [CI](https://github.com/Durwood-Studios/Dura/actions/runs/34754531157), [Vercel](https://vercel.com/dustin-snellings-projects/dura/4UNM79vZyBL2DMswuJ4tUb4fVhdm). A red preview check is distinct from main CI and from production deployment.

## Remaining product-quality acceptance

- Finish semantic/executable review of the remaining guides. The 135-guide inventory covers 1,469 code fences; inventory and rendering are not proof every tutorial works. Start with `standards/pedagogy/TUTORIAL-RUNTIME-REVIEW.md`.
- Execute hardware/tool-specific acceptance where appropriate: physical STM32 board, full UVM environment, ROS Jazzy / URsim. Existing host tests, UART simulation and firmware compilation have narrower evidence.
- Continue specialist review of career-path depth. Introductory links close identified mapping gaps but do not establish advanced professional competence or complete coverage of every possible skill.
- Evaluate engineering-judgment teaching with learners and calibrate the rubric. Standards and published teaching methods inform the design; Dura-specific effectiveness and scoring reliability remain unvalidated. See `standards/engineering-judgment/ej-1.0.md`.
- Extend accessibility/viewport acceptance where evidence is missing, especially zoom and assistive technology. Existing checks do not justify a universal “nothing can ever render off screen” guarantee.
- Verify production auth redirects, provider rate limits and signup configuration. Preserve free core learning and offline functionality.

## Pause / resume discipline

### Fresh live verification — September 21

The user restored the Durwood Studios session. Verified Dura `ytputzzqubbaaztowyoz`, main PRODUCTION, Dub5991. Two catalog-only SELECTs succeeded in a separate editor; no migrations or learner-record queries ran. This supersedes the browser-access blocker described below.

| Screenshot queue file                      | Verified disposition                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `015-function-fixes.sql`                   | Skip replay: live sync_progress has the ownership guard and bigint millisecond writes; update_user_preferences(jsonb) exists with the expected `prefs` argument and merge body.                                                                                                                                                                                        |
| `017-admin-rls.sql`                        | Skip replay: admin feedback/profile/progress/annotation reads and analytics admin policy already exist. Some definitions differ in owner-read composition, but the intended admin access is present. Unconditional policy creation would collide.                                                                                                                      |
| `20260629000001_security_hardening.sql`    | Do not run unchanged: all four views are invoker views, relevant function search paths inspected are empty, and own-folder storage read policies exist. PUBLIC EXECUTE still appears in the inspected RPC ACLs, so anon-only revocations do not fully resolve effective access. Needs a targeted remaining-delta review, not a claim that every statement was applied. |
| `20260629000002_rls_performance.sql`       | Do not replay: 71 of 72 public policies containing auth.uid already use SELECT auth.uid. The script's owner-only annotation/vote rules also conflict with the newer moderation reconciliation. This count does not prove an exact match for every statement.                                                                                                           |
| `20260629000003_infrastructure.sql`        | Skip: annotation_votes_user_id_idx already exists as a btree on user_id.                                                                                                                                                                                                                                                                                               |
| `20260629000005_admin_annotations_rls.sql` | Skip: both admin_read_annotations and admin_update_annotations exist, including the update status check.                                                                                                                                                                                                                                                               |
| `20260630000001_rate_limits.sql`           | Table and cleanup function are absent. The older checkout expects this table, but current main uses Redis. Do not deploy its broadly readable/writable policies as the release fix; reconcile the active app implementation first.                                                                                                                                     |

The current catalog also confirms no learner_tombstones table and no inspected new feedback/account/sync/admin RPCs. Base reconciliation plus 021–023 therefore remain outstanding; recheck all prerequisites before execution.

Logs show repeated GET `/rest/v1/rate_limits` responses with HTTP 404, consistent with the absent table and older limiter code. The dashboard showed 244 API warnings and no API 5xx errors; sampled individual warnings were 404s. Do not claim every one of the 244 was individually examined, or that a 3.6% dashboard request success rate is a measured learner success rate. No IP addresses or request keys are retained in this report.

Next release action: resolve the deployment/code mismatch and provision the chosen safe limiter, then complete the coordinated SQL/frontend rollout. Missing legacy limiter storage is a real currently observed request failure, not evidence that all seven historical scripts should run.

### Correction from the screenshot follow-up

The screenshot's seven-file queue was located at `/Users/dustinsnellings/Coding Projects/Dura/supabase/migrations/Need To Run/`. This is a separate checkout on `fix/learning-foundations`, commit `e71a7ce`, with unrelated local changes. Do not overwrite or switch it blindly. The earlier statement that the queue did not exist applied only to the ChatGPT checkout and was insufficient investigation.

Its rate limiter still uses the Supabase `rate_limits` table; the ChatGPT/main implementation uses Upstash. Reconcile the two code revisions before deciding which deployment's migration requirements apply.

Static SQL findings: `017-admin-rls.sql` and `20260629000005_admin_annotations_rls.sql` both unconditionally create `admin_read_annotations`, so the full batch collides even on a fresh target. The RLS-performance script recreates owner-only annotation INSERT/vote rules and would undo the stricter reconciliation. The security-hardening script revokes from anon without removing inherited PUBLIC EXECUTE and unconditionally creates storage policies. The rate-limits script exposes all limiter rows to public client roles and is not replay-safe despite its comment (unconditional CREATE POLICY). The infrastructure script only adds an IF NOT EXISTS index; confirm its definition against the catalog. `015-function-fixes.sql` needs both function bodies checked, including the preferences overload, before classifying the whole file.

A fresh browser attempt reached Supabase but redirected the Dura project URL to Turblu. The authenticated account was the Turblu work account; its complete organization list contained only Turblu, with no account-switch option. Prior read authorization persists, but that browser session cannot currently inspect Dura. No sign-out, SQL execution, hosted writes, or changes to the other checkout occurred. Resume live verification in the Durwood Studios account; do not present the September 14 metadata as a fresh inspection.

At the pause, no subagent remained running. The agent-owned local production server, session 37076 on port 3100, was stopped with exit 130. The user's separate development server was not stopped. No recurring automation was created. Temporary `/private/tmp/dura-*` logs and runtime installs may expire; use repository and GitHub evidence first.

The earlier pause was interrupted before its report was written. This file completes that handoff. No build, dependency upgrade, migration, commit or deployment was started to produce this status report. Resume with the rollout queue and current evidence, not another unbounded rewrite of the seven priorities.

## Latest live verification — September 21, Safari

Safari successfully accesses Dura as Dub5991 while Chrome retains the separate Turblu session. Read-only catalog checks confirm all ten migration function bodies and the principal columns, policies, trigger and write restrictions. Three sync functions retain explicit anon EXECUTE grants; their bodies reject missing authentication. A narrowly scoped correction is documented, not executed. Approval to prepare migration 024 is pending under the per-migration instruction. Do not rerun 001/021/022/023. See [live verification evidence](xDocs/active/dura-live-verification-2026-09-21.md). Production release attestation remains unset; Redis and frontend deployment remain outstanding.

## Latest queue update — migration 024 prepared

Dustin approved preparation. Both checkouts now contain only `024-sync-function-permissions.sql` in Need To Run. The original four applied SQL files moved unchanged to Already Ran. Harness references are updated and regression assertions cover the explicit anon grant discrepancy and repeat application. Thirteen Node release/readiness checks and shell syntax checks passed; native PostgreSQL tests remain unexecuted locally because PostgreSQL is unavailable. 024 has NOT run on hosted Supabase. After Dustin runs it, verify anonymous EXECUTE=false and authenticated EXECUTE=true for all three functions, then archive 024 and update harness paths. Redis, production attestation and deployment still remain. No commit or push made for this queue update.

## Latest status — 024 applied and verified

September 21: Dustin executed 024 successfully. A fresh live catalog SELECT in Dura confirmed anonymous EXECUTE=false and authenticated EXECUTE=true on sync_learner_records(text,jsonb), delete_learner_record(uuid,text,text,bigint), and sync_progress_v2(uuid,jsonb). 024 is archived unchanged in Already Ran; the reviewed execution queue is empty. Harness paths now reference the archive. Earlier pending-024 statements above are historical. Redis configuration, frontend deployment, and hosted behavior acceptance remain outstanding.

## Latest decision — Redis removed, Supabase limiter prepared

Dustin rejected an additional Redis provider. No Upstash terms accepted, account created, or paid plan selected. The active implementation now uses Supabase consume_rate_limit with HMAC identifiers and a separate server-only DURA_RATE_LIMIT_SECRET. Redis runtime imports/dependencies are removed. Release guard requires database contract 2026-09-025, existing Supabase public settings, and the generated limiter credential.

025-supabase-rate-limits.sql is the ONLY new queued migration; it is not applied remotely. It creates private limiter config/buckets and a secret-authorized atomic sliding-window RPC. Follow supabase/staged/DEPLOYMENT-READINESS.md to run it and privately transfer the generated secret to Vercel. Do not print/copy the secret into reports. Prior 001/021/022/023/024 remain applied and archived.

Native PostgreSQL17 installed for verification; temporary cluster is /private/tmp/dura-limiter-pg-025 on localhost55439 (stop when done). Both the limiter harness (including16concurrent calls, exactly5admitted) and complete staged-contract harness passed. Production build, typecheck, lint,6limiter unit tests and10release tests passed. Full suite initially had2curriculum compilation timeouts while building concurrently;119files/1569tests passed. Isolated rerun pending. LocalNode24.5.0 is below package declared engine despite successful build; CI uses its supported runtime. All work remains uncommitted/unpushed; no hosted migration or Vercel configuration changed.

Validation follow-up: both timed-out curriculum files passed in isolation (755tests). The temporary PostgreSQL instance is stopped. Both checkouts have025as the only queued SQL file, with deployment instructions mirrored. No hosted writes, secret retrieval, commits or pushes occurred.

## Latest status — 025 applied and verified

September21: live function body MD5 a741fe06b12e5b5e331af2c875b1710a matches source, SECURITY DEFINER and empty search_path match; both private tables have RLS; anon/authenticated lack private schema access; anon config-table access and authenticated bucket access are denied. Exactly one valid-format credential exists (value not retrieved). Intended anon/authenticated RPC transport grants are present. 025 is archived unchanged; queue empty. Vercel server credential, release attestation, commit/push and deployment remain pending. No hosted mutations performed by agent.
