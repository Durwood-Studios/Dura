<div align="center">

# DURA

**Engineering education, hardened by design.**

[![Build](https://img.shields.io/github/actions/workflow/status/Durwood-Studios/Dura/ci.yml?branch=main&style=flat-square&labelColor=0a0a12)](https://github.com/Durwood-Studios/Dura/actions)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPLv3-10b981?style=flat-square&labelColor=0a0a12)](https://www.gnu.org/licenses/agpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white&labelColor=0a0a12)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-10b981?style=flat-square&labelColor=0a0a12)](CONTRIBUTING.md)

[Live Demo](https://dura.vercel.app) · [Report Bug](https://github.com/Durwood-Studios/Dura/issues) · [Contributing](CONTRIBUTING.md)

</div>

---

A free, open-source learning platform that serves the full education lifecycle — from a child's first encounter with computing to engineering leadership. 406 lessons, 100 project tutorials, 500+ dictionary terms, 20 interactive Discovery activities, 12 career tracks — all offline-capable, all free forever.

## Features

- **Discovery Center** — 6 rooms, 20 interactive activities for young learners (ages 5-12), zero data collection
- **406 lessons** across 10 phases — Digital Literacy to CTO Track
- **100 project tutorials** — build real, deployable artifacts across 12 career tracks
- **35 how-to guides** — practical, step-by-step problem-solving
- **12 career tracks** — Frontend, Backend, AI/ML, Security, DevOps, and 7 more with skill graphs
- **Mastery-gated** — advance when you prove it, not when time passes
- **Dual point system** — Activity Points (effort) and Mastery Points (proof), honestly separated
- **Offline-first** — works without internet after first load
- **Spaced repetition** — FSRS-5 flashcard system for long-term retention
- **500+ dictionary terms** — 3-tier definitions, individually indexed for SEO
- **Code sandboxes** — write and run JavaScript, TypeScript, React in-browser
- **Skill assessment** — 35-question placement test with adaptive path recommendations
- **Certificates** — verified, shareable, downloadable as PDF
- **6 study modes** — Standard, Bite-sized, Focus, Sprint, Review, Challenge
- **Accessibility** — high contrast, dyslexia font, reduced motion, site-wide font sizing
- **PWA** — installable on Windows, Mac, Linux, iOS, Android with platform-specific install guides
- **Privacy-first** — no cookies, no tracking, no ads, local-first data
- **Free forever** — AGPLv3 licensed, no paywalls, no premium tiers

## Quick Start

```bash
git clone https://github.com/Durwood-Studios/Dura.git
cd Dura
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). That's it.

**Prerequisites:** Node.js 20+, npm 10+

## Tech Stack

Next.js 15 · React 19 · TypeScript · Tailwind v4 · Zustand · IndexedDB · Serwist (PWA) · Shiki · MDX · Sandpack

## Curriculum

| Phase | Focus                    | Lessons |
| ----- | ------------------------ | ------- |
| 0     | Digital Literacy         | 16      |
| 1     | Programming Fundamentals | 45      |
| 2     | Web Development          | 50      |
| 3     | CS Fundamentals          | 40      |
| 4     | Backend Engineering      | 45      |
| 5     | Systems Engineering      | 35      |
| 6     | AI/ML Engineering        | 50      |
| 7     | Advanced Systems         | 30      |
| 8     | Professional Practice    | 35      |
| 9     | CTO Track                | 60      |

Plus 35 how-to guides, 100 project tutorials, a [Discovery Center](https://dura.vercel.app/discover) for young learners, and an [AI Engineering Competency Framework](https://dura.vercel.app/standards/ai-engineering).

Standards: ACM CS2023 · SWEBOK v4 · SFIA 9 · CSTA K-12 · AP CS Principles · AP CS A · ISTE

## Project Structure

```
src/
  app/          — Next.js routes (55+ routes)
  components/   — React components
  content/      — MDX lessons, dictionary, howtos, tutorials, skills, roles
  lib/          — Utilities, IDB, analytics, FSRS, sync engine
  stores/       — Zustand state management
  types/        — TypeScript interfaces
supabase/
  migrations/   — 13 SQL migrations (ready to run)
  README.md     — Setup guide
```

See [PLANNING.md](PLANNING.md) for full architecture documentation.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, code standards, and how to submit PRs.

## License

Core platform: [AGPL-3.0](LICENSE) · APIs: Apache-2.0

Free forever. No paywalls. No premium tiers.

---

<div align="center">

Built by [Dustin Snellings](https://github.com/dustinsnellings) at [Durwood Studios LLC](https://github.com/Durwood-Studios)

</div>
