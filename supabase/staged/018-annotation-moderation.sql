-- STAGED: make the existing admin moderation action usable while preventing
-- authors from inserting already-approved annotations or editing vote totals.
begin;

drop policy "Create own annotations" on public.annotations;
create policy "Create own annotations" on public.annotations
  for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending' and upvotes = 0 and downvotes = 0);
create policy "Read own annotations" on public.annotations
  for select to authenticated using (user_id = auth.uid());
create policy "admin_read_annotations" on public.annotations
  for select to authenticated
  using ((auth.jwt() -> 'app_metadata' -> 'is_admin') = 'true'::jsonb);
create policy "admin_update_annotations" on public.annotations
  for update to authenticated
  using ((auth.jwt() -> 'app_metadata' -> 'is_admin') = 'true'::jsonb)
  with check ((auth.jwt() -> 'app_metadata' -> 'is_admin') = 'true'::jsonb);

revoke update on public.annotations from authenticated;
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

commit;
