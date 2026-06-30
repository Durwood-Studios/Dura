# DURA Roadmap

> A public-facing view of where DURA is and where it's going. Updated when reality changes — not on a fixed cadence.
>
> Last updated: 2026-06-18

DURA is built in the open. This roadmap reflects the actual state of the work, including what's shipped, what's mid-flight, and what's deliberately deferred. Anything not on this list either hasn't been planned yet or isn't on the table.

---

## Now — shipped and live

These are in production on [dura.vercel.app](https://dura.vercel.app) today.

### Curriculum (~456 lessons across 15 phases)

**Core track (10 phases, ~406 lessons)**

| Phase | Focus                    | Lessons | Status  |
| ----- | ------------------------ | ------- | ------- |
| 0     | Digital Literacy         | 16      | ✅ Live |
| 1     | Programming Fundamentals | 45      | ✅ Live |
| 2     | Web Development          | 50      | ✅ Live |
| 3     | CS Fundamentals          | 40      | ✅ Live |
| 4     | Backend Engineering      | 45      | ✅ Live |
| 5     | Systems Engineering      | 35      | ✅ Live |
| 6     | AI/ML Engineering        | 50      | ✅ Live |
| 7     | Advanced Systems         | 30      | ✅ Live |
| 8     | Professional Practice    | 35      | ✅ Live |
| 9     | CTO Track                | 60      | ✅ Live |

**Specialty track (5 phases, ~50 lessons)**

| Phase | Focus                      | Lessons | Status  |
| ----- | -------------------------- | ------- | ------- |
| 10    | Embedded & Firmware        | 8       | ✅ Live |
| 11    | Hardware Verification      | 8       | ✅ Live |
| 12    | Quantitative / HFT Systems | 8       | ✅ Live |
| 13    | Robotics                   | 8       | ✅ Live |
| 14    | Manufacturing              | 12      | ✅ Live |

### Platform

- Offline-first PWA — works fully without internet after first load
- Mastery-gated progression — advance when you prove it, not when time passes
- Dual point system — Activity Points (effort) and Mastery Points (proof) tracked separately
- FSRS-5 spaced repetition for vocabulary review (dictionary terms promote into the same flashcard deck — one review surface for everything)
- 500+ dictionary terms with 3-tier definitions, individually indexed
- 100 project tutorials across 12 career tracks
- 35 how-to guides
- 20 Discovery Center activities for young learners (Phase 0)
- In-browser code sandboxes (Sandpack) — templates, save management, fullscreen mode, console output
- 35-question skill placement assessment with adaptive path recommendations
- Shareable, downloadable certificates (PDF)
- 6 study modes (Standard, Bite-sized, Focus, Sprint, Review, Challenge)
- Accessibility: high contrast, dyslexia font, reduced motion, site-wide font sizing
- WCAG 2.2 AA — component-level axe-core coverage on interactive surfaces
- Profile settings page — display name, bio, avatar URL, sticky save bar
- User profile and sign-out in sidebar (desktop and mobile drawer)
- Theme toggle — binary light/dark, amber sun glow in dark mode
- PWA update card — confetti explosion, blur backdrop, no-flicker overlay

### Admin

- Admin dashboard at `/admin` — JWT-gated via `app_metadata.is_admin` (no service_role key)
- Feedback viewer, analytics viewer, users table, local IDB inspection tools

### Security & auth

- Sign-out properly clears session
- Auth hardening to OWASP ASVS Level 2
- Edge rate limiting on auth endpoints via Upstash Redis
- 19 Supabase tables with row-level security on all of them: profiles, lesson_progress, module_progress, phase_progress, flashcards, review_logs, goals, skill_assessments, assessment_results, certificates, analytics, xp_events, sandbox_saves, track_progress, lesson_difficulty, annotations, annotation_votes, activity, content_embeddings (+ feedback staged in migration 016)

### Standards & compliance (2026-Q2 compliance sprint, closed 2026-04-26)

- **LFLRS-1.0** — canonical learner record schema + xAPI 1.0.3 projection + ZIP export (GDPR Art. 20)
- **PPLAS-1.0** — consent-gated analytics, 18-event catalog, Laplace differential-privacy noise layer
- **AINDGS-1.0** — AI-assisted development governance (provenance trailers, CODEOWNERS gating)
- **AI Act Art. 13/14** — transparency disclosure surface in Settings + /how-it-works
- At-rest AES-256-GCM encryption on flashcards, review logs, lesson progress
- Local-first persistence (OPFS shadow layer + IndexedDB)
- Storage-persistence request + best-effort eviction warning (LFLRS-R1)

### Standards & design (2026-Q2 motion sprint, closed 2026-05-27)

- **DLS-1.0** — visual language + OKLCH token system (canonical blue accent, emerald reserved for learner-positive moments)
- **DLS-2.0** — motion vocabulary (SPRINGS, HAPTICS, signatures, ambient depth model)
- Geist Sans + Geist Mono via `next/font/local`
- 22 motion phases shipped across review/discover/lesson/settings surfaces

---

## In Progress

Work that is actively running now.

### Curriculum gap-fill (~20 new modules across all 15 phases)

Lessons and modules being authored to close gaps identified in the standards-alignment audit:

- **Phase 1** — OOP & Classes module
- **Phase 2** — TypeScript module (critical gap), Real-Time/WebSockets module
- **Phase 3** — Discrete Mathematics module
- **Phase 4** — Message Queues & Event-Driven Architecture module
- **Phase 5** — Concurrency & Parallelism module
- **Phase 6** — Classical ML Foundations module, Computer Vision module
- **Phase 7** — Formal Methods & GPU Programming module
- **Phase 8** — System Design at Scale module, Incident Management module
- **Phase 9** — Technical Due Diligence module, Compliance & Governance module
- **Phase 10** — Power Management module, Bootloaders/OTA module
- **Phase 11** — Clock Domain Crossing module, Emulation/Acceleration module
- **Phase 12** — Quantitative Finance Mathematics module
- **Phase 13** — Robotics Science Fundamentals module (kinematics, SLAM, control)
- **Phase 14** — CNC/CAM module, Metrology/Supply Chain module

### Supabase go-live

Migrations 016 (feedback table) and 017 (admin RLS) are staged and ready. Pending one-shot apply to production per the project's staged-migration policy.

### Auth-gated features

Annotations and lesson completion are being wired to require an account when Supabase is active. Offline behavior is unaffected — the requirement only applies to cross-device sync.

---

## Next Up

Roughly in priority order. Dates are intent, not commitments.

### Learning surfaces

- AI tutor — Claude-API-backed Q&A scoped to lesson context, consent-gated, no training-data retention
- Code review surface — submit a code sample, receive structured feedback with explanations
- Functional feedback submission flow wired to Supabase (UI exists, backend pending go-live)

### Profile & identity

- Avatar file upload (currently URL input only — full file upload deferred until storage bucket is configured)
- PWA offline indicator and sync status badge

### Platform hygiene

- Semantic versioning + in-app audit log (release notes surface, like an app store changelog)
- Playwright e2e smoke suite covering 5 hot paths (lesson, review, discover, certificate, auth)
- CSP `unsafe-eval` removal once Sandpack execution path is reconfirmed safe

### Mobile

- Mobile lesson UX follow-up pass — first audit closed 2026-05-28 (tap targets, breadcrumb collapse, VocabTooltip). Deferred issues tracked in [`xDocs/active/mobile-ux-audit-2026-05.md`](xDocs/active/mobile-ux-audit-2026-05.md)

### Global reach + i18n

DURA's framing is "a global tool for all software engineers." The language registry declares ~38 languages. Only English is enabled today; the phased plan:

1. **Phase 1 — extraction.** Audit the ~2,000 UI strings; route through a `t()` helper. English baseline first. No user-visible change.
2. **Phase 2 — RTL + bidi.** Wire `dir="rtl"` swap; verify lesson reader, sidebar, and dictionary in Arabic + Hebrew.
3. **Phase 3 — machine-translated baseline.** Translate the UI string catalog; flip each locale's `enabled` flag after native-speaker validation. Lessons remain English-only.
4. **Phase 4 — community + AI-assisted lesson translation.** 456 lessons × N languages is a six-to-seven-figure translation surface. Community-first, AI-translated drafts as a baseline. Provenance and credit tracked per lesson per locale.

This will not happen in a single sprint. The scaffolding is here so contributions can flow in piece by piece.

---

## Deferred — on the list, no timeline yet

- Discord launch (community gathering point)
- Instructor mode — host a cohort, see learner progress (opt-in only, no surveillance defaults)
- Native mobile shell (Capacitor or equivalent) — only if PWA-on-iOS limitations become a real problem
- Project tutorial library expansion past 100
- Discovery activities for Phases 3–9 (Pathfinding, Race Condition, Embedding Galaxy, GC Visualizer shipped 2026-05-28; remaining phases pending)

---

## Not on the roadmap (and why)

Deliberate non-goals. Asking for these in an issue is fine, but the answer is "no" by design, not by oversight.

- **Payment surfaces, premium tiers, "unlock to continue" prompts** — DURA's core platform is permanently free under AGPLv3. See CLAUDE.md Rule 7. Any future revenue comes from products built _on top of_ DURA (managed hosting, white-label, consulting), never from gating what already exists.
- **Ads, tracking pixels, third-party analytics by default** — privacy-first is a load-bearing commitment, not a marketing claim.
- **Mandatory accounts** — auth is optional. Sync is optional. Offline is not optional.
- **Closed-source modules** — the AGPLv3 license guarantees the source stays open.
- **Anthropic SDK or other LLM SDKs as bundled dependencies** — AI features integrate via opt-in network calls, never as required runtime deps.

---

## How decisions get made

- **Curriculum changes** — Dustin Snellings (project owner) reviews alignment with the published standards before merge.
- **Architectural changes** — recorded as ADRs under [`xDocs/decisions/`](xDocs/decisions/) when the choice is load-bearing.
- **Roadmap reprioritization** — happens when a sprint closes or when an outside signal (security advisory, user incident, accessibility regression) warrants it.

If you want to influence the roadmap, the best path is a [GitHub Discussion](https://github.com/Durwood-Studios/Dura/discussions) explaining the learner-facing problem you want solved. Feature requests framed around outcomes get further than ones framed around implementations.

---

## See also

- [README.md](README.md) — what DURA is and how to run it
- [CONTRIBUTING.md](CONTRIBUTING.md) — how to contribute code, lessons, or dictionary terms
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) — community standards
- [SECURITY.md](SECURITY.md) — vulnerability reporting
- [`standards/`](standards/) — the published DURA standards (DLS, LFLRS, PPLAS, AINDGS)
