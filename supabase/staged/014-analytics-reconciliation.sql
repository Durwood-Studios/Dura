-- STAGED: review the actual database schema before applying. Never auto-apply.
-- Preserves events and existing RLS while aligning the table name with clients.
begin;

do $$
begin
  if to_regclass('public.analytics') is not null
     and to_regclass('public.analytics_events') is not null then
    raise exception 'Both analytics tables exist: reconcile their data manually first';
  elsif to_regclass('public.analytics') is not null then
    alter table public.analytics rename to analytics_events;
  elsif to_regclass('public.analytics_events') is null then
    raise exception 'Apply baseline migrations 001-013 before reconciliation';
  end if;
end;
$$;

-- Clients use the original tenant-scoped conflict key, not global event IDs.
-- A global unique ID still blocks another tenant even after adding an index.
-- Refuse that drift; choosing replacement keys requires explicit reconciliation.
do $$
begin
  if exists (
    select 1 from pg_catalog.pg_index i
    join pg_catalog.pg_class t on t.oid = i.indrelid
    join pg_catalog.pg_namespace n on n.oid = t.relnamespace
    join pg_catalog.pg_attribute a on a.attrelid=t.oid and a.attnum=i.indkey[0]
    where n.nspname='public'
      and t.relname in ('analytics_events','xp_events','review_logs','certificates')
      and i.indisunique and i.indnkeyatts=1 and a.attname='id'
  ) then
    raise exception 'Global unique ID found: reconcile tenant-scoped keys before applying 014';
  end if;
end;
$$;
create unique index if not exists analytics_events_user_id_id
  on public.analytics_events (user_id, id);
create unique index if not exists xp_events_user_id_id
  on public.xp_events (user_id, id);
create unique index if not exists review_logs_user_id_id
  on public.review_logs (user_id, id);
create unique index if not exists certificates_user_id_id
  on public.certificates (user_id, id);

commit;
