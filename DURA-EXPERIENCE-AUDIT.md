# Dura learner-experience audit — September 21, 2026

Scope: code and evidence review of main release ac96abf, with targeted checks. This is not a claim that every lesson is semantically correct or that every hosted learner workflow was exercised. The Supabase-only release is live; CI and its production gate passed, the health endpoint returned success, and an empty sign-in request reached form validation after the limiter. No real learner account was created or deleted in this audit.

## Real learner journey map

| Journey                      | Steps and intended outcome                                                                       | Current evidence                                                                                    | Acceptance still needed                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| First-time guest             | Discover → choose a path/placement → lesson → required practice → completion → next lesson       | Guest completion/reload browser test; curriculum destinations resolve; authored pages render        | Observe novices choosing suitable starting points and handling prerequisites without assistance                               |
| Returning learner            | Dashboard → resume → review scheduled cards → continue lessons                                   | Flashcard scheduling and durable reload tests                                                       | Longitudinal scheduling, motivation and successful return after an extended absence                                           |
| Offline learner              | Download curriculum → disconnect → open an unvisited lesson → practice → reconnect               | Production browser test opens the final unvisited lesson offline; offline feedback persists         | Real mobile storage eviction/private-mode constraints and interrupted downloads/recovery                                      |
| Guest becoming an account    | Sign up → confirm email → explicit guest adoption → sign in → retain work                        | Local browser owner isolation and explicit guest-copy tests; auth handler tests                     | Actual hosted confirmation/redirect flow, refusal to adopt, and second-device convergence                                     |
| Multi-device learner         | Device A edits → sync → device B edits → reconnect A → resolve newer records/deletions           | SQL stale-write/tombstone tests, local race tests, applied live RPC metadata                        | Two independent hosted sessions; conflicting edits, offline deletion, expired sessions and retry paths                        |
| Learner recovering work      | Export → fresh browser/account → restore → validate records                                      | Encrypted archive round trips, invalid-import rollback, portable written responses/Discovery stamps | Hosted recovery with actual account transitions and large real-world archives                                                 |
| Learner practicing judgment  | Choose case → commit decision → new evidence → revise → compare/rate → return later              | Journal persistence in multiple browser engines; logic/storage tests                                | Unfamiliar-case transfer, independent scoring and effectiveness pilot; journal is device-local with export, not cloud-synced  |
| Learner completing a project | Prerequisites → tutorial/lab → reproduce output → debug failure → explain choices                | Eleven lab bundles; selected projects have executable checks                                        | Clean-environment execution of most guides; assess independent project performance                                            |
| Learner proving competence   | Required lesson activities → module/phase assessment → explain credential limits → verify result | Assessment inventory, required-evidence logic and route tests                                       | Full hosted assessment/credential issuance and verification journey; do not equate completion with professional qualification |
| Learner leaving              | Reauthenticate → remove owned files/account → erase correct local namespace                      | Deletion ordering/failure unit tests and SQL owner/recent-auth tests                                | Disposable hosted account with Storage objects, stale session, interrupted deletion and another signed-in device              |

Evidence: tests/e2e/learning-flows.spec.ts, offline-curriculum.spec.ts, portable-product-record.spec.ts; tests/account; tests/learner-record; tests/supabase. Mocks and disposable SQL fixtures do not establish hosted end-to-end acceptance.

## Curriculum depth

749 lessons, 120 modules and 1,806 assessment questions are authored. All 106 formerly unmapped career topics now have introductory study links. This establishes coverage entry points, not complete professional depth. See standards/pedagogy/CAREER-COVERAGE.md and CONFORMANCE.md.

Depth acceptance should be recorded per path: prerequisite chain, worked example, guided practice, independent task, novel transfer task, assessment quality, and demonstrable portfolio outcome. Prioritize destination-career requirements before adjacent careers. Real platform examples (Spark/Airflow, native mobile, Kubernetes/GitOps, robotics and qualified hardware tooling) need actual runtime or specialist acceptance where the repository currently records only syntax, fixtures or introductory coverage.

## Tutorial execution and accuracy

