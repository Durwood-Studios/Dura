-- Disposable PostgreSQL test database only. Simulates Supabase auth claims.
-- Roles belong to the cluster, while each harness has its own database.
-- Reuse only unprivileged test roles; never silently weaken an existing role.
do $$
declare role_name text;
begin
  foreach role_name in array array['anon', 'authenticated'] loop
    if not exists (select 1 from pg_roles where rolname = role_name) then
      execute format('create role %I nologin', role_name);
    elsif exists (
      select 1 from pg_roles where rolname = role_name
      and (rolsuper or rolbypassrls or rolcreaterole or rolcreatedb or rolcanlogin)
    ) then
      raise exception 'Refusing privileged test role %', role_name;
    end if;
  end loop;
end $$;
create schema auth;
create table auth.users (
  id uuid primary key,
  email text,
  raw_user_meta_data jsonb not null default '{}'::jsonb
);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
create function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb)
$$;
grant usage on schema public, auth to anon, authenticated;
grant execute on function auth.uid(), auth.jwt() to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
