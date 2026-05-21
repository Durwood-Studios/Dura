# DURA Feature Module Standard 1.0

**Version:** 1.0 | **Date:** 2026-05-18 | **Status:** Active
**Depends on:** DLS-1.0, DLS-2.0 (visual + motion), LP-1.0 (when the feature touches lessons), AINDGS-1.0 (AI provenance)
**Governs:** every new feature added to DURA — its folder shape, its code-splitting posture, its design-token discipline, and the surface area it is allowed to touch.
**One sentence:** Every DURA feature ships as a self-contained module that respects the design language, lazy-loads its weight, and cannot regress core learner-facing functionality.

---

## Purpose

DURA is growing in scope (auto-grader, /standards index, AI tutor, animated icon library, cohort mode, verifiable credentials) while staying a solo project on Free-Forever economics. Without a feature-module standard, each new addition drifts in style, blows up the bundle, or breaks an existing learner flow. FM-1.0 is the contract that prevents that drift.

The 10x constraint FM-1.0 breaks: most growing codebases trade quality for velocity. FM-1.0 makes velocity _and_ quality the default by encoding the patterns that prevent rework — design tokens, dynamic imports, additive content contracts, server-by-default — as conformance rules rather than aspirations.

---

## The Core Invariant

> **A new feature ships when it (a) styles itself entirely from DLS tokens, (b) costs the cold-load bundle nothing the learner doesn't immediately need, (c) leaves every previously-working lesson, sandbox, and review session bit-identical, and (d) follows the folder convention so a future contributor can find every piece of it in one place.**

Four follow-ons:

1. **No hard-coded design values.** If you're typing a hex color, an arbitrary px size, or a Tailwind `text-[Npx]` outside the design system, you're outside the standard.
2. **No eager imports of heavy dependencies on the critical path.** Sandpack, CodeMirror, GSAP, anything > ~30KB gzip must be `next/dynamic` with a Skeleton fallback.
3. **No silent breakage of content contracts.** Frontmatter shape, MDX component props, sandbox `testCases`, vocabulary slugs, certificate hash inputs — these are public APIs to learners and content authors. Additive only.
4. **Single home per feature.** `src/lib/<feature>/`, `src/components/<feature>/`, `src/stores/<feature>.ts` — discoverable by `<feature>` name across every layer.

---

## Folder Convention

Every non-trivial feature follows this layout. Skip a layer only when the feature genuinely doesn't need it.

```
src/lib/<feature>/                   pure logic, server-safe, no React
  index.ts                           public API of the feature
  types.ts                           shared types
  <internal>.ts                      private helpers
src/components/<feature>/            UI
  <Feature>.tsx                      server-component entrypoint (default)
  <Feature>Client.tsx                client-only inner, dynamically imported by entrypoint
  <Feature>Skeleton.tsx              SSR-safe skeleton fallback
src/stores/<feature>.ts              Zustand store (only if cross-component state needed)
src/lib/db/<feature>.ts              IndexedDB persistence (only if persisted locally)
src/lib/supabase/queries/<feature>.ts   remote sync (only if cross-device sync needed)
src/app/(app)/<feature>/page.tsx     route (only if a top-level page exists)
```

If a "feature" is one small component (e.g. a chip), inline placement under an adjacent feature folder is acceptable — the standard governs scope, not bureaucracy.

---

## Server-vs-Client Discipline

Server Component by default. Add `"use client"` only when at least one of these is true:

- Uses `useState`, `useEffect`, `useRef`, `useReducer`, `useMemo` with reactive deps, or any other React hook.
- Attaches event handlers (onClick, onChange, onKeyDown, etc.).
- Touches browser APIs (window, localStorage, IndexedDB, IntersectionObserver, ResizeObserver, MediaQueryList).
- Renders an interactive primitive (Radix dialog, popover, command palette).

If a component renders only as a wrapper around a dynamically imported client component, it is a Server Component, not a client component. (Today, `src/components/sandbox/FreeformSandbox.tsx` violates this — owed cleanup.)

---

## Dynamic-Import Threshold

A component MUST be wrapped in `next/dynamic` (with `ssr: false` where appropriate) when any of these hold:

- Its transitive deps add > ~30KB gzipped to the route bundle.
- It depends on a browser-only API that crashes during SSR (Sandpack, CodeMirror, WebGL).
- It is not on the critical render path for the route (deferred reveal, modal, drawer).

