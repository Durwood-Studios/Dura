> Current status, September21: releaseac96abf is live, all migrations through025 are verified, and both production environment variables are configured. The steps below document setup/recovery; they are not a new execution queue.

# Current rollout: Supabase request limiter (025)

Redis/Upstash setup is cancelled. Dura now uses its existing Supabase project for server-authorized request limiting. No additional provider account is required. This consumes existing database resources; it is not a promise of unlimited free traffic.

1. 025 is already applied and archived at `supabase/migrations/Already Ran/025-supabase-rate-limits.sql`. Do not rerun it. It creates private limiter tables, a database-generated server credential, and an atomic RPC. It changes no learner records. Client roles cannot read or write the tables directly; the RPC validates a separate server credential before writes. Raw IPs are HMAC-hashed by the server.
2. In the privileged Supabase SQL Editor, privately run `SELECT secret FROM dura_private.rate_limit_config WHERE singleton;`. Copy the result into Vercel's **server-only** `DURA_RATE_LIMIT_SECRET` for Production (and only previews using this database). Do not paste the result in chat, commit it, expose it with NEXT_PUBLIC, or share a screenshot of it. This is a narrowly scoped limiter credential, not a Supabase service-role key.
3. Verify the migration's live objects/permissions and the configured RPC. Then set `DURA_SUPABASE_CONTRACT_VERSION=2026-09-025` in Vercel. Existing NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY remain required. Stripe-only deployments also require these limiter settings. No Upstash settings are required.
4. Deploy the matching main commit only after its trusted Release readiness check passes. Verify account endpoints distinguish rate exhaustion (429) from infrastructure failure (503). Guest/local learning stays available independently.

The production client fails closed on RPC errors, invalid responses, or missing configuration. Expired buckets are cleaned in bounded batches as authorized requests arrive. Without traffic, expired hashes can remain until the next request; no raw IPs are stored. Secret rotation requires coordinated database and Vercel changes. Reapplying 025 preserves the existing secret.

Local SQL regression includes explicit-role authorization, private-table denial, expiry, replay, and 16 concurrent consumers competing for five slots. Never run fixture harnesses against production.
