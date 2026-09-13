# Dura promise audit and remaining work

Date: September 12, 2026. Repository: Durwood-Studios/Dura. Audited tracked revision: `19b5ec24e4c2bb6a91c2f6d874acc3f3cad92cab`.

**Dura has substantial implemented learning functionality, but the current code does not yet support several of its strongest promises. Protecting learner work, completing assessment coverage, and correcting privacy/verification claims should precede broad curriculum expansion.** Passing structural checks and compiling 668 lessons establish useful properties; they do not establish reliable restore, safe two-device sync, or demonstrated competency.

This document identifies work. It does not claim that the defects below have been fixed. No application implementation, production database, GitHub settings, or deployment was changed for this audit.

## Evidence and scope

- Inventoried all **1,544 tracked files**: 832 content files, 479 other source files, 94 test files, 26 SQL files, and 113 remaining files. The content includes **668 phase lessons**. Binary assets, dependency packages, generated bundles, and untracked copies are distinct from reviewed application source.
- Three parallel reviews covered curriculum/assessment/teacher resources, learner data/auth/sync/storage, and public promises/product flows. Root reviewed release evidence, auth limiting, API contracts, analytics, prescriptions, review/statistics, configuration, and verification coverage. Detailed review notes below distinguish full reads, targeted reads, loaded data, and unverified behavior.
- Loaded all 15 phase question banks as actual TypeScript data: **860 questions**. This establishes complete phase/module identity and count coverage, not factual correctness of every answer.
- Compiled all **100 tutorials and 35 how-to files** and checked their declared step counts. Imported all 100 skills, 17 roles and 12 path records to check their connections. These complete data/syntax checks are separate from the focused technical reading.
- Existing evidence at this revision includes successful GitHub lint/type/build, standards, and browser jobs. The previous local pass recorded 1,352 tests, 22 browser tests, structural validation and MDX compilation of all 668 lessons. These were not all rerun in this audit. **The published database job failed.**
- New isolated probes reproduced encrypted-export failure, canonical flashcard metadata loss, an in-flight sync completion regression, analytics acknowledgement without delivery, incomplete AI-stream success, the teacher CSV identity collision, specialty API filter rejection, and concurrent rate-limit overshoot. Each probe's limits are stated below. Controlled test doubles were used for network/storage where needed; these were not production learner-data tests.
- There are **81 untracked files with ` 2` suffixes**, including eight duplicate lesson files. Eighty match their originals byte-for-byte; the generated service-worker copy differs. Their origin is unknown. They were preserved. A current-workspace curriculum-count test fails because it sees 676 MDX files against the registry's 668. That failure is separate from the clean tracked revision.
- This is a repository-wide promise review with focused source tracing and whole-inventory checks. **It is not a sentence-by-sentence specialist validation of all 11 MB of content, an exhaustive security assessment, or a complete real-device/production acceptance test.** The unfinished assurance work is explicitly included below.

## What the promises currently support

| Promise                                      | Assessment                                                            | Work needed                                                                                  |
| -------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Free core learning, optional account         | Implemented in reviewed core/tip paths                                | Preserve free access; distinguish external BYOK provider costs from Dura fees                |
| Your learning record is durable and portable | Broken in important paths                                             | Encrypted export, complete restore, truthful saves, atomic recovery                          |
| Cross-device sync preserves work             | Broken in important paths                                             | Account ownership, conflict protocol, acknowledgement races, complete store inventory        |
| Mastery gates and verified competency        | Incomplete and overstated                                             | Missing banks, phase IDs, outcome coverage, per-activity evidence, bounded credential claims |
| Complete, trustworthy curriculum             | Structural baseline exists; semantic coverage incomplete              | Review scored answers, connect prerequisites, supply assessed projects and specialist review |
| Privacy and user control                     | Controls exist; public claims conflict with behavior                  | Working deletion, accurate network disclosures, coherent analytics contract                  |
| Offline access                               | Local persistence and cached flows exist; universal access unverified | Explicit download/cache scope and cold-offline execution tests                               |
| Teacher-ready resources and standards        | Concrete correctness defects                                          | Canonical identity, complete printable exercises, reviewed source traceability               |
| Personalized plans, goals, and progress      | Several incorrect calculations/routes                                 | Real due-card routing, day-based time, meaningful role requirements, hydrated statistics     |
| Accessible and global                        | Partial implementation/limited tests                                  | Complete journeys on real browsers, accurate language metadata, actual UI extraction         |
| Reliable releases and enforced review        | Not enforced by observed GitHub settings                              | Repair SQL CI, valid CODEOWNERS, required checks and deployment gating                       |

## First work: protect learners and make core claims true

### W01 — Isolate local data by account and preserve guest work (P1)

Local stores use lesson/id keys without account ownership. AuthProvider switches the active encryption key and user without partitioning the stores. Sync attributes all local plaintext goals and certificates to the currently authenticated user. A shared browser can therefore expose or upload A's remaining records as B's. Encrypted records can instead become unreadable under the new key; this is not a reliable ownership boundary. Guest-to-account encryption migration is described as owed but is not implemented in the hydration path.

**Do:** introduce an explicit local owner namespace; define guest adoption; migrate keys without losing the old readable copy; clear/reload reactive state and invalidate in-flight operations on account changes. Review sign-out error handling as part of the same lifecycle.

**Done when:** guest → A → sign-out → B, direct account switches, expired sessions, offline reopening, and delayed sync prove that no A record is visible/uploaded as B, and adopted guest work remains readable.

Evidence: [AuthProvider.tsx](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/components/providers/AuthProvider.tsx:44), [db.ts](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/db.ts:153), [sync.ts](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/supabase/sync.ts:163), [encryption-key.ts](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/idb/encryption-key.ts:28). Source-backed; a full two-account browser reproduction remains required.

### W02 — Make export and restore preserve the actual encrypted learning record (P1)

Export reads raw IDB envelopes instead of decrypted records. A real encrypted review caused export to reject with missing `rating`, `elapsed_days`, `scheduled_days`, and `state` validation errors. Separately, canonical cards omit both content and the term slug needed by import; schema parsing strips a supplied slug. The importer cannot reconstruct those exported cards. Raw encrypted progress is also unsuitable as a portable JSON sidecar.

**Do:** export through hydrated readers; version and validate the entire archive, including Dura extensions; preserve content, identity and scheduling; implement explicit merge rules and all-or-recoverable application. Define and test the complete inventory: XP, saved code, tutorials, assessments, preferences, goals, credentials and Dojo records as well as cards/progress. Current export and backup omit different subsets. Preserve legacy localStorage assessment data until its IDB migration commits.

**Done when:** populated device-tier and auth-tier records round-trip on a fresh device without the original key; no cards/logs disappear or duplicate; an older backup cannot regress newer work; malformed archives make zero changes; quota errors never produce a success report. Full ZIP round-trip was not executed by the metadata probe and must be added.

Evidence: [export.ts](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/learner-record/export.ts:82), [types.ts](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/learner-record/types.ts:95), [import.ts](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/learner-record/import.ts:188), [snapshot.ts](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/storage/snapshot.ts:49), [skill-assessment.ts](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/db/skill-assessment.ts:56).

### W03 — Repair the synchronization protocol (P1)

`fullSync` pushes before pulling. Flashcards, goals, sandbox saves and tutorial progress use unconditional remote upserts. A stale device can overwrite a newer remote value before the later local merge sees it. Pure merge-function tests do not exercise this protocol. Background synchronization pushes only; XP is pushed but not pulled.

There is also a **reproduced local completion loss**: while a progress RPC was pending, a lesson was completed locally. Its acknowledgement rewrote the captured old record, leaving `completedAt=null`, scroll 40%, XP 0 and `synced=1`.

**Do:** conditional server updates/versioned mutations, intentional merge semantics, revision-aware local acknowledgement in transactions, periodic pull, account-generation checks, and tombstones for supported deletions. Assess all synchronized stores together.

**Done when:** two-device tests in either reconnect order preserve newer reviews, code, tutorial progress and achieved goals; a completion during upload survives and is subsequently uploaded; deleted goals do not return; a new device receives every documented synchronized category including XP.

Evidence: [sync.ts](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/supabase/sync.ts:107), [progress acknowledgement](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/supabase/sync.ts:139), [flashcard upsert](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/supabase/queries/flashcards.ts:36), [goal upsert](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/supabase/queries/goals.ts:30).

### W04 — Stop reporting successful saves when persistence failed (P1/P2)

Goal and sandbox storage helpers suppress write failures, while callers update the UI or show “Saved.” Sandbox language/template switching can replace dirty code before the 30-second autosave. Other wrappers need the same caller-level error-contract review. OPFS restoration commits stores separately; a partial restore can cause the next boot to skip the remaining recovery.

**Do:** propagate storage failures, preserve dirty drafts, flush or explicitly confirm discard before replacing a workspace, and make recovery transactional or resumable. Do not infer durable success from a resolved helper that swallowed an error.

**Done when:** injected IDB/quota failures leave recoverable drafts and truthful UI; switching language within the autosave interval preserves work; interrupted backup restoration completes safely on a later launch.

Evidence: [goals.ts](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/db/goals.ts:20), [sandbox.ts](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/db/sandbox.ts:26), [FreeformSandboxInner.tsx](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/components/sandbox/FreeformSandboxInner.tsx:990), [snapshot.ts](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/storage/snapshot.ts:108), [restore.ts](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/storage/restore.ts:25).

### W05 — Finish assessment coverage and correct scored answers (P1)

Nineteen registered modules have no questions at all:

`1-7`, `2-6`, `2-7`, `3-6`, `4-6`, `5-5`, `6-7`, `6-8`, `6-9`, `7-5`, `8-6`, `8-7`, `9-9`, `9-10`, `10-9`, `10-10`, `13-9`, `14-13`, `14-14`.

An empty pool causes Start to log and return. Strict gating can then block progression. Robotics/manufacturing banks contain 136 questions under letter phase IDs `r`/`m`; numeric phase 13/14 tests cannot select them. Another **55 nonempty module pools have fewer than ten questions**, with a minimum of three, despite the 10–15-question/retry-variety description. Phase sampling does not guarantee module/outcome coverage.

Manufacturing keyed answers still contradict revised lessons: model authority versus contractual precedence, the claim that 2D drawings defeat MBD, and an unqualified solder-fill percentage. These answers feed assessments and teacher exports. This audit establishes internal contradictions; exact industrial criteria require source/edition-specific specialist review.

**Do:** normalize all identities; author substantive missing/alternate questions; build an outcome-based assessment blueprint; review the entire scored bank against taught material and sources; visibly handle unavailable assessments. No placeholder questions to satisfy counts.

**Done when:** every registered module and phase starts and finishes its assessment; strict progression works across every boundary; property tests establish counts/coverage across seeds; reviewed answers and alternatives match the taught outcomes.

Evidence: [MasteryGate.tsx](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/components/verify/MasteryGate.tsx:99), [phase-13.ts](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/content/questions/phase-13.ts:24), [phase-14.ts](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/content/questions/phase-14.ts:665), [assessment.ts](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/assessment.ts:54), [assessment-server.ts](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/verify/assessment-server.ts:109).

### W06 — Distinguish reading, practice and demonstrated competency (P1/P2)

Lesson completion uses scroll/time plus one sticky lesson-wide quiz flag. Written tasks and sandbox results do not establish completion evidence; one small quiz can satisfy the flag while the main competency activity remains untouched. Strict gating defaults off, while public copy says advancement requires proof. Default local certificates and separately configured server-scored credentials have different trust properties, correctly disclosed in some newer screens but overstated elsewhere.

**Do:** persist per-activity evidence and define required outcomes. Distinguish reading completion, self-review, automatic checks and independent review. Align marketing/terms/certificates with open exploration, optional strict mode, self-reported identity and unproctored server scores. Signing a score does not establish independent knowledge or accreditation.

**Done when:** an easy secondary quiz cannot satisfy a required competency task; all required activity state survives reload; local receipts are never presented as independently issued; server credentials list exactly the verified claims. Add graded artifacts and capstones where the promised outcome requires applied work.

