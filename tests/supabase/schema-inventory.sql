-- Read-only metadata snapshot. Contains no learner rows, emails, tokens or passwords.
-- Run in the selected project's SQL editor, or psql -X -qAt -f this-file > snapshot.json.
begin read only;
set local statement_timeout = '15s';
select jsonb_build_object(
  'formatVersion', 1,
  'capturedAt', now(),
  'database', current_database(),
  'schema', 'public',
  'tables', coalesce((
    select jsonb_agg(jsonb_build_object(
      'name', c.relname, 'rls', c.relrowsecurity,
      'columns', (select jsonb_agg(jsonb_build_object('name', a.attname,
        'type', format_type(a.atttypid,a.atttypmod), 'nullable', not a.attnotnull)
        order by a.attnum) from pg_attribute a where a.attrelid=c.oid and a.attnum>0 and not a.attisdropped),
      'indexes', coalesce((select jsonb_agg(pg_get_indexdef(i.indexrelid) order by i.indexrelid::regclass::text)
        from pg_index i where i.indrelid=c.oid),'[]'::jsonb),
      'constraints', coalesce((select jsonb_agg(pg_get_constraintdef(k.oid) order by k.conname)
        from pg_constraint k where k.conrelid=c.oid),'[]'::jsonb),
      'policies', coalesce((select jsonb_agg(jsonb_build_object('name', p.policyname,
        'command', p.cmd, 'roles', p.roles, 'using', p.qual, 'check', p.with_check)
        order by p.policyname) from pg_policies p where p.schemaname='public' and p.tablename=c.relname),'[]'::jsonb)
    ) order by c.relname) from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind in ('r','p')
  ),'[]'::jsonb),
  'functions', coalesce((select jsonb_agg(jsonb_build_object(
    'name', p.proname, 'arguments', pg_get_function_identity_arguments(p.oid),
    'securityDefiner', p.prosecdef, 'settings', p.proconfig,
    'definition', pg_get_functiondef(p.oid),
    'anonExecute', has_function_privilege('anon',p.oid,'EXECUTE'),
    'authenticatedExecute', has_function_privilege('authenticated',p.oid,'EXECUTE')
    ) order by p.proname, p.oid) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.prokind in ('f','p')),'[]'::jsonb),
  'grants', coalesce((select jsonb_agg(jsonb_build_object('table',table_name,
    'role',grantee,'privilege',privilege_type) order by table_name,grantee,privilege_type)
    from information_schema.role_table_grants where table_schema='public'),'[]'::jsonb),
  'migrationRegistryPresent', to_regclass('supabase_migrations.schema_migrations') is not null
) as schema_snapshot;
rollback;
