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

A free, open-source learning platform that serves the full education lifecycle — from a child's first encounter with computing to engineering leadership. 450+ lessons across 15 phases, a technical dictionary, spaced-repetition flashcards, code sandboxes, and cross-device sync — all offline-capable, all free forever.

## Features

- **450+ lessons** across 15 phases — Digital Literacy through specialty engineering tracks
- **Learning paths / career tracks** — structured progressions with skill graphs
- **FSRS-5 spaced repetition** — flashcard system for long-term retention
- **Code sandboxes** — write and run code in-browser with templates, fullscreen, console, and save management
- **DURA Dictionary** — 500+ technical terms with tiered definitions
- **AI inference layer** — local-first AI features integrated into the learning experience
- **Skill placement assessments** — adaptive path recommendations based on demonstrated knowledge
- **Goal setting** — daily, weekly, phase, and career goals
- **Lesson progress tracking** — scroll position, time-on-lesson, and quiz completion
- **Cross-device sync** — optional Supabase sync; offline-first and always works without it
- **Annotations / community notes** — collaborative margin notes on lessons
- **Admin dashboard** — JWT-gated `/admin` for content and platform management
- **Mastery-gated** — advance when you prove it, not when time passes
- **Dual point system** — Activity Points (effort) and Mastery Points (proof), honestly separated
- **PWA** — installable on Windows, Mac, Linux, iOS, Android; service worker with update notifications
- **Dark / light theme** — toggle with amber sun glow accent
- **Edge rate limiting** — hardened auth endpoints
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

Next.js 15 (App Router) · TypeScript strict · Tailwind v4 · Supabase (19 tables, RLS) · Zustand · IndexedDB · FSRS-5 · Serwist (PWA) · Framer Motion v12 · Lucide React · MDX · Sandpack

## Curriculum

### Core Phases

| Phase | Focus                    | Lessons |
| ----- | ------------------------ | ------- |
| 0     | Digital Literacy         | 16      |
| 1     | Programming Fundamentals | 45      |
| 2     | Web Development          | 50      |
| 3     | CS Fundamentals          | 40      |
| 4     | Backend Engineering      | 45      |
| 5     | Systems Engineering      | 35      |
| 6     | AI/ML Engineering        | 62      |
| 7     | Advanced Systems         | 30      |
| 8     | Professional Practice    | 35      |
| 9     | CTO Track                | 60      |

### Specialty Phases

| Phase | Focus                      | Lessons |
| ----- | -------------------------- | ------- |
| 10    | Embedded / Firmware        | 8       |
| 11    | Hardware Verification      | 8       |
| 12    | Quantitative / HFT Systems | 8       |
| 13    | Robotics                   | 8       |
| 14    | Manufacturing              | 12      |

**Total: 15 phases · 450+ lessons**

Standards: ACM CS2023 · SWEBOK v4 · SFIA 9 · CSTA K-12 · AP CS Principles · AP CS A · ISTE

## Project Structure

```
src/
  app/          — Next.js App Router routes
  components/   — React components
  content/      — MDX lessons, dictionary, skills, roles
  lib/          — Utilities, IDB, analytics, FSRS, sync engine
  stores/       — Zustand state management
  types/        — TypeScript interfaces
supabase/
  migrations/   — SQL migrations (19 tables, RLS on everything)
  README.md     — Supabase setup guide
```

See [PLANNING.md](PLANNING.md) for full architecture documentation.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, code standards, and how to submit PRs.

## License

[AGPLv3](LICENSE) — the source stays open, legally and permanently.

Free forever. No paywalls. No premium tiers. Future revenue (if any) comes from new products built on top of DURA — never from restricting what already exists.

---

<div align="center">

Built by [Dustin Snellings](https://github.com/dustinsnellings) at [Durwood Studios LLC](https://github.com/Durwood-Studios)

</div>
