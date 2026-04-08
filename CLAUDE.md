# CLAUDE.md — DURA Project Intelligence

> This file governs how Claude Code operates on the DURA codebase.
> Every rule exists because of a real mistake or a real best practice.
> Read this completely before writing any code.

---

## IDENTITY

You are working on **DURA**, an open-source LMS built by Durwood Studios LLC.
Repository: `github.com/Durwood-Studios/Dura`
Owner: Dustin Snellings
Stack: Next.js 15, TypeScript strict, Tailwind v4, Supabase, Vercel

---

## RULE 0: TRUST BUT VERIFY

You are a powerful tool. You are not infallible.

- Before claiming a library exists, verify it. Run `npm view <package>` or search for it.
- Before claiming an API exists, check the docs. Do not invent endpoints, methods, or parameters.
- Before claiming a file exists in this repo, run `ls` or `cat` to confirm.
- Before claiming a config option works, verify it against the tool's current documentation.
- If you are less than 90% confident about something, say so explicitly: "I'm not certain about X — let me verify."
- Never fabricate import paths, function signatures, or package names. If you don't know, say "I need to check."
- When in doubt, read the source. `cat node_modules/<package>/package.json` is your friend.

**The cost of admitting uncertainty is zero. The cost of hallucinating is rework, broken builds, and lost trust.**

---

## RULE 1: TOKEN DISCIPLINE

Tokens are not free. Every response should earn its length.

### DO:

- Lead with the answer, then explain if needed
- Use code blocks — they communicate faster than prose
- One change per response when possible
- If a fix is 3 lines, respond with 3 lines — not a paragraph explaining what 3 lines do
- Batch related file changes into a single response
- When reading files for context, read only what you need — not entire directories

### DO NOT:

- Repeat back what the user just said
- Explain what you're "about to do" — just do it
- List every file you changed with descriptions of each change — the diff speaks for itself
- Add "Let me know if you need anything else" or other filler
- Regenerate entire files when a 2-line edit suffices — use targeted edits
- Provide multiple alternative approaches unless explicitly asked — pick the best one and commit

### RESPONSE LENGTH GUIDE:

- Bug fix: 5-20 lines (code only, root cause in a comment if non-obvious)
- New component: The component code + one sentence on usage
- Architecture question: 3-5 sentences max, then a code example
- "What should I do next?": Numbered list, 1 sentence per item

---

## RULE 2: CODE QUALITY STANDARDS

Every line of code must meet these standards. No exceptions. No "we'll fix it later."

### TypeScript

- `strict: true` is non-negotiable — it's already in tsconfig.json
- Zero `any` types. Use `unknown` + type guards if the type is truly unknown.
- Zero `@ts-ignore` or `@ts-expect-error` without an accompanying explanation comment
- All function parameters and return types must be explicitly typed
- Use `interface` for object shapes, `type` for unions/intersections/utilities
- Prefer `const` assertions and `satisfies` over type casting

### Error Handling

- Every async function must have error handling — try/catch or .catch()
- Never swallow errors silently. At minimum: `console.error(error)`
- User-facing errors must have human-readable messages
- API routes must return appropriate HTTP status codes with error bodies

### Naming

- Components: PascalCase (`LessonReader.tsx`)
- Utilities/hooks: camelCase (`useProgress.ts`, `formatTime.ts`)
- Constants: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- Types/Interfaces: PascalCase (`LessonProgress`, `PhaseConfig`)
- Files match their default export name
- Boolean variables: prefix with `is`, `has`, `should`, `can` (`isLoading`, `hasCompleted`)

### Comments

- Comment the WHY, never the WHAT
- If the code needs a WHAT comment, the code is too complex — simplify it
- TODOs must include context: `// TODO(dustin): Add retry logic after Judge0 integration`
- JSDoc on all exported functions and components

### Imports

- Use `@/*` path alias (maps to `src/*`)
- Group imports: React → Next.js → External libs → Internal modules → Types
- No barrel exports (`index.ts` re-exports) — they break tree shaking

---

## RULE 3: ARCHITECTURE

### File Organization

Follow the project structure in README.md exactly. Do not create new top-level directories without explicit approval. New components go in the appropriate subdirectory under `src/components/`.

### Component Patterns

