-- ============================================================================
-- 016-feedback.sql  (STAGED — apply during the Supabase go-live one-shot)
--
-- Creates the feedback table for learner-submitted platform feedback.
-- Anonymous feedback is allowed (user_id nullable) so signed-out users
-- who somehow land here can still submit. RLS restricts reads to admins.
-- ============================================================================

begin;

create table if not exists public.feedback (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  message     text not null check (char_length(message) between 1 and 2000),
  category    text not null default 'general'
                check (category in ('bug', 'feature', 'content', 'general')),
  page_url    text,
  created_at  timestamptz not null default now()
);

-- Learners can insert their own feedback (or anonymous rows).
-- Nobody can read other users' feedback from the client.
alter table public.feedback enable row level security;

create policy "Insert own feedback" on public.feedback
  for insert to authenticated, anon
  with check (
    user_id is null or user_id = auth.uid()
  );

-- Admins read all feedback via service role (no client-side read policy).
-- This keeps the table append-only from the client perspective.

comment on table public.feedback is
  'Learner-submitted platform feedback. Append-only from the client; admin reads via service role or Supabase dashboard.';

commit;
