-- 010-realtime.sql
-- Enable Supabase Realtime on selected tables and create an activity feed
-- driven by database triggers.
--
-- Realtime presence (e.g. "who's online") uses Supabase channels and does
-- NOT require table changes — it works out of the box. This migration adds
-- the profiles table to the realtime publication so clients can subscribe
-- to profile changes (avatar updates, display name changes, etc.).
--
-- The activity_feed table stores a per-user event log populated
-- automatically via triggers when milestones occur (lesson completed,
-- phase completed, streak milestone, etc.).

-- ---------------------------------------------------------------------------
-- Realtime publication
-- ---------------------------------------------------------------------------

-- Add profiles to the Supabase Realtime publication so changes broadcast
-- to subscribed clients (useful for presence indicators & live profile sync)
alter publication supabase_realtime add table public.profiles;

-- ---------------------------------------------------------------------------
-- Activity feed table
-- ---------------------------------------------------------------------------

create table public.activity_feed (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  event_type text        not null,   -- 'lesson_completed', 'phase_completed', 'cert_earned', 'streak_milestone'
  title      text        not null,   -- Human-readable headline
  detail     text,                   -- Optional longer description
  metadata   jsonb       default '{}',
  created_at timestamptz default now()
);

-- RLS: users can only see their own feed
alter table public.activity_feed enable row level security;

create policy "Users read own feed"
  on public.activity_feed
  for select to authenticated
  using (user_id = auth.uid());

-- Allow authenticated inserts scoped to the user's own ID
-- (triggers run as SECURITY DEFINER so they bypass RLS, but this policy
-- also permits client-side inserts for custom events if needed)
create policy "Users insert own feed"
  on public.activity_feed
  for insert to authenticated
  with check (user_id = auth.uid());

-- Index for fast feed retrieval sorted by recency
create index idx_activity_feed_user
  on public.activity_feed (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Trigger: auto-log lesson completions into the activity feed
-- ---------------------------------------------------------------------------

create or replace function public.handle_lesson_completed()
returns trigger as $$
begin
  -- Only fire when completed_at transitions from null to a real timestamp
  if NEW.completed_at is not null and OLD.completed_at is null then
    insert into public.activity_feed (user_id, event_type, title, detail, metadata)
    values (
      NEW.user_id,
      'lesson_completed',
      'Completed a lesson',
      'Lesson ' || NEW.lesson_id || ' in Phase ' || NEW.phase_id,
      jsonb_build_object(
        'lesson_id', NEW.lesson_id,
        'phase_id',  NEW.phase_id,
        'module_id', NEW.module_id
      )
    );
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

-- Attach the trigger to lesson_progress updates
create trigger on_lesson_completed
  after update on public.lesson_progress
  for each row
  execute function public.handle_lesson_completed();
