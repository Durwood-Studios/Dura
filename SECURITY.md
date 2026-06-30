# Security Policy

## Reporting a vulnerability

Please report suspected security issues privately:

- **Email:** security@durwoodstudios.com
- **GitHub:** open a [private security advisory](https://github.com/Durwood-Studios/Dura/security/advisories/new)

Do not file public issues for security reports.

### What to include

- A description of the issue and the impact you observed
- Steps to reproduce, ideally a minimal proof-of-concept
- The affected commit SHA, branch, or deployed URL
- Your name or handle if you'd like credit (optional)

## Response timeline

| Step                         | Target          |
| ---------------------------- | --------------- |
| Acknowledge receipt          | 3 business days |
| Initial assessment           | 7 business days |
| Fix + coordinated disclosure | within 90 days  |

If a report needs longer than 90 days, we will say so in writing and agree a revised date with the reporter.

## Scope

In scope:

- The DURA web application (production and preview deployments)
- This repository's source code, CI configuration, and Supabase schema
- Dependencies pinned in `package.json` / `package-lock.json`

Out of scope:

- Third-party services we depend on (Supabase, Vercel, GitHub) — please report to those vendors directly
- Findings that require a compromised end-user device or browser

## Safe harbor

We will not pursue legal action against researchers who:

- Act in good faith and avoid privacy violations, data destruction, and service degradation
- Give us reasonable time to respond before public disclosure
- Do not exfiltrate data beyond what is needed to demonstrate the issue

## Supported versions

DURA is a continuously deployed web app. Fixes land on `main` and ship to production. There are no maintained release branches.

---

## Security Architecture Notes

### Admin access

Admin privileges are granted via Supabase Studio: set `raw_app_meta_data.is_admin = true` on the target row in `auth.users`. The JWT claim `app_metadata.is_admin` is then asserted in `src/app/admin/layout.tsx` server-side before rendering any admin UI.

No service_role key is required or permitted for this flow. The anon key + RLS is the only permitted key pair in application code. If a Supabase Studio operator needs to grant/revoke admin: edit `raw_app_meta_data` directly in the Studio UI, then ask the user to sign out and back in to refresh their JWT.

### Rate limiting

Edge rate limiting is applied to auth endpoints (sign-in, sign-up, password reset) via Upstash Redis. The env var is `UPSTASH_REDIS_REST_URL` (plus `UPSTASH_REDIS_REST_TOKEN`). These are secrets — never commit them; they belong in `.env.local` or Vercel project environment variables only.

### OWASP ASVS Level 2

Auth flows have been hardened to OWASP ASVS Level 2. Key controls applied:

- Session tokens are HTTP-only, SameSite=Lax, Secure
- Password reset links are single-use and expire in 1 hour
- Failed login attempts are rate-limited at the edge before reaching Supabase
- All redirects after auth are validated against an allowlist

### RLS admin read policies

Migration `017-admin-rls.sql` (staged in `xDocs/active/supabase-golive-2026-06/staged/supabase/`) adds admin read policies that allow rows with `app_metadata.is_admin = true` to read learner records for support and moderation. These policies are **read-only** — no admin write path through the application is permitted. Apply only with explicit instruction.
