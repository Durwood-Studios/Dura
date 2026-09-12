-- LIVE-SPECIFIC PROPOSAL for Dura ytputzzqubbaaztowyoz.
-- Reconciled against dashboard metadata observed 2026-09-12. NOT APPLIED.
-- Preserves existing learner records, policies for admin moderation, and legacy
-- direct feedback INSERT while the existing frontend is still deployed.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';

-- Hosted default ALL includes TRUNCATE (not protected by RLS), TRIGGER and
-- MAINTAIN. Preserve only application operations; service_role is unchanged.
revoke all on public.feedback, public.annotations, public.annotation_votes from public, anon, authenticated;
grant select, insert on public.feedback to anon, authenticated;
grant select on public.annotations to anon, authenticated;
grant insert, delete on public.annotations to authenticated;
grant select, insert, update, delete on public.annotation_votes to authenticated;

create function public.submit_feedback(
  p_id uuid, p_message text, p_category text, p_page_url text, p_created_at timestamptz
) returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_id is null or p_message is null or char_length(btrim(p_message)) not between 1 and 2000
    or p_category is null or p_category not in ('bug','feature','content','general')
    or p_page_url is null or char_length(p_page_url) not between 1 and 2048
    or left(p_page_url,1) <> '/' or left(p_page_url,2) = '//' or p_created_at is null then
    raise exception 'Invalid feedback submission' using errcode='22023';
  end if;
  insert into public.feedback(id,user_id,message,category,page_url,created_at)
    values(p_id,auth.uid(),p_message,p_category,p_page_url,p_created_at)
    on conflict(id) do nothing;
end;
$$;
revoke all on function public.submit_feedback(uuid,text,text,text,timestamptz) from public;
grant execute on function public.submit_feedback(uuid,text,text,text,timestamptz) to anon,authenticated;

drop policy "Create own annotations" on public.annotations;
create policy "Create own annotations" on public.annotations
  for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending' and upvotes = 0 and downvotes = 0);
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='annotations' and policyname='Read own annotations') then
    create policy "Read own annotations" on public.annotations for select to authenticated using (user_id = auth.uid());
  end if;
end $$;

revoke update on public.annotations from public, anon, authenticated;
-- Column grants survive table-level REVOKE; remove those inherited from hosted defaults too.
revoke update (id, user_id, lesson_id, annotation_type, content, upvotes, downvotes, status, created_at, updated_at) on public.annotations from public, anon, authenticated;
grant update (content, status, updated_at) on public.annotations to authenticated;

-- Votes are learner-owned, but only published annotations may receive votes.
drop policy "Users vote once" on public.annotation_votes;
create policy "Users vote once" on public.annotation_votes
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and exists (
    select 1 from public.annotations a
    where a.id = annotation_id and a.status in ('approved', 'promoted')
  ));
-- The existing PostgREST upsert includes both key columns in its update set.
-- RLS constrains the owner and target while permitting that replay contract.
grant select, insert, update, delete on public.annotation_votes to authenticated;

-- Maintain counters atomically so concurrent votes cannot overwrite one another.
-- The caller can write only their own vote; this trigger alone updates totals.
create function public.update_annotation_vote_totals() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if TG_OP in ('DELETE', 'UPDATE') then
    update public.annotations set
      upvotes = greatest(0, coalesce(upvotes, 0) - case when OLD.vote = 1 then 1 else 0 end),
      downvotes = greatest(0, coalesce(downvotes, 0) - case when OLD.vote = -1 then 1 else 0 end)
    where id = OLD.annotation_id;
  end if;
  if TG_OP in ('INSERT', 'UPDATE') then
    update public.annotations set
      upvotes = coalesce(upvotes, 0) + case when NEW.vote = 1 then 1 else 0 end,
      downvotes = coalesce(downvotes, 0) + case when NEW.vote = -1 then 1 else 0 end
    where id = NEW.annotation_id;
  end if;
  return null;
end;
$$;
revoke all on function public.update_annotation_vote_totals() from public, anon, authenticated;
create trigger annotation_vote_totals after insert or update or delete
  on public.annotation_votes for each row execute function public.update_annotation_vote_totals();

-- Reconcile votes that predate the counter trigger.
update public.annotations a set
  upvotes = (select count(*) from public.annotation_votes v where v.annotation_id=a.id and v.vote=1),
  downvotes = (select count(*) from public.annotation_votes v where v.annotation_id=a.id and v.vote=-1);


alter table public.certificates add column if not exists server_credential text;
do $$ begin
  if exists (select 1 from pg_attribute where attrelid='public.certificates'::regclass
      and attname='server_credential' and not attisdropped and atttypid <> 'text'::regtype) then
    raise exception 'Existing server_credential column is incompatible; reconcile before applying 020';
  end if;
end $$;
alter table public.certificates drop constraint if exists certificates_server_credential_length;
alter table public.certificates add constraint certificates_server_credential_length
  check (server_credential is null or char_length(server_credential) between 1 and 8192);

-- PostgreSQL cannot add an OUT column using CREATE OR REPLACE. No CASCADE:
-- unknown dependents cause a rollback and require explicit reconciliation.
drop function public.get_certificate_by_hash(text);
create function public.get_certificate_by_hash(hash text)
returns table (
  id text, phase_id text, user_id uuid, display_name text, phase_title text,
  score real, total_questions integer, completed_at bigint,
  verification_hash text, standards text[], server_credential text
)
language sql stable security definer set search_path = ''
as $$
  select c.id,c.phase_id,c.user_id,c.display_name,c.phase_title,c.score,
    c.total_questions,c.completed_at,c.verification_hash,c.standards,c.server_credential
  from public.certificates c where c.verification_hash=hash limit 1;
$$;
revoke all on function public.get_certificate_by_hash(text) from public;
grant execute on function public.get_certificate_by_hash(text) to anon, authenticated;

commit;
