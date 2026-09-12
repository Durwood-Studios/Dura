# Dura hosted schema review

Read through the authenticated Supabase SQL Editor on September 11–12, 2026.
Target: `ytputzzqubbaaztowyoz`, Dura, Durwood Studios, main production branch.
The dashboard links to `Durwood-Studios/Dura`; signed-in display is `Dub5991`.
The user expressly authorized direct work on this project. All inspection queries
used `begin read only` and `rollback`. No learner row contents or credentials
were queried. No hosted changes have been applied as of this review.

## Observed state

- The public inventory contains 24 base tables and four views. All 24 base tables
  have row-level security enabled. RLS being enabled alone does not establish that
  each policy is correct.
- `analytics_events` already exists under the correct name. Analytics, review,
  assessment, certificate and XP primary keys already use `(user_id, id)`.
- `tutorial_progress`, `dojo_sessions`, and `concept_retention` already exist with
  the expected application columns and owner policies. Do not run staged 015's
  unconditional table creation against this database.
- `profiles.email` already exists. The signup trigger writes it.
- `sync_progress(uuid,jsonb)` is security-definer but already rejects a requested
  user ID distinct from `auth.uid()`. It uses epoch-millisecond values correctly.
  Anonymous execution is granted, though the caller guard and table constraints
  limit useful anonymous writes. Do not report the earlier unguarded function as
  the live implementation.
- `get_certificate_by_hash(text)` exists with the original ten result columns,
  security-definer, empty search path, and anonymous/authenticated execution.
  `certificates.server_credential` is absent.
- `submit_feedback` and `update_annotation_vote_totals` are absent. There are no
  non-internal triggers on `annotations` or `annotation_votes`.

## Feedback compatibility

The existing feedback table has `id uuid` (generated default, not null), nullable
`user_id uuid` referencing `auth.users` with delete-set-null, non-null `message`,
non-null `category` defaulting to `general`, nullable `page_url`, and non-null
`created_at` defaulting to `now()`. Its checks cover untrimmed message length
1–2000 and the four categories bug/feature/content/general.

`Insert own feedback` permits anon/authenticated inserts where `user_id` is null
or equals the caller. `admin_read_feedback` uses the trusted JWT app-metadata admin
flag. The deployed client may still rely on direct inserts: preserve that path
while adding the validated retry-safe RPC. Tightening existing nullable columns
or invalidating historical feedback is unnecessary for the new RPC.

## Annotation compatibility

`Create own annotations` checks ownership only, so it does not require a newly
inserted annotation to remain pending. `Update own pending` requires ownership
and pending status before and after an update. Published annotations are readable;
an owner-specific SELECT policy is absent. Existing admin SELECT/UPDATE policies
use trusted app metadata. Allowed status values are pending/approved/rejected/promoted.

`Users vote once` is an owner-only ALL policy without a published-annotation
condition. Counts have no maintenance trigger. Insert/update column privileges
currently permit callers to supply counters and status, subject only to RLS.

Annotations have generated non-null UUID IDs; user, lesson, type and content are
non-null. Counters are nullable with default zero; status is nullable with default
pending; timestamps are nullable with default now(). Preserve existing rows while
restricting future writes and recomputing counters from authoritative votes.

For feedback, annotations and annotation_votes, exact table ACLs grant all current
table privileges to postgres, anon, authenticated and service_role. No PUBLIC
table grants were observed. Narrowing client privileges must preserve service_role
and existing necessary client operations.

## Next action

Prepare and test a target-specific transactional patch rather than replaying the
repository setup scripts. Record the applied SQL and post-application verification
separately once execution succeeds. The earlier staged files remain proposals for
a fresh baseline, not evidence of hosted migration history.