- Server Components by default. Only add `"use client"` when you need:
  - useState, useEffect, useRef, or other hooks
  - Event handlers (onClick, onChange, etc.)
  - Browser APIs (localStorage, IntersectionObserver, etc.)
- Extract client interactivity into small wrapper components — keep the parent as a Server Component
- Props interfaces defined in the same file, above the component
- No prop drilling beyond 2 levels — use Zustand stores or React Context

### Styling

- Tailwind v4 utility classes only. No inline styles. No CSS modules.
- Tailwind v4 has NO config file. Custom values go in `@theme` in globals.css.
- Use CSS variables from the design system (see DESIGN SYSTEM section below)
- Responsive: mobile-first. Use `sm:`, `md:`, `lg:` breakpoints.
- Dark mode is the default. Light mode is a toggle.

### State Management

- URL state for navigation/filters (useSearchParams)
- React state for ephemeral UI (dropdowns, modals)
- Zustand for cross-component state (progress, preferences, goals)
- IndexedDB for persistent offline data (via idb library)
- Supabase for cross-device sync (optional, never required)

### Data Flow

```
User Action → Zustand Store → IndexedDB (immediate, offline)
                            → Supabase Sync (background, when online)
```

The app MUST work fully without Supabase. Auth is optional. Sync is optional. Offline is not optional.

---

## RULE 4: SECURITY

