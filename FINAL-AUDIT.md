# DURA Final Pre-Supabase Audit

> Last updated: April 16, 2026
> Commits: 226+ on main
> Build: 578+ static pages, zero errors
> Content: 406 lessons, 100 tutorials, 35 guides, 500 terms, 514 questions, 20 Discovery activities
> Standards: CS2023, SWEBOK v4, SFIA 9, CSTA K-12, AP CSP, AP CSA, ISTE

---

## Lighthouse Audit

### Performance

| Route                                    | First Load JS | Status                                                       |
| ---------------------------------------- | ------------- | ------------------------------------------------------------ |
| `/`                                      | 153 kB        | P2 — 3 kB over target. Motion in shared chunk.               |
| `/challenge`                             | 185 kB        | **P1** — ChallengeMode imports ALL_QUESTIONS (504 questions) |
| `/paths/[phaseId]/[moduleId]/[lessonId]` | 183 kB        | **P1** — Sandpack + BiteMode + motion in lesson route        |
| All other routes                         | <135 kB       | PASS                                                         |

- **P2**: No render-blocking resources. Fonts via next/font (preloaded). No raw `<img>` tags.
- **PASS**: All images use `next/image` or are SVG/Lucide icons.
- **PASS**: 9 dynamic imports in use for heavy components.
- **PASS**: `PageTransition` in app layout imports motion — this is intentional and shared.

### Accessibility

| Finding                            | Severity | Location                                                                                                                                         |
| ---------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `lang="en"` on `<html>`            | PASS     | `layout.tsx:68`                                                                                                                                  |
| Skip-to-content link               | PASS     | `(app)/layout.tsx:14-19`                                                                                                                         |
| `prefers-reduced-motion` respected | PASS     | LenisProvider, BiteMode, PageTransition, StaggerList                                                                                             |
| Focus indicators                   | PASS     | `globals.css` — `*:focus-visible` with emerald ring                                                                                              |
| Emerald text contrast on white     | **P2**   | `#10B981` on `#FFFFFF` = 2.7:1. Used for links/accents — large text only. Body text uses `--color-text-secondary` (#525252 = 7.3:1). Acceptable. |
| `dangerouslySetInnerHTML`          | **P2**   | BiteMode segments, CodeBlock (Shiki output), theme script. All from trusted internal sources.                                                    |

### SEO

- **PASS**: All page routes export `metadata` or `generateMetadata`.
- **PASS**: Sitemap dynamically generated. robots.ts blocks private routes.
- **PASS**: OG metadata in root layout.
- **PASS**: Proper heading hierarchy on checked routes.

### Best Practices

- **PASS**: No hardcoded secrets.
- **PASS**: No `.env` files in repo.
- **P2**: 0 `console.log` in runtime code (all instances are in content strings/templates).
- **PASS**: No deprecated React lifecycle methods.

---

## Security Audit

| Finding                    | Severity | Detail                                                                                                                                            |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hardcoded secrets          | PASS     | None found                                                                                                                                        |
| .env files in repo         | PASS     | None committed                                                                                                                                    |
| npm audit                  | **P0**   | 1 high: Next.js DoS with Server Components (GHSA-q4gf-8mx6-v5v3). Fix: `npm audit fix --force` → next@15.5.15                                     |
| CSP headers                | **P1**   | Not configured in next.config.ts. PLANNING.md requires them.                                                                                      |
| API route input validation | **P1**   | 4 API routes have zero Zod validation. `/health` is fine (no input). `/terms`, `/terms/[slug]`, `/phases` accept query params without validation. |
| dangerouslySetInnerHTML    | P2       | 4 uses — all from trusted internal sources (Shiki HTML, theme script, BiteMode segments).                                                         |
| eval() / new Function()    | PASS     | None in app code (MDX evaluate is in a library).                                                                                                  |
| Open redirects             | PASS     | Redirects use hardcoded paths only.                                                                                                               |
| Assessment in localStorage | **P1**   | `stores/assessment.ts` uses localStorage instead of IDB. Should migrate for consistency before Supabase sync.                                     |

---

## Content Integrity Audit

| Metric                      | Count | Target | Status                                     |
| --------------------------- | ----- | ------ | ------------------------------------------ |
| Lessons                     | 406   | ~406   | PASS                                       |
| Dictionary terms            | 500   | 500+   | PASS                                       |
| How-to guides               | 35    | 25-35  | PASS                                       |
| Tutorials                   | 100   | 50-100 | PASS                                       |
| Questions                   | 514   | 500+   | PASS                                       |
| Duplicate slugs             | 0     | 0      | PASS                                       |
| Lessons without interactive | 15    | <20    | P2 — acceptable for intro/overview lessons |

### Per-phase lesson counts

| Phase | Lessons |
| ----- | ------- |
| 0     | 16      |
| 1     | 45      |
| 2     | 50      |
| 3     | 40      |
| 4     | 45      |
| 5     | 35      |
| 6     | 50      |
| 7     | 30      |
| 8     | 35      |
| 9     | 60      |

---

## State & Data Integrity

| Finding                  | Severity | Detail                                                               |
| ------------------------ | -------- | -------------------------------------------------------------------- |
| IDB stores               | PASS     | 14 stores, all covered by clearAllData                               |
| Zustand stores           | PASS     | 8 stores, all functional                                             |
| localStorage: assessment | **P1**   | Assessment results in localStorage, not IDB                          |
| localStorage: theme      | P2       | Theme in localStorage — acceptable (needs sync-free FOUC prevention) |
| localStorage: tip-seen   | P2       | One-time flag — acceptable                                           |
| clearAllData coverage    | PASS     | Covers all 14 IDB stores + 3 localStorage keys + sessionStorage + SW |

---

## P0 Fixes Required

1. **npm audit high vulnerability** — Update Next.js to 15.5.15

## P1 Fixes Required

1. **CSP headers** — Add Content-Security-Policy to next.config.ts
2. **API route validation** — Add Zod schemas to /terms and /phases routes
3. **/challenge bundle** — Dynamic import ALL_QUESTIONS or lazy-load ChallengeMode
4. **Assessment localStorage → IDB** — Migrate for Supabase readiness

## P2 (Deferred)

- Home page 153 kB (motion in shared chunk — architectural, not fixable without removing motion)
- Lesson page 183 kB (Sandpack is heavy — already dynamically imported)
- Emerald contrast on white — only used for large text/accents, not body text
- 15 lessons without interactive elements — intro/overview lessons, acceptable
