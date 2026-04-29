# DURA Design Language Standard (DLS-1.0)

**Version:** 1.0 | **Date:** 2026-04-25 | **Status:** Active
**Scope:** Visual language, interaction model, and surface-specific design
for DURA — Classroom, Dojo, and Discover
**Issued by:** Durwood Studios LLC (novel standard)

---

## Purpose

DLS-1.0 defines the design language that governs every visual and
interaction decision in DURA. It exists to solve the gap left by every
existing learning platform: they all choose between "engaging but
cognitively noisy" (Duolingo) or "powerful but hostile" (Anki). Neither
treats the UI as a performance environment where cognitive load reduction
IS the design goal.

DURA's users are serious adult learners under real pressure — interview
prep, certification, career-level skill acquisition. They do not need
dopamine loops and cartoon owls. They need a focused environment that
disappears behind the material, delivers precise feedback, and earns
trust through consistency.

**The one-sentence design philosophy:**
The interface wins when the learner forgets it exists.

**This standard does NOT cover:** branding/marketing pages, email design,
or content authored inside MDX files.

---

## Competitive Landscape Map

Where DURA sits among its peers:

```
                    PLAYFUL/GAMIFIED
                          ↑
                       Duolingo
                     Quizlet
              Memrise
                          |
SIMPLE ←──────────────────┼──────────────────→ POWERFUL
    Mochi    RemNote  DURA★                 Anki
                          |
              Khan Academy
                    Coursera
                          ↓
                   STRUCTURED/CALM
```

**DURA's position:** Powerful and calm. Not playful. Not hostile.
Maximum information density at minimum cognitive load.
The Linear of learning platforms.

**What each competitor does well (and DURA inherits):**

- Duolingo: Instant feedback, streak momentum, session pacing
- Anki: Algorithm trust, no distractions during review
- Mochi: Calm dark UI, keyboard-first, respects learner's focus
- Linear (not a learning app): The gold standard for
  "dark mode + dense information + zero clutter"
- RemNote: Knowledge connectivity, bidirectional context

**What every competitor does wrong (DURA inverts):**

- Duolingo: UI competes with content for attention. Characters,
  animations, and gamification fire DURING the learning moment —
  exactly when attention should be on the material.
- Anki: 2012 visual language creates friction before the first card.
  Bad design makes learners distrust the algorithm.
- RemNote: Pro-user power comes at the cost of onboarding.
  Cognitive overhead before the learner learns anything.
- Quizlet: Optimized for cramming, not retention. The design
  reflects the algorithm — shallow and social.

---

## Principles

**P1 — Cognitive Load Is the Enemy**
Every visual element that doesn't directly support the learning moment
is cognitive overhead. Headers, decorations, animations, notifications,
and social signals that fire during review all tax the working memory
the learner needs for the material. Eliminate first; ask questions later.

_Rationale: Sweller's Cognitive Load Theory (1988, extended 2011)
identifies extraneous load — processing caused by poor interface design —
as the primary enemy of learning. DURA's UI is the substrate. It must
be invisible._

**P2 — Feedback is the Primary Interaction**
In a learning platform, feedback is not a feature — it is the core
interaction. Every user action must receive immediate, precise, and
proportional feedback. Not celebration. Not punishment. Signal.

_Rationale: Hattie & Timperley's 2007 meta-analysis (effect size d=0.73)
identifies feedback as one of the highest-impact influences on achievement.
The UI's job is to deliver that feedback without distortion._

**P3 — Surface-Specific Emotional Register**
Each of DURA's three surfaces has a distinct emotional register and
must be designed accordingly. Violating register breaks the learner's
mental model.

- Classroom: Calm, structured, patient. A well-lit library.
- Dojo: Focused, taut, precise. A training floor.
- Discover: Open, curious, browsable. A well-curated bookshop.

_Rationale: Users calibrate their attention and tolerance for difficulty
based on environmental cues. The Dojo's UI must signal "this is performance
mode" without saying it. The Classroom must signal "this is safe to explore."_

**P4 — Dark Mode is the Default**
DURA defaults to dark mode. Light mode is available. Dark is canonical.

_Rationale: Serious adult learners studying for high-stakes goals often
work at night, in low-light environments, or for extended sessions.
Dark mode reduces eye strain at the performance layer. It also sets
the emotional register — dark is focused, serious, and high-contrast.
Duolingo is green and lime. DURA is not Duolingo._

