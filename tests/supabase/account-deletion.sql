-- Disposable database only, after staged contracts and existing behavior tests.
insert into auth.users(id) values ('33333333-3333-4333-8333-333333333333');
insert into storage.objects(bucket_id,name,owner_id) values
('certificates','33333333-3333-4333-8333-333333333333/certificate.pdf','33333333-3333-4333-8333-333333333333');
set role anon;
do $$ begin
  begin perform public.delete_own_account('33333333-3333-4333-8333-333333333333'); raise exception 'Anonymous deletion allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',false);
select set_config('request.jwt.claims',jsonb_build_object('iat',extract(epoch from now()),'amr',jsonb_build_array(jsonb_build_object('method','token_refresh','timestamp',extract(epoch from now())::bigint)))::text,false);
do $$ begin
  begin perform public.delete_own_account('33333333-3333-4333-8333-333333333333'); raise exception 'Refresh accepted as authentication';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims',jsonb_build_object('amr',jsonb_build_array(jsonb_build_object('method','password','timestamp',extract(epoch from now()-interval '6 minutes')::bigint)))::text,false);
do $$ begin
  begin perform public.delete_own_account('33333333-3333-4333-8333-333333333333'); raise exception 'Stale authentication accepted';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims',jsonb_build_object('amr',jsonb_build_array(jsonb_build_object('method','password','timestamp',extract(epoch from now())::bigint)))::text,false);
do $$ begin
  if (select count(*) from public.account_deletion_files('33333333-3333-4333-8333-333333333333'))<>1 then raise exception 'Wrong owned file inventory'; end if;
  begin perform public.delete_own_account('33333333-3333-4333-8333-333333333333'); raise exception 'Owned storage allowed deletion';
  exception when object_not_in_prerequisite_state then null; end;
end $$;
do $$ begin
  begin perform public.delete_own_account('22222222-2222-4222-8222-222222222222'); raise exception 'Mismatched intended account accepted';
  exception when insufficient_privilege then null; end;
end $$;
-- Simulates the metadata result after the Storage API successfully removes bytes.
delete from storage.objects where name='33333333-3333-4333-8333-333333333333/certificate.pdf';
select public.delete_own_account('33333333-3333-4333-8333-333333333333');
select set_config('request.jwt.claims','{"app_metadata":{"is_admin":true}}',false);
do $$ begin
  if exists(select 1 from public.profiles) or exists(select 1 from public.feedback) then raise exception 'Deleted admin retained private row access'; end if;
  begin
    insert into storage.objects(bucket_id,name) values ('certificates','33333333-3333-4333-8333-333333333333/new.pdf');
    raise exception 'Deleted-account JWT could upload';
  exception when insufficient_privilege then null; end;
  begin perform public.delete_own_account('33333333-3333-4333-8333-333333333333'); raise exception 'Deleted account accepted';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin
  if exists(select 1 from auth.users where id='33333333-3333-4333-8333-333333333333') then raise exception 'Account remains'; end if;
  if exists(select 1 from public.profiles where id='33333333-3333-4333-8333-333333333333') then raise exception 'Profile remains'; end if;
  if not exists(select 1 from auth.users where id='22222222-2222-4222-8222-222222222222') then raise exception 'Other account deleted'; end if;
end $$;
