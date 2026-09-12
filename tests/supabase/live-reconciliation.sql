-- Disposable fixture only; preserve records and compatibility while tightening writes.
insert into auth.users(id) values('11111111-1111-4111-8111-111111111111');
do $$ begin
 if has_table_privilege('anon','public.feedback','TRUNCATE')
   or has_table_privilege('authenticated','public.annotations','TRUNCATE')
   or has_table_privilege('authenticated','public.annotation_votes','TRIGGER') then
   raise exception 'Nonapplication table grants remain';
 end if;
end $$;
set role anon;
insert into public.feedback(id,message,category,page_url) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Legacy insert','bug','/');
select public.submit_feedback('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Retry','bug','/',now());
select public.submit_feedback('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Changed replay','bug','/',now());
do $$ begin
 begin
  perform public.submit_feedback(gen_random_uuid(),' ','bug','/',now());
  raise exception 'Blank feedback accepted';
 exception when invalid_parameter_value then null; end;
 begin
  perform public.submit_feedback(gen_random_uuid(),'Valid','bug','https://example.com',now());
  raise exception 'External page URL accepted';
 exception when invalid_parameter_value then null; end;
 begin
  perform public.submit_feedback(gen_random_uuid(),'Valid','bug','//example.com',now());
  raise exception 'Protocol-relative URL accepted';
 exception when invalid_parameter_value then null; end;
 if (select count(*) from public.feedback) <> 0 then raise exception 'Anonymous inbox read'; end if;
end $$;
reset role;
do $$ begin
 if (select count(*) from public.feedback) <> 2 then raise exception 'Retry or legacy insert broken'; end if;
 if (select message from public.feedback where id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb') <> 'Retry' then raise exception 'Replay overwrote feedback'; end if;
end $$;
set role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
select public.submit_feedback('cccccccc-cccc-4ccc-8ccc-cccccccccccc','Signed in','general','/settings',now());
insert into public.annotations(id,user_id,lesson_id,annotation_type,content) values('dddddddd-dddd-4ddd-8ddd-dddddddddddd',auth.uid(),'test','tip','Pending');
do $$ begin
 if (select count(*) from public.annotations) <> 1 then raise exception 'Owner cannot read pending'; end if;
 begin
  insert into public.annotations(user_id,lesson_id,annotation_type,content,status) values(auth.uid(),'test','tip','Bypass','approved');
  raise exception 'Self approval allowed';
 exception when insufficient_privilege then null; end;
 begin
  update public.annotations set upvotes=100 where user_id=auth.uid();
  raise exception 'Column counter grant survived';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.annotation_votes(annotation_id,user_id,vote) values('dddddddd-dddd-4ddd-8ddd-dddddddddddd',auth.uid(),1);
  raise exception 'Pending vote allowed';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims','{"app_metadata":{"is_admin":true}}',false);
update public.annotations set status='approved' where id='dddddddd-dddd-4ddd-8ddd-dddddddddddd';
select set_config('request.jwt.claims','{}',false);
insert into public.annotation_votes(annotation_id,user_id,vote) values('dddddddd-dddd-4ddd-8ddd-dddddddddddd',auth.uid(),1);
update public.annotation_votes set vote=-1 where user_id=auth.uid();
do $$ begin
 if not exists(select 1 from public.annotations where upvotes=0 and downvotes=1) then raise exception 'Vote counters wrong'; end if;
end $$;
reset role;
do $$ begin
 if (select user_id from public.feedback where id='cccccccc-cccc-4ccc-8ccc-cccccccccccc') <> '11111111-1111-4111-8111-111111111111'::uuid then raise exception 'Feedback owner missing'; end if;
end $$;