**P5 — Keyboard is a First-Class Citizen**
Every core interaction in DURA must be completable without a mouse.
The rating buttons (Again/Hard/Good/Easy), navigation between cards,
session start/end, and mode switching all have keyboard shortcuts.
Keyboard shortcuts are discoverable, not hidden.

_Rationale: Power users — DURA's primary audience — reach for the
keyboard. Forcing mouse use during a review session breaks flow and
adds latency to what should be a sub-second rating interaction._

**P6 — Typography Carries the Information Architecture**
DURA uses a maximum of 2 typefaces in any context. Type scale, weight,
and tracking do the hierarchy work. Color is used for state, not structure.

_Rationale: Typographic hierarchy is processed pre-attentively.
Color used for structure requires active cognitive processing.
Learning platforms that use color to communicate hierarchy
(most of them) tax the working memory. DURA doesn't._

**P7 — Progress is Always Visible, Never Central**
The learner always knows where they are in a session and in a module.
But progress indicators never compete with the content for visual
primacy. They live in the periphery and update quietly.

_Rationale: Excessive gamification (Duolingo's path, Quizlet's
score screens) shifts attention from learning to performing.
DURA shows progress to inform, not to reward. The distinction
is architectural._

---

## Design Tokens — The Canonical Values

### Color System (OKLCH — perceptually uniform, accessible)

```css
/* === DURA COLOR TOKENS v1.0 === */

/* --- Base surfaces --- */
--color-surface-0: oklch(8% 0 0); /* deepest bg — app shell */
--color-surface-1: oklch(11% 0 0); /* card surfaces, panels */
--color-surface-2: oklch(15% 0 0); /* elevated — modals, popovers */
--color-surface-3: oklch(19% 0 0); /* hover states */

/* --- Text --- */
--color-text-primary: oklch(93% 0 0); /* body, labels */
--color-text-secondary: oklch(65% 0 0); /* meta, timestamps, hints */
--color-text-tertiary: oklch(40% 0 0); /* disabled, placeholders */

/* --- Accent — DURA Blue --- */
--color-accent: oklch(65% 0.18 250); /* primary CTA, focus rings */
--color-accent-hover: oklch(70% 0.18 250);
--color-accent-muted: oklch(65% 0.08 250); /* accent surface tint */

/* --- FSRS Rating Colors (semantic — not decorative) --- */
--color-rating-again: oklch(58% 0.2 20); /* red — Again */
--color-rating-hard: oklch(68% 0.18 50); /* amber — Hard */
--color-rating-good: oklch(68% 0.18 145); /* green — Good */
--color-rating-easy: oklch(65% 0.18 250); /* blue — Easy */

/* --- Dojo surface overrides (taut, darker) --- */
--color-dojo-surface-0: oklch(6% 0 0);
--color-dojo-accent: oklch(65% 0.22 250); /* slightly more saturated */

/* --- Classroom surface overrides (slightly warmer) --- */
--color-classroom-surface-1: oklch(12% 0.01 90);

/* --- Discover surface overrides (slightly cooler) --- */
--color-discover-surface-1: oklch(12% 0.01 250);

/* --- Semantic states --- */
--color-success: oklch(68% 0.18 145);
--color-warning: oklch(75% 0.18 85);
--color-error: oklch(58% 0.22 20);
--color-info: oklch(65% 0.18 250);

/* --- Borders --- */
--color-border: oklch(20% 0 0);
--color-border-strong: oklch(28% 0 0);
--color-border-focus: var(--color-accent);
```

### Typography System

```css
/* === DURA TYPE TOKENS v1.0 === */

/* Primary: Geist (Vercel) — clean, technical, neutral authority */
/* Secondary: Geist Mono — code, intervals, FSRS stats */
/* Fallback stack for both: system-ui, sans-serif */

--font-primary: "Geist", system-ui, sans-serif;
--font-mono: "Geist Mono", "Fira Code", monospace;

/* --- Scale (fluid, clamp-based) --- */
--text-xs: clamp(0.625rem, 0.6vw + 0.5rem, 0.75rem); /* 10–12px */
--text-sm: clamp(0.75rem, 0.7vw + 0.6rem, 0.875rem); /* 12–14px */
--text-base: clamp(0.875rem, 0.8vw + 0.7rem, 1rem); /* 14–16px */
--text-lg: clamp(1rem, 1vw + 0.75rem, 1.25rem); /* 16–20px */
--text-xl: clamp(1.25rem, 1.5vw + 0.9rem, 1.5rem); /* 20–24px */
--text-2xl: clamp(1.5rem, 2vw + 1rem, 2rem); /* 24–32px */
--text-3xl: clamp(2rem, 3vw + 1.25rem, 3rem); /* 32–48px */

/* --- Weights --- */
--weight-normal: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;

/* --- Leading --- */
--leading-tight: 1.25; /* headings */
--leading-snug: 1.375; /* subheadings */
--leading-normal: 1.5; /* body */
--leading-relaxed: 1.625; /* long-form content in Classroom */

/* --- Tracking --- */
--tracking-tight: -0.025em; /* large display headings */
--tracking-normal: 0em;
--tracking-wide: 0.05em; /* small caps, status labels */
--tracking-widest: 0.1em; /* section labels, UI chrome */
```

