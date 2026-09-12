-- Run only against the disposable database initialized with bootstrap.sql.
-- Any broken assertion aborts psql/CI; no live credentials are used.
insert into auth.users(id) values
  ('11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222222');

set role anon;
select public.submit_feedback('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'Offline retry', 'bug', '/settings', now());
select public.submit_feedback('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'Offline retry', 'bug', '/settings', now());
do $$ begin
  begin
    perform * from public.feedback;
    raise exception 'Anonymous feedback read was allowed';
  exception when insufficient_privilege then null; end;
  begin
    perform public.submit_feedback(gen_random_uuid(), ' ', 'bug', '/settings', now());
    raise exception 'Empty feedback was accepted';
  exception when check_violation then null; end;
end $$;
reset role;
do $$ begin
  if (select count(*) from public.feedback) <> 1 then
    raise exception 'Feedback retry duplicated the row';
  end if;
end $$;

set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false);
select set_config('request.jwt.claims', '{"app_metadata":{},"user_metadata":{"is_admin":true}}', false);
insert into public.tutorial_progress(id,user_id,slug,type,current_step,total_steps,started_at,last_active_at)
values ('tutorial-a',auth.uid(),'first-app','tutorial',1,3,1000,2000)
on conflict (user_id,id) do update set current_step=excluded.current_step;
insert into public.dojo_sessions(id,user_id,started_at,completed_at,tier,avg_score)
values ('dojo-a',auth.uid(),1000,2000,'T3',7);
insert into public.analytics_events(id,user_id,name,timestamp)
values ('event-a',auth.uid(),'lesson_started',1000) on conflict(user_id,id) do nothing;
insert into public.analytics_events(id,user_id,name,timestamp)
values ('event-a',auth.uid(),'lesson_started',1000) on conflict(user_id,id) do nothing;
insert into public.annotations(id,user_id,lesson_id,annotation_type,content)
values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',auth.uid(),'lesson-a','tip','Try this');
do $$ begin
  if (select count(*) from public.feedback) <> 0 then
    raise exception 'User metadata incorrectly grants admin access';
  end if;
  begin
    insert into public.annotations(user_id,lesson_id,annotation_type,content,status)
    values (auth.uid(),'lesson-a','tip','Self approved','approved');
    raise exception 'Author self-approved on insert';
  exception when insufficient_privilege then null; end;
  begin
    update public.annotations set upvotes=100 where user_id=auth.uid();
    raise exception 'Author changed vote totals';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', false);
do $$ begin
  if (select count(*) from public.tutorial_progress) <> 0
     or (select count(*) from public.dojo_sessions) <> 0
     or (select count(*) from public.analytics_events) <> 0 then
    raise exception 'Learner data leaked across accounts';
  end if;
  begin
    insert into public.dojo_sessions(id,user_id,started_at,completed_at,tier,avg_score)
    values ('foreign', '11111111-1111-4111-8111-111111111111',1000,2000,'T3',7);
    raise exception 'Cross-account write allowed';
  exception when insufficient_privilege then null; end;
end $$;
-- The progress RPC must obey the same ownership policy as table writes.
do $$ begin
  begin
    perform public.sync_progress('11111111-1111-4111-8111-111111111111',
      '[{"lessonId":"foreign","phaseId":"0","moduleId":"0-1","startedAt":1000,"scrollPercent":0,"timeSpentMs":0,"quizPassed":false,"xpEarned":0}]'::jsonb);
    raise exception 'Progress RPC bypassed row ownership';
  exception when insufficient_privilege then null; end;
end $$;
select public.sync_progress(auth.uid(),
  '[{"lessonId":"mine","phaseId":"0","moduleId":"0-1","startedAt":1000,"scrollPercent":90,"timeSpentMs":10000,"quizPassed":true,"xpEarned":10}]'::jsonb);
do $$ begin
  if not exists(select 1 from public.lesson_progress where lesson_id='mine' and quiz_passed) then
    raise exception 'Valid progress sync failed';
  end if;
end $$;
-- A separate learner may reuse a local event ID without losing their record.
insert into public.analytics_events(id,user_id,name,timestamp)
values ('event-a',auth.uid(),'lesson_started',1000) on conflict(user_id,id) do nothing;
select set_config('request.jwt.claims', '{"app_metadata":{"is_admin":true}}', false);
do $$ begin
  if (select count(*) from public.feedback) <> 1 then
    raise exception 'Admin cannot read feedback';
  end if;
  if (select count(*) from public.analytics_events) <> 2 then
    raise exception 'Admin analytics or tenant-scoped deduplication failed';
  end if;
end $$;
update public.annotations set status='approved'
where id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
do $$ begin
  if not exists(select 1 from public.annotations where status='approved') then
    raise exception 'Admin moderation did not update annotation';
  end if;
end $$;
reset role;

set role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', false);
select set_config('request.jwt.claims', '{"app_metadata":{}}', false);
insert into public.annotation_votes(annotation_id,user_id,vote)
values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',auth.uid(),1);
do $$ begin
  if not exists(select 1 from public.annotations where id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' and upvotes=1 and downvotes=0) then
    raise exception 'Vote totals did not increment';
  end if;
end $$;
insert into public.annotation_votes(annotation_id,user_id,vote)
values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',auth.uid(),-1)
on conflict(annotation_id,user_id) do update set
  annotation_id=excluded.annotation_id,user_id=excluded.user_id,vote=excluded.vote;
do $$ begin
  if not exists(select 1 from public.annotations where id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' and upvotes=0 and downvotes=1) then
    raise exception 'Changed vote did not update totals';
  end if;
end $$;
delete from public.annotation_votes where user_id=auth.uid();
do $$ begin
  if not exists(select 1 from public.annotations where id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' and upvotes=0 and downvotes=0) then
    raise exception 'Deleted vote did not update totals';
  end if;
end $$;
reset role;

set role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', false);
select set_config('request.jwt.claims', '{"app_metadata":{}}', false);
insert into public.annotations(id,user_id,lesson_id,annotation_type,content)
values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc',auth.uid(),'lesson-a','tip','Pending');
do $$ begin
  begin
    insert into public.annotation_votes(annotation_id,user_id,vote)
    values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc',auth.uid(),1);
    raise exception 'Pending annotation accepted vote';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.annotation_votes(annotation_id,user_id,vote)
    values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','11111111-1111-4111-8111-111111111111',1);
    raise exception 'Vote impersonation allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

set role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', false);
insert into public.review_logs(id,user_id,card_id,rating,reviewed_at,state)
values ('review-retry',auth.uid(),'card-a','good',1000,'review')
on conflict(user_id,id) do nothing;
insert into public.review_logs(id,user_id,card_id,rating,reviewed_at,state)
values ('review-retry',auth.uid(),'card-a','good',1000,'review')
on conflict(user_id,id) do nothing;
insert into public.assessment_results(id,user_id,type,target_id,score,total_questions,correct_count,passed,started_at,completed_at,time_spent_ms)
values ('assessment-retry',auth.uid(),'phase-verification','0',1,1,1,true,1000,2000,1000)
on conflict(user_id,id) do nothing;
insert into public.assessment_results(id,user_id,type,target_id,score,total_questions,correct_count,passed,started_at,completed_at,time_spent_ms)
values ('assessment-retry',auth.uid(),'phase-verification','0',1,1,1,true,1000,2000,1000)
on conflict(user_id,id) do nothing;
do $$ begin
  if (select count(*) from public.review_logs where id='review-retry') <> 1
     or (select count(*) from public.assessment_results where id='assessment-retry') <> 1 then
    raise exception 'Append-only replay was not deduplicated';
  end if;
end $$;
reset role;