Evidence: [LessonReader.tsx](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/components/lesson/LessonReader.tsx:73), [CompletionGate.tsx](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/components/lesson/CompletionGate.tsx:114), [WrittenExercise.tsx](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/components/lesson/WrittenExercise.tsx:89), [preferences.ts](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/types/preferences.ts:34), [issued credential disclosure](</Users/dustinsnellings/Documents/ChatGPT/Dura/src/app/(app)/verify/issued/page.tsx:41>).

### W07 — Deliver account deletion and consistent account onboarding (P1)

Privacy/terms promise account deletion from Settings. The button is unconditionally disabled; the unused profile-delete helper does not delete the auth user. First-time GitHub OAuth from Sign In also bypasses the age step shown only on Sign Up. Normal sign-out ignores returned SDK errors; the sign-out route can likewise return success after failure.

**Do:** implement a working authenticated deletion/request workflow with reauthentication and defined retention/resource scope; make the first-account policy consistent across email/OAuth/direct provisioning; inspect SDK errors and invalidate local identity truthfully. A self-attestation step should be described as such.

**Done when:** a dedicated test account can request deletion, observe honest failure/success, and verify the promised resources/session outcome; fresh OAuth follows required onboarding; failed/offline sign-out cannot silently report success while retaining the local session.

Evidence: [SettingsClient.tsx](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/components/settings/SettingsClient.tsx:373), [profile.ts](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/supabase/queries/profile.ts:91), [SignInForm.tsx](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/components/auth/SignInForm.tsx:49), [AuthProvider.tsx](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/components/providers/AuthProvider.tsx:112), [sign-out route](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/app/api/auth/sign-out/route.ts:24).

### W08 — Repair release checks and finish the target-specific database rollout (P1)