### Spacing System (4px base grid)

```css
/* === DURA SPACING TOKENS v1.0 === */

--space-1: 0.25rem; /* 4px  — icon gap, tight list items */
--space-2: 0.5rem; /* 8px  — component internal padding */
--space-3: 0.75rem; /* 12px — small component gap */
--space-4: 1rem; /* 16px — base unit */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px — section internal gap */
--space-8: 2rem; /* 32px — component group spacing */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px — major section gap */
--space-16: 4rem; /* 64px — page section spacing */
--space-24: 6rem; /* 96px — hero/large section gap */

/* --- Radius --- */
--radius-sm: 4px; /* inputs, tags */
--radius-md: 8px; /* cards, panels */
--radius-lg: 12px; /* modals, large cards */
--radius-xl: 16px; /* Discover cards */
--radius-full: 9999px; /* pills, avatars, rating buttons */
```

### Motion System

```css
/* === DURA MOTION TOKENS v1.0 === */

/* Philosophy: Motion communicates state change. It does not celebrate. */
/* Duration matches cognitive expectation — not so fast it's invisible,
   not so slow it's an obstacle. */

/* --- Durations --- */
--duration-instant: 50ms; /* state micro-feedback (button press) */
--duration-fast: 120ms; /* rating button color change */
--duration-normal: 200ms; /* card transitions, panel slide */
--duration-slow: 350ms; /* modal enter, mastery unlock */
--duration-deliberate: 600ms; /* progress bar fill, FSRS interval reveal */

/* --- Easings --- */
--ease-out: cubic-bezier(0, 0, 0.2, 1); /* elements entering */
--ease-in: cubic-bezier(0.4, 0, 1, 1); /* elements leaving */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1); /* position changes */
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275); /* rating reveal */

/* --- Reduced motion --- */
/* @media (prefers-reduced-motion: reduce) { all transitions: none } */
/* This is a requirement, not a recommendation. */
```

---

## Surface-Specific Design

### 1. The Review Card (Classroom + Dojo core)

The review card is DURA's highest-stakes UI component. Every design
decision here compounds across thousands of sessions.

**Information hierarchy:**

```
┌─────────────────────────────────────────┐
│  [Progress bar — 2px, top edge only]    │
│                                         │
│  Deck name                    [N] cards │  ← text-sm, text-secondary
│                                         │
│  ─────────────────────────────────────  │  ← hairline border
│                                         │
│                                         │
│         CARD FRONT CONTENT              │  ← text-xl, center
│         (question or prompt)            │
│                                         │
│                                         │
│  ─────────────────────────────────────  │  ← hairline border
│                                         │
│  [           Show Answer          ]     │  ← full-width, space-4 padding
└─────────────────────────────────────────┘
```

**After answer reveal:**

```
┌─────────────────────────────────────────┐
│  [Progress bar]                         │
│                                         │
│  CARD FRONT                             │  ← text-sm, text-secondary
│  ─────────────────────────────────────  │
│                                         │
│         CARD BACK CONTENT               │  ← text-lg, center
│         (answer)                        │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Next review times (shown on hover):    │  ← text-xs, text-tertiary
│  Again: 10m  Hard: 3d  Good: 7d  Easy: 14d │
│                                         │
│  [ Again ]  [ Hard ]  [ Good ]  [ Easy ]│  ← rating buttons
└─────────────────────────────────────────┘
```

**Rating Button Specification:**

