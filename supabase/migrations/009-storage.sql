-- 009-storage.sql
-- Storage buckets for user avatars and phase completion certificates.
--
-- Avatars bucket:
--   - Public read so profile photos display without auth
--   - Authenticated upload scoped to the user's own folder: avatars/{user_id}/avatar.{ext}
--   - 2 MB max, images only (enforced at the application layer; bucket-level
--     size/type restrictions require Supabase Pro — keep the policy comments
--     as documentation for when/if the project upgrades)
--
-- Certificates bucket:
--   - Public read so /verify/[hash] sharing works for anyone
--   - Authenticated upload scoped to the user's own folder
--   - 5 MB max, images + PDF (application-layer enforcement, same caveat)

-- ---------------------------------------------------------------------------
-- Buckets
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', true);

-- ---------------------------------------------------------------------------
-- Avatars — RLS policies
-- ---------------------------------------------------------------------------

-- Anyone (including anonymous visitors) can view avatars
create policy "Avatars public read"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

-- Authenticated users can upload to their own folder only
create policy "Avatar upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can replace their own avatar
create policy "Avatar update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can delete their own avatar
create policy "Avatar delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Certificates — RLS policies
-- ---------------------------------------------------------------------------

-- Anyone can view certificates (enables public /verify/[hash] page)
create policy "Certificates public read"
  on storage.objects for select
  to public
  using (bucket_id = 'certificates');

-- Authenticated users can upload certificates to their own folder
-- In practice the app creates these on phase completion, but the policy
-- ensures a user can only write to certificates/{their_user_id}/
create policy "Certificate upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'certificates'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
