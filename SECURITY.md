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