```
Size:        44×44px minimum (WCAG 2.2 SC 2.5.8 + Apple HIG)
Shape:       rounded-full (radius-full)
Typography:  text-sm, weight-semibold
Layout:      equal width, 4-column grid, space-2 gap
Colors:      surface-2 default → rating-[again|hard|good|easy] on confirm
Transition:  background-color 120ms ease-out
Keyboard:    1=Again, 2=Hard, 3=Good, 4=Easy (discoverable via ? overlay)
Focus:       3px accent ring, 2px offset — visible in both dark and light

Rating reveal timing:
  - Color appears immediately on keypress/tap (instant feedback)
  - Next card enters after 200ms (card flip transition)
  - Next review interval revealed as card enters (deliberate)
```

**What competitors do wrong here:**

- Duolingo shows celebration animations DURING the rating moment,
  firing dopamine where attention should be on the answer quality.
- Anki shows the raw interval numbers before the learner rates,
  potentially biasing the rating.
- RemNote buries the rating buttons below a fold on mobile.

**DURA's position:** Rating is the most important button in the app.
It gets the most space, the clearest labels, and the fastest response.
No celebration until the session ends.

---

### 2. The Dojo Surface

The Dojo is a performance environment. Its design language is the
most restrained in DURA — more compact, darker, higher contrast.

**Dojo-specific overrides:**

```
Background:     --color-dojo-surface-0 (oklch 6% — near black)
Accent:         --color-dojo-accent (more saturated blue)
Typography:     weight-medium minimum everywhere (no weight-normal in Dojo)
Border:         --color-border-strong everywhere (higher contrast)
Animation:      duration-fast max (--duration-normal = too slow for drills)
Progress:       Circular, not linear — shows % complete of session
Scoring:        Displayed inline, immediately after each answer
                Format: [score]/10 · [2-word verdict] · [1-sentence gap]
```

**Dojo session flow states:**

```
1. READY       → Dark screen, mode title, "Press Space to begin"
2. QUESTION    → Question text, timer (if timed mode), [Submit] button
3. EVALUATING  → Streaming AI response — tokens appear as typed
4. SCORED      → Score badge animates in, gap sentence fades up
5. CONTINUING  → "Next question" prompt, keyboard shortcut shown
6. COMPLETE    → Session summary: avg score, weakest area, next session
```

**Inference status in Dojo:**

```
Top-right corner, persistent:
● Ollama · phi3.5:mini          (green dot = T1 active)
○ Offline · Question Bank       (grey dot = T3 fallback)
```

---

### 3. The Classroom Surface

The Classroom is a structured, patient environment. The design
communicates "you have time here."

**Classroom-specific:**

```
Background:     --color-classroom-surface-1 (slightly warm tint)
Layout:         Two-column on desktop (sidebar + content), single on mobile
Sidebar:        Module tree — shows mastery percentage per module
                Locked modules: opacity 50%, lock icon, no hover state
Content:        MDX rendered in reading zone (max-width 65ch)
Typography:     leading-relaxed for body, text-base minimum
Progress:       Linear bar, top of content column — always visible
Mastery gate:   Quiet — shows lock icon + "N% mastery required"
                No blocking modal. Inline context.
```

---

### 4. The Discover Surface

The Discover surface is the most open. Higher information density,
more visual variety, browsable.

**Discover-specific:**

```
Background:     --color-discover-surface-1 (slightly cool tint)
Layout:         Masonry or responsive grid — 2-4 columns
Cards:          --radius-xl, show: title, domain tags, difficulty
                bloom level indicator (1-6 color-coded), duration
                Hover: slight scale (1.02), border brightens
Filter bar:     Sticky top, lightweight — domain pills + difficulty slider
Empty state:    Not "no results" — "Explorer's map" — suggest adjacent
```

---

## Interaction Patterns

### Session Progress Communication

**Rule:** Progress lives at the edge of attention, not the center.

```
Classroom:  2px progress bar — top of content area, left to right fill
            Color: accent, no animation except fill
            Shows: X of N cards due / X% module mastery

Dojo:       Circular progress — top right, 32×32px
            Fills clockwise as session progresses
            No percentage label — just the arc

Discover:   No progress indicator — exploration has no completion
```

### Mastery Unlock Animation

When a module unlocks, DURA delivers a moment — not a party.

```
Duration:     600ms total
Sequence:
  1. 0ms:    Lock icon fades out (200ms)
  2. 200ms:  Border pulses once with --color-accent (200ms)
  3. 400ms:  Module title briefly brightens to text-primary (200ms)
  4. 600ms:  Subtle haptic on mobile (if supported)

No confetti. No sound. No full-screen overlay.
The learner knows. That's enough.
```