The [database job for this commit failed](https://github.com/Durwood-Studios/Dura/actions/runs/34670915425/job/103491980032): `tests/supabase/bootstrap.sql:2: ERROR: role "anon" already exists`. Two test databases share one Postgres cluster; both harnesses try to create the same cluster-wide roles. The second harness fails before testing the target-specific reconciliation. The commit's Vercel status nevertheless says deployment completed. GitHub returned no active main-branch rules and “Branch not protected”; its CODEOWNERS API returned **ten unknown-owner errors** for `@Durwood-Studios`.

**Do:** make role bootstrap safe for both databases or isolate clusters; rerun the complete native PostgreSQL job; configure valid user/team owners covering actual auth, sync, signing, payment, admin and staged-SQL paths; align required checks/deployment promotion with the intended release process. Provenance checks should inspect the actual push range, rather than a fixed ten commits.

The last read-only hosted inspection found 24 RLS tables, but missing feedback RPC/signed-credential contracts and unsafe annotation/grant behavior. The prepared **single target-specific reconciliation** is still not confirmed applied. Recheck metadata, manually apply the reviewed file, then verify hosted JWT/PostgREST behavior. Do not replay historic migrations.

**Done when:** both database harnesses pass in the same CI configuration; a failed required check prevents production promotion; GitHub reports no CODEOWNERS errors; the correct Dura project has an execution record and successful post-application contract checks.

Evidence: [ci.yml](/Users/dustinsnellings/Documents/ChatGPT/Dura/.github/workflows/ci.yml:127), [bootstrap.sql](/Users/dustinsnellings/Documents/ChatGPT/Dura/tests/supabase/bootstrap.sql:2), [CODEOWNERS](/Users/dustinsnellings/Documents/ChatGPT/Dura/CODEOWNERS:7), [provenance script](/Users/dustinsnellings/Documents/ChatGPT/Dura/scripts/check-ai-provenance.mjs:66), [manual SQL run matrix](/Users/dustinsnellings/Documents/ChatGPT/Dura/supabase/staged/live/README.md:24), [last hosted observations](/Users/dustinsnellings/Documents/ChatGPT/Dura/supabase/staged/LIVE-SCHEMA-REVIEW.md:1).

Target: Dura `ytputzzqubbaaztowyoz`, Durwood Studios. Proposed file: `supabase/staged/live/001-dura-contract-reconciliation.sql`; reviewed SHA-256 `66d831da811b17ea322275b70790f0bbafb000b827c3d42dca3f1a90367b032d`. Production execution was not attempted by this audit.

### W09 — Make auth protection and privacy claims match actual controls (P1/P2)

The advertised Dura auth limiter checks page/callback routes, while credential forms call Supabase directly. Its implementation uses a Supabase count-then-insert, not the Upstash Redis described in SECURITY.md. It fails open on missing configuration or backend errors, and the referenced rate-limit migration is absent from tracked source. A controlled concurrent probe admitted **20 of 20 requests with a limit of five**. Hosted Supabase auth protections were not verified; this is not a claim that Supabase has no independent limits.

Privacy/install/how-it-works claims such as “no cookies,” “data never leaves,” and no other service receiving data conflict with essential auth cookies, optional sync, anonymous feedback, opt-in Anthropic requests and the external CodeSandbox runtime. Source is passed into the third-party runtime; this audit does **not** establish server-side retention by CodeSandbox. The differential-privacy helper is not used by the runtime uploader; raw consented analytics are mapped directly to server rows. A helper's existence does not establish a deployed privacy guarantee.

**Do:** verify the actual auth-attempt endpoints and provider limits; use an atomic enforceable application limiter where needed; document failure behavior. Create a field-level service/consent/retention inventory and reconcile all public claims and export/deletion promises. Decide and implement the actual aggregate/raw analytics contract before claiming differential privacy. Have the policy owner review commitments; this audit makes no legal-compliance determination.

**Done when:** tests exercise actual login/signup/reset attempts, including concurrent/error cases; browser request/storage traces for guest, feedback, AI, sandbox and signed-in sync match disclosures and controls.

Evidence: [proxy.ts](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/proxy.ts:16), [SignInForm.tsx](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/components/auth/SignInForm.tsx:23), [rate-limit.ts](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/rate-limit.ts:69), [SECURITY.md](/Users/dustinsnellings/Documents/ChatGPT/Dura/SECURITY.md:66), [privacy page](</Users/dustinsnellings/Documents/ChatGPT/Dura/src/app/(marketing)/privacy/page.tsx:61>), [aggregation.ts](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/analytics/aggregation.ts:1).

## Next work: complete the experience and verify its scope

| ID / priority                               | Concrete remaining work                                                                                                                                                                                                                                                                                                                                                                                                                                          | Acceptance evidence                                                                                                                                                                                                                   |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W10 / P2 — Teacher resources                | Standards collection/filter/CSV uses bare `01` IDs and confuses unrelated lessons. Print reuses paginated interactive Quiz and omits other questions.                                                                                                                                                                                                                                                                                                            | Canonical phase/module/lesson identity throughout; all-668 frontmatter/export comparison; rendered workbook with every prompt, deliberate answer-key policy and readable page breaks.                                                 |
| W11 / P2 — Standards and factual content    | Separate source mentions, educational alignment and normative compliance. Standards Watch reads limited typed robotics/manufacturing registries and skips unknown citations. Public AP claims exceed withheld mappings. Discovery prose contains a false Morse prefix claim, inaccurate key-per-block explanation and incorrect security-phase links.                                                                                                            | Reviewed outcome/source/edition/clause/reviewer matrix; stale and unknown citations in MDX and banks produce findings; technical review of inline activities as well as lessons.                                                      |
| W12 / P2 — Offline contract                 | Resolve “every lesson offline after first load” against visited-page fallback and external sandbox runtimes. Auto-update copy conflicts with deliberate Restart/Later activation.                                                                                                                                                                                                                                                                                | Cold browser → first visit → disconnect → unvisited lesson and each runtime; explicit downloadable scope, cache/quota status and safe update tests. Current deployed precache behavior remains unverified.                            |
| W13 / P2 — Plans, goals and statistics      | Due-card prescription links to `/dojo`, which does not consume the due-card queue. Career goals reach 100% after any phase certificate, even “CTO.” Daily minutes use lesson lifetime time. Stats reads encrypted raw progress, treating missing completion fields as completed and summing missing time. Retention is the fraction of cards in review state, not measured recall. Dojo all-time stats are capped at 100 and recent trend selects the wrong end. | `/review` queue is consumed by the due-card action; stable role requirements; local-day session accounting; hydrated reads; truthful metric names; 101-session and cross-midnight fixtures.                                           |
| W14 / P2 — Flashcard promises               | Copy promises automatic vocabulary/missed-question cards, while creation is opt-in and term-only. “Again” summary says cards return shortly, but the actual new-card scheduler probe returns 24 hours.                                                                                                                                                                                                                                                           | Intentional deck-population policy and deduplication; tagged/untagged/offline/repeated miss cases; review copy matches the chosen interval and actual queue.                                                                          |
| W15 / P2 — Analytics reliability            | The five-second analytics loop marks events synced using its default no-op sink; reproduced `synced:0→1` without delivery. Admin content chart filters open/view events instead of emitted `lesson_started`. Thirty-day charts silently aggregate a capped raw-event slice.                                                                                                                                                                                      | One acknowledgement owner after successful delivery, failure/retry tests, actual emitted events populate charts, >10,000-event fixture gives complete results or explicit partial-data labeling.                                      |
| W16 / P2 — Notifications and AI             | Enabling notifications after mount does not start the scheduler. Timers are foreground page timers; encrypted raw-progress reminders fail. AI tutor treats EOF without protocol completion as successful, reproduced with a partial stream; code review lacks caller deadline/cancel handling.                                                                                                                                                                   | Opt-in/opt-out changes timers in-session; truthful foreground support; hydrated daily activity; interrupted AI output marked incomplete with retry, complete streams accepted, deadlines/cancellation exercised.                      |
| W17 / P2 — Accessibility and language       | Axe coverage is two isolated components, and browser configuration covers Desktop Chrome only. Spanish selection translates the picker while much of UI stays English and all-page language metadata changes.                                                                                                                                                                                                                                                    | Real-route keyboard/screen-reader/focus/error/contrast/reflow tests, touch iOS/Android and reduced motion; translated enabled UI surfaces with accurate language regions. A test passing is not a full WCAG conformance claim.        |
| W18 / P2 — API, docs and workspace          | Terms API rejects phase 10–14 with 400 due to one-digit regex (reproduced). Duplicate files break local counts and can enter SQL globs. README/contributing/runtime/signing/release docs drift from code and reference missing planning files.                                                                                                                                                                                                                   | Every advertised phase filter works; preserve/reconcile copies and prevent accidental inclusion; clean source checks; docs use actual Node/Next/signing contracts and registry-derived counts.                                        |
| W19 / P1 — Placement and career connections | A reproduced placement case with 60% basics and zero advanced answers returns mid-to-senior. Role requirements contain 1,022 unresolved references to 262 nonexistent skill IDs; all 100 catalog skills have empty lesson lists.                                                                                                                                                                                                                                 | Threshold/monotonicity tests prevent advanced placement after weak foundations; canonical skill IDs; every taught career requirement links to actual lessons and assessment evidence.                                                 |
| W20 / P1/P2 — Specialty projects            | All 12 paths are marked complete, but some promise built, flashed, simulated, measured and artifact-anchored outcomes beyond current scored-certificate verification. Fourteen specialty portfolio tutorial identifiers do not exist; the UI presents them as project promises rather than broken links.                                                                                                                                                         | Reachable build packages, toolchain/fixture requirements and reproducible evidence per promised project; correct artifact-handling instructions; a documented definition of path completion. Reuse existing capstones where possible. |
| W21 / P2 — Runnable tutorials               | All 135 tutorial/how-to files compile as MDX, but a sampled “working MCP server” calls undefined helpers and parses user42's URI as profile.                                                                                                                                                                                                                                                                                                                     | Complete versioned examples assembled and run from clean environments; input/output and failure tests, clearly marked illustrative omissions. Apply this verification to every tutorial advertised as runnable.                       |

Supporting source: [teacher filtering](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/components/teacher/CurriculumBrowser.tsx:188), [standards CSV](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/exports/standards-export.ts:10), [print renderer](</Users/dustinsnellings/Documents/ChatGPT/Dura/src/app/(app)/teach/print/modules/[phaseId]/[moduleId]/page.tsx:96>), [standards scan](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/standards-watch/scan.ts:23), [prescription engine](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/prescription/engine.ts:115), [GoalsClient](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/components/goals/GoalsClient.tsx:45), [StatsClient](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/components/stats/StatsClient.tsx:60), [ReviewSession](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/components/review/ReviewSession.tsx:124), [AnalyticsProvider](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/components/providers/AnalyticsProvider.tsx:12), [notification scheduler](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/components/pwa/NotificationScheduler.tsx:11), [AI client](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/ai/anthropic-client.ts:166), [accessibility tests](/Users/dustinsnellings/Documents/ChatGPT/Dura/tests/accessibility/components.axe.test.tsx:1), [terms API](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/app/api/v1/terms/route.ts:9).

## Where additional lessons and labs will help

The missing assessment pools belong to existing taught subjects, including OOP, TypeScript, WebSockets, discrete mathematics, queues, concurrency, production agents, classical ML, computer vision, formal methods/GPU work, incident management, due diligence, governance, bootloaders/OTA, robotics fundamentals and manufacturing. Finish those assessments first.

The strongest demonstrated need is a complete practical route through the specialty capstones: embedded build/flash/fault injection; UART UVM execution and coverage closure; simulated robotics integration with a reviewed evidence package; a working manufacturing protocol bridge and MES consumer; and a quant replay/correctness/benchmark lab. Existing capstone prose should be reused. Add setup, debugging or prerequisite bridge lessons where a fresh-environment walkthrough actually fails. Real-machine safety and professional competence must not be inferred from a simulation or self-review.

Also repair and execute the promised runnable tutorial packages. The MCP example provides a concrete starting point. Each new lesson should connect a prerequisite gap to an observable outcome, guided practice and a matching assessed artifact; each career requirement should resolve to that evidence. The detailed curriculum notes below list all 19 missing-bank module titles and the specific capstone work.

Evidence: [career resolver](</Users/dustinsnellings/Documents/ChatGPT/Dura/src/app/(app)/tracks/[slug]/page.tsx:80>), [skill catalog](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/content/skills.ts:11), [placement fallback](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/skill-assessment.ts:103), [specialty path outcomes](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/lib/paths/index.ts:223), [MCP example](/Users/dustinsnellings/Documents/ChatGPT/Dura/src/content/howto/32-mcp-server.mdx:177).

## Delivery order and closure rule

1. **Stabilize releases and preserve work:** W08 CI/bootstrap and observed SQL protections, then W01–W04 data integrity. Do the privacy/deletion disclosure corrections in parallel; do not describe unavailable controls as working while waiting for implementation.
2. **Make learning claims defensible:** W05–W07 assessment coverage, evidence model and account control, plus W19 placement/skill connections; W09 actual auth/privacy controls. Technical question review should happen alongside implementation, especially industrial/safety content.
3. **Complete the promised experience:** W10–W18 teacher output, offline, plans/metrics, delivery, accessibility and documentation; W20–W21 executable capstones/tutorials. Prioritize failures that lose work or block a learner before cosmetic polish.
4. **Expand based on missing outcomes:** add guided practice, alternate assessment items and assessed projects where a learner cannot currently demonstrate the promised skill. Use prerequisite/outcome mapping to select new lessons. A larger lesson count alone will not close any data, privacy or assessment defect.

Every work item should close only with: a concrete learner outcome, a reproducible before-case, an appropriate regression/acceptance check, and current deployment evidence where a hosted dependency is involved. Track implementation, testing and production application separately. Structural conformance, a populated roadmap checkbox, or a successful frontend deployment is not interchangeable with those results.

Already declared future scope—broader translations, avatar uploads, instructor cohorts, Discord, a possible native shell and tutorial expansion beyond 100—should stay visibly deferred unless chosen for a release. They should not be mislabeled as existing functionality or silently promoted ahead of core reliability.

## Detailed review notes and reproducibility

The following sections preserve the independent reviewers' source references, counterexamples and coverage limits. Paths without an absolute prefix are relative to this repository. No absence of a finding should be interpreted as certification of that file or feature.

## Detailed notes: Curriculum, assessment and teacher review

# DURA promise audit — curriculum, assessment, standards, and teacher resources

Audit date: 2026-09-12. Read-only review of the current shared working tree, not a claim about the deployed revision. No implementation changes were made. The recent 668-lesson structural/MDX migration is useful, but the following counterexamples remain outside those checks.

## Prioritized findings

### P1 — Nineteen modules cannot start their mastery gate, and numeric phases 13/14 cannot start phase assessments

**Promise:** `src/app/(marketing)/how-it-works/page.tsx:63` promises a mastery gate after every module; `README.md:34` promises mastery-gated advancement.

**Evidence:** Actual imported `ALL_QUESTIONS` contains 860 questions. Nineteen registered modules have no questions at all: `1-7`, `2-6`, `2-7`, `3-6`, `4-6`, `5-5`, `6-7`, `6-8`, `6-9`, `7-5`, `8-6`, `8-7`, `9-9`, `9-10`, `10-9`, `10-10`, `13-9`, `14-13`, `14-14`. `src/components/verify/MasteryGate.tsx:99` selects that pool and, if empty, only logs and returns; the learner's start action never starts an assessment. With strict gating, `src/lib/gating.ts:30` requires the previous module's passed gate, so this also prevents subsequent advancement.

Separately, `src/content/questions/phase-13.ts:24` still assigns `phaseId: "r"`; `src/content/questions/phase-14.ts:24` assigns `"m"`. Their module IDs are normalized, but their phase IDs are not. There are 64 robotics and 72 manufacturing questions under those letter IDs. `src/content/questions/index.ts:68` filters exact phase identity; `src/lib/verify/assessment-server.ts:109` therefore rejects numeric 13/14 as unavailable. Local phase selection has the same exact comparison in `src/lib/assessment.ts:71`.

**Required work:** Canonicalize every phase/module pair; author substantive question pools for the missing modules; render an actionable unavailable state until a pool exists. Do not add placeholder questions merely to satisfy counts.

**Acceptance evidence:** Enumerate all registered modules and require a nonempty, reviewed pool with matching phase identity; exercise starting and completing every module/phase route. Test numeric 13 and 14 in both local and server assessment selectors. Test strict progression across every module boundary.

**Why existing tests missed it:** `tests/paths/content-reachability.test.ts:64` checks that existing questions point to known modules. It does not check the reverse direction, phase identity, or every gate. The conformance document's assertion that these tests catch completion flows with no bank (`standards/pedagogy/CONFORMANCE.md:53`) is too broad.

### P1 — Assessment banks still teach claims removed from repaired lessons

**Promise:** `src/app/(marketing)/standards/page.tsx:101` promises published industry references by edition and clause; the platform's mastery scores imply the keyed answers are reliable.

**Counterexample:** `src/content/questions/phase-14.ts:665` says the annotated model becomes authoritative under Y14.41, while the repaired lesson `src/content/phases/14-manufacturing/m-7-asme-y14-41-mbd/01-model-based-definition.mdx:33` correctly distinguishes contractual authority among model, drawing, and combined packages. The bank at `phase-14.ts:731` goes further and says generating 2D drawings defeats MBD; the repaired lesson explicitly permits derived shop-floor views under controlled precedence. The bank at `phase-14.ts:784` also asserts universal Class 1/2 solder-fill percentages without a revision/criterion context, whereas `m-8-ipc-a-610-classes/01-three-class-framework.mdx:39` explains why this lesson cannot supply one universal percentage.

These are not dormant inline examples: `src/content/questions/index.ts:40` includes the manufacturing bank, and `src/lib/exports/quiz-export.ts:13` exports the same keyed questions to teachers. Fixing phase IDs makes these questionable statements available in phase scoring too. The current examples demonstrate a consistency defect; a fresh licensed-clause audit is needed before claiming the exact numeric IPC acceptance rule is wrong in every context.

**Required work:** Review all scored question banks against the revised lessons and current primary requirements, not just MDX Quiz components. Version questions and link them to exact taught outcomes and source scope. Quarantine disputed answers until reviewed.

**Acceptance evidence:** A reviewed question-to-outcome/source matrix, regression examples for the corrected MBD cases, and technical review of safety/industrial banks. Component-prop tests cannot establish answer truth.

### P1 — Lesson completion is not evidence that the lesson's competency task was performed

**Promise:** `src/app/(marketing)/how-it-works/page.tsx:59` says DURA tracks what learners can do. LP-1.0's core invariant requires demonstrable competency; advanced lessons now provide substantial written tasks.

**Counterexample:** `src/components/lesson/LessonReader.tsx:73` recognizes only Quiz, FillBlank, and ParsonsPanel for completion gating. `CompletionGate.tsx:114` combines scroll/time with a single lesson-wide `quizPassed` flag. `WrittenExercise.tsx:89` explicitly and correctly says it awards no automated score, and its rubric checkboxes at line106 have no evidence-submission or review state. Neither a written response nor a sandbox result participates in lesson completion. In a lesson containing several independent quizzes, `src/stores/progress.ts:84` and `:93` make the first successful quiz sticky for the entire lesson; passing a later small recall quiz can satisfy completion despite an untouched competency task.

Concrete example: phase12's branch lesson has its substantive WrittenExercise at `q-1-modern-cpp-for-hft/03-branch-prediction-and-branchless-patterns.mdx:156` and a separate simple optimization-hint quiz at line168. Correctly answering that quiz establishes no branch analysis artifact. This is not a request to label self-review as automatic mastery; the component's disclosure is a good boundary that broader claims should respect.

**Required work:** Model per-activity evidence and distinguish reading completion, self-reviewed practice, automatically checked work, and independently reviewed competency. Decide which evidence each lesson/outcome requires. Keep honest offline self-review, but do not derive proof claims from it.

**Acceptance evidence:** A browser test where passing only an easy secondary quiz cannot satisfy a required competency activity; evidence persists across reloads; multiple quizzes aggregate intentionally; written tasks remain explicitly self-reviewed unless a real review mechanism exists. Credentials must only claim the evidence actually evaluated.

### P1 — Teacher standards filters and CSV exports mix unrelated lessons with the same local ID

**Promise:** `src/components/teacher/ExportHubClient.tsx:174` describes standards cross-referenced to lesson titles; `/teach` offers standards-based curriculum filtering.

**Counterexample:** `src/lib/content.ts:108` deliberately gives each lesson its local number (`01`, `02`, etc.), with phase/module stored separately. `src/lib/curriculum.ts:101` passes only `meta.id` into `collectStandards`, collapsing matching numbers across modules. `src/components/teacher/CurriculumBrowser.tsx:188` filters by the same bare ID, so a standard attached to one lesson01 can match unrelated lesson01 entries. `src/lib/exports/standards-export.ts:10` creates a Map keyed by bare ID; later lessons overwrite earlier titles.

**Reproduced:** Executing the actual `standardsCSV` with two distinct lesson01 records emitted the later CMM lesson title for a standards reference intended for the earlier binary lesson. This was a minimal collision fixture, not a browser screenshot; the collision mechanism is directly present in production code.

**Required work:** Use canonical `phase/module/lesson` keys end-to-end in StandardRef, collection, filtering, exports, and links; preserve local numbers only for display.

**Acceptance evidence:** Two lesson01 fixtures in different modules with different standards must remain distinct. Export counts/titles and teacher filter results must match the corresponding actual frontmatter across all668 lessons.

### P2 — Question quantity, retry variety, and phase coverage do not meet the assessment description

**Promise:** `src/app/(marketing)/how-it-works/page.tsx:63` promises 10–15 randomized questions and different questions on retry; `src/components/verify/PhaseTest.tsx:321` promises questions across all modules.

**Evidence:** Imported bank inventory shows55 nonempty module pools below10 questions, minimum3. `src/lib/assessment.ts:54` returns all available questions when the pool is smaller than the requested12, so small pools necessarily repeat exactly the same content in a different order. `selectVerificationQuestions` (`src/lib/assessment.ts:65`) buckets by difficulty only, not module or outcome. `src/lib/verify/assessment-server.ts:112` uniformly shuffles the phase and takes30, likewise with no module/outcome blueprint. Missing modules from the P1 finding can never be assessed; even after adding them the selection algorithm does not guarantee coverage.

**Required work:** Define a defensible assessment blueprint (module/outcome coverage, cognitive demand, question counts, variant pool size), then implement sampling against it. Describe retries accurately if only the order changes. Avoid treating an arbitrary30 questions as full-phase verification.

**Acceptance evidence:** Property tests across seeds assert coverage and counts, with explicit behavior for insufficient pools; reviewed alternate items demonstrate equivalent difficulty and outcome coverage. Test smallest specialty pools and a phase with more modules than the sampler can cover.

### P2 — Marketing and certificate descriptions still promise stronger verification than the delivered default flow

**Promise:** `src/app/(marketing)/how-it-works/page.tsx:68` says passing a phase creates a tamper-resistant certificate with public verification; `src/app/(marketing)/terms/page.tsx:84` describes demonstrated mastery through verified assessment.

**Counterexample:** Default `src/components/verify/PhaseTest.tsx:165` calculates results locally, creates an Anonymous Learner certificate, and hashes client-generated data at line179. Its updated UI correctly says “local learning certificate” at line324. `src/components/verify/CertificateView.tsx:58` explicitly says it is locally scored and not independently issued. The separately implemented server assessment signs a bounded server score and uses self-reported identity; it is not the default PhaseTest issuance path. Public prose has not followed the improved distinction. The signed path also uses public, exportable questions and makes no identity or independence proof, which its dedicated issued page already discloses.

**Required work:** Reconcile marketing, terms, route metadata, certificate UX, and PDFs around local versus server-scored records. If a stronger mastery claim is intended, define and implement the actual evidence, assessment integrity, and identity boundaries first.

**Acceptance evidence:** Copy/route tests and an end-to-end local-versus-server issuance walkthrough establish that no local record is described as independently verified or universally publicly resolvable. Signed records should list exactly the claims validated by their signature and scoring service.

### P2 — Standards traceability/currency claims exceed the data and scanner scope

**Promise:** `src/app/(marketing)/standards/page.tsx:28` says every lesson/module is mapped to named educational standards; line101 promises professional references by edition and clause; line105 promises tracking each current revision.

**Counterexample:** `standards/pedagogy/CONFORMANCE.md:41` correctly says empty arrays make no alignment claim, and line43 says65 former pending mappings were scope decisions, not certified crosswalks. AP arrays were deliberately withheld (`CONFORMANCE.md:45`), but `README.md:90` still lists AP CSP and AP CSA without that qualification. Numeric SFIA/Bloom tags do not supply an industry clause-to-outcome evidence trail. The revised manufacturing lesson's generic Y14.41 scope reference illustrates a bounded citation, not a complete clause-level alignment.

`src/lib/standards-watch/scan.ts:7` explicitly limits scanning to PHASE_R and PHASE_M typed registries; lesson-body and diagnostic-text scanning are deferred. `scan.ts:57` skips unknown citations entirely. A clean scan therefore cannot establish current references throughout668 MDX lessons and scored banks. `registry.ts:16` also supplies a shared last-reviewed fallback rather than per-citation evidence.

**Required work:** Separate “mentions,” “aligned educational outcome,” and “verified normative requirement” in the data/UI. Record source edition, clause where applicable, evidence, reviewer, and checked date. Expand scan coverage or visibly disclose its boundaries and unknown references. Keep withheld AP mappings withheld in public claims too.

**Acceptance evidence:** Trace a sampled badge to its exact lesson outcome and reviewed source; inject stale/unknown citations into an MDX lesson and question bank and require a visible finding rather than a clean report. This review did not independently recheck every publisher's current catalog.

### P2 — Automatic flashcard promise is an optional term-only workflow in code

**Promise:** `src/app/(marketing)/how-it-works/page.tsx:80`: every vocabulary term and missed quiz question becomes a flashcard.

**Counterexample:** `src/components/lesson/Quiz.tsx:183` only collects explicit `q.terms`; a missed question without such tags produces nothing. `Quiz.tsx:193` creates a dictionary-definition card, not a card for the missed question, and line249 requires the learner to click to add it. Correctly choosing not to auto-add cards is a reasonable product choice; the universal wording is inaccurate. The newly repaired branch-hint quiz at its lesson line168 has no terms and demonstrates a miss that cannot trigger this workflow.

**Required work:** Choose automatic versus opt-in behavior deliberately, represent missed-question cards if promised, and reconcile the copy. Ensure idempotent creation and offline term availability rather than relying on successful term fetches.

**Acceptance evidence:** A missed tagged question, an untagged question, repeated attempts, offline mode, and an existing card each have specified outcomes. Assert whether the actual question or a related vocabulary term becomes the card.

### P2 — Teacher workbooks reuse one-question-at-a-time interactive renderers

**Promise:** `src/components/teacher/ExportHubClient.tsx:225` offers full lesson bodies, exercises, and summaries as printable module workbooks.

**Counterexample:** `src/app/(app)/teach/print/modules/[phaseId]/[moduleId]/page.tsx:96` uses ordinary `mdxComponents`, not print-specific assessment renderers. `src/components/lesson/Quiz.tsx:287` renders the current question only; line297 reads `question.question`. A multi-question Quiz therefore contributes only its currently visible question to the DOM, not the full printable assessment. Written responses and answer reveals similarly retain interactive controls. The CSS inspected at `src/app/globals.css:716` contains no conversion of paginated Quiz state into all question content.

**Required work:** Implement static print components for quizzes, written tasks, blanks, and code, with an explicit learner-workbook versus instructor-answer-key choice. Avoid depending on the current interactive state when generating a workbook.

**Acceptance evidence:** Generate PDF/print DOM for a module with a three-question quiz, a written task, and code. Assert every intended prompt appears, answer keys follow the chosen policy, and content is readable across page breaks. This finding is source-backed; rendered PDF/browser print verification remains necessary.

## Coverage, method, and limitations

- Read AGENTS.md, README.md, ROADMAP.md, current LP-1.0/conformance rules, and the source slices recorded below. The existing LP checker and its tests were re-examined as structural checks, not independent pedagogical proof.
- Loaded every one of the15 phase question-bank exports through the actual TypeScript imports and inspected the860 resulting records for registered phase/module coverage. This is a complete identity/count inventory, **not** a factual review of all860 keyed answers. Detailed answer-content inspection focused on the industrial examples listed above.
- Traced local/server question selection, local completion signals, written/sandbox behavior, teacher filtering/export, workbook rendering, and standards aggregation/watch. The actual CSV collision function was executed with a minimal two-lesson fixture.
- Recently repaired manufacturing and phase12 examples were reread at the cited sections. Prior work in this same task reviewed/migrated many more lessons and compiled all668, but that earlier pass is not counted as a fresh exhaustive factual audit here. Do not interpret the668 structural pass as a promise audit of every sentence.
- No implementation or deployed-service changes, trading/machine actions, or external messages. No browser/PDF rendering in this bounded pass. No exhaustive review of all dictionary definitions, tutorial/how-to bodies, AI tutoring response quality, or licensed industrial-standard clauses. Deployment, authentication/storage, accessibility, and broader repository audits are other agents' scopes.
- Untracked `* 2.*` duplicates appeared in search results but were excluded from findings; root is investigating their origin. Relevant newly added nonduplicate source/tests may also be untracked; inventory below records that rather than claiming they are committed.

## Reproduction artifacts

- `/private/tmp/dura-promise-bank-inventory.json`: imported bank phase/module counts and missing phase+module pairs.
- `/private/tmp/dura-promise-data.cjs`: read-only TS loader, inventory, and CSV collision fixture (requires existing project dependencies).
- Scope inventory below distinguishes tracked paths from new working-tree paths. An inventory entry means a focused source review unless marked as fully loaded data; it does not imply every line received technical verification.

### Focused source/data inventory

66 files inventoried: 66 tracked, 0 untracked nonduplicate working-tree files. All15 phase banks and the phase registry were loaded as data; body review was focused as described above.

- `AGENTS.md`
- `README.md`
- `ROADMAP.md`
- `standards/pedagogy/lp-1.0.md`
- `standards/pedagogy/CONFORMANCE.md`
- `src/components/lesson/WrittenExercise.tsx`
- `src/components/lesson/SandboxExercise.tsx`
- `src/components/lesson/SandboxExerciseInner.tsx`
- `src/components/lesson/Quiz.tsx`
- `src/components/lesson/CompletionGate.tsx`
- `src/components/lesson/LessonReader.tsx`
- `src/components/lesson/StandardsBadges.tsx`
- `src/components/lesson/FillBlank.tsx`
- `src/components/paths/GatingGuard.tsx`
- `src/components/verify/MasteryGate.tsx`
- `src/components/verify/PhaseTest.tsx`
- `src/components/verify/CertificateLookup.tsx`
- `src/components/verify/CertificateView.tsx`
- `src/components/teacher/ExportHubClient.tsx`
- `src/components/teacher/CurriculumBrowser.tsx`
- `src/lib/assessment.ts`
- `src/lib/curriculum.ts`
- `src/lib/content.ts`
- `src/lib/gating.ts`
- `src/lib/lesson-conformance.ts`
- `src/lib/standards-aggregate.ts`
- `src/lib/standards-watch/registry.ts`
- `src/lib/standards-watch/scan.ts`
- `src/lib/exports/standards-export.ts`
- `src/lib/exports/quiz-export.ts`
- `src/lib/sandbox/harness.ts`
- `src/lib/sandbox/verdict.ts`
- `src/lib/verify/assessment-server.ts`
- `src/lib/verify/persistence.ts`
- `src/stores/progress.ts`
- `src/types/assessment.ts`
- `src/content/phases.ts`
- `src/content/questions/index.ts`
- `src/content/standards-map.ts`
- `src/app/globals.css`
- `src/app/(marketing)/how-it-works/page.tsx`
- `src/app/(marketing)/standards/page.tsx`
- `src/app/(marketing)/terms/page.tsx`
- `src/app/(app)/paths/[phaseId]/[moduleId]/[lessonId]/page.tsx`
- `src/app/(app)/teach/print/modules/[phaseId]/[moduleId]/page.tsx`
- `tests/paths/content-reachability.test.ts`
- `tests/standards/lp-1-conformance.test.ts`
- `tests/curriculum/assessment-props.test.ts`
- `src/content/phases/14-manufacturing/m-7-asme-y14-41-mbd/01-model-based-definition.mdx`
- `src/content/phases/14-manufacturing/m-8-ipc-a-610-classes/01-three-class-framework.mdx`
- `src/content/phases/12-quant-hft/q-1-modern-cpp-for-hft/03-branch-prediction-and-branchless-patterns.mdx`
- `src/content/questions/phase-0.ts`
- `src/content/questions/phase-1.ts`
- `src/content/questions/phase-2.ts`
- `src/content/questions/phase-3.ts`
- `src/content/questions/phase-4.ts`
- `src/content/questions/phase-5.ts`
- `src/content/questions/phase-6.ts`
- `src/content/questions/phase-7.ts`
- `src/content/questions/phase-8.ts`
- `src/content/questions/phase-9.ts`
- `src/content/questions/phase-10.ts`
- `src/content/questions/phase-11.ts`
- `src/content/questions/phase-12.ts`
- `src/content/questions/phase-13.ts`
- `src/content/questions/phase-14.ts`

## Extended review: paths, career skills, tutorials, and missing practical work

### P1 — Career-track requirements do not resolve to the skill catalog

`src/app/(app)/tracks/[slug]/page.tsx:184` presents role-level required skills, but its resolver at line80 silently displays the raw ID when no skill exists. Loading the actual 17-role registry and 100-skill registry found **1,022 unresolved references across level/required/valuable lists, representing262 distinct nonexistent IDs**. For example, role requirements use `git-basics`, while the skill catalog defines `git-version-control`. Independently, all100 skills have empty `lessonIds` (`src/content/skills.ts:11` and every subsequent entry). Tutorial references and prerequisite references within the skill catalog do resolve; the failure is specifically the role-to-skill and skill-to-lesson connections.

**Required work:** Establish one canonical skill ID namespace, map each role requirement to it, and give each skill actual lesson/outcome/assessment evidence. Preserve intentional aliases through an explicit migration rather than a raw-ID fallback. **Acceptance:** every role reference resolves; every claimed taught skill has reachable evidence and an explicit assessment boundary; cross-role repeated skills retain one identity.

### P1 — Placement can recommend advanced study after weak foundations

`src/lib/skill-assessment.ts:77` sends scores below50% basics to foundation, but subsequent branches require at least70%; the fallback at line103 is mid-to-senior. An execution of the actual `recommendPath` with basics3/5 and every other bracket0/5 returns `mid-to-senior`. This is a real branch gap, not a proposed psychometric interpretation. The same function's AI-specialist branch comments explicitly admit phase6 AI cannot be separated from phase7 within its combined bracket.

**Required work:** Close the50–69% foundations gap and base topic-specific recommendations on topic-specific evidence. Review the MCQ-derived Dreyfus Expert label against what the instrument can actually establish. **Acceptance:** threshold and monotonicity tests, especially60% basics/zero advanced, and separate AI versus systems fixtures; any expert claim needs independent validation beyond a score-label conversion.

### P1 — “Complete” specialty paths promise artifacts that the delivered assessment cannot establish

All12 path records are marked `complete`. Concrete promises include firmware that compiles/flashes/runs (`src/lib/paths/index.ts:283`), a ROS2/URsim application and safety-case package (`:223`), a working MTConnect→OPC UA bridge integrated into an MES (`:252`), a UART UVM testbench with100% coverage and `/verify` anchoring (`:319`), and a measured microsecond order book anchored through `/verify` (`:349`). Some underlying capstone lessons exist, so this is **not** evidence that each needs a duplicate new lesson.

However, the quant capstone still tells learners that a single archive is hashed/anchored via `/verify` (`src/content/phases/12-quant-hft/q-8-capstone-order-book/08-capstone-order-book.mdx:400`), while the audited verification flow handles scored assessment certificates rather than artifact-bundle submission. Its WrittenExercise at line392 assesses a design explanation, and a simple quantity quiz at line419 cannot establish the promised compiled/profiled artifact. The hardware capstone similarly promises hash-anchored authenticity and a working simulation (`src/content/phases/11-hardware-verification/h-8-capstone-uart-uvm-tb/01-uart-uvm-capstone.mdx:13`) but its written task explicitly discloses separately executed tool evidence at line178. Those honest local disclosures do not reconcile the stronger path claims.

The role registry also names **14 nonexistent tutorial slugs** for specialty portfolio projects. These are currently rendered as plain cards, not broken hyperlinks (`src/app/(app)/tracks/[slug]/page.tsx:207–225`), with the promise “When you complete this track, you'll have built.” Examples are `phase-e-capstone` (`src/content/roles.ts:2861`), `phase-r-capstone` (`:3068`), `phase-m-ppap` (`:3270`), and `phase-m-bridge` (`:3280`). Full identifiers are in the track inventory JSON. Existing equivalent phase lessons should be linked before new tutorials are invented.

**Required work:** For each promised project, provide a reachable build package, declared toolchain/hardware/simulator requirements, working fixtures, negative tests, reproducible run instructions, and an honest evidence/review mechanism. Either implement artifact submission/anchoring with clearly bounded claims or remove those instructions. Mark a path complete only against a documented definition appropriate to its actual deliverables. **Acceptance:** a fresh learner environment can build/run the promised project from supplied materials; independently reviewed artifacts prove only the stated tested outcome; no certificate score is substituted for hardware/simulator/latency evidence.

### P2 — Tutorial syntax passes do not establish working examples

All100 tutorials and35 how-to files compile with the existing MDX compiler, and all declared step counts match numbered headings. This positive check covers syntax and navigation structure only. A sampled how-to promises a working MCP server from scratch (`src/content/howto/32-mcp-server.mdx:3,12`) but calls undefined `searchDocuments` at line120 and `fetchUserProfile` at line178 without providing their implementations. Its sample `users://{userId}/profile` handler extracts `uri.pathname.split('/')[1]` at line177: for `users://42/profile`, that value is `profile`, not42. These are source-demonstrable incompleteness/correctness defects without needing to infer the current SDK API contract. The broader tutorial100 description also promises production-grade complete code, but it was only sampled, not installed/run.

**Required work:** Turn promised runnable tutorials into versioned, executable fixtures and validate their complete assembly, imports, dependencies, request flow, failure behavior, and expected outputs. Clearly label illustrative pseudocode and intentionally omitted infrastructure. **Acceptance:** clean-environment build and behavioral smoke tests per runnable tutorial, including a resource request whose returned identity matches its URI. Do not treat MDX compilation as a code-example test.

## Additional curriculum work, prioritized by a demonstrated gap

1. **Assessment completion for existing modules, before more lecture count:** author reviewed pools for OOP and Classes(1-7), TypeScript(2-6), Real-Time and WebSockets(2-7), Discrete Mathematics(3-6), Message Queues and Events(4-6), Concurrency and Parallelism(5-5), Production Agentic AI(6-7), Classical ML Foundations(6-8), Computer Vision(6-9), Formal Methods and GPU Programming(7-5), System Design at Scale(8-6), Incident Management(8-7), Technical Due Diligence(9-9), Compliance and Governance(9-10), Power Management(10-9), Bootloaders and OTA(10-10), Robotics Science Fundamentals(13-9), CNC and CAM(14-13), and Metrology and Supply Chain(14-14). These are existing lessons with missing gates, not19 missing subject areas.
2. **Embedded capstone build-and-test lab:** close the gap between educational C/Rust fragments and the promised flashed sensor pipeline with a pinned target/simulator, complete project, reproducible fault-injection/watchdog tests, and recorded timing evidence. Reuse existing e-8 lessons; add a setup/debugging bridge only where a fresh-environment walkthrough exposes missing prerequisites.
3. **UVM execution and coverage-closure lab:** supply a specific licensed UART RTL fixture and supported simulator workflow, complete harness, failing tests, coverage model/exclusions, and reviewed closure evidence. A design response alone cannot fulfill the current path outcome;100% must be scoped to a reviewed model and never presented as exhaustive correctness.
4. **Robotics integration/safety-case capstone:** a reproducible URsim/ROS2/MoveIt project plus worked evidence package, with explicit separation of simulated behavior and real-machine safety validation. Map the four missing robotics portfolio tutorial identifiers to real reachable work or write the missing build sequence; do not imply a self-review constitutes safety approval.
5. **Manufacturing integration capstone and portfolio packages:** a simulated CNC feed, implemented MTConnect→OPC UA adapter, data-quality/reconnect tests, and a small MES consumer; add worked PPAP/GD&T evidence packages if the promised portfolio cannot be produced from existing lessons. Distinguish ISA95 integration modeling from IEC62443 security zones/conduits.
6. **Quant correctness-before-performance capstone lab:** a complete replay fixture, parser and order-identity invariants, differential tests against a simple reference, gap recovery cases, and a reproducible benchmark harness. Existing capstone prose offers an extensive checklist; the missing deliverable is a verified executable path through it, plus truthful artifact handling—not another overview of trading systems.
7. **Tutorial reliability pass:** repair the concrete MCP sample, then execute the other promised runnable tutorials from clean manifests. Use resulting missing-step evidence to author focused bridge lessons instead of prescribing a speculative large expansion.

## Extended coverage and limits

The original66-file focused inventory above remains valid. Additional literal or focused source reads covered `src/lib/skill-assessment.ts`, `src/types/skill-assessment.ts`, `src/content/skill-assessment.ts`(prefix sample), `src/lib/learning-paths.ts`, `src/lib/paths/index.ts`(outcomes and selected path bodies), `src/content/skills.ts` and `src/content/roles.ts`(selected bodies plus full imported data), `src/app/(app)/tracks/[slug]/page.tsx`, `src/content/howto/32-mcp-server.mdx`, `src/content/tutorials/100-capstone-platform.mdx`(opening sample), both specialty capstones cited above, and these interaction files: `MDXComponents.tsx`, `CodeBlock.tsx`, `TryInDiscovery.tsx`, `StandardsDisclaimer.tsx`, `ScrollTracker.tsx`, `SandboxExerciseSkeleton.tsx` under `src/components/lesson/`.

Whole-corpus automated extensions:135 MDX syntax compiles and step-heading checks; all100 skills,17 roles,12 paths loaded and cross-referenced; all860 bank questions cross-referenced to the phase registry. No orphaned phase was found in the path registry. These are static/data validations, not literal manual reading of all lesson/tutorial prose. The135-file compiler inventory and complete track-reference inventory are saved at `/private/tmp/dura-promise-tutorial-inventory.json` and `/private/tmp/dura-promise-track-inventory.json`. No11MB manual prose-review claim is made. Remaining annotation/bite/vocabulary/AI-tutor interaction bodies have not all received complete additional reads; broad source coverage is not equivalent to browser/accessibility/offline testing. No source files were edited, and untracked `* 2.*` duplicates were excluded from these checks.

## Detailed notes: Learner data and synchronization review

# Learner-data promise audit (read-only, 2026-09-12)

Scope: source inspection of the files listed below; no implementation or hosted mutations. These are concrete source-backed findings, not a claim that every repository file has been read. Ignored untracked `* 2.*` copies. Parent owns the rate-limit audit. Priority P1 = data loss/privacy/essential promise; P2 = important correctness/coverage.

## New findings

### P1 — User export bypasses encryption and cannot reliably export real records

- Evidence: `src/lib/learner-record/export.ts:82` reads raw flashcards/reviewLogs/progress/moduleProgress; `src/lib/idb/encrypted-store.ts:143` moves non-index fields into an ArrayBuffer envelope; `:202` keeps only lesson identity and synced fields plaintext. `src/lib/learner-record/types.ts` expects hydrated review rating/scheduling/state fields for canonical projection.
- Counterexample: review a card with the normal AuthProvider-installed key, then Export my data. Raw encrypted review rows lack rating, elapsedDays, scheduledDays and state; the actual runtime probe rejected these missing fields during canonical validation. reviewedAt remains indexed/plaintext. Raw progress exported under x-dura contains `_e` serialized as `{}`, not the learning fields. Existing export tests use plaintext fixtures.
- Work: export through hydrated readers and a versioned, validated portable representation; never serialize raw ciphertext accidentally.
- Acceptance: real device-tier and auth-tier encrypted records round-trip through ZIP on a fresh device, with identical learner content, dates and progress and no source key dependency.

### P1 — Even plaintext exported flashcards cannot be restored

- Evidence: `src/lib/learner-record/types.ts:95` canonical card schema has neither text nor term slug; `:220` projection omits them; `src/lib/learner-record/import.ts:338` resolveCardContent requires term_slug/termSlug. Zod object parsing removes unknown keys before resolution. `import.ts:240` skips unresolved cards.
- Counterexample: export one dictionary card, clear device data, import the export: every card has no recoverable slug and is skipped. Non-dictionary content is likewise absent.
- Work: portable card sidecar with original identity, content/slug and full required scheduling state; explicitly reconcile canonical IDs.
- Acceptance: dictionary and custom cards round-trip with content and scheduling; repeat import creates no duplicate cards or orphan review logs.

### P1 — A stale device overwrites newer remote scheduling before merge

- Evidence: `src/lib/supabase/sync.ts:107` fullSync pushes before pulling; `:150` sends every card; `src/lib/supabase/queries/flashcards.ts:36` unconditionally upserts. Goals use the same unconditional overwrite (`queries/goals.ts:30`), despite monotonic merge claims. Background sync (`sync.ts:502`) only pushes.
- Counterexample: A reviews a card today and syncs. B still has last week's schedule; opening B pushes that old schedule over A's remote copy, then pulls the now-stale value. Pure merge idempotency tests never exercise this protocol.
- Work: server-side conditional timestamp updates/monotonic field merging with explicit mutation versions; periodic pull; deletion tombstones where user deletion is supported.
- Acceptance: two-device stale reconnect preserves newer FSRS state and achieved goals regardless of sync order; a deleted synced goal does not reappear at next pull.

### P1 — Sync acknowledgement can erase an in-flight local progress update

- Evidence: `src/lib/supabase/sync.ts:139–142` awaits network then rewrites the captured old progress object with synced=1.
- Counterexample: sync captures 40% scroll; learner completes the lesson while request is pending; response arrives and replaces the completed local record with the captured incomplete record. Later pull cannot recover a completion never uploaded.
- Work: acknowledge only an unchanged revision in one local transaction, preserving newer local fields and dirty state; serialize conflicting operations or version them.
- Acceptance: delayed RPC test mutates progress during upload; local completion/XP survives and a subsequent sync uploads it.

### P1 — Shared local stores have no account ownership boundary

- Evidence: `src/lib/db.ts:153–223` keys learner stores only by lesson/id; `src/components/providers/AuthProvider.tsx:44–68` switches key/user and starts sync without partitioning local stores; `src/lib/supabase/sync.ts:163–176` attributes every local goal/certificate to the current user. Goals are plaintext (`src/lib/db/goals.ts:20`).
- Counterexample: A creates a goal, signs out, B signs in in the same browser. A's plaintext goal remains visible and can upload as B's. Auth-key-encrypted A cards instead fail under B's key, potentially stopping the push before later stores—this is another symptom, not reliable isolation. Fresh-account sign-in can also strand encrypted guest records because the new auth key replaces the device key with no fallback migration in hydrate.
- Work: per-account local namespaces plus explicit guest adoption and key migration; clear/reload reactive stores on ownership changes; cancel/drain old operations and check identity generation before writes.
- Acceptance: guest→A→sign-out→B and direct account switch with delayed sync prove no A data visible/uploaded as B; guest-owned records survive approved adoption.

### P1 — Account deletion is promised but unavailable

- Evidence: privacy page `src/app/(marketing)/privacy/page.tsx:114` promises Settings deletion removes all server data; `src/components/settings/SettingsClient.tsx:372` button is unconditionally disabled. Unwired `src/lib/supabase/queries/profile.ts:91` deletes only profiles, explicitly leaves auth.users for a separate absent flow.
- Counterexample: signed-in learner cannot perform the promised deletion. Merely enabling the existing helper would not implement auth deletion.
- Work: reviewed authenticated account-erasure workflow and verified retention/cascade semantics, or accurately disclose an operational request mechanism until implemented. Do not conflate local reset with cloud deletion.
- Acceptance: dedicated test account deletion invalidates session and removes all scoped server records according to a documented retention policy; local data choice remains explicit.

### P2 — Import accepts unvalidated sidecar and overwrites newer progress

- Evidence: `src/lib/learner-record/import.ts:188` casts x-dura without validation; `:306–318` writes goals/progress unconditionally despite timestamp-merge comments. Separate writes mean failure can leave partial application. `src/lib/db/goals.ts:20–28` suppresses failure, so import counts a goal as restored even when it wasn't.
- Counterexample: importing last month's save over today's completion regresses local progress. A malformed sidecar can apply earlier cards/logs before throwing on an invalid progress row.
- Work: validate complete archive including sidecar before mutation; explicit merge rules; transactional application or durable resumable journal; truthful result counts.
- Acceptance: older backup cannot erase newer completion; malformed payload makes zero changes; injected quota failure cannot produce false successful restore counts.

### P2 — “Complete” export/backup coverage omits learner-owned stores

- Evidence: export.ts:82 reads only six stores; snapshot.ts:49 lists twelve but excludes dojo-sessions (created at db.ts:223). Export omits XP, sandbox work, preferences, assessments, tutorials, Dojo and analytics despite policy promising full export including analytics.
- Counterexample: learner relying on Export my data to move devices loses saved code and XP. OPFS-only recovery loses Dojo history.
- Work: define inventory-based portability/recovery contract, include supported records and preserve certificate proof artifacts, clearly label excluded categories.
- Acceptance: populate every learner-owned store, export/restore and OPFS-recover, assert the documented full inventory rather than testing a hand-picked subset.

### P2 — OPFS restore is not atomic and can permanently accept partial recovery

- Evidence: `src/lib/storage/snapshot.ts:108` runs per-store transactions with Promise.all; `src/lib/storage/restore.ts:25` only restores if all selected learner stores are empty.
- Counterexample: progress restoration commits but flashcard restoration fails due to quota/error; next bootstrap sees nonempty progress and skips recovery, leaving missing cards indefinitely.
- Work: one multi-store restore transaction after full validation, or restore journal that resumes incomplete stores and cannot be mistaken for success.
- Acceptance: injected failure after one store commits is recoverable on next launch without silently abandoning remaining backup records.

### P2 — Goal saves/deletes report success after storage failure

- Evidence: `src/lib/db/goals.ts:20–39` catches without rethrow; `src/stores/goals.ts:34–58` updates UI regardless.
- Counterexample: quota failure while creating a goal still shows it; reload loses it. Delete failure hides a goal until reload.
- Work: propagate write errors and keep reactive state consistent; show retryable error.
- Acceptance: forced IDB failure preserves prior UI/state and communicates failure for add/update/remove/complete.

### P2 — Normal sign-out ignores returned SDK errors

- Evidence: `src/components/providers/AuthProvider.tsx:112` awaits signOut without inspecting returned error, then sets user=null. Dedicated reset has a separate robust local-session path.
- Counterexample: SDK resolves `{error: networkError}` while retaining session; UI appears signed out, reload restores session. Timer stop does not cancel in-flight sync.
- Work: inspect result and ensure bounded truthful local sign-out, identity invalidation and worker drain.
- Acceptance: offline/failed revocation tests verify either actual local sign-out or visible error, never success UI with retained session.

### P2 — Published privacy statements contradict implemented data flows

- Evidence: privacy page:80 says No cookies; `src/lib/supabase/server.ts:17–26` sets essential auth cookies. Privacy page's final service list says no other services receive data, while `src/lib/ai/consent-gate.ts:1–15` explicitly covers learner content sent to Anthropic. Policy claims full JSON/analytics export although Settings now downloads incomplete ZIP.
- Work: reconcile public policy with actual optional AI, feedback, performance analytics, auth-cookie, account deletion and retention behavior; have policy owner review legal commitments. This is a source/product mismatch finding, not legal advice.
- Acceptance: data-flow inventory maps every public claim to implementation and a tested user control; policy no longer claims unavailable deletion/export behavior.

## Previously known hosted work, not new discoveries

The verified project is Dura ytputzzqubbaaztowyoz in Durwood Studios. Last confirmed catalog read showed 24 RLS tables, existing tenant keys/analytics_events/optional stores/guarded sync_progress, but absent submit_feedback, unsafe annotation creation/table grants, absent vote maintenance and absent server_credential. `supabase/staged/live/001-dura-contract-reconciliation.sql` is the reviewed narrow patch; **no hosted application confirmed**. Manual run matrix documents skipping historic repairs already present. Local fixtures cannot establish actual application or hosted JWT/PostgREST behavior. Parent must check whether user has subsequently applied it before repeating this deployment status.

## Coverage and limits

Full reads: learner-record import.ts/export.ts; storage restore.ts/shadow-write.ts/snapshot.ts; supabase sync.ts and queries/progress.ts; analytics.ts and analytics/consent-gate.ts; marketing privacy/page.tsx; providers/AuthProvider.tsx; idb/encryption-key.ts/active-key.ts; db/goals.ts; stores/goals.ts.
Targeted reads: learner-record/types.ts; idb/encrypted-store.ts; storage/opfs.ts; clearAllData.ts; db.ts store inventory; queries/flashcards.ts/goals.ts/profile.ts; SettingsClient.tsx/RestoreFromFile.tsx references; ai/consent-gate.ts; supabase/server.ts; learner-record export/import tests and OPFS test search. Earlier task read/validated reset tests, reset coordination, live patch and staged SQL fixtures; current pass did not rerun those.
Current SQL evidence comes from durable earlier root live inspection and the reviewed patch, not a fresh live query. No credentials, browser operations, legal-source research, network mutation or implementation edits performed. The initial pass used source-derived counterexamples; the subsequent runtime addendum below records four executed reproductions. This is a bounded data audit, not exhaustive assurance of every auth/AI/DB wrapper or service-worker route. ZIP decompression memory protection relies on directory claims and deserves a separate adversarial test; not promoted to a confirmed finding here.

## Runtime reproduction addendum

Temporary real-module Vitest probe executed successfully: **4/4 tests reproduced the bugs**. Test source saved `/private/tmp/dura-promise-reproductions.test.ts`; output `/private/tmp/dura-promise-reproductions.log`. Repository temporary test was removed; no implementation edits. To rerun, temporarily copy it under tests/, run Vitest on that filename, then remove. Storage and network were controlled in-memory doubles; encryption, export, canonical projection, sync orchestration, and analytics flush were real implementation modules.

1. Real Web Crypto encryption + putEncryptedReviewLog → exportLearnerRecord **rejects with Zod errors for missing rating/elapsed_days/scheduled_days/state**. Correction to original hypothesized exact exception: reviewedAt is an indexed plaintext field, so this fixture does not throw Invalid time value; the export bug is confirmed, but the observed error is missing encrypted fields. Parent additionally found raw-progress hydration bypass in StatsClient:60 and notifications:153/202; include those readers in the same systematic hydration repair.
2. Real canonical projection omits dictionary termSlug, and real CanonicalCardSchema parsing strips an explicitly injected termSlug. This proves the metadata loss; full ZIP import was not executed in this probe.
3. Delayed real pushChanges RPC: locally replace 40%-complete snapshot with completedAt=20, scroll=100, XP=50 while request pending. After acknowledgement the stored row is **completedAt=null, scroll=40, XP=0, synced=1**. This is a reproduced local data-loss race, not merely a missing-guard hypothesis.
4. Real analytics flush() with no sink transforms event.synced **0→1 without a sender**. AnalyticsProvider:12 actually calls startAnalyticsLoop() without a sink. Supabase sync later selects only synced=0 (sync.ts:181), so the 5-second no-op loop usually consumes events before the 30-second uploader. **P2 confirmed delivery bug.** Required work: one delivery owner, no acknowledgement without successful sink, actual integration test from consented track through uploader and failure/retry.

## Additional source findings / coverage

- `src/lib/db/skill-assessment.ts:56–62` removes the legacy localStorage result before awaited IDB migration; putSkillAssessment:47 suppresses storage failure. **P2 data loss:** IDB quota failure destroys the only durable legacy result. Preserve source until verified commit; test rejected IDB put retains original localStorage.
- `src/lib/db/dojo.ts:28–35` labels stats all-time but limits input to newest100, and computes recentTrend from the oldest10 within that truncated set. **P2 correctness:** session101 never increases total beyond100; chart omits newest90 of a100-session window. Aggregate all records and select newest10 then reverse. Acceptance: 101 distinct session fixtures produce total101 and correct latest10 chronological points.
- False-success wrapper pattern also appears in db/preferences.ts:29, sandbox.ts:26, certificates.ts:5, assessments.ts:5, tutorial-progress.ts:20; the latter returns an updated checkpoint even if persistence failed (:113–114). These need caller-level error-contract review along with goals, not speculative extra findings per wrapper.
- Sandbox/tutorial query upserts unconditionally overwrite remote rows too (`queries/sandbox.ts:27`, `queries/tutorial.ts:31`); include them in stale-device conflict repair. Dojo upsert omits ignoreDuplicates despite immutable G-set claim; assessment upsert correctly includes ignoreDuplicates.
- The aggregation helper is **not evidence of deployed differential privacy**. Repository import/use search found no runtime importer of analytics/aggregation.ts. Actual batchSyncAnalytics maps user_id, timestamp and properties into analytics_events directly. Its helper commentary's guarantee about observing every aggregate is not demonstrated by bounded contributions or privacy-budget composition. Required work: decide/publish actual analytics contract and trace an implemented validated aggregate pipeline before claiming DP. This audit did not attempt a formal privacy proof.
- XP events are pushed but absent from pullChanges; source comment queries/analytics.ts:20 promises access across devices and inclusion in exports, but neither pull nor current export supplies them. Include XP in the end-to-end portability/sync inventory acceptance test.

Additional **full reads** this pass: db/preferences.ts, certificates.ts, xp.ts, sandbox.ts, skill-assessment.ts, dojo.ts, tutorial-progress.ts, assessments.ts; providers/AnalyticsProvider.tsx. Additional **targeted reads**: queries/analytics.ts, sandbox.ts, tutorial.ts, dojo.ts, assessments.ts; idb/encrypted-store.ts hydration/dehydration/review paths; encryption.ts derivation/encryption; analytics/aggregation.ts noise mechanism and contract; existing learner-record/export.test.ts (largely summary tests, not full encrypted export). No claim of full remaining query/config/SQL coverage. No hosted probes or full two-device browser run performed.

## Detailed notes: Product flow and public promise review

# Product promise audit — read-only, 2026-09-12

Scope: public marketing/policy promises and selected implementation paths. Source inspection, not a production acceptance test. No source edited. Findings distinguish absence of a feature from inaccurate copy; changing marketing is a legitimate resolution where the implemented behavior is intentional. Paths below are repository-relative to /Users/dustinsnellings/Documents/ChatGPT/Dura. Untracked `* 2.*` duplicates excluded.

## Confirmed actionable gaps

### P1 — Account deletion is promised but impossible through Settings

- Promise: `src/app/(marketing)/privacy/page.tsx:101` and `src/app/(marketing)/terms/page.tsx:64` promise account deletion from Settings, removing server data.
- Implementation: `src/components/settings/SettingsClient.tsx:373` renders an unconditionally `disabled` button, with “Delete Account — available when signed in” at377. This is not conditional on auth state and has no handler. Local Clear All Data is a separate operation.
- Counterexample: signed-in learner follows policy to Settings and cannot request the promised deletion.
- Needed work: implement an authenticated, reauthenticated deletion/request workflow with explicitly defined storage scope (auth user, rows, avatars, public records, retained legal records), or publish a working manual deletion channel and honestly state its limits while implementation is pending. Coordinate with data-engine audit; do not add a service-role browser key.
- Acceptance: real test account can initiate deletion, sees pending/success/failure honestly, and retained/deleted resources match the policy; signed-out local erase remains separate.

### P1 — Privacy policy contradicts shipped network behavior

- Promise: privacy61 says nothing is sent unless account+sync;69 says no cookies;218 says no other third party beyond Vercel/Supabase/Stripe. Install25 says data never leaves device. How-it-works133 says records are never on a remote server.
- Implementation: `src/lib/supabase/client.ts:29` writes essential auth cookies; `src/lib/supabase/middleware.ts:55` sets response cookies. `src/lib/ai/anthropic-client.ts:21,115,148` sends opted-in content directly to Anthropic. `src/lib/feedback/delivery.ts:61` posts anonymous feedback to Supabase using the anon credential at64–65. `src/components/about/GenerativeAIDisclosure.tsx:38` accurately describes optional AI, contradicting the policy.
- Counterexample: a guest configures optional AI and sends code; a guest sends feedback; a signed-in user receives essential cookies. None is represented accurately by the absolute policy claims.
- Needed work: reconcile all public copy with a field-level data-flow inventory, consent and purpose. Explicitly describe feedback, AI, optional sync, essential cookies, and user-entered content that may contain personal data. Do not “fix” by disabling legitimate consented flows.
- Acceptance: browser request/storage traces for guest, feedback, AI, sign-in and sync have corresponding accurate disclosures; no statement promises that arbitrary pasted text can never contain a name/email.

### P1 — First-time OAuth account creation bypasses the advertised age step

- Promise: `src/app/(marketing)/privacy/page.tsx:159`: account creation requires age verification.
- Implementation: `src/components/auth/SignUpForm.tsx:84` gates the signup form with AgeGate, but `src/components/auth/SignInForm.tsx:49` calls `signInWithOAuth` directly and exposes Continue with GitHub at83. `src/app/auth/callback/route.ts` exchanges the code without any age attestation check.
- Counterexample: new visitor with a GitHub identity uses Sign In → Continue with GitHub, never visits Sign Up/AgeGate. Supabase OAuth first-use account provisioning is not guarded by this client signup-only step.
- Needed work: consistent first-account policy across email and OAuth and a server-side account-provisioning/attestation decision; distinguish self-attestation from independently verified age. This is a source-backed onboarding gap, not a legal determination.
- Acceptance: a fresh OAuth identity cannot complete first-account onboarding without the required step; returning verified users are not repeatedly blocked; direct signup APIs follow the same policy.

### P2 — Marketing presents optional gates as mandatory and certificate trust too broadly

- Promise: how-it-works49,63–73 says80% to advance, gate after every module, public tamper-resistant certificate. About61 similarly says advance only when proven; terms84–92 describes demonstrated mastery through verified assessment.
- Implementation: `src/types/preferences.ts:34` defaults strictGating to false; `src/components/paths/GatingGuard.tsx:35` skips checks when false; `src/lib/gating.ts:18` immediately unlocks everything. `src/components/verify/PhaseTest.tsx:324` says passing saves a local learning certificate. Separate `src/app/(app)/verify/issued/page.tsx:41,52` accurately states self-reported name, server-scored unproctored unlimited-practice answers, and no verified independent knowledge/accreditation.
- Counterexample: fresh guest navigates directly to a later module without80%; completing local phase test is not equivalent to the separately configured server-scored credential flow.
- Needed work: describe open exploration vs optional strict mode, local receipts vs server-scored credentials, network/configuration and sharing limitations. If mandatory progression is truly intended, define and test that product change rather than implying existing security boundaries.
- Acceptance: fresh-user navigation and both certificate flows match marketing, with trust scope visible before assessment and sharing.

### P2 — Every term/missed-question auto-flashcard promise is not implemented

- Promise: `src/app/(marketing)/how-it-works/page.tsx:80`: every vocabulary term and missed quiz question becomes a flashcard.
- Implementation: `src/components/lesson/VocabTooltip.tsx:117,210` adds a term only via explicit button. `src/components/lesson/Quiz.tsx:183` derives missedTerms only from optional q.terms, and242–249 requires clicking an add button; it does not create a card containing each missed question.
- Counterexample: answer a question without terms metadata incorrectly, leave the summary: no question card is produced. Merely reading a vocabulary tooltip also does not add its term.
- Needed work: choose intentional opt-in deck population and correct promise, or implement deduplicated automatic missed-question/term card creation with clear learner controls.
- Acceptance: demonstrate behavior for questions with/without terms and repeated attempts; no duplicate deck flooding and no claim of automatic enrollment when a click is required.

### P2 — “Reach CTO” goal reaches100% after any one phase certificate

- UI promise: `src/components/goals/GoalCreator.tsx:19,200–204` offers Junior through CTO role goals.
- Implementation: GoalCreator58–61 sets every career target to1 and persists role only in label; `src/components/goals/GoalsClient.tsx:77–84` counts certificates across all phases without role requirements; `src/components/goals/GoalCard.tsx:20` caps count/target at100%.
- Counterexample: select Reach CTO after only a Phase0 certificate; computed progress=1,target=1, UI100%. Senior and Junior have identical computation.
- Needed work: persist a stable role identifier and map its actual required phases/skills/verification, or explicitly make career goals self-reported milestones with no invented percentage.
- Acceptance: Phase0 alone cannot show CTO completion; each role has documented, independently tested requirements; imported labels cannot silently select requirements.

### P2 — Daily minutes count a lesson's lifetime time, not today's work

- UI promise: GoalCreator22 offers minutes/day.
- Implementation: `src/components/goals/GoalsClient.tsx:45–52` selects rows by completedAt/startedAt then adds entire timeSpentMs.
- Counterexample: study50 minutes yesterday and10 today then complete today; daily goal displays60, not10. Resume an incomplete lesson started yesterday: today's time can be omitted entirely.
- Needed work: use day-bucketed activity/session durations with consistent local-day/timezone semantics; coordinate data-engine owner. Do not infer temporal allocation from lesson totals.
- Acceptance: cross-midnight, resume, multi-day completion and timezone cases reflect actual time in the selected day.

### P2 — Offline access and auto-update promises exceed cache/update contract

- Promise: install46–47 says lessons/sandbox all available without internet;60 says always latest/no manual updates. About56 says every lesson offline after first load.
- Implementation: `src/app/sw.ts:14–32` uses generated precache+default runtime cache and explicit offline document fallback; `src/app/offline/page.tsx:15` accurately limits access to previously visited pages. No explicit complete-curriculum download/availability control appears in reviewed install path/config. sw23 keeps waiting worker (`skipWaiting:false`); `src/hooks/useServiceWorkerUpdate.ts:104` waits for explicit applyUpdate; UpdateAvailable exposes Restart/Later.
- Counterexample: guest visits landing page then disconnects and attempts a previously unvisited lesson. Expected cache-miss fallback is incompatible with “all available.” A long-lived tab choosing Later remains old by design.
- Needed work: describe visited/downloaded scope and user-approved activation; if full curriculum offline is intended, ship download inventory/progress/quota handling and cold-offline tests. Preserve safe update activation.
- Acceptance: production-build cold profile → first visit → disconnect → unvisited lesson test; downloaded curriculum navigation with API outage; update waiting vs restart states match copy. Exact deployed precache contents were not inspected, so cold-profile runtime reproduction remains required before declaring a specific URL failure.

### P2 — Discovery's authoritative explanation contradicts its own Morse data

- Source: `src/app/(marketing)/discover/[slug]/[activity]/page.tsx:83` says no letter encoding is a prefix of another; `src/components/discover/MorseCode.tsx:7,11,14` defines A='.-', E='.', H='....'. E is a prefix of A/H when considering dot/dash symbols alone. Timing gaps supply boundaries.
- Adjacent same-page125 says AES/ChaCha20 change the key every block, an inaccurate model;127/149 route “Phase7 Security Engineering” into Phase7 Advanced Systems (`src/content/phases.ts:482`).
- Needed work: revise Discovery scaffolding with technically correct delimiter/prefix explanation, correct key/nonce/counter terminology and real curriculum destinations. Do not assume main-MDX conformance audits cover inline Discovery copy.
- Acceptance: code-map counterexample is explained accurately and each teaches link leads to the advertised subject. Broader Discovery text needs its own technical review; this is a concrete sample, not a claim the rest is wrong.

## Lower-priority alignment / explicit limitations

- How-it-works37 promises5–8 minute runnable-code lessons, while specialist lessons intentionally have much longer estimates and written/external-tool tasks. AI disclosure still says418 lessons at `src/components/about/GenerativeAIDisclosure.tsx:41`; current registry has668. Use registry-derived counts and accurate modality descriptions (P2 copy alignment, overlaps curriculum audit).
- StandardsWatch explicitly limits itself to old typed PHASE_R/PHASE_M registries (`src/lib/standards-watch/scan.ts:23`) and silently skips unknown citations at60; its “All references current” status at `src/components/standards-watch/StandardsWatch.tsx:211` is only as broad as that scope. Footer admits limitation, so do not report as an undisclosed full scanner. Needed extension: shared actual MDX-frontmatter inventory, unknown-reference state and scope-qualified status; no claim of publisher monitoring without a maintained registry process.
- Command palette honestly advertises pages/phases/dictionary at185. It is not lesson-body semantic search: static list52 and dictionary API81; Supabase search helper is unused by this UI and itself text fallback. Record as unfulfilled future capability only if a broader explicit search promise is found, not a present P1 defect.
- Anonymous feedback delivery now uses durable local queue and insert-onlyRPC; UI calls it saved, not delivered. Actual hosted migration/admin-read operation requires deployment evidence. No new product bug established in reviewed feedback flow.
- TipButton sends one-time checkout, handles503 visibly, no feature entitlement; webhook acknowledges without unlock. Monthly checkout API exists but current button sends once; do not invent a user-facing subscription-cancellation promise.
- StudyingNow presence component has no mounting call found, so its anonymous network possibility is not counted as a live privacy violation.
- ActivityPlaceholder exists but no registration found in inspected activity registry; existence alone is not a shipped “coming soon” finding.
- Admin feedback page is guarded by admin layout and reads via RLS; this pass did not validate live role assignment, SQL deployment or operational inbox handling.

## Coverage inventory and limits

Read fully or relevant implementation sections (not an assertion of every line audited):

- `src/app/(marketing)/how-it-works/page.tsx`
- `src/app/(marketing)/privacy/page.tsx`
- `src/app/(marketing)/terms/page.tsx`
- `src/app/(marketing)/about/page.tsx`
- `src/app/(marketing)/install/page.tsx`
- `src/app/(marketing)/support/page.tsx`
- `src/app/(marketing)/standards-currency/page.tsx`
- `src/app/(marketing)/discover/[slug]/[activity]/page.tsx`
- `src/components/standards-watch/StandardsWatch.tsx`
- `src/lib/standards-watch/scan.ts`
- `src/components/about/GenerativeAIDisclosure.tsx`
- `src/components/auth/SignInForm.tsx`
- `src/components/auth/SignUpForm.tsx`
- `src/components/auth/AgeGate.tsx`
- `src/app/auth/callback/route.ts`
- `src/components/settings/SettingsClient.tsx`
- `src/components/settings/AIFeaturesPanel.tsx`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/ai/anthropic-client.ts`
- `src/components/feedback/FeedbackButton.tsx`
- `src/lib/feedback/delivery.ts`
- `src/app/admin/feedback/page.tsx`
- `src/components/goals/GoalsClient.tsx`
- `src/components/goals/GoalCreator.tsx`
- `src/components/goals/GoalCard.tsx`
- `src/stores/goals.ts`
- `src/components/dashboard/DashboardClient.tsx`
- `src/components/dashboard/StudyingNow.tsx`
- `src/lib/supabase/queries/presence.ts`
- `src/components/nav/CommandPalette.tsx`
- `src/lib/supabase/queries/search.ts`
- `src/components/support/TipButton.tsx`
- `src/app/api/tips/checkout/route.ts`
- `src/app/api/tips/webhook/route.ts`
- `src/app/sw.ts`
- `src/app/offline/page.tsx`
- `next.config.ts`
- `src/components/pwa/InstallGuide.tsx`
- `src/components/pwa/UpdateAvailable.tsx`
- `src/hooks/useServiceWorkerUpdate.ts`
- `src/components/pwa/NotificationScheduler.tsx`
- `src/lib/notifications.ts`
- `src/types/preferences.ts`
- `src/lib/gating.ts`
- `src/components/paths/GatingGuard.tsx`
- `src/lib/assessment.ts`
- `src/components/verify/MasteryGate.tsx`
- `src/components/verify/PhaseTest.tsx`
- `src/app/(app)/verify/issued/page.tsx`
- `src/components/lesson/Quiz.tsx`
- `src/components/lesson/FillBlank.tsx`
- `src/components/lesson/VocabTooltip.tsx`
- `src/components/lesson/LessonReader.tsx`
- `src/components/discover/MorseCode.tsx`
- `src/components/discover/ActivityPlaceholder.tsx`
- `src/content/phases.ts`

58 tracked files inspected fully or selectively. Search hits are not represented as full-file reviews. Marketing standards overview pages, all Discovery activities, all admin pages, notification UX, all AI tutor/review components and full dashboard reactive behavior were not exhaustively reviewed. This is a bounded promise audit; root should not label it a complete all-code audit. No browser interactions, live account changes, external messages or implementation edits occurred.

## Runtime extension — source inspection and isolated stream experiment

### P1 — Freeform sandbox reports Saved after IndexedDB write failure

- `src/lib/db/sandbox.ts:27` catches `putSave` failures at33–35 and resolves normally. `src/components/sandbox/FreeformSandboxInner.tsx:990–993` then sets saved identity, lastSavedCode and visible savedAt unconditionally. Next automatic pass skips unchanged code at977.
- Counterexample: quota/write rejection during Save yields a “Saved” timestamp and suppresses unchanged-code retries, although no durable snippet exists. This directly violates the local auto-save promise (privacy57 and sandbox save UI).
- Work: propagate failure, show actionable unsaved/error state, retain dirty state and retry; apply the same honest contract to delete/rename. Test quota, transaction abort and reset-in-progress with the real caller, not only helper unit tests.
- Acceptance: a rejected IDB write never displays Saved or clears dirty state; retry succeeds without retyping.

### P2 — Switching sandbox language/template can discard the most recent edits

- `FreeformSandboxInner.tsx:736` autosaves only every30 seconds;1010–1013 cleanup clears interval without a final flush. Language switch1229–1233, loadSave1236–1240 and template selection1249–1252 remount the provider and replace code without saving or confirming dirty contents.
- Counterexample: type new code, select TypeScript within30 seconds, switch back: unsaved JS is replaced by starter. UI doesn't warn.
- Work: flush current draft before destructive workspace changes, keep per-language drafts, or explicitly confirm discard; handle write failure without changing workspace.
- Acceptance: switching within first autosave interval preserves or explicitly discards edits; failure to flush blocks destructive transition.

### P1 — Sandbox privacy/offline contract also omits the external CodeSandbox runtime

- `FreeformSandboxInner.tsx:1262–1267` uses default SandpackProvider with user code and no self-hosted bundlerURL. Installed dependency `node_modules/@codesandbox/sandpack-client/dist/clients/runtime/index.js:332` selects a codesandbox.io runtime,381 initializes its iframe protocol,602 dispatches a compile message containing modules to it.
- This establishes third-party-origin runtime access to editor source, not proof that CodeSandbox persists source on its servers. Do not overstate persistence. It also creates a network/cache dependency beyond DURA's service-worker scope.
- Counterexample: guest opens React sandbox; source is passed into the third-party runtime despite privacy218 “No other third-party services receive your data” and install's unconditional offline statement.
- Work: explicitly disclose runtime origin and actual data boundary, or self-host an isolated supported runner; verify cold/warm offline execution for every advertised language.
- Acceptance: audited request/postMessage trace matches disclosure, with no implied server retention unless established; cold offline failures clearly explain which runtime assets must be downloaded.

### P2 — First notification opt-in does not start the notification scheduler

- `src/components/pwa/NotificationScheduler.tsx:11–16` checks opt-in only once in an empty-dependency mount effect. `src/components/settings/SettingsClient.tsx:531–538` requests permission and changes component state but never starts or signals the scheduler. `src/app/(app)/layout.tsx:49` mounts the scheduler before opt-in and preserves it across app navigation.
- Counterexample: fresh app → Settings → enable notifications → remain open with due cards. No initial timer or five-minute checks are created until remount/reload, despite Settings showing reminders enabled.
- Work: shared subscribed preference state, starting/stopping scheduler on actual permission/opt-in changes; expose foreground-only limit accurately. `notifications.ts` schedules page timers, not a service-worker background job, so “recently used” alone doesn't guarantee execution.
- Acceptance: opt in during same session triggers eligible reminders; opting out cancels timers; no notification permission is requested without user action.

### P2 — AI streaming treats an interrupted reply as successful completion

- `src/lib/ai/anthropic-client.ts:166–168` breaks on EOF without requiring `message_stop`;183–188 silently skip malformed JSON. `AITutorPanel.tsx:176–178` marks the assistant turn finished whenever generator returns normally.
- Isolated runtime reproduction: transpiled the actual client with a mocked Response stream containing one valid text delta “Partial answer” then EOF, no message_stop. Result was `{result:"Partial answer",completedWithoutMessageStop:true}`. No network call/API key used.
- Counterexample: upstream/proxy closes a stream mid-answer; tutor renders partial answer as complete without error/retry notice.
- Work: parse and require protocol completion, flush decoder deliberately, handle CRLF/trailing framing and distinguish cancellation/network truncation from success. Preserve useful partial text with a visible interrupted state.
- Acceptance: complete stream succeeds; EOF-before-stop and malformed required event fail visibly; chunk splits don't drop text. CodeReview's fetch also lacks a caller timeout/cancel signal (`CodeReviewClient.tsx:112`, client115) and can remain submitting indefinitely; add deadline/cancel handling as related reliability work.

### P2 — Selected non-English interface language only translates the picker, but changes all page language metadata

- `src/lib/i18n/languages.ts:232–240` enables es-419. `src/components/settings/LocalePicker.tsx:19` uses useTranslation. Repository-wide runtime search found this is the only component calling that hook; dashboard, Settings sections and navigation are hardcoded English. `src/i18n/useTranslation.ts:44` changes `document.documentElement.lang` to the chosen locale globally.
- Counterexample: choose Spanish (Latin America): picker changes, “Dashboard”, “New Goal”, settings prose remain English; document now claims Spanish, potentially changing screen-reader pronunciation of English content.
- Work: either wire the translated UI strings into the advertised interface or label translation scope as limited and preserve lang on untranslated regions. Root owns accessibility follow-up.
- Acceptance: choose enabled locale, key navigation/settings/dashboard strings render that language; each untranslated content region has an accurate lang; refresh/navigation preserve state consistently.

### P2 — Admin “most opened lessons” chart ignores the actual lesson-start event

- `src/app/admin/content/page.tsx:29–31` accepts names containing lesson plus open/view. Actual tracked event is `lesson_started` at `src/stores/progress.ts:70`, defined in `src/types/analytics.ts:2`. Search of non-MDX source found no emitter for the chart's lesson_opened/lesson_viewed names.
- Counterexample: opted-in learners start lessons and synced events exist; most-opened chart stays empty.
- Work: derive chart event names and properties from the same typed event catalog as producers; show meaningful no-consent/no-data/query-failure states.
- Acceptance: seed actual emitted lesson_started rows and verify counts; unknown events do not silently populate unrelated categories.

### P2 — Admin 30-day analytics silently truncates aggregates

- `src/app/admin/analytics/page.tsx:101–106` limits raw rows to10000 then computes DAU/WAU/day counts at133–140; charts present them as30-day metrics without a truncation indication. Comment claims accuracy beyond10000, but sort-newest doesn't recover omitted rows.
- Counterexample: newest10000 events come from one active user today, an older user was active yesterday: WAU calculated from the slice is1 rather than2 and prior days disappear. Backend row caps may truncate sooner.
- Work: database aggregation over full authorized date range, paginated complete fetch, or explicit sample/truncated labeling. Keep exact total count separate from sampled aggregates.
- Acceptance: >10000-event fixture produces correct daily/weekly distinct users and counts or a clear partial-data warning.

### Confirmed routing mismatch for root's prescription audit

- `/dojo` mounts `src/components/dojo/DojoClient.tsx`, which uses the Dojo question store and open-ended AI/offline-bank drills. No due-card/flashcard/FSRS access appears in `src/components/dojo` or `src/lib/dojo`. A prescription promising “X cards due” must route to the actual review queue, not Dojo. Root owns exact prescription source citation and acceptance.

### Extension coverage and runtime limits

- Local production probe `curl -I -m3 http://127.0.0.1:3000` failed immediately with connection refused. No cold-offline browser test was attempted against user profiles. No server was started or deployment changed.
- Newly read full files or relevant run/data paths: `src/components/code-review/CodeReviewClient.tsx`, `src/components/lesson/AITutor/AITutorPanel.tsx`, `src/components/lesson/AITutor/AITutorMount.tsx`, `src/hooks/useAIAvailability.ts`, `src/lib/ai/key-storage.ts`, `src/lib/ai/consent-gate.ts`, `src/components/sandbox/FreeformSandboxInner.tsx` (templates sampled, run/save paths inspected), `src/lib/db/sandbox.ts`, `src/app/admin/annotations/actions.ts`, `src/app/admin/annotations/ModerationButtons.tsx`, `src/app/admin/content/page.tsx`, `src/app/admin/analytics/page.tsx`, `src/app/admin/users/page.tsx`, `src/app/admin/page.tsx` (query/revenue/error paths selected), `src/lib/i18n/locale-storage.ts`, `src/lib/i18n/languages.ts`, `src/components/settings/LocalePicker.tsx`, `src/i18n/useTranslation.ts`, `src/app/(app)/dojo/page.tsx`, `src/components/dojo/DojoClient.tsx` (entry flow selected), plus notification/settings/dashboard/client files already listed above.
- Rechecked notification scheduling, dashboard mount loading, admin moderation auth/RLS-zero-row handling, code-review schema parsing, tutor consent mount and abort-on-unmount. No new bypass established for those guarded paths. Code review uses text/structured React rendering; no raw model HTML execution found in reviewed rendering path.
- Lesson sandbox harness/verdict, every freeform template, full admin charts/local dashboard, all translated bundles and all Dojo grading internals were not exhaustively reviewed here. Root/other agents own review/data-engine/Dojo details. This extension remains a bounded audit, not a claim that every tracked file was read.