The current inventory has 135 guides and 1,469 fences: 125 are marked not-executed, seven have project/lab execution statuses, and three have helper-only evidence. A fence inventory or passing MDX compile does not prove a complete project works. See standards/pedagogy/tutorial-runtime-inventory.json and TUTORIAL-RUNTIME-REVIEW.md.

**Concrete teaching defect:** src/content/tutorials/11-auth-system.mdx:325 refreshes an access token after JWT verification without checking the stored refresh-token hash/revoked/expiry state. Logout revokes rows that this refresh endpoint ignores. The cookie's /auth/refresh path also prevents normal delivery to /auth/logout. Repair the guide and add real logout/revocation/replay tests. This defect is in tutorial code, not Dura's deployed Supabase authentication handlers.

Additional concrete tutorial defects:

- The authentication tutorial also falls back to public fixed signing secrets when environment variables are absent (11-auth-system.mdx:151–152), including production. Missing production secrets must stop startup.
- tutorials/33-rate-limiter.mdx:409 only advances load-test completion for HTTP200/429; connection errors and other statuses can run indefinitely. Concurrent workers can exceed the intended budget. Count reserved attempts, bound requests and account for errors.
- The same guide introduces CleanableStore without wiring it into the algorithm stores, so its cleanup promise is not implemented. Its clock-injection instruction is not reflected in the code. Assemble a deterministic runnable project and test expiration/error paths.

Next acceptance unit: assemble each guide from a clean checkout using its stated setup, pin dependencies, run the main workflow and negative cases, and record reproducible evidence. Start with authentication/security and data-loss-sensitive examples. Label partial excerpts explicitly; do not count helper tests as whole-project execution.

## Engineering judgment

The feature is substantive: eight cases require an initial decision, immutable commitment, counterevidence, revision, worked comparison, six anchored self-ratings, reflection/transfer prompts, and a seven-day return. Cases address sync, release risk, accessibility, AI assistance, sensing, market-data integrity, robotics and maintenance. Sources connect to SWEBOK, ABET, WCAG, NIST AI RMF, ACM ethics and IES teaching recommendations; external editions were not revalidated in this audit.

**Unproven:** Dura-specific learning gains, reliable scoring and transfer to unfamiliar problems. Length/completeness validation cannot judge reasoning quality. A learner pilot needs baseline tasks, independent double-scoring, delayed unfamiliar cases, and recorded rubric disagreements. Current delayed review reopens the same case with earlier answers visible; that is practice, not an unfamiliar transfer assessment. Teacher materials exist, but the inspected workflow has no independent reviewer scoring process. Journal records are encrypted and exportable, but do not currently sync through Supabase.

References: standards/engineering-judgment/ej-1.0.md; teacher-mapping.md; src/lib/judgment/logic.ts; src/components/judgment/JudgmentCaseClient.tsx.

## Accessibility and screen fit

Strong existing coverage: every authored lesson/guide has narrow-screen geometry checks; selected dialogs and judgment workflows run in Chromium, Firefox and mobile WebKit. StandardsBadges uses collision-aware positioning and bounded dimensions. Passing horizontal geometry does not establish complete accessibility or all overlay/keyboard states.

**Concrete defect:** src/components/lesson/AddFlashcardButton.tsx:123 and :134 render visual labels without associated control IDs/htmlFor. The Term input lacks an accessible name. The form opens upward from a fixed offset without max-height/vertical scrolling/collision handling (:100–107), so short screens/soft keyboards can crop it. That clipping is a source-confirmed risk, not a fresh browser reproduction. Focus entry/restoration is missing; its close target is approximately 24px versus Dura's 48px mobile target.

Existing geometry tests do not open this form. The shared geometry helper mainly checks horizontal containment inside main. Fresh axe tests cover only RatingButtons and AITransparencyDisclosure. Next: fix the form; test open-state keyboard/focus/landscape geometry, then real-route axe, 200–400% zoom, text spacing, VoiceOver and mobile keyboard behavior. Do not claim universal off-screen prevention or WCAG conformance yet.

## Hardware labs

There are eleven downloadable labs overall, including actual hardware-related source projects:

| Project                   | Evidence                                                                    | Still unverified                                                                      |
| ------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| STM32 sensor pipeline     | PlatformIO cross-compilation and host fault-policy tests                    | Physical STM32F407 flash/run, ADC/DMA timing, watchdog, UART and power/fault recovery |
| UART verification         | Icarus procedural simulation of all 256 bytes, reset, bad stop and recovery | Full UVM compilation/execution; broader timing and physical/synthesis claims          |
| Robotics planned transfer | ROS/MoveIt/URsim source; four local trajectory contract tests               | Complete ROS/URsim integration; EVIDENCE.md explicitly says NOT RUN                   |
| Manufacturing telemetry   | Synthetic HTTP → actual OPC UA → SQLite integration tests                   | Physical CNC, full MTConnect interoperability and production controls                 |

Evidence limits are appropriately documented in public/labs/\*/README.md and public/labs/robotics/EVIDENCE.md. Describe these as simulations/host tests until the actual equipment and integration procedures pass.

## Documentation

Documentation is extensive but operationally inconsistent. DURA-COMPLETION.md still requires Upstash and contract 2026-09-023; standards/lflrs/DATA-INTEGRITY-IMPLEMENTATION.md points to moved staged SQL and pending migrations. README.md:57 still says Next.js15 while package.json declares Next16. DURA-PROMISE-AUDIT.md retains Chrome-only coverage language despite selected Firefox/WebKit suites. Historical sections in the deployment guide and resume log can be mistaken for current instructions.

Create one concise current release status, update executable paths and current setup instructions, and clearly separate historical evidence. Retain honest limitations. Current truth: ac96abf is deployed; 001/021/022/023/024/025 are applied and archived; no Redis service is required; the reviewed migration queue is empty. Hosted multi-device/deletion/credential acceptance is still incomplete.

## Priority order

1. Repair the authentication tutorial's revocation/logout teaching and add executable negative cases.
2. Fix and regression-test the lesson flashcard form's labels, focus and short-screen positioning.
3. Execute the mapped hosted learner journeys using dedicated disposable accounts and independent browser sessions.
4. Reconcile current deployment documentation so users cannot follow obsolete Redis/migration instructions.
5. Audit each destination path against independent performance and transfer tasks, not topic-link counts.
6. Work through the 125 unexecuted guides in risk order and make projects reproducible.
7. Run judgment pilot/double-scoring/delayed-transfer evaluation; schedule real hardware integration acceptance separately.

## Checks performed in this audit

- Three curriculum test files passed 760 tests (structure/MDX compile, career linkage, selected tutorial helpers); these are not semantic validation of every lesson.
- Tutorial inventory consistency check passed; statuses are evidence labels, not execution of all guides.
- Eight targeted judgment/lab Vitest files: 15 tests passed.
- Robotics Python contracts: four tests passed; embedded host fault-policy test passed.
- Accessibility component axe checks: eight tests passed; JSDOM canvas limitation prevents treating them as full rendered contrast evidence.
- Source review of routes, auth/recovery, guest/offline tests, deletion tests, documentation, curriculum evidence, judgment and lab contracts.
- Earlier release CI passed all jobs, including production browser workflows and PostgreSQL concurrency tests. This audit did not rerun the entire browser suite or create/delete hosted accounts.

## Remediation follow-up — first fix batch

The authentication tutorial's secret fallback, refresh-session checks and logout cookie scope have been repaired with extracted-source SQLite regressions (JWT verification explicitly mocked). The rate-limiter tutorial now has connected TTL cleanup, injected algorithm clocks and bounded error-aware load-test attempts. Neither guide is claimed to have full Express deployment acceptance.

The lesson flashcard form now has associated labels, managed entry/return focus, collision-aware placement, bounded scrollable height and48px controls. Nine production-browser checks passed across Chromium/Firefox/mobile WebKit at320×568,667×320 and375×250. Real-device software keyboard and screen-reader acceptance remain separate.

Current release documentation has been reconciled with the Supabase-only release and archived migration paths; historical audit material is clearly labeled. Full unit suite:123files/1577tests passed. Build, lint, typecheck and tutorial inventory consistency passed. The remaining journey/depth/pilot/hardware work above is not completed by these repairs.