### FSRS Interval Reveal

The moment between rating a card and seeing the next interval is
the most information-rich moment in DURA.

```
Timing:    Interval shown as card transitions out (200ms window)
Format:    "Next: 7d" — minimal, right-aligned, text-xs, text-tertiary
Placement: Bottom of outgoing card, fades out with card
Animation: Opacity 0→1 over 120ms, held, then fades with card exit
```

### Empty States

Empty states in a learning platform communicate either "you're done"
or "nothing here yet." Both are emotional moments.

```
Session complete:
  ┌─────────────────────────────────────────┐
  │                                         │
  │   ✓                                     │ ← minimal check, accent color
  │   All caught up.                        │ ← text-xl, weight-semibold
  │   Next review in 4 hours.               │ ← text-sm, text-secondary
  │                                         │
  │   [ Review early ]  [ Done ]            │
  └─────────────────────────────────────────┘

No decks yet:
  ┌─────────────────────────────────────────┐
  │                                         │
  │   Your library is empty.                │
  │   Import a deck or start in Discover.   │
  │                                         │
  │   [ Browse Discover → ]                 │
  └─────────────────────────────────────────┘
```

---

## Component Anti-Patterns

**✗ Modal Interruption During Review**
_What it looks like:_ A modal ("Great job! You've studied 10 cards!")
appears mid-session.
_Why it happens:_ Milestone celebration seems motivating.
_Consequence:_ Forces learner out of flow state. Takes 300-600ms of
recovery to re-enter focus. Repeated across sessions = cumulative loss.
_Standard response:_ Session milestones surface at session END only.
Never mid-session.

**✗ Rating Button Color Before Rating**
_What it looks like:_ Again button is pre-colored red before the
learner has rated, creating visual anchoring.
_Why it happens:_ Pre-colored buttons look more polished.
_Consequence:_ Anchoring effect may bias ratings toward the
pre-highlighted option.
_Standard response:_ All rating buttons neutral surface-2 until tapped.

**✗ Progress Bar Celebration Animation**
_What it looks like:_ Progress bar bounces, pulses, or plays a
particle animation when filling.
_Why it happens:_ Motion = engagement = retention metrics go up
(short term).
_Consequence:_ Extraneous cognitive load during review. The
animation fires at exactly the moment learner should be reading the answer.
_Standard response:_ Progress bar fills linearly, no easing, no
bounce, no celebration animation.

**✗ Streak Anxiety Injection**
_What it looks like:_ Streak counter prominently displayed during
review with flame icon glowing.
_Why it happens:_ Streak mechanics drive daily retention.
_Consequence:_ Converts learning motivation to loss aversion.
Learner studies to protect streak, not to learn. Anxiety, not mastery.
_Standard response:_ Streak is visible in profile/settings, not
during review sessions. Session focus is material, not metrics.

**✗ Font Size Below 14px**
_What it looks like:_ Hint text, interval previews, and meta
information at 11-12px.
_Why it happens:_ Designers working on retina displays at 100% zoom.
_Consequence:_ Fails WCAG 2.2 AA, illegible on non-retina, causes
eye strain in extended sessions.
_Standard response:_ --text-xs minimum is 12px (10px at 0.625rem base
— violates standard). Use --text-sm (12-14px) as absolute minimum.

---

## Application — DURA

**Current state:** DURA uses Tailwind CSS v4 + shadcn/ui. No custom
design token system is documented. Component behavior is consistent
within the shadcn system but DURA-specific tokens (rating colors, surface
hierarchy, motion system) are not formally defined.

**Gap analysis:**

- Color tokens: NOT DEFINED — using ad-hoc Tailwind values
- Typography system: PARTIAL — Tailwind defaults, no fluid scaling
- Motion tokens: NOT DEFINED — no duration/easing system
- Rating button spec: UNKNOWN — needs audit
- Surface differentiation (Classroom vs Dojo vs Discover): NOT IMPLEMENTED
- FSRS interval reveal: NOT IMPLEMENTED
- Keyboard shortcuts for rating: UNKNOWN — needs audit
- Empty states: UNKNOWN — needs audit
- Streak anxiety: Needs policy decision before implementation

**Priority actions:**

1. Define CSS custom properties from this token system in
   `src/styles/tokens.css` — 1 day
2. Audit rating buttons: size (44px min), color timing, keyboard
   shortcuts — half day
3. Build surface-level theme switching (Classroom/Dojo/Discover
   background + accent overrides) — 1 day
