# DURA Supabase Setup

## Prerequisites

- Supabase project created at [supabase.com](https://supabase.com)

## Setup

1. Copy `.env.example` to `.env.local`
2. Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Run migrations in order:
   - `001-profiles.sql` — User profiles (auto-created on sign-up via trigger)
   - `002-progress.sql` — Lesson, module, and phase progress tracking
   - `003-flashcards.sql` — FSRS-5 flashcards and review logs
   - `004-goals-and-assessments.sql` — Learning goals, assessment results, certificates
   - `005-analytics-and-xp.sql` — Analytics events and XP event log
   - `006-functions.sql` — Server-side RPC functions (sync_progress, get_certificate_by_hash)
   - `007-views.sql` — Aggregation views (user_stats, module_progress)
   - `008-seed.sql` — Optional seed data for development
4. Enable auth providers in the Supabase dashboard:
   - Email/Password
   - GitHub OAuth
   - Google OAuth
5. Set the **Site URL** and **Redirect URLs** in Auth settings:
   - Site URL: `http://localhost:3000` (dev) or your production URL
   - Redirect URLs: `http://localhost:3000/auth/callback`, `https://yourdomain.com/auth/callback`

## Schema

| Table                | Description                                                         |
| -------------------- | ------------------------------------------------------------------- |
| `profiles`           | User display name, email, avatar. Auto-created on sign-up.          |
| `lesson_progress`    | Per-lesson scroll %, time spent, quiz scores, completion status.    |
| `module_progress`    | Aggregated module-level completion (view or materialized).          |
| `flashcards`         | FSRS-5 spaced repetition cards with full scheduling state.          |
| `review_logs`        | Append-only log of every flashcard review.                          |
| `goals`              | User-set learning goals (daily, weekly, phase, custom).             |
| `assessment_results` | Mastery gate and phase verification exam results.                   |
| `certificates`       | Phase completion certificates with verification hashes.             |
| `analytics_events`   | Append-only behavioral analytics (lesson starts, completions, etc). |
| `xp_events`          | Append-only XP award log (lesson, quiz, flashcard, etc).            |

## RLS

All tables have Row Level Security enabled. Users can only read and write their own data. The only exception is `certificates`, which are publicly readable by verification hash via the `get_certificate_by_hash` RPC function (used by `/verify/[hash]`).

## Sync Architecture

The sync engine (`src/lib/supabase/sync.ts`) handles bidirectional sync between IndexedDB (offline-first) and Supabase (cross-device backup):

- **Push**: Local unsynced changes are pushed every 30 seconds when online
- **Pull**: Remote data is fetched and merged on sign-in and periodically
- **Conflict resolution**:
  - Lesson completion: OR (completed anywhere = completed everywhere)
  - Quiz scores: keep highest
  - Flashcard reviews: append-only (no conflicts possible)
  - Goals: highest progress wins, achievement is permanent
  - Analytics/XP: append-only with server-side deduplication

The app works fully offline. Supabase sync is optional — it adds cross-device backup for users who create an account.
