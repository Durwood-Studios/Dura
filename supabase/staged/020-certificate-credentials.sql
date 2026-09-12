-- STAGED ONLY: preserve optional signed certificate claims across device sync.
-- Tokens are public proof artifacts, not API credentials. Their presence in a
-- learner-writable row never establishes trust; the application verifies them.
begin;
alter table public.certificates add column if not exists server_credential text;
do $$ begin
  if exists (select 1 from pg_attribute where attrelid='public.certificates'::regclass
      and attname='server_credential' and not attisdropped and atttypid <> 'text'::regtype) then
    raise exception 'Existing server_credential column is incompatible; reconcile before applying 020';
  end if;
end $$;
alter table public.certificates drop constraint if exists certificates_server_credential_length;
alter table public.certificates add constraint certificates_server_credential_length
  check (server_credential is null or char_length(server_credential) between 1 and 8192);

-- PostgreSQL cannot add an OUT column using CREATE OR REPLACE. No CASCADE:
-- unknown dependents cause a rollback and require explicit reconciliation.
drop function public.get_certificate_by_hash(text);
create function public.get_certificate_by_hash(hash text)
returns table (
  id text, phase_id text, user_id uuid, display_name text, phase_title text,
  score real, total_questions integer, completed_at bigint,
  verification_hash text, standards text[], server_credential text
)
language sql stable security definer set search_path = ''
as $$
  select c.id,c.phase_id,c.user_id,c.display_name,c.phase_title,c.score,
    c.total_questions,c.completed_at,c.verification_hash,c.standards,c.server_credential
  from public.certificates c where c.verification_hash=hash limit 1;
$$;
revoke all on function public.get_certificate_by_hash(text) from public;
grant execute on function public.get_certificate_by_hash(text) to anon, authenticated;
commit;