4. Implement FSRS interval reveal on card exit — half day

---

## Provenance

**Synthesizes:**

- Nielsen Norman Group 10 Usability Heuristics — contributed P1, P2
  (visibility of system status, match with real world)
- Cognitive Load Theory (Sweller, 1988/2011) — contributed P1 and all
  anti-patterns related to extraneous load
- Hattie & Timperley feedback research (2007) — contributed P2
- WCAG 2.2 — contributed rating button size requirement (SC 2.5.8)
- Apple HIG touch target minimum (44px) — contributed rating button spec
- Duolingo design language — contributed session pacing patterns,
  then explicitly inverted the gamification-during-review pattern
- Linear's design philosophy — contributed dark-mode-canonical,
  keyboard-first, density-without-clutter aesthetic
- Mochi design language — contributed calm, focused review environment
- Material Design 3 / OKLCH color system — contributed perceptually
  uniform color token structure

**Supersedes:** No formal standard. Supersedes the implicit design
decisions made during initial DURA development.

**Novel contributions:**

- Surface-specific emotional register as a design constraint (P3)
- Cognitive load as the primary design metric (P1, all anti-patterns)
- FSRS interval reveal timing spec — no prior platform documents this
- Streak anxiety prevention as an explicit anti-pattern
- Inference status indicator as a design component (AILF-1.0 integration)
- Rating button color timing (neutral until tapped) — inverts
  Duolingo's pre-colored approach

**Version history:** v1.0 — 2026-04-25 — Initial standard

---

## Logical Enforcement

### Consistency Proof

- P1 (cognitive load) × P2 (feedback): Feedback must be immediate but
  non-disruptive. These are complementary — precise feedback at zero
  extraneous cost. CONSISTENT.
- P3 (register) × P4 (dark default): Dark is canonical for Dojo
  (focused). Classroom is warm. Discover is cool. All are dark.
  Register is differentiated within the dark system. CONSISTENT.
- P4 (dark default) × P6 (typography hierarchy): Dark backgrounds
  require higher contrast text. OKLCH system ensures this at every
  level. CONSISTENT.
- P5 (keyboard first) × P2 (feedback): Keyboard actions must receive
  the same instant feedback as pointer actions. Rating key 1-4 must
  show rating color immediately. CONSISTENT.
- P7 (progress in periphery) × P2 (feedback is primary): Progress
  updates are feedback, but not the primary feedback. Rating response
  is primary. Progress bar update is secondary, peripheral. CONSISTENT.

No conflicts. All principles are mutually reinforcing.

### Anti-Pattern Soundness Check

- ✗ Modal interruption → prevented by P1 (cognitive load enemy) + session
  milestone rule. ✓
- ✗ Pre-colored rating buttons → prevented by P2 (unbiased feedback) +
  rating button timing spec. ✓
- ✗ Progress bar celebration → prevented by P1 + motion token max
  (linear fill, no easing). ✓
- ✗ Streak anxiety injection → prevented by P3 (Dojo register = focused,
  not anxious) + streak display policy. ✓
- ✗ Font below 14px → prevented by P6 + token minimum (--text-sm). ✓

---

## Adoption Friction Analysis

**Failure Mode 1: Tailwind utility classes override token values.**
Developers use `bg-gray-900` instead of `var(--color-surface-0)`.
Tokens exist in CSS but are never adopted.
Mitigation: ESLint rule flagging hardcoded color values in components.
Add to CI gate.

**Failure Mode 2: Dojo "feels boring" without gamification.**
Internal pressure to add streak counters or score animations during
Dojo sessions because metrics show short-term engagement lift.
Mitigation: P1 and P3 are explicit. Anti-pattern for modal interruption
and streak anxiety are named. The standard is the argument — cite it.

**Failure Mode 3: Component library overrides surface-specific design.**
shadcn/ui components have their own opinionated defaults. Surface
differentiation (Classroom vs Dojo vs Discover tokens) gets lost when
a developer uses a shadcn Card in the Dojo without applying Dojo overrides.
Mitigation: Surface wrapper components (`<DojoSurface>`, `<ClassroomSurface>`,
`<DiscoverSurface>`) that inject CSS context. Never use shadcn components
in surface-specific contexts without the wrapper.

---

_DURA Design Language Standard v1.0_
_Maintained in: standards/dls/ | Part of DURA Standards Family v1.0_
_Review trigger: any new surface added, any change to rating interaction,
any change to motion system_
