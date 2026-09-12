-- STAGED: private feedback inbox, including anonymous offline submissions.
-- Client UUID is the idempotency key: replay with ON CONFLICT (id) DO NOTHING.
begin;

create table public.feedback (
  id uuid primary key,
  message text not null check (char_length(btrim(message)) between 1 and 2000),
  category text not null check (category in ('bug', 'feature', 'content', 'general')),
  page_url text not null check (char_length(page_url) between 1 and 2048 and left(page_url, 1) = '/'),
  created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;
-- Clients cannot read or mutate inbox rows directly. An insert-only RPC
-- supports retries without exposing a SELECT policy for ON CONFLICT.
revoke all on public.feedback from anon, authenticated;
create function public.submit_feedback(
  p_id uuid, p_message text, p_category text, p_page_url text, p_created_at timestamptz
) returns void
language sql security definer set search_path = ''
as $$
  insert into public.feedback(id, message, category, page_url, created_at)
  values (p_id, p_message, p_category, p_page_url, p_created_at)
  on conflict (id) do nothing;
$$;
revoke all on function public.submit_feedback(uuid, text, text, text, timestamptz) from public;
grant execute on function public.submit_feedback(uuid, text, text, text, timestamptz)
  to anon, authenticated;
create index feedback_created_at on public.feedback (created_at desc);

commit;
