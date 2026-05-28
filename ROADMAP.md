# DURA Roadmap

> A public-facing view of where DURA is and where it's going. Updated when reality changes — not on a fixed cadence.
>
> Last updated: 2026-05-28

DURA is built in the open. This roadmap reflects the actual state of the work, including what's shipped, what's mid-flight, and what's deliberately deferred. Anything not on this list either hasn't been planned yet or isn't on the table.

---

## Now — shipped and live

These are in production on [dura.vercel.app](https://dura.vercel.app) today.

### Curriculum (406 lessons across 10 phases)

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

### Platform

- Offline-first PWA — works fully without internet after first load
- Mastery-gated progression — advance when you prove it, not when time passes
- Dual point system — Activity Points (effort) and Mastery Points (proof) tracked separately
- FSRS-5 spaced repetition for vocabulary review (dictionary terms promote into the same flashcard deck — one review surface for everything)
- 500+ dictionary terms with 3-tier definitions, individually indexed
- 100 project tutorials across 12 career tracks
- 35 how-to guides
- 20 Discovery Center activities for young learners (Phase 0)
- In-browser code sandboxes (Sandpack) for JS / TS / React
- 35-question skill placement assessment with adaptive path recommendations
- Shareable, downloadable certificates (PDF)
- 6 study modes (Standard, Bite-sized, Focus, Sprint, Review, Challenge)
- Accessibility: high contrast, dyslexia font, reduced motion, site-wide font sizing
- WCAG 2.2 AA — component-level axe-core coverage on interactive surfaces

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
- 22 phases shipped across review/discover/lesson/settings surfaces

---

## Next — in flight or planned for this quarter

Roughly in priority order. Dates are intent, not commitments.

### Security & supply chain

- Dependabot weekly grouped updates (shipped 2026-05-28)
- CSP `unsafe-eval` removal once Sandpack execution path is reconfirmed safe
- Playwright e2e smoke suite covering 5 hot paths (lesson, review, discover, certificate, auth)

### Curriculum extension

- Discovery activities for Phases 3–9 — Pathfinding, Race Condition, Embedding Galaxy, and GC Visualizer all shipped 2026-05-28
- Standards-alignment audit across 418 lessons — automated reconciliation against ACM CS2023, SWEBOK v4, SFIA 9, CSTA K-12, AP CS Principles/A, ISTE (audit script shipped 2026-05-28; first run found one missing module registration, fixed in the same commit)

### Learning surfaces

- AI tutor — Claude-API-backed Q&A scoped to lesson context, consent-gated, no training-data retention
- Code review surface — submit a code sample, receive structured feedback with explanations

### Mobile

- Mobile lesson UX audit — tap targets, scroll behavior, font scaling, reader mode on small screens

---

## Later — on the list, no timeline yet

- Discord launch (community gathering point)
- Multi-language support (i18n)
- Instructor mode — host a cohort, see learner progress (opt-in only, no surveillance defaults)
- Native mobile shell (Capacitor or equivalent) — only if PWA-on-iOS limitations become a real problem
- Project tutorial library expansion past 100

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
