# Migrations

DURA has no automated migration runner. Every migration is applied **by hand** in the
Supabase SQL editor. These two folders are the only record of what has and hasn't been run,
so keeping them accurate is the whole point.

```
migrations/
  Need To Run/    <- staged SQL, not yet applied. Paste into the SQL editor.
  Already Ran/    <- applied against the live project. Move files here after they succeed.
```

## Workflow

1. New migration lands in **`Need To Run/`**.
2. Open the [Supabase SQL editor](https://supabase.com/dashboard/project/_/sql), paste the
   file, run it.
3. On success, `git mv` the file into **`Already Ran/`** and commit that move.
4. If it fails, leave it in `Need To Run/` and fix forward — never edit a file that has
   already moved to `Already Ran/`.

Step 3 is the one that gets skipped. A file sitting in `Need To Run/` that was actually
applied is worse than no record at all.

## How the current split was determined (2026-09-03)

Files were sorted by probing the live PostgREST schema cache with the anon key —
`404 PGRST205` means the object does not exist, `200` means it does. That is evidence for
**table-creating** migrations only. Policies, functions, indexes, and `create or replace`
statements are invisible to this probe, so anything policy- or function-only is marked
**unverified** and was placed in `Need To Run/` on the safe assumption that not running a
needed migration is worse than re-running an idempotent one.

| File                                       | Evidence                                                                                                          | Verdict                         |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `014-reconciliation.sql`                   | `streaks` 200, `analytics_events` 200, `analytics` 404, `activity` 200, `activity_feed` 404, `profiles.email` 200 | **Applied** — renames completed |
| `016-feedback.sql`                         | `feedback` 200                                                                                                    | **Applied**                     |
| `20260629000004_tutorial_progress.sql`     | `tutorial_progress` 200                                                                                           | **Applied**                     |
| `20260630000001_rate_limits.sql`           | `rate_limits` **404**                                                                                             | **Not applied** — proven        |
| `015-function-fixes.sql`                   | functions not probeable                                                                                           | Unverified                      |
| `017-admin-rls.sql`                        | policies not probeable                                                                                            | Unverified                      |
| `20260629000001_security_hardening.sql`    | `create or replace` only                                                                                          | Unverified                      |
| `20260629000002_rls_performance.sql`       | policies not probeable                                                                                            | Unverified                      |
| `20260629000003_infrastructure.sql`        | index not probeable                                                                                               | Unverified                      |
| `20260629000005_admin_annotations_rls.sql` | policies not probeable                                                                                            | Unverified                      |

`001`–`013` were already in this directory and are assumed applied; they were moved into
`Already Ran/` unchanged.

## Re-run safety

Because six of the seven staged files are unverified, you may re-run one that already
landed. Most are written to tolerate that:

| File                                       | Safe to re-run?                                                          |
| ------------------------------------------ | ------------------------------------------------------------------------ |
| `20260630000001_rate_limits.sql`           | Yes — `create table/index if not exists`, and it is proven absent anyway |
| `20260629000001_security_hardening.sql`    | Yes — `create or replace` + `drop policy if exists` first                |
| `20260629000002_rls_performance.sql`       | Yes — every `create policy` is preceded by `drop policy if exists`       |
| `20260629000003_infrastructure.sql`        | Yes — `create index if not exists`                                       |
| `015-function-fixes.sql`                   | Yes — `create or replace function`                                       |
| `017-admin-rls.sql`                        | **No** — bare `create policy`, errors `42710` if applied                 |
| `20260629000005_admin_annotations_rls.sql` | **No** — bare `create policy`, errors `42710` if applied                 |

## ⚠️ Known conflict: `017` vs `20260629000005`

Both files create a policy named **`admin_read_annotations` on `public.annotations`**, and
the two definitions are byte-for-byte equivalent in effect. Both files are wrapped in
`begin; … commit;`, so whichever runs second **rolls back entirely** — you would silently
lose the other statements in that file, not just the duplicate.

Neither run order works on its own. Do this instead:

1. Run **`017-admin-rls.sql`** in full. It creates five policies including
   `admin_read_annotations`.
2. Do **not** run `20260629000005_admin_annotations_rls.sql` as-is. It has exactly one
   statement that `017` does not cover — run only this:

   ```sql
   create policy "admin_update_annotations" on public.annotations
     for update to authenticated
     using (
       (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
     )
     with check (
       (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
       and status in ('pending', 'approved', 'rejected', 'promoted')
     );
   ```

3. Move both files into `Already Ran/` once step 1 and 2 succeed.

## Schema drift audit (2026-09-03)

Every table the query layer touches (`.from("…")` across `src/`) was probed against the live
project, and every object the migrations create was probed back the other way. Result: **no
migration file is missing, and no table-creating migration is unapplied except
`20260630000001_rate_limits.sql`.** All four RPCs the code calls — `sync_progress`,
`update_user_preferences`, `get_certificate_by_hash`, `recalculate_difficulty` — are defined
in migrations.

Three mismatches survive, none of them a missing file:

- **`content_index` does not exist and never has.** `src/lib/supabase/queries/search.ts:101`
  queries it; `011-vectors.sql` defines `content_embeddings` instead. `014-reconciliation.sql`
  explicitly flags this as _not_ a rename — the two are different concepts — and defers the
  call to the go-live runbook. Impact today is zero: neither `searchContent` nor
  `textSearchContent` has a single caller, and the query is wrapped in a try/catch that
  returns `[]`. Wire search up without resolving this and text search silently finds nothing.
  Decide between pointing search at `content_embeddings` (it already has `title` and
  `body_preview`) or adding a `content_index` view over it.
- **`skill_assessments` and `track_progress` are orphans.** Both exist in the database with
  RLS, and no code reads or writes either. Build the query layer or drop the tables.
- **`avatars` is a storage bucket, not a table** (`009-storage.sql`). It shows up in a naive
  `.from()` grep because `supabase.storage.from()` shares the method name. Not a defect —
  noted so the next audit doesn't chase it.

The reverse direction has a hard limit worth knowing: enumerating every table actually in the
database needs PostgREST's OpenAPI root, which now requires a **secret** key. Per Rule 4 this
project has none, so a table created ad hoc in the SQL editor — referenced by neither the code
nor any migration — would not show up in this audit. Everything the code depends on is
covered; unreferenced strays are not.

## Contract test

`tests/learner-record/row-contracts.test.ts` parses every `.sql` file under this directory
**recursively, including `Need To Run/`** — DDL is contract-checked before it is applied,
not after. If you add a `bigint` column annotated `-- epoch ms`, add it to
`EPOCH_MS_COLUMNS` in `src/lib/supabase/row-contracts.ts` or the test fails.

Two known gaps in that tripwire:

- `tutorial_progress.last_active_at` is a `bigint` epoch-ms column but carries no
  `-- epoch ms` comment in either file that declares it, so the parser does not see it and
  the manifest cannot list it. Adding the comment is a no-op against the live schema, but
  it means editing an already-applied migration — left alone deliberately.
- `tutorial_progress` is declared in **both** `014-reconciliation.sql` and
  `20260629000004_tutorial_progress.sql`. Both use `if not exists`, and the column types
  and constraints are identical (only whitespace and comment text differ), so the duplicate
  is harmless. The test dedupes columns across files because of it.