- Never hardcode secrets, API keys, or credentials in source code
- All secrets go in `.env.local` (already in .gitignore)
- Supabase anon key is safe for client-side (it's designed for this) — but NEVER expose the service_role key
- All user input must be validated before processing (use Zod)
- SQL via Supabase client is parameterized by default — never concatenate user input into queries
- Content Security Policy headers must be configured in next.config.ts
- RLS policies on every Supabase table — no exceptions
- The `SUPABASE_SERVICE_ROLE_KEY` must never exist in this codebase. The only Supabase keys permitted are `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — both public by design. RLS protects the data. If admin access is ever needed, it will be discussed and approved explicitly before any implementation.

---

## RULE 5: TESTING MINDSET

- When fixing a bug, describe what test would have caught it
- When adding a feature, consider: what breaks if this input is null? empty? enormous?
- Edge cases to always consider: empty arrays, undefined values, network timeout, offline state, screen readers
- Before marking any task complete, mentally run through: "What happens on mobile? What happens offline? What happens with 0 items? What happens with 10,000 items?"

---

## RULE 6: GIT DISCIPLINE

- Conventional Commits enforced by commitlint (Husky pre-commit hook)
- Format: `type(scope): description` — e.g., `feat(lesson): add scroll progress tracker`
- Allowed types: feat, fix, docs, style, refactor, perf, test, build, ci, chore
- Keep commits atomic — one logical change per commit
- Never commit: node_modules, .env.local, .next, build artifacts, DS_Store

---

## RULE 7: FREE FOREVER

DURA's core platform is free. Permanently. This is a Durwood Studios LLC commitment.

- NEVER build feature gates that check payment or subscription status
- NEVER create "premium" content tiers within the core curriculum
- NEVER add "upgrade to unlock" UI anywhere in the learning experience
- NEVER paywall lessons, dictionary terms, flashcards, sandboxes, or verification
- The "Support the Developer" tip button is voluntary — it unlocks nothing
- The AGPLv3 license legally guarantees the source stays open

Future revenue (if any) comes from NEW products built ON TOP of DURA: managed hosting, enterprise SSO, white-label, analytics dashboards, consulting. Never from restricting what already exists. Trust at scale is the product.

If any code review reveals a payment gate on core features, it is a bug. Revert it immediately.

---

## DESIGN SYSTEM

### Colors (use these CSS custom properties)

```css
--bg-primary: #08080d;
--bg-surface: rgba(255, 255, 255, 0.04);
--bg-surface-hover: rgba(255, 255, 255, 0.06);
--border: rgba(255, 255, 255, 0.08);
--text-primary: #f0f0f0;
--text-secondary: #a0a0a8;
--text-muted: #6b6b75;
--accent-emerald: #10b981;
--accent-cyan: #06b6d4;
```

### Phase Colors

```
Phase 0: #6ee7b7    Phase 5: #f0abfc
Phase 1: #93c5fd    Phase 6: #67e8f9
Phase 2: #c4b5fd    Phase 7: #fcd34d
Phase 3: #fda4af    Phase 8: #a3e635
Phase 4: #fdba74    Phase 9: #f472b6
```

### Typography

```
Body/Headings: "DM Sans" (400/500/600/700)
Code:          "JetBrains Mono" (400/500)
Accent:        "Instrument Serif" (italic, for taglines only)
Body size:     16-18px desktop, 15-16px mobile
Line height:   1.8 for reading, 1.5 for UI
Code size:     14px
Max content:   700px for reading
```

### Animation Timing

```
Hover:           150-250ms
Page transition: 300-500ms
Scroll reveal:   400-800ms ease-out
List stagger:    50-100ms between items
Spring:          stiffness 300, damping 30
```

### Component Style

- Glass morphism cards: bg-surface + border + backdrop-blur-xl
- Rounded corners: 8px (buttons), 12px (cards), 16px (modals)
- Minimum tap target: 48px on mobile
- Focus indicators: 2px ring, emerald color, visible on all interactive elements

---

## DEPENDENCIES — APPROVED LIST

Only install packages from this list without asking. Anything else requires explicit approval.

### Already Installed

- next, react, react-dom
- typescript, @types/node, @types/react, @types/react-dom
- tailwindcss, @tailwindcss/postcss, postcss
- eslint, eslint-config-next, @eslint/eslintrc
- prettier, prettier-plugin-tailwindcss, eslint-config-prettier
- husky, lint-staged, @commitlint/cli, @commitlint/config-conventional

### Approved to Install (when needed)

- @supabase/supabase-js, @supabase/ssr (auth + database)
- zustand (state management)
- idb (IndexedDB wrapper)
- serwist, @serwist/next (PWA)
- next-mdx-remote (MDX content)
- shiki (syntax highlighting)
- motion (Framer Motion v12, animations)
- gsap (scroll-triggered animations)
- lenis (smooth scrolling)
- zod (runtime validation)
- lucide-react (icons)
- @radix-ui/\* (component primitives, via shadcn/ui)
- class-variance-authority, clsx, tailwind-merge (shadcn/ui utilities)
- @sandpack/react (code sandboxes)
- @codemirror/\* or monaco-editor (code editor)

### NOT Approved (do not install)

- axios (use native fetch)
- lodash (use native JS methods)
- moment/dayjs (use Intl.DateTimeFormat or date-fns if truly needed)
- styled-components, emotion, CSS modules (Tailwind only)
- Redux, MobX, Jotai, Recoil (Zustand only)
- Any ORM (use Supabase client directly)
- Any AI/LLM SDK (defer to explicit instruction)

---

## WORKFLOW

When starting a new task:

1. Read the relevant section of PLANNING.md if it exists
2. Check for existing patterns in the codebase — match them
3. Implement the smallest working version first
4. Verify it builds: `npm run build`
5. Verify it lints: `npm run lint`
6. Verify types: `npm run typecheck`
7. Commit with conventional message

When you encounter ambiguity:

1. State the ambiguity clearly
2. Propose your best recommendation with reasoning
3. Ask for confirmation before proceeding
4. Do NOT guess and implement silently

---

## WHAT SUCCESS LOOKS LIKE

A successful contribution to DURA:

- Builds without errors (`npm run build` passes)
- Lints without warnings (`npm run lint` passes)
- Type checks without errors (`npm run typecheck` passes)
- Works on mobile (responsive, 48px tap targets, readable)
- Works offline (no Supabase dependency for core features)
- Follows the design system (colors, fonts, spacing from this file)
- Commits follow conventional format
- No `any` types, no swallowed errors, no hardcoded secrets
- Component is accessible (keyboard nav, screen reader, focus visible)

---

## QUICK REFERENCE

```bash
npm run dev          # Dev server with Turbopack
npm run build        # Production build (must pass before commit)
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix lint issues
npm run format       # Format all files with Prettier
npm run format:check # CI formatting check
npm run typecheck    # TypeScript check
```

## REMEMBER

- You are building a learning platform for real people.
- Every pixel, every interaction, every error message matters.
- Offline-first is not a feature — it is the architecture.
- Admit what you don't know. Verify what you think you know.
- Ship quality. There is no "we'll fix it later."
