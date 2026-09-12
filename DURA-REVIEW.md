# Dura implementation and review

Reviewed September 12, 2026 for `Durwood-Studios/Dura`. The user requested direct publication to `main`. Repository changes and hosted database changes are separate: **no production SQL has been applied by this work**. The user will run reviewed migrations; agent access is read-only for inspection and verification.

## Implemented

- Eight new beginner reading/testing lessons, 24 inline quiz questions, and 16 module assessment questions. The curriculum now contains 668 reachable lessons, 119 modules, and 860 assessment questions.
- Meaningful prerequisites, outcomes, guided offline practice and content corrections for the original 16 Digital Literacy lessons.
- Specialty lesson and assessment loading fixed: legacy folder IDs now resolve to canonical numeric route IDs. Every authored lesson is checked for reachability.
- Local data reset clears every IndexedDB store, OPFS backup, Dura-owned browser state, and saved AI key/consent. It drains background writes, protects other open tabs from stale writes, and clears the local session without needing network access. A browser-stalled service-worker unregistration is bounded to one second; cache deletion remains mandatory. Cloud records remain, as the UI explains.
- Lesson completion, flashcard reviews, and certificates now handle durable-save failures rather than reporting false success. Added duplicate submission guards and protection against late results overwriting a newer session.
- XP deduplication now uses an atomic transaction; repeated actions do not display awards that were not actually earned. Reopening a completed lesson recovers an interrupted XP award from the durable completion record.
- Feedback saves locally and retries at startup, reconnect, and periodically, using a stable ID and a private insert-only RPC. Reset drains/aborts delivery.
- Certificate lookup can recover from local storage failure; network verification failures are distinct from invalid receipts. Public signing of arbitrary client hashes is disabled. Offline certificates remain learner-controlled assessment records; historical hash receipts are not proof of earned achievement.
- Progress RPC sends a JSON array rather than a doubly encoded string. Append-only sync skips existing review/assessment rows, and relevant conflict targets match tenant-scoped keys. Text search uses the existing content metadata table.
- Staged SQL repairs cover missing learner tables, feedback, admin reads, annotation moderation/vote counters, the signup email column, and progress RPC ownership. These have been executed in an isolated PostgreSQL runtime with row-access and replay tests.
- Browser CI now exercises the production build and rejects streamed not-found pages that return HTTP 200. A separate PostgreSQL CI job executes staged schema and access-control tests without production credentials.
- Reconnecting no longer automatically reloads the page and interrupts unsaved work. Offline chunk failures no longer clear working offline caches. Service-worker update polling/listeners clean up properly. Dictionary search cancels stale debounce callbacks.
- Runtime and toolchain upgrades use Next.js 16.3.5, React 19.3.0, TypeScript 6.0.3, Serwist 9.5.12, and Node 22.23.2. Webpack remains explicit for service-worker integration. ESLint 9 is retained because the current plugins do not declare ESLint 10 compatibility.
- README and roadmap match the implemented code; unverified standards mappings are withheld rather than shown as established alignment.

## Additional completion work

- Native written exercises preserve local drafts and provide specific rubrics and worked answers for activities the browser cannot execute. They explicitly use self-review rather than claiming automatic grading.
- Lesson revisions include actual executable-example repairs, native assessment component contracts, canonical prerequisite identities and cycle checks, and corrected technical claims. Detailed evidence is in the [curriculum inventory](standards/pedagogy/CONFORMANCE.md) and its linked phase reports. Static checks do not establish instructional accreditation or validate physical equipment.
- Server-scored assessment results bind signed claims to a time-limited challenge. Tests cover scoring, tampering, and challenge replay. Results state that tests are unproctored and names are self-reported; offline certificates remain available. Production signing configuration is still required.
- Fill-in-the-blank exercises now recognize longer underscore placeholders without leaving stray underscores or displacing later inputs. Quizzes using unsupported prop shapes were corrected.
- Public certificate lookup supports an optional signed artifact, whose authenticity is checked independently of learner-writable storage.

## Verification

- 1,352 unit and contract tests pass across 83 files, including strict current pedagogy checks and MDX compilation for all 668 lessons, assessment prop contracts, and prerequisite resolution.
- Production build passes with 645 generated pages and the service worker. TypeScript, lint, formatting, and standards checks pass.
- All 22 Chromium production learning/offline browser tests pass.
- npm audit reports zero known vulnerabilities in the resolved dependency tree.
- Both isolated database paths pass: historical baseline plus staged repairs, and the Dura-specific patch against reconstructed observed schema. No hosted writes were performed.
- Six actual-MDX C++ examples pass strict native compilation and sanitizers; four robotics Python regression tests pass. Hardware/ROS execution and physical safety validation are not claimed.

## Hosted database decision

Authenticated metadata inspection verified **Durwood Studios / Dura / ytputzzqubbaaztowyoz**, linked to this repository. The database already contains several contracts reconstructed in staged 014–019, so running that sequence blindly is inappropriate. See [live schema observations](supabase/staged/LIVE-SCHEMA-REVIEW.md) and the [target-specific reconciliation](supabase/staged/live/README.md).

The proposed transaction preserves learner records, keeps legacy feedback insertion compatible, adds validated feedback delivery, restricts annotation editing and voting, maintains vote totals, and extends certificate proof storage/lookup. It has been tested against an isolated reconstruction of the observed schema. That is not evidence of hosted execution. A fresh read-only check is needed after the user runs it.

## Remaining external verification

- Apply only the reconciled SQL appropriate to the current hosted schema, then independently verify metadata and intended role behavior.
- Verify the production deployment target, public Supabase configuration, auth redirects, and server-only signing configuration without exposing secrets.
- Verify hosted sync, feedback delivery, and signed assessment issuance against the deployed release. Local and simulated checks do not establish production delivery.
- Preserve human review of security-sensitive changes and advanced technical teaching. No claim is made that every possible bug has been eliminated.

No secrets, AGENTS.md changes, or CODEOWNERS changes are included. Historical baseline SQL remains unchanged.
