-- STAGED ONLY. Aggregate within PostgreSQL so API row caps cannot truncate charts.
begin;
create function public.admin_learning_report() returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare result jsonb; today timestamptz := date_trunc('day', now() at time zone 'UTC') at time zone 'UTC';
begin
  if not public.current_account_exists() or (auth.jwt()->'app_metadata'->>'is_admin') is distinct from 'true' then
    raise exception 'Administrator access required' using errcode='42501';
  end if;
  with days as (select generate_series(today-interval '29 days',today,interval '1 day') as day),
  events as (select name,user_id,timestamp,properties from public.analytics_events
    where timestamp >= extract(epoch from today-interval '29 days')*1000 and timestamp <= extract(epoch from now())*1000),
  event_days as (select to_char(to_timestamp(timestamp/1000.0) at time zone 'UTC','YYYY-MM-DD') as day,count(*) as value from events group by 1),
  signup_days as (select to_char(created_at at time zone 'UTC','YYYY-MM-DD') as day,count(*) as value from public.profiles where created_at >= today-interval '29 days' and created_at <= now() group by 1),
  names as (select name as label,count(*) as value from events group by name order by count(*) desc,name limit 10),
  lessons as (select coalesce(properties->>'lessonId','(unknown lesson)') as label,count(*) as value from events where name='lesson_started' group by 1 order by count(*) desc,1 limit 20),
  searches as (select coalesce(properties->>'query','(no term)') as label,count(*) as value from events where name='dictionary_searched' group by 1 order by count(*) desc,1 limit 20),
  quizzes as (select coalesce(properties->>'lessonId',name) as label,count(*) as value from events where name in ('quiz_started','quiz_completed','quiz_answered') group by 1 order by count(*) desc,1 limit 20)
  select jsonb_build_object(
    'eventCount',(select count(*) from events),
    'dau',(select count(distinct user_id) from events where timestamp>=extract(epoch from today)*1000),
    'wau',(select count(distinct user_id) from events where timestamp>=extract(epoch from now()-interval '7 days')*1000),
    'distinctNames',(select count(distinct name) from events),
    'eventsPerDay',(select jsonb_agg(jsonb_build_object('date',to_char(d.day at time zone 'UTC','YYYY-MM-DD'),'value',coalesce(e.value,0)) order by d.day) from days d left join event_days e on e.day=to_char(d.day at time zone 'UTC','YYYY-MM-DD')),
    'signupsPerDay',(select jsonb_agg(jsonb_build_object('date',to_char(d.day at time zone 'UTC','YYYY-MM-DD'),'value',coalesce(s.value,0)) order by d.day) from days d left join signup_days s on s.day=to_char(d.day at time zone 'UTC','YYYY-MM-DD')),
    'topEvents',coalesce((select jsonb_agg(to_jsonb(n)) from names n),'[]'::jsonb),
    'lessons',coalesce((select jsonb_agg(to_jsonb(n)) from lessons n),'[]'::jsonb),
    'searches',coalesce((select jsonb_agg(to_jsonb(n)) from searches n),'[]'::jsonb),
    'quizzes',coalesce((select jsonb_agg(to_jsonb(n)) from quizzes n),'[]'::jsonb)
  ) into result;
  return result;
end;
$$;
revoke all on function public.admin_learning_report() from public,anon;
grant execute on function public.admin_learning_report() to authenticated;
commit;