Examples in the current codebase:

| Component                                  | Why dynamic                                                                                                                |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `SandboxExerciseInner`                     | Sandpack pulls in a webcontainer-class bundle. Pattern: dynamic + Skeleton + ErrorBoundary fallback. **Conformant today.** |
| `FreeformSandbox` / `FreeformSandboxInner` | Same as above. Conformant pattern, but the wrapper is needlessly `"use client"` — fix owed.                                |
| `CommandPalette`                           | Cmd-K modal, off critical path. **Currently eager — owed dynamic conversion.**                                             |
| `Confetti`                                 | Only fires on celebration. **Currently eager — owed dynamic conversion.**                                                  |
| `ReviewSession`                            | Heavy, route-scoped. Acceptable to eager-import inside `/review`; do not import from outside that route.                   |

All dynamic imports MUST provide:

```ts
const Feature = dynamic(() => import("./FeatureClient"), {
  ssr: false,                              // only if SSR is impossible
  loading: () => <FeatureSkeleton />,      // not null, not blank — a layout-stable placeholder
});
```

And MUST be wrapped in an Error Boundary with a graceful fallback if the chunk fails (network failure, ad-blocker, etc.). See `SandboxExercise.tsx` for the canonical pattern.

---

## Design Token Discipline

This section IS DLS-1.0's enforcement spec for the code layer.

**Allowed:**

- CSS custom properties from DLS-1.0: `var(--color-text-primary)`, `var(--color-bg-surface)`, `var(--color-accent)`, `var(--color-celebration)`, `var(--color-border)`, etc.
- Tailwind utilities that resolve to those properties (`text-emerald-500` is acceptable for celebration semantics; the design tokens are the preferred form).
- DLS-1.0 typographic scale: `text-xs` (12px floor), `text-sm`, `text-base`, `text-lg`, …
- DLS-1.0 radius scale: `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`.
- DLS-2.0 motion vocabulary: `SPRINGS.snappy | fluid | settle | drift | bounce` from `src/lib/motion/springs.ts`.

**Banned:**

- Arbitrary px sizes for _text_: `text-[10px]`, `text-[11px]`, `text-[14px]` — use the scale. Sub-`text-xs` (under 12px) violates the WCAG 2.2 AA project bar and is non-conformant.
- Arbitrary hex colors in className strings or inline styles outside `standards/dls/` and `src/app/globals.css`. Add a token if a new color is genuinely needed.
- Tailwind `text-[Npx]` with N < 12, anywhere, ever.
- Inline `style={{...}}` for layout. Animation-only styles driven by Motion variants are exempt.
- CSS modules, styled-components, emotion. Per CLAUDE.md.

Existing violations (50+ files) are tracked as an owed cleanup commit; do not introduce new ones.

---

## Motion Discipline

All animation MUST go through the `motion` library (Framer Motion v12) and the DLS-2.0 `SPRINGS` vocabulary. Direct CSS transitions are acceptable only for hover-state color/opacity changes ≤ 150ms.

Every animation MUST check `useMotionPreference` (or its underlying primitive) for `prefers-reduced-motion`:

- **Reduced-motion = true:** static state, no transition, no auto-play, no loop. Component remains functional.
- **Looping animations:** require explicit motion-preference gating _and_ a user-visible disable.
- **Signature moments** (lesson complete, mastery unlock, level up): allowed bigger animation budgets; still reduced-motion-aware.

Animated icons (e.g. `@lucide-animated/*`) MUST be used surgically — celebration, success, mastery, sync-complete moments only. They are NOT a replacement for the persistent UI icon set (`lucide-react`), which stays static. This is the "premium hardware, not gamified software" principle from DLS-2.0.

---

## Lesson Content Contract

Features that read or write lesson content are bound by an extra rule: **the public content shape is additive-only.**

This means:

- New optional frontmatter fields: **allowed.**
- Renaming an existing frontmatter field: **not allowed** without an LP-1.0 amendment and a bulk content migration in the same commit.
- New MDX components (`<Diagram>`, `<Callout>`, etc.): **allowed** if registered in `src/components/lesson/MDXComponents.tsx`.
- Changing the prop shape of an existing MDX component: **not allowed.** Add a new component with the new shape; deprecate the old over a versioned migration.
- Changing the testCases / vocabulary slug interpretation: **not allowed** without an explicit LP-1.0 amendment.

