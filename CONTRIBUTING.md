# Contributing to DURA

DURA is open source and we welcome contributions. Whether you're fixing a typo, improving a lesson, adding a dictionary term, or building a new feature — thank you.

## Development Setup

### Prerequisites

- Node.js 20+
- npm 10+
- Git

### Getting Started

```bash
git clone https://github.com/Durwood-Studios/Dura.git
cd Dura
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dev server uses Turbopack for fast reloads.

### Verify Your Changes

Before submitting a PR, all three checks must pass:

```bash
npm run build      # Production build — zero errors
npm run lint       # ESLint — zero warnings
npm run typecheck  # TypeScript — zero errors
```

## Project Structure

```
src/
├── app/           # Next.js App Router (routes)
├── components/    # React components (ui, lesson, nav, etc.)
├── content/       # MDX lessons, dictionary terms, question banks
├── lib/           # Core utilities (db, fsrs, analytics, etc.)
├── stores/        # Zustand state management
└── types/         # TypeScript type definitions
```

See [PLANNING.md](PLANNING.md) for the full architecture and design decisions.

## Code Standards

- **TypeScript strict** — no `any` types, ever
- **Tailwind v4** — CSS variables for theming, no inline styles
- **Conventional Commits** — enforced by Husky pre-commit hook
  ```
  feat(lesson): add scroll progress tracker
  fix(review): correct FSRS interval calculation
  docs: update contributing guide
  ```
- **Allowed types:** feat, fix, docs, style, refactor, perf, test, build, ci, chore

## How to Contribute

### Find Something to Work On

1. Check [open issues](https://github.com/Durwood-Studios/Dura/issues) for `good-first-issue` or `help-wanted` labels
2. Browse the dictionary for missing terms
3. Read lessons and flag confusing explanations or errors

### Workflow

1. Fork the repository
2. Create a branch: `git checkout -b feat/your-change`
3. Make your changes (one logical change per PR)
4. Verify: `npm run build && npm run lint && npm run typecheck`
5. Commit with a conventional message
6. Push and open a Pull Request

### UI Changes

Include before/after screenshots for any visual changes. Test on:

- Mobile viewport (375px)
- Dark mode
- Keyboard navigation

## Content Contributions

### Dictionary Terms

Follow the format in `src/content/dictionary/`. Each term needs:

- `slug` — URL-safe identifier
- `beginner` — analogy a non-programmer would understand
- `intermediate` — technical explanation with practical context
- `advanced` — spec-level precision with edge cases
- `seeAlso` — related terms that exist in the dictionary

### Lesson Improvements

- Fix typos and unclear explanations
- Add better examples or exercises
- Improve quiz questions and explanations
- Ensure sandbox exercises use pure JS only (no `require`, `import`, or DOM)

### Translation

Not yet supported but planned. If you're interested in translating DURA, open an issue to discuss.

## What NOT to Do

- **Don't add payment gates.** DURA is free forever. See CLAUDE.md Rule 7.
- **Don't add unapproved dependencies.** Check the approved list in CLAUDE.md before installing anything.
- **Don't submit bulk AI-generated PRs without review.** AI-assisted is fine. AI-dumped is not.
- **Don't add `any` types, `@ts-ignore`, or swallow errors silently.**

## Community

- Read our [Code of Conduct](CODE_OF_CONDUCT.md)
- Every contributor is a stakeholder in DURA's mission
- Be constructive in code reviews — we're all learning

## License

- Core platform: [AGPLv3](LICENSE)
- APIs and integrations: Apache 2.0

By contributing, you agree to license your contribution under the same terms.

---

Built by [Durwood Studios LLC](https://github.com/Durwood-Studios) · Ideation by Dustin Snellings
