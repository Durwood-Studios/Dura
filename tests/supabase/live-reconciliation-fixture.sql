-- DISPOSABLE LOCAL DATABASE ONLY: reconstructed subset of observed live metadata.
-- Apply after bootstrap and baseline001–006/013; this is not a hosted schema dump.
alter table public.profiles add column email text;
create table public.feedback (
 id uuid primary key default gen_random_uuid(),
 user_id uuid references auth.users(id) on delete set null,
 message text not null check(char_length(message) between 1 and 2000),
 category text not null default 'general' check(category in('bug','feature','content','general')),
 page_url text,
 created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;
create policy "Insert own feedback" on public.feedback for insert to anon,authenticated
 with check(user_id is null or user_id=auth.uid());
create policy admin_read_feedback on public.feedback for select to authenticated
 using((auth.jwt()->'app_metadata'->'is_admin')='true'::jsonb);
create policy admin_read_annotations on public.annotations for select to authenticated
 using((auth.jwt()->'app_metadata'->'is_admin')='true'::jsonb);
create policy admin_update_annotations on public.annotations for update to authenticated
 using((auth.jwt()->'app_metadata'->'is_admin')='true'::jsonb)
 with check((auth.jwt()->'app_metadata'->'is_admin')='true'::jsonb and status in('pending','approved','rejected','promoted'));
-- Simulate independently granted column permissions; REVOKE UPDATE on the table
-- alone must not leave these allowing learner-written counter changes.
grant update(id,user_id,lesson_id,annotation_type,content,upvotes,downvotes,status,created_at,updated_at)
 on public.annotations to anon,authenticated;
