<div align="center">

# DURA

**Engineering education, hardened by design.**

An open-source, offline-capable learning platform that takes anyone from absolute zero to CTO-ready through mastery-gated, standards-backed engineering education.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPLv3-10b981?style=flat-square&labelColor=0a0a12)](https://www.gnu.org/licenses/agpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white&labelColor=0a0a12)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000?style=flat-square&logo=next.js&logoColor=white&labelColor=0a0a12)](https://nextjs.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white&labelColor=0a0a12)](https://tailwindcss.com/)

[Live Demo](https://dura.vercel.app) · [Report Bug](https://github.com/Durwood-Studios/Dura/issues) · [Request Feature](https://github.com/Durwood-Studios/Dura/issues)

</div>

---

## What Is DURA?

DURA is a Progressive Web App that teaches software engineering, AI engineering, and technology leadership from the ground up. It does not promise shortcuts. It provides the means — verified through hardened skills testing — for those willing to do the work.

- **10 phases** covering digital literacy through CTO-level leadership
- **~406 lessons** mapped to ACM CS2023, SWEBOK v4, and SFIA 9 standards
- **~2,850 hours** of structured curriculum
- **Offline-first** — works without internet after first load
- **Free forever** at the core

## Key Features

- **Mastery-gated progression** — advance only when you prove competency
- **FSRS spaced repetition** — adaptive flashcards tuned to your memory
- **Verified dictionary** — 500+ terms at 3 difficulty levels with inline tooltips
- **Live code sandboxes** — JS, Python, Rust, and 60+ languages in-browser
- **Bite-sized mode** — 2-4 minute micro-lessons for learning on the go
- **6 study modes** — Standard, Bite, Focus, Review, Sprint, Challenge
- **Skills verification** — timed assessments with tamper-resistant certificates
- **Teacher dashboard** — curriculum browser, class management, exportable resources

## Tech Stack

| Layer          | Technology                                 |
| -------------- | ------------------------------------------ |
| Framework      | Next.js 15 (App Router, Server Components) |
| Language       | TypeScript (strict mode)                   |
| Styling        | Tailwind CSS v4                            |
| UI             | shadcn/ui + Radix primitives               |
| Content        | MDX via next-mdx-remote                    |
| Animation      | Motion v12 + GSAP ScrollTrigger + Lenis    |
| State          | Zustand with persist middleware            |
| Offline        | IndexedDB via idb, Serwist PWA             |
| Auth           | Supabase Auth (optional)                   |
| Database       | Supabase PostgreSQL (optional, for sync)   |
| Code Execution | Sandpack, Pyodide, Judge0                  |
| Deployment     | Vercel                                     |

## Getting Started

### Prerequisites

- Node.js 22+
- npm 10+
- Git

### Installation

```bash
git clone https://github.com/Durwood-Studios/Dura.git
cd Dura
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available Scripts

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix lint errors
npm run format       # Format with Prettier
npm run format:check # Check formatting
npm run typecheck    # Run TypeScript type checker
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout: fonts, metadata
│   ├── page.tsx             # Splash/landing page
│   ├── (marketing)/         # About, how-it-works, open-source
│   ├── (app)/               # Authenticated app shell
│   │   ├── dashboard/       # Learner home
│   │   ├── paths/           # Phase → Module → Lesson routing
│   │   ├── review/          # Flashcard sessions
│   │   ├── dictionary/      # Verified programming dictionary
│   │   ├── sandbox/         # Freeform code playground
│   │   ├── goals/           # Learning goals tracker
│   │   ├── stats/           # Progress analytics
│   │   ├── verify/          # Skills verification tests
│   │   └── teach/           # Teacher dashboard
│   └── api/                 # Route handlers
├── components/
│   ├── ui/                  # shadcn/ui base
│   ├── splash/              # Landing page sections
│   ├── lesson/              # Lesson reader, quiz, parsons
│   ├── review/              # Flashcard components
│   ├── dictionary/          # Term cards, search
│   ├── sandbox/             # Code editor wrappers
│   ├── nav/                 # Navigation components
│   └── motion/              # Animation wrappers
├── content/                 # MDX lessons and dictionary terms
├── lib/                     # Core utilities (db, fsrs, progress)
├── stores/                  # Zustand stores
└── types/                   # TypeScript type definitions
```

## Contributing

DURA is open source and contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a PR.

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Commit messages are enforced by commitlint via Husky pre-commit hooks.

```
feat: add new feature
fix: fix a bug
docs: documentation changes
style: formatting, missing semicolons, etc.
refactor: code change that neither fixes a bug nor adds a feature
perf: performance improvement
test: adding or correcting tests
build: changes to build system or dependencies
ci: CI/CD configuration changes
chore: other changes that don't modify src or test files
```

### Branch Strategy

Trunk-based development with short-lived feature branches:

```bash
git checkout -b feat/splash-page
# make changes
git commit -m "feat: build splash page with scroll animations"
git push origin feat/splash-page
# open PR → CI must pass → merge to main
```

## Curriculum Overview

| Phase | Title                    | Hours | Focus                          |
| ----- | ------------------------ | ----- | ------------------------------ |
| 0     | Digital Literacy         | 50    | Binary, CLI, dev environment   |
| 1     | Programming Fundamentals | 225   | JavaScript, TypeScript         |
| 2     | Web Development          | 275   | React 19, Next.js 15           |
| 3     | CS Fundamentals          | 225   | Data structures, algorithms    |
| 4     | Backend Engineering      | 275   | Node.js, PostgreSQL, Docker    |
| 5     | Systems Engineering      | 350   | OS, networking, DB internals   |
| 6     | AI/ML Engineering        | 400   | LLMs, RAG, MCP, agents         |
| 7     | Advanced Systems         | 350   | Compilers, distributed, Rust   |
| 8     | Professional Practice    | 200   | Testing, CI/CD, architecture   |
| 9     | CTO Track                | 500   | Leadership, strategy, business |

## Standards Alignment

Every lesson maps to industry-recognized standards:

- **ACM CS2023** — Computing Curricula knowledge areas
- **SWEBOK v4** — Software Engineering Body of Knowledge
- **SFIA 9** — Skills Framework for the Information Age
- **Bloom's Taxonomy** — Cognitive learning levels
- **Dreyfus Model** — Skill acquisition stages

## Support the Developer

DURA is free and open source. If this platform helps your journey, consider supporting the work:

☕ $5 · 🍱 $15 · 🚀 $50 · 💚 Custom

Powered by Stripe · [Durwood Studios LLC](https://github.com/Durwood-Studios)

## License

This project is licensed under the **GNU Affero General Public License v3.0** — see [LICENSE](LICENSE) for details.

APIs and integration libraries are licensed under **Apache 2.0**.

---

<div align="center">

**DURA** — A [Durwood Studios LLC](https://github.com/Durwood-Studios) product · Ideation by Dustin Snellings

_Engineering education, hardened by design._

</div>
