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

A free, open-source learning platform that takes anyone from absolute zero to CTO-ready through mastery-gated, standards-backed engineering education. 406 lessons across 10 phases, 500+ dictionary terms, 35 how-to guides, 20 project tutorials — all offline-capable, all free forever.

## Features

- **406 lessons** across 10 phases — Digital Literacy to CTO Track
- **Mastery-gated** — advance when you prove it, not when time passes
- **Offline-first** — works without internet after first load
- **Spaced repetition** — FSRS-5 flashcard system for long-term retention
- **500+ dictionary terms** — 3-tier definitions, individually indexed for SEO
- **Code sandboxes** — write and run JavaScript, TypeScript, React in-browser
- **35 how-to guides** — practical, step-by-step problem-solving
- **20 project tutorials** — build real, deployable artifacts
- **Skill assessment** — 35-question placement test with adaptive paths
- **Certificates** — verified, shareable, downloadable as PDF
- **6 study modes** — Standard, Bite-sized, Focus, Sprint, Review, Challenge
- **Dark mode** — full theme support with FOUC prevention
- **PWA** — installable, cached, fast
- **Privacy-first** — no cookies, no tracking, no ads
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

Plus 35 how-to guides, 20 project tutorials, and an [AI Engineering Competency Framework](https://dura.vercel.app/standards/ai-engineering).

Standards: ACM CS2023 · SWEBOK v4 · SFIA 9

## Project Structure

```
src/
  app/          — Next.js routes (43 routes)
  components/   — React components
  content/      — MDX lessons, dictionary, howtos, tutorials
  lib/          — Utilities, IDB, analytics, FSRS algorithm
  stores/       — Zustand state management
  types/        — TypeScript interfaces
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
