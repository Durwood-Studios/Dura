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

## Additional Migrations (Free Tier Features)

Run these after the core migrations above:

- `009-storage.sql` — Avatar and certificate file storage buckets
- `010-realtime.sql` — Presence tracking and activity feed table with auto-triggers
- `011-vectors.sql` — pgvector extension for semantic search across all content
- `012-auth-metadata.sql` — Instant preferences sync via auth user metadata
- `013-moat-features.sql` — Difficulty calibration, community annotations, research analytics views

## Free Tier Limits & Graceful Degradation

DURA is designed to run permanently on the Supabase free tier. The guard module (`src/lib/supabase/guard.ts`) provides:

**Circuit Breaker:** After N consecutive failures per feature, stop calling that feature for a cooldown period. The app continues working from IndexedDB.

| Feature        | Max Failures | Cooldown |
| -------------- | ------------ | -------- |
| Auth           | 3            | 60s      |
| Database       | 5            | 30s      |
| Storage        | 3            | 120s     |
| Realtime       | 3            | 300s     |
| Edge Functions | 3            | 60s      |
| Search         | 5            | 60s      |

**Free Tier Limits (2026):**

| Resource       | Limit          | DURA Usage                            |
| -------------- | -------------- | ------------------------------------- |
| Database       | 500MB          | ~50MB at 10K users                    |
| Auth           | 50K MAU        | Unlikely to hit                       |
| Storage        | 1GB files      | Avatars + certs ~200MB at 10K users   |
| Realtime       | 200 concurrent | Fine for early growth                 |
| Edge Functions | 500K/month     | Streak reminders ~30K/month at 1K DAU |
| API            | 500 req/s      | Unlikely to hit                       |

**Upgrading:** When growth demands it, the guard module has hooks for cost tier awareness. The `FREE_TIER_LIMITS` constants in `guard.ts` can be updated to match Pro/Team tier limits. No code changes needed — just update the numbers.

**Rule:** If Supabase is down, rate-limited, or the free tier is exhausted, the user experience does not degrade. Every Supabase feature has an IDB fallback. The app is local-first.
