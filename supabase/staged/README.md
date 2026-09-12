# Staged database repairs

These files are reviewable proposals for the contracts used by the app. They have **not been applied to production**. They reconstruct missing repository setup; they are not recovered copies of the original private migrations.

Before applying anything, export the live schema and compare tables, columns, indexes, grants, functions, and policies. Migration numbers referenced by older private notes may already exist with different contents. Do not mark these applied or run them over that schema blindly. Each file is transactional. Existing additive tables intentionally fail rather than hiding incompatible definitions.

| File | Change                                                               | Data affected                                                                            |
| ---- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 014  | Rename legacy analytics table; ensure tenant-scoped conflict indexes | Preserves analytics/XP/review/certificate rows; conflicting schemas abort                |
| 015  | Tutorial progress, Dojo sessions, concept retention tables           | New optional learner records, owner-only RLS                                             |
| 016  | Feedback inbox and insert-only retry-safe RPC                        | New private feedback rows; anonymous submission, no client read/update                   |
| 017  | Admin read policies                                                  | Allows JWT app_metadata.is_admin=true to read feedback, analytics, profiles and progress |
| 018  | Annotation moderation, column grants and vote totals                 | Enables moderation; prevents author self-approval; reconciles and maintains vote totals  |
| 019  | Profile email column and progress RPC caller permissions             | Fixes new-signup trigger; prevents cross-account progress writes                         |

Apply missing changes in numeric order only after schema reconciliation and human review. Do not edit historical migrations to make a deployed database appear aligned. No service-role key is needed in the application, and no deployment automation applies these files.

Feedback uses `POST /rest/v1/rpc/submit_feedback` with `p_id` (stable client UUID), `p_message`, `p_category`, `p_page_url`, and `p_created_at` (ISO timestamp). The function inserts once and returns no inbox data; a replay with the same ID is a no-op. Message length is 1–2,000 trimmed characters and page URLs must be local paths of at most 2,048 characters. Only the table owner function and verified admin read policy can access the inbox; clients cannot directly select or mutate it.

The text-search fallback now uses `content_embeddings`, whose public metadata columns already exist in migration 011. An empty/unseeded table still returns no results; populating search metadata and generating semantic vectors remain deployment/content tasks.

To validate locally, create a **fresh disposable PostgreSQL database**, set `DURA_TEST_DATABASE_URL` to its local URL, then run `bash scripts/check-staged-supabase.sh`. The harness creates mock Supabase auth roles/functions, applies only relevant baseline dependencies and every staged file, then verifies signup, repeat delivery, message validation, owner isolation, admin access, moderation, and progress RPC ownership. CI runs the same harness against PostgreSQL 17 without production credentials. The test auth shim does not validate actual JWT issuance, hosted grants, storage, realtime, or production schema drift.

Migration 014 rejects global unique IDs on learner event/certificate tables rather than silently retaining cross-account conflicts. Replacing an existing global key requires explicit schema reconciliation. Migration 018 backfills annotation vote totals and maintains them atomically on vote insert/change/delete; users may vote only on published annotations.

## Certificate issuance boundary

Public `/api/verify/sign` now always returns `503 trusted-issuance-unavailable`. Its old arbitrary-client-hash signing behavior could not prove learner identity or assessment completion. Offline certificates still save, print, and share as learner-controlled records. Historical signatures remain checkable only as hash receipts, with unavailable checks distinct from invalid signatures. Existing hashes omit some displayed fields, so their receipt does not attest the complete certificate.

Trusted credential issuance is deferred until a separately designed authority validates assessment evidence, authorizes issuance, signs a versioned canonical payload covering every claim, and defines revocation. The public registry is learner-written and cannot serve as trusted evidence. Historical hashes remain unchanged so existing links continue working.
