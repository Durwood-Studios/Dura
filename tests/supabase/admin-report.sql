-- Disposable fixture verifies aggregation beyond client/server pagination caps.
set role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',false);
select set_config('request.jwt.claims','{"app_metadata":{},"user_metadata":{"is_admin":true}}',false);
do $$ begin
 begin perform public.admin_learning_report(); raise exception 'User metadata granted admin report';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
insert into public.analytics_events(id,user_id,name,timestamp,properties)
select 'report-'||n,'22222222-2222-4222-8222-222222222222','lesson_started',extract(epoch from now())*1000,'{"lessonId":"0/0-1/01"}'::jsonb from generate_series(1,10001) n;
set role authenticated;
select set_config('request.jwt.claims','{"app_metadata":{"is_admin":true}}',false);
do $$ declare report jsonb; begin
 report := public.admin_learning_report();
 if (report->>'eventCount')::int <> 10001 then raise exception 'Report truncated beyond page size'; end if;
 if (report->>'dau')::int <> 1 then raise exception 'Distinct user count wrong'; end if;
 if jsonb_array_length(report->'eventsPerDay')<>30 then raise exception 'Missing zero-filled days'; end if;
 if (report->'lessons'->0->>'value')::int <>10001 then raise exception 'Real lesson_started events not counted'; end if;
end $$;
reset role;
