-- Disposable test fixture only; no Storage API or physical object deletion is simulated.
create schema storage;
create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null,
  name text not null,
  owner_id text
);
alter table storage.objects enable row level security;
grant usage on schema storage to authenticated;
grant select, insert, delete on storage.objects to authenticated;
create policy fixture_read on storage.objects for select to authenticated using(true);
create policy fixture_insert on storage.objects for insert to authenticated
with check (split_part(name,'/',1)=auth.uid()::text);
