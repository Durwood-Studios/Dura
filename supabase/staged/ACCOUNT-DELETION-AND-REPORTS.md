# Account deletion and exact admin reports (staged, not applied)

Apply only after operator review against the deployed schema. These files do not use a service key and must not be executed as a production test.

- `021-account-deletion.sql`: creates self-only deletion/file-inventory RPCs. Both use the verified `auth.uid()` and a signed `amr` authentication timestamp within five minutes. `iat` and `token_refresh` are insufficient. The UI removes bytes through the supported Storage API first. The final RPC locks Storage metadata writes, verifies no owned/prefixed objects remain, then deletes the caller from `auth.users`; existing foreign-key cascades remove their profile and learner records. A file removal failure leaves the account intact but can leave earlier files already removed; the UI reports that partial outcome.
- Existing-account restrictive policies cover learner/private admin tables and Storage so an already-issued JWT cannot regain private access after deletion. The predicate reads `auth.users` as its function owner, avoiding recursive profile RLS. Review the listed table inventory when adding new private tables. Public anonymous feedback and public certificate lookup remain intentional public endpoints.
- `023-admin-report.sql`: reads using the caller's RLS session and explicitly requires an existing administrator. PostgreSQL aggregates a full 30 UTC-day window instead of truncating at PostgREST's row cap. Daily users use the current UTC day; weekly users cover the trailing seven days. It returns zero-filled days and top content/event groups, never raw rows. Missing deployment or access surfaces an unavailable report rather than sampled numbers disguised as exact.

The operator applying021 must own/create the functions with permission to read/delete `auth.users` and lock/read `storage.objects`. Verify Storage owner fields, bucket/path conventions, FK cascades, custom auth hooks, and any additional private tables before rollout. No SQL deletes Storage objects. Unusual legacy object ownership or missing Storage delete permission intentionally blocks deletion with an actionable message. Anonymous feedback is not attributable by account ID; downloaded files, other device copies, provider backups/log retention and already shared receipts are outside account deletion.

Official implementation references:

- [Supabase user deletion and existing JWT limitation](https://supabase.com/docs/guides/auth/managing-user-data)
- [Authentication method timestamps](https://supabase.com/docs/guides/auth/jwt-fields)
- [Storage ownership](https://supabase.com/docs/guides/storage/security/ownership)
- [Supported Storage object removal](https://supabase.com/docs/guides/storage/management/delete-objects)

Disposable tests: `tests/supabase/account-deletion.sql` exercises anonymous, stale/refreshed-only claims, remaining files, owner isolation/cascade and residual admin access. `admin-report.sql` checks non-admin rejection and exact counting of10,001 events. `storage-bootstrap.sql` simulates only metadata/RLS; it does not claim to test physical Storage byte removal. Client tests separately prove Storage removal precedes deletion and local guest-preserving cleanup only follows confirmed server deletion.
