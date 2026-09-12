-- Run after staged-behavior.sql in a disposable database only.
set role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
insert into public.certificates(id,user_id,phase_id,display_name,phase_title,score,
  total_questions,completed_at,verification_hash,server_credential)
values ('credential-test',auth.uid(),'0','Test Learner','Computing',1,10,1000,
  'credential-test-hash','signed-proof-fixture');
do $$ begin
  begin
    update public.certificates set server_credential=repeat('x',8193) where id='credential-test';
    raise exception 'Oversized credential accepted';
  exception when check_violation then null; end;
  begin
    update public.certificates set server_credential='' where id='credential-test';
    raise exception 'Empty credential accepted';
  exception when check_violation then null; end;
end $$;
reset role;
set role anon;
do $$ begin
  if not exists (select 1 from public.get_certificate_by_hash('credential-test-hash')
      where server_credential='signed-proof-fixture') then
    raise exception 'Public lookup lost signed proof';
  end if;
  if exists (select 1 from public.get_certificate_by_hash('unknown-hash')) then
    raise exception 'Unknown certificate hash matched';
  end if;
end $$;
reset role;
