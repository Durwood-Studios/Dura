-- =============================================================================
-- 003-flashcards.sql — Flashcards and review logs
-- =============================================================================
-- Sync strategy: IDB owns scheduling state. On sync, client upserts cards and
-- appends review logs. Review logs are append-only (never updated).
-- Conflict resolution for cards: latest updated_at wins. FSRS fields come
-- from whichever device reviewed most recently.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- flashcards — mirrors IDB "flashcards" store
-- ---------------------------------------------------------------------------
create table public.flashcards (
  id              text not null,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  front           text not null,
  back            text not null,
  lesson_id       text,
  term_slug       text,
  created_at      bigint not null,                -- epoch ms
  -- FSRS-5 scheduling fields
  due             bigint not null,                -- epoch ms
  stability       real not null default 0,
  difficulty      real not null default 0,
  elapsed_days    real not null default 0,
  scheduled_days  real not null default 0,
  reps            integer not null default 0,
  lapses          integer not null default 0,
  state           text not null default 'new'
                  check (state in ('new', 'learning', 'review', 'relearning')),
  last_review     bigint,                         -- epoch ms
  updated_at      timestamptz not null default now(),

  primary key (user_id, id)
);

comment on table public.flashcards is
  'User flashcards with FSRS-5 scheduling state. Mirrors IDB flashcards store.';

alter table public.flashcards enable row level security;

create policy "flashcards: select own"
  on public.flashcards for select
  using (auth.uid() = user_id);

create policy "flashcards: insert own"
  on public.flashcards for insert
  with check (auth.uid() = user_id);

create policy "flashcards: update own"
  on public.flashcards for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "flashcards: delete own"
  on public.flashcards for delete
  using (auth.uid() = user_id);

-- Due cards query: "give me my cards due before now"
create index flashcards_by_due on public.flashcards (user_id, due);
create index flashcards_by_lesson on public.flashcards (user_id, lesson_id);
create index flashcards_by_state on public.flashcards (user_id, state);
create index flashcards_by_term on public.flashcards (user_id, term_slug)
  where term_slug is not null;

create trigger flashcards_updated_at
  before update on public.flashcards
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- review_logs — mirrors IDB "reviewLogs" store (append-only)
-- ---------------------------------------------------------------------------
create table public.review_logs (
  id              text not null,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  card_id         text not null,
  rating          text not null
                  check (rating in ('again', 'hard', 'good', 'easy')),
  reviewed_at     bigint not null,                -- epoch ms
  elapsed_days    real not null default 0,
  scheduled_days  real not null default 0,
  state           text not null
                  check (state in ('new', 'learning', 'review', 'relearning')),
  created_at      timestamptz not null default now(),

  primary key (user_id, id)
);

comment on table public.review_logs is
  'Individual review events. Append-only. Mirrors IDB reviewLogs store.';

alter table public.review_logs enable row level security;

create policy "review_logs: select own"
  on public.review_logs for select
  using (auth.uid() = user_id);

create policy "review_logs: insert own"
  on public.review_logs for insert
  with check (auth.uid() = user_id);

-- Append-only: no update policy. Users can still delete their data.
create policy "review_logs: delete own"
  on public.review_logs for delete
  using (auth.uid() = user_id);

-- Query: "all reviews for a specific card"
create index review_logs_by_card on public.review_logs (user_id, card_id);
-- Query: "recent review activity"
create index review_logs_by_reviewed on public.review_logs (user_id, reviewed_at);