The 442 existing lessons are the contract surface. Breakage there is a learner-facing regression and a CLAUDE.md core-features violation.

---

## Worked Example: StandardsBadges

The feature shipped on 2026-05-18 (`b2e9673`, `412527a`) is the worked example of an FM-1.0-conformant feature.

| FM-1.0 rule              | How StandardsBadges satisfies it                                                                                                         |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Folder convention        | `src/lib/standards.ts` (logic) + `src/components/lesson/StandardsBadges.tsx` (UI). Two files, named after the feature, no orphan layers. |
| Server-vs-client         | `"use client"` because it manages popover open state — earns the directive.                                                              |
| Dynamic-import threshold | Tiny (~3KB). Eager import is correct.                                                                                                    |
| Design tokens            | All colors via `var(--color-*)` tokens. All text at `text-xs` or larger. No arbitrary hex.                                               |
| Motion                   | No motion. Hover/open are CSS-transition affordances at < 150ms. No motion-preference gating needed.                                     |
| Content contract         | Reads existing frontmatter shape additively; no rename, no rewrite.                                                                      |
| Provenance               | Commits tagged `[AI: claude-code ~95%]` per AINDGS-1.0.                                                                                  |

Owed nice-to-haves not blocking conformance: a `StandardsBadgesSkeleton` for the rare zero-data case, a unit test for `buildBadges`.

---

## Conformance

A feature is **FM-1.0 conformant** when all of:

1. Folder convention is followed (or the feature is small enough that inline placement is justified).
2. Server-vs-client decision is correct per the [discipline rules](#server-vs-client-discipline).
3. Heavy components are dynamically imported with Skeleton + Error Boundary.
4. Zero new design-token violations (no banned arbitrary px / hex / sub-`text-xs`).
5. Motion uses the DLS-2.0 vocabulary and respects reduced-motion.
6. No regression to any existing lesson, sandbox, review, dashboard, dictionary, certificate, or settings flow.
7. No new runtime dependency outside CLAUDE.md's approved list (without explicit approval and an ADR).
8. Commit follows AINDGS-1.0 provenance format.

Non-conformance is a review blocker.

---

## Anti-patterns

- **The eager modal.** Importing a Cmd-K palette / dialog / drawer at the route boundary instead of dynamically. Bundle penalty for a feature most users never open.
- **The "use client" wrapper.** A Server Component file that only delegates to a dynamic client import does not need `"use client"`. Strip it; saves a hydration boundary.
- **The drive-by token violation.** Reaching for `text-[11px]` because `text-xs` "feels too big" instead of fixing the surrounding layout. The DLS exists so we never have this conversation.
- **The silent content break.** Renaming `meta.standards.cs2023` to `meta.standards.acm2023` because the new name "reads better" — breaks every lesson that references it and every component that consumes the field.
- **The new color.** Inventing a hex value in a new chip / badge / banner because none of the existing tokens "fit". Either add a token (DLS amendment) or pick the closest existing one.
- **The animated everywhere.** Replacing static icons with looping animated ones across the entire UI. Read CLAUDE.md Design System §Component Style.
- **The unauthorized dependency.** `npm install some-cool-thing` without checking the approved list. CLAUDE.md is explicit.

---

## Relationship to Other Standards

- **DLS-1.0** is the visual spec; FM-1.0 enforces it at the code layer.
- **DLS-2.0** is the motion spec; FM-1.0 enforces motion-preference and the SPRINGS vocabulary.
- **LP-1.0** is the lesson content spec; FM-1.0's "lesson content contract" section is the code-layer expression of LP-1.0's stability promise.
- **AINDGS-1.0** is the AI governance spec; FM-1.0 inherits its provenance tag requirement and high-risk-surface flags.
- **LFLRS-1.0** is the learner record format; FM-1.0 features that touch the record MUST conform to LFLRS shape.
- **PPLAS-1.0** is the analytics spec; FM-1.0 features emit only events listed in PPLAS's catalog.

FM-1.0 does not invent new policy. It is the cross-cutting enforcement layer that makes the other standards executable in code.

---

## Changelog

| Date       | Change                  | Rationale                                                                                                                                                                       |
| ---------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-18 | Initial FM-1.0 standard | Founder constraint: as new features land, design language must ship with them, dynamic imports must keep the bundle honest, and no new feature may regress a core learner flow. |
