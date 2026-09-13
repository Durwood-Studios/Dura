-- STAGED ONLY. Deletes the caller's auth account and cascading learner records.
-- Files must first be removed through the Storage API, never SQL metadata deletion.
begin;

-- A deleted user's already-issued JWT remains cryptographically valid until expiry.
-- Evaluate existence outside profiles RLS to avoid recursive policy evaluation.
create function public.current_account_exists() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from auth.users where id = auth.uid());
$$;
revoke all on function public.current_account_exists() from public, anon;
grant execute on function public.current_account_exists() to authenticated;
do $$ declare relation text; begin
  foreach relation in array array['profiles','lesson_progress','module_progress','flashcards',
    'review_logs','phase_progress','assessment_results','sandbox_saves','track_progress','goals','skill_assessments','certificates','analytics_events','xp_events',
    'tutorial_progress','dojo_sessions','concept_retention','annotations','annotation_votes','feedback'] loop
    if to_regclass('public.'||relation) is not null then
      execute format('create policy "Existing account required" on public.%I as restrictive for all to authenticated using (public.current_account_exists()) with check (public.current_account_exists())', relation);
    end if;
  end loop;
end $$;

create function public.account_deletion_files(p_user_id uuid)
returns table(bucket_id text, name text)
language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid();
begin
  if actor is null or p_user_id is distinct from actor or not exists(select 1 from auth.users where id = actor) then
    raise exception 'Sign in again before deleting your account.' using errcode = '42501';
  end if;
  if not exists (
    select 1 from pg_catalog.jsonb_array_elements(
      case when pg_catalog.jsonb_typeof(auth.jwt()->'amr') = 'array'
        then auth.jwt()->'amr' else '[]'::jsonb end
    ) entry
    where entry->>'method' in ('password', 'oauth', 'otp', 'totp', 'magiclink', 'sso/saml')
      and case when entry->>'timestamp' ~ '^[0-9]{1,12}$'
        then (entry->>'timestamp')::numeric between extract(epoch from now()) - 300
          and extract(epoch from now()) + 30 else false end
  ) then
    raise exception 'Sign in again, then return to Settings within five minutes. Refreshing a session is not sufficient.' using errcode = '42501';
  end if;
  return query select o.bucket_id, o.name from storage.objects o
    where pg_catalog.to_jsonb(o)->>'owner_id' = actor::text
       or pg_catalog.to_jsonb(o)->>'owner' = actor::text
       or (o.bucket_id in ('avatars', 'certificates') and split_part(o.name, '/', 1) = actor::text);
end;
$$;
revoke all on function public.account_deletion_files(uuid) from public, anon;
grant execute on function public.account_deletion_files(uuid) to authenticated;

-- Expired accounts must not use an otherwise unexpired access token to upload
-- fresh orphaned files. Existing bucket/path policies still apply too.
create policy "Storage requires existing account" on storage.objects
as restrictive for all to authenticated
using (public.current_account_exists())
with check (public.current_account_exists());
create policy "Delete own certificate files" on storage.objects
for delete to authenticated using (
  bucket_id = 'certificates' and split_part(name, '/', 1) = auth.uid()::text
);

create function public.delete_own_account(p_user_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  -- Serialize the final emptiness check against in-flight Storage metadata writes.
  lock table storage.objects in share row exclusive mode;
  if exists(select 1 from public.account_deletion_files(p_user_id)) then
    raise exception 'Remove your uploaded files first. If removal fails, contact the site operator; your account has not been deleted.' using errcode = '55000';
  end if;
  delete from auth.users where id = auth.uid();
  if not found then
    raise exception 'Account no longer exists.' using errcode = '42501';
  end if;
end;
$$;
revoke all on function public.delete_own_account(uuid) from public, anon;
grant execute on function public.delete_own_account(uuid) to authenticated;
commit;
