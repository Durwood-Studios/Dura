# Dura implementation and review

Work is on `codex/dura-completion`, based on `a8f1199`, in the local Dura workspace. Three subagents handled data durability, feedback/certificates, and curriculum; the main agent integrated browser checks, database repairs, and regression fixes. No production database changes or deployment have been performed.

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
- Security dependency patches retain Next.js 15 (resolved 15.5.25), update Sharp to 0.35.4 and Vitest to 4.1.11, and patch vulnerable transitive packages. Final full `npm audit` reports zero vulnerabilities, including development dependencies.
- README and roadmap match the implemented code; unverified standards mappings are withheld rather than shown as established alignment.

## Validation

- 1,152 unit and contract tests pass across 70 files.
- Production build, TypeScript, lint, formatting, and standards checks pass. The standards gate explicitly reports existing migration debt; it does not hide it.
- All 21 Chromium browser tests pass against the production build: lesson completion/reload, offline reading, feedback/reset, guest auth/certificate routes, flashcard review persistence, cross-tab reset, and 15 route smoke checks.
- Full dependency audit: zero reported vulnerabilities.
- All 24 Digital Literacy MDX lessons compile; all eight new executable examples produce their expected output.

The original lesson smoke route was incorrectly rendering a streamed 404 and is now checked against actual content.

Staged PostgreSQL tests execute the relevant baseline migrations plus files 014–019 and assert signup, duplicate feedback delivery, message constraints, private inbox access, tenant isolation, progress RPC ownership, admin read/moderation, vote insert/update/delete counters, and repeated append-only sync.

## Remaining product and deployment work

- **Live schema reconciliation and deployment:** inspect the actual hosted schema before applying staged SQL. These files reconstruct missing contracts; they are not copies of previously private migrations. Existing global keys or overlapping migration numbers must be reconciled explicitly. See [staged database notes](supabase/staged/README.md).
- **Curriculum migration:** 403 existing lessons still lack explicit prerequisites/outcomes; additional structural findings and 65 standards mappings await semantic review. [The conformance inventory](standards/pedagogy/CONFORMANCE.md) lists the precise debt and regression gate. Passing structural tests is not certification of full pedagogical quality.
- **Trusted credential issuance:** server-verified assessment evidence and an issuance trust model are still needed before certificates can attest external credentials. A learner-writable registry is not a trusted issuer.
- **Dependency major upgrades:** GitHub has no open issues and ten open dependency PRs at review time. Framework/toolchain major updates such as [Next 16](https://github.com/Durwood-Studios/Dura/pull/9) and [TypeScript 6](https://github.com/Durwood-Studios/Dura/pull/5) remain separate compatibility work; security patches are handled in this branch.

## Review boundary

Dustin Snellings should review auth/session handling, cross-device sync, analytics query changes, encryption transaction changes, the service-worker configuration, standards inventory, and staged SQL before merge. No secrets or service-role credentials were added. Historical applied migrations, AGENTS.md, and CODEOWNERS are unchanged. The work fixes evidenced defects; it does not claim that every possible bug or production configuration issue has been eliminated.
