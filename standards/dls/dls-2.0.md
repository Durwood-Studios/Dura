# DURA Design Language Standard 2.0 — Motion & Polish Layer

**Version:** 2.0 | **Date:** 2026-04-25 | **Status:** Active
**Depends on:** DLS-1.0 (required — tokens, surfaces, principles)
**Scope:** Signature moments, spring physics, depth model, typographic
animation, haptics, surface transitions, ambient systems
**One sentence:** DLS-1.0 defines what DURA is. DLS-2.0 defines how it moves.

---

## Purpose

DLS-1.0 established the constraint layer — what to eliminate, what the
tokens are, what each surface feels like at rest. DLS-2.0 specifies the
motion layer — the 5 choreographed moments that define DURA's character,
the physics system that makes every interaction feel physical and precise,
and the ambient systems that make DURA feel alive without competing for
attention.

The design goal for this layer: **DURA should feel like premium hardware.**
Not gamified software. Not a productivity tool. The same feeling as
unlocking a high-end mechanical watch, or the physical feedback of a
quality keyboard — precise, weighted, satisfying, and never gratuitous.

**The 10x constraint DLS-2.0 breaks:**
Every competitor's motion design is decorative. Duolingo's animations
celebrate. Anki has none. RemNote has functional but joyless transitions.
The 10x version treats motion as physics — every element has mass, inertia,
and a resting state. Motion communicates truth about the system, not
marketing about the brand.

---

## Dependencies & Tech Stack

```
Framer Motion v11+       — spring physics, layout animations, gesture
GSAP 3.12+               — signature moment sequences, precise timelines
CSS @property            — animated custom properties (gradient shifts,
                           spring-based transforms natively)
Web Animations API       — performance-critical loops (ambient systems)
Lenis 1.x                — smooth scroll with momentum
navigator.vibrate()      — haptic patterns (mobile Web API)
```

All motion respects `prefers-reduced-motion`. Every animated element
has a static fallback. This is not optional — it is a conformance
requirement inherited from DLS-1.0.

---

## The Spring Physics System

### Why Springs, Not Easings

CSS easing curves (`ease-out`, `cubic-bezier`) produce motion that
starts and stops at exact times. Springs produce motion that
overshoots, settles, and comes to rest — the way physical objects
behave. The difference is felt immediately. Spring-based UI feels
real. Easing-based UI feels digital.

### DURA Spring Vocabulary

```typescript
// src/lib/motion/springs.ts
import { MotionConfig } from "framer-motion";

export const SPRINGS = {
  // Snappy — UI feedback, button presses, rating confirmation
  // Fast settle, minimal overshoot. Like a quality key press.
  snappy: {
    type: "spring" as const,
    stiffness: 500,
    damping: 35,
    mass: 0.8,
  },

  // Fluid — card transitions, panel slides, content entry
  // Medium settle, slight personality. Like a heavy door on good hinges.
  fluid: {
    type: "spring" as const,
    stiffness: 280,
    damping: 26,
    mass: 1,
  },

  // Settle — mastery unlocks, session complete, modal entrance
  // Slower settle, visible overshoot. Like something clicking into place.
  settle: {
    type: "spring" as const,
    stiffness: 180,
    damping: 18,
    mass: 1.2,
  },

  // Drift — ambient systems, background elements, discover cards on hover
  // Very slow, large mass, barely perceptible. Like clouds.
  drift: {
    type: "spring" as const,
    stiffness: 60,
    damping: 20,
    mass: 2,
  },

  // Bounce — celebration moments (session complete only — never during review)
  // Used sparingly. Max once per session.
  bounce: {
    type: "spring" as const,
    stiffness: 400,
    damping: 12,
    mass: 0.6,
  },
} as const;

// Framer Motion global config — wrap app root
export const motionConfig = {
  transition: SPRINGS.fluid, // default for all unspecified transitions
};
```

### Spring Usage Rules

```
SPRINGS.snappy  → rating buttons, keyboard shortcut feedback,
                  toggle switches, checkbox states
SPRINGS.fluid   → card enter/exit, panel slide, navigation
SPRINGS.settle  → mastery unlock, session complete, modal
SPRINGS.drift   → Discover card parallax, ambient background
SPRINGS.bounce  → session complete only — one use per session
```

Never mix spring vocabulary across a single interaction sequence.
A card that enters with `fluid` must exit with `fluid`.

---

## The 5 Signature Moments

These are DURA's defining interactions. Each is choreographed to the
frame. Each has a name. The team refers to them by name.

---

### Signature 1: The Card Flip ("The Reveal")

The moment between question and answer. The most repeated interaction
in DURA — a serious learner will experience this 10,000+ times.
Every millisecond of friction here compounds catastrophically.

**The choreography:**

```
Duration:     340ms total
Axis:         Y-axis rotation (3D card flip — not a fade, not a slide)

Phase 1 (0–170ms): Front face rotates away
  transform: rotateY(0deg) → rotateY(-90deg)
  spring:    SPRINGS.snappy
  easing:    ease-in on first half only

Phase 2 (170–340ms): Back face rotates into view
  transform: rotateY(90deg) → rotateY(0deg)
  spring:    SPRINGS.snappy
  content:   Back content fades in opacity 0→1 over last 80ms

Depth cue:
  perspective: 1200px on the card container
  translateZ: 0px → 8px → 0px (card briefly comes toward viewer at 85ms)
  shadow:    box-shadow lifts at the midpoint — card appears to float
             then land

Reduced motion fallback:
  opacity: 1→0→1 over 200ms (crossfade, no rotation)
```

```typescript
// src/components/review/card-flip.tsx
import { motion, AnimatePresence } from 'framer-motion'

const cardVariants = {
  front: {
    rotateY: 0,
    translateZ: 0,
    boxShadow: '0 4px 24px oklch(0% 0 0 / 0.4)',
  },
  exit: {
    rotateY: -90,
    translateZ: 8,
    boxShadow: '0 16px 48px oklch(0% 0 0 / 0.7)',
    transition: { ...SPRINGS.snappy, duration: 0.17 },
  },
  enter: {
    rotateY: 0,
    translateZ: 0,
    boxShadow: '0 4px 24px oklch(0% 0 0 / 0.4)',
    transition: { ...SPRINGS.snappy, duration: 0.17 },
  },
  enterFrom: {
    rotateY: 90,
    translateZ: 8,
    boxShadow: '0 16px 48px oklch(0% 0 0 / 0.7)',
  },
}

export function CardFlip({ front, back, isFlipped }: CardFlipProps) {
  return (
    <div style={{ perspective: '1200px' }}>
      <AnimatePresence mode="wait">
        {!isFlipped ? (
          <motion.div
            key="front"
            variants={cardVariants}
            initial="front"
            exit="exit"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {front}
          </motion.div>
        ) : (
          <motion.div
            key="back"
            variants={cardVariants}
            initial="enterFrom"
            animate="enter"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {back}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

---

### Signature 2: The Mastery Unlock ("The Gate Opens")

The moment a module unlocks. Earned. Never frivolous. Happens rarely.
Must feel significant without being loud.

**The choreography:**

```
Duration:     1200ms total — deliberately slow. Let the moment breathe.

Phase 1 (0–200ms): Lock icon dissolves
  opacity: 1→0
  scale: 1→0.7
  filter: blur(0→4px)
  transition: SPRINGS.fluid

Phase 2 (200–400ms): Border pulse
  The module card border transitions:
  color: --color-border → --color-accent → --color-border
  width: 1px → 2px → 1px
  Glow: box-shadow 0→12px accent glow→0
  This is the ONLY time DURA uses a glow effect.

Phase 3 (400–700ms): Content reveal
  Module title:   color: --color-text-tertiary → --color-text-primary
  Description:   opacity: 0.4 → 1
  CTA button:    slides up from translateY(8px), opacity 0→1
  transition:    SPRINGS.settle (the "click into place" spring)

Phase 4 (700–1000ms): Mastery score counts up
  The percentage counter animates from previous score to 100%
  Using a number spring, not a linear counter
  Font: --font-mono, large, --color-accent

Phase 5 (1000–1200ms): Haptic (mobile only)
  navigator.vibrate([30, 20, 60])
  Pattern: short-pause-long — "achievement" pattern

No confetti. No sound. No full-screen overlay.
The gate opens. That's the moment.
```

---

### Signature 3: The Dojo Session Start ("The Bell")

The moment the learner begins a Dojo session. This transition must
signal mode change — from browsing to performance. From exploration
to execution.

**The choreography:**

```
Duration:     800ms total

Pre-state:    Navigation, sidebar, and all non-Dojo chrome
              are visible at full opacity

Phase 1 (0–200ms): Focus collapse
  All non-essential chrome fades to opacity 0.1
  Background desaturates: filter: saturate(1→0.2)
  Vignette overlay appears: radial-gradient darkening edges
  This creates tunnel vision — the session is the only thing

Phase 2 (200–400ms): Mode title enters
  "ARCHITECTURE DEFENSE" (or current mode name)
  Enters from opacity 0, translateY(-12px)
  Font: --text-3xl, --weight-bold, --tracking-tight
  Color: --color-text-primary
  transition: SPRINGS.settle

Phase 3 (400–600ms): First question card materializes
  Not a slide. Not a fade. A MATERIALIZE.
  Scale: 0.94→1, opacity: 0→1, blur: 8px→0
  This feels like the card was always there but just came
  into focus. Like pulling something into reality.
  transition: SPRINGS.fluid

Phase 4 (600–800ms): Ready state
  "Press Space to begin" fades in — text-sm, text-secondary
  Inference status indicator fades in — top right
  A single 16ms haptic pulse on mobile: navigator.vibrate(16)
  This is the "lean forward" signal.
```

---

### Signature 4: The All Caught Up Screen ("The Clearing")

Session complete. Zero cards due. The rarest screen in DURA —
a learner who sees this has done the work. It must feel like
arriving somewhere, not like an empty state.

**The choreography:**

```
Duration:     1600ms total — the longest sequence. Earned.

Background:
  The review card surface dissolves away
  What's left is the raw --color-surface-0 (near black)
  But a very slow, very subtle radial gradient breathes:
  Not a pulse — a single slow inhale/exhale. 8-second cycle.
  center: oklch(11% 0.02 250) → oklch(8% 0 0) → repeat
  This is ambient. Almost imperceptible. But felt.

Phase 1 (0–400ms): Checkmark draws
  SVG stroke-dashoffset animation — the check draws itself
  Duration: 400ms, easing: ease-out
  Color: --color-accent
  Size: 48×48px — present but not dominating

Phase 2 (400–800ms): Primary text settles in
  "All caught up." — text-2xl, weight-semibold
  Enters: opacity 0→1, y: 8px→0
  transition: SPRINGS.settle

Phase 3 (800–1200ms): Next session info surfaces
  "Next review: 4h 23m" — text-sm, text-secondary
  Precise. No rounding. The algorithm knows exactly when.
  Uses --font-mono for the time value (data, not decoration)
  Enters: opacity 0→0.7 (never full opacity — this is peripheral)

Phase 4 (1200–1600ms): Options appear
  [ Review early ]  [ Done ]
  Staggered: 150ms between each button
  Both enter with SPRINGS.fluid from y: 6px
  "Done" is the primary — weight-semibold, accent background
  "Review early" is ghost — text-only, secondary

Phase 5 (ongoing): Haptic (mobile)
  navigator.vibrate([20, 30, 20, 30, 60])
  Pattern: gentle double-tap then resolution
  Fires at 1400ms — after the visual settles
```

---

### Signature 5: The AI Score Reveal ("The Verdict")

In the Dojo, after answering a question, the AI evaluates the response
and returns a score with feedback. This is the highest emotional moment
in the Dojo — it matters whether the score is 6 or 9.

**The choreography:**

```
Duration:     Variable — AI streams, then verdict lands

Phase 1: Streaming (AI response arrives token by token)
  Text streams in at the natural pace of the model
  A blinking cursor (2px wide, 16px tall, --color-accent) follows
  the text insertion point exactly
  No typing sound. No animation. Just the cursor and the text.
  This feels like watching someone think.

Phase 2: Stream complete signal
  Cursor blinks 3 times then dissolves (opacity 1→0, 200ms)
  This signals "the thinking is done"

Phase 3: Score badge enters (the Verdict)
  Timing: 200ms after stream ends
  The score (e.g. "8/10") was withheld until now — parsed from
  the stream but held, not rendered
  Entry: scale 0.6→1, opacity 0→1 — SPRINGS.bounce (the ONE
  time bounce is used — it's the score, it earned it)
  Color:
    9-10: --color-rating-easy (blue)
    7-8:  --color-rating-good (green)
    5-6:  --color-rating-hard (amber)
    1-4:  --color-rating-again (red)
  Size: 48px diameter, --font-mono, --weight-bold

Phase 4: Gap sentence rises
  The one-sentence gap insight surfaces below the score
  Enters: opacity 0→1, y: 4px→0 over 300ms
  Color: --color-text-secondary — this is information, not praise
  SPRINGS.fluid

Phase 5: Next question prompt
  "Next →" or keyboard shortcut [N]
  Appears 600ms after score lands
  Never auto-advances — learner controls pace
```

---

## The Depth Model

DURA uses three depth layers. Every element lives on exactly one.

```
Layer 0 — Ground (z-index: 0)
  Background surfaces, ambient systems, decorative elements
  Nothing interactive lives here.

Layer 1 — Content (z-index: 10-49)
  Cards, lists, panels, forms, all primary content
  The learner's world. Most of DURA lives here.

Layer 2 — Overlay (z-index: 50-99)
  Modals, tooltips, popovers, inference status indicator
  When Layer 2 appears, Layer 1 recedes:
  filter: brightness(0.7) blur(1px) — subtle, not heavy
  This communicates hierarchy through physics, not just z-index.

Layer 3 — Critical (z-index: 100+)
  Session start overlay, mastery unlock, "all caught up" screen
  When Layer 3 appears, Layers 0-2 become background:
  filter: brightness(0.4) saturate(0.3)
  The world fades. The moment is everything.
```

```css
/* Layer transition mixin */
.layer-1-receding {
  filter: brightness(0.7) blur(1px);
  transition: filter 200ms var(--ease-in-out);
}

.layer-1-background {
  filter: brightness(0.4) saturate(0.3);
  transition: filter 350ms var(--ease-in-out);
}
```

---

## Glass Morphism — Used Once

Glass morphism (backdrop-blur + translucent surface) is used in
exactly ONE place in DURA: the inference status indicator in the Dojo.

This is not a design trend. It is a functional choice — the indicator
must float above content without completely obscuring it, and it must
feel like it belongs to a different layer than the content below it.

```css
/* src/components/inference-status.module.css */
.inference-status-glass {
  /* The glass surface */
  background: oklch(15% 0 0 / 0.6);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);

  /* The glass edge */
  border: 1px solid oklch(100% 0 0 / 0.08);
  border-top-color: oklch(100% 0 0 / 0.15); /* top edge catches light */

  /* Shape */
  border-radius: var(--radius-full);
  padding: var(--space-2) var(--space-3);

  /* Position — top right, always visible */
  position: fixed;
  top: var(--space-4);
  right: var(--space-4);
  z-index: 60; /* Layer 2 */
}
```

Using glass morphism anywhere else is a standard violation.
The effect loses meaning when overused. One use = premium.
Ten uses = 2019 design trend.

---

## Typographic Animation

### Streaming Text (Dojo AI responses)

The AI score reveal uses streaming text. The implementation matters.

```typescript
// src/components/dojo/streaming-text.tsx
import { useEffect, useRef, useState } from 'react'

export function StreamingText({ stream, onComplete }: StreamingTextProps) {
  const [displayText, setDisplayText] = useState('')
  const [cursorVisible, setCursorVisible] = useState(true)
  const [streamDone, setStreamDone] = useState(false)

  // Cursor blink
  useEffect(() => {
    if (streamDone) {
      // Blink 3 times then hide
      let blinks = 0
      const interval = setInterval(() => {
        setCursorVisible(v => !v)
        blinks++
        if (blinks >= 6) { // 3 full blink cycles
          clearInterval(interval)
          setCursorVisible(false)
          onComplete?.()
        }
      }, 120)
      return () => clearInterval(interval)
    }
  }, [streamDone])

  return (
    <p className="streaming-text">
      {displayText}
      {!streamDone && (
        <span
          className="cursor"
          style={{
            display: 'inline-block',
            width: '2px',
            height: '1em',
            background: 'var(--color-accent)',
            marginLeft: '1px',
            verticalAlign: 'text-bottom',
            opacity: cursorVisible ? 1 : 0,
            transition: 'opacity 80ms',
          }}
          aria-hidden="true"
        />
      )}
    </p>
  )
}
```

### FSRS Interval Counter

When the next interval is revealed (on card exit), the number
counts from previous value to new value using a spring.

### Session Score Animate-In

At session end, average score counts up with a spring.
0 → final score over 800ms with SPRINGS.bounce
Color transitions as number crosses thresholds.

---

## Haptic Choreography

Every significant interaction has a distinct haptic signature on mobile.
Haptics are never gratuitous — they confirm state changes.

```typescript
// src/lib/haptics.ts

// navigator.vibrate() pattern: [duration, pause, duration, ...]

export const HAPTICS = {
  // Rating feedback — distinct for each rating
  ratingAgain: [8], // sharp single tap — "miss"
  ratingHard: [8, 8, 8], // double tap — "effort"
  ratingGood: [12], // medium single — "solid"
  ratingEasy: [8, 6, 12], // short-long — "clean"

  // Session events
  sessionStart: [16], // single attention pulse
  sessionEnd: [20, 30, 20, 30, 60], // resolution pattern

  // Mastery
  masteryUnlock: [30, 20, 60], // achievement: short-pause-long

  // Card flip — subtle physical feedback
  cardFlip: [6], // very brief — confirms the action

  // Error / warning
  blocked: [8, 8, 8, 8, 8], // rapid triple — "stop"
} as const;

export function haptic(pattern: keyof typeof HAPTICS) {
  if ("vibrate" in navigator && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    navigator.vibrate(HAPTICS[pattern]);
  }
}
```

```
Haptic rules:
1. Never haptic during reading/thinking moments
2. Rating haptics fire ON the rating button tap, not after
3. Mastery haptic fires at end of animation sequence, not start
4. Session start haptic fires at "lean forward" moment (Phase 4)
5. If prefers-reduced-motion is set: no haptics
6. Never repeat a haptic within 500ms (debounce all haptic calls)
```

---

## Surface Transition Choreography

Moving between Classroom, Dojo, and Discover must feel like
entering a different space — not switching tabs.

### Classroom → Dojo

```
The learner is leaving a patient environment for a performance one.
This transition must feel like stepping onto the training floor.

1. Classroom content fades and compresses:
   scale: 1 → 0.97
   opacity: 1 → 0
   filter: blur(0 → 4px)
   duration: 300ms, SPRINGS.fluid

2. Background shifts — a brief darkness:
   --color-surface-0 at full opacity for 100ms
   No content. Just the floor of DURA.

3. Dojo surfaces materializes from darkness:
   scale: 0.97 → 1
   opacity: 0 → 1
   filter: blur(4px → 0)
   duration: 300ms, SPRINGS.fluid

Total: 700ms including the dark interstitial.
This is intentionally longer than a standard navigation.
The pause is the moment of preparation.
```

### Dojo → Classroom

```
Opposite direction — decompression, not compression.
The transition should feel like removing headphones.

1. Dojo focus chrome dissolves:
   vignette, desaturation filters fade out
   duration: 400ms — slower than Dojo entry

2. Classroom warmth enters:
   --color-classroom-surface-1 bleeds in
   slightly warmer color temperature
   duration: 300ms

Total: 700ms. Same duration, different emotional quality.
```

### Any → Discover

```
Discover is the most open surface. The transition should feel
like a door opening outward.

1. Current surface slides left:
   x: 0 → -40px, opacity: 1 → 0
   duration: 250ms, SPRINGS.fluid

2. Discover grid enters from right:
   x: 40px → 0, opacity: 0 → 1
   duration: 250ms, SPRINGS.fluid
   But cards stagger:
   Each card enters with 30ms delay after the previous
   Max 8 cards stagger — after that, simultaneous

Total: 250ms + stagger. Fast and open.
```

---

## The Ambient System

Ambient motion is motion that exists when nothing else is happening.
It signals that DURA is alive, focused, and waiting. It must never
compete with content — the moment content appears, ambient stops.

### Discover Surface Parallax

In Discover, cards respond to cursor position (desktop) or device
tilt (mobile) with subtle depth parallax. Max 4 degrees of rotation,
spring-smoothed via `SPRINGS.drift`.

### Dojo Ambient Breath

On the Dojo ready screen (before session start), the background
performs a single, very slow "breath" — a radial gradient that
expands and contracts imperceptibly.

```css
@keyframes dojo-breath {
  0%,
  100% {
    background: radial-gradient(
      ellipse 60% 60% at 50% 50%,
      oklch(11% 0.02 250) 0%,
      oklch(6% 0 0) 70%
    );
  }
  50% {
    background: radial-gradient(
      ellipse 65% 65% at 50% 50%,
      oklch(13% 0.03 250) 0%,
      oklch(6% 0 0) 70%
    );
  }
}

.dojo-ready-screen {
  animation: dojo-breath 8s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .dojo-ready-screen {
    animation: none;
  }
}
```

---

## Performance Budget

Motion is only premium when it doesn't drop frames. Every animation
in DLS-2.0 must stay within these budgets:

```
Target:         60fps (16.7ms/frame) on mid-range device
                Chrome/Edge: Pixel 7 class
                Safari: iPhone 13 class

Compositor-only transforms (never trigger layout):
  - transform: translate, scale, rotate
  - opacity
  - filter (only on GPU-composited layers — will-change: transform)

NEVER animate (causes layout recalculation):
  - width, height, padding, margin, top, left
  - font-size (use scale instead)
  - box-shadow (use filter: drop-shadow on a composited layer)

will-change policy:
  Apply will-change: transform to elements that will animate
  BEFORE the animation starts (add class on hover/focus)
  REMOVE will-change after animation completes
  Permanent will-change is a memory leak

Framer Motion layout animations:
  Use <motion.div layout> sparingly
  Layout animations recalculate positions — expensive
  Only justified for the Discover grid reflow and
  the session progress indicator updates

Spring performance:
  useSpring with high stiffness (>400) runs on JS thread
  Prefer CSS transitions for simple property changes
  Use Framer Motion springs only for the 5 signature moments
  and the parallax system
```

---

## Reduced Motion Contract

Every animated element in DLS-2.0 has a static fallback.
This is a conformance requirement, not a recommendation.

**Reduced motion fallbacks by signature:**

| Signature          | Full motion              | Reduced motion                |
| ------------------ | ------------------------ | ----------------------------- |
| Card Flip          | 3D Y-rotation, 340ms     | Crossfade opacity, 200ms      |
| Mastery Unlock     | Full 1200ms sequence     | Border flash + instant reveal |
| Dojo Session Start | 800ms choreography       | Simple fade in, 200ms         |
| All Caught Up      | 1600ms sequence          | Static display                |
| AI Score Reveal    | Streaming + spring score | Instant display, score static |

---

## Anti-Patterns

**✗ Motion Without Purpose** — hover wiggles, idle bounces. Hover
states use color and border changes only.

**✗ More Than One Glass Surface** — glass is used on the inference
indicator only. One glass surface per application.

**✗ Stagger Without Limit** — stagger max 8 elements, 30ms apart.
After 8, remaining elements enter simultaneously.

**✗ Spring on Layout Properties** — springs on transform and
opacity only. Use scale + clip-path to approximate dimension changes.

**✗ Bounce Outside Session Complete** — `SPRINGS.bounce` is used
ONCE — the AI score reveal badge. No exceptions.

**✗ Haptics Without Debounce** — 500ms minimum between any two
haptic events. Debounce all haptic calls.

---

## Application — DURA

**Gap analysis against DLS-2.0 (as of 2026-04-26):**

- Spring system (SPRINGS.ts): NOT IMPLEMENTED
- Card flip: NOT IMPLEMENTED — current reveal is a fade
- Mastery unlock: NOT IMPLEMENTED
- Dojo session start: NOT IMPLEMENTED — Dojo surface itself does not exist
- All caught up: NOT IMPLEMENTED
- AI score reveal with streaming cursor: NOT IMPLEMENTED — Dojo absent
- Glass morphism inference indicator: NOT IMPLEMENTED
- Surface transition choreography: NOT IMPLEMENTED
- Discover parallax: NOT IMPLEMENTED
- Dojo ambient breath: NOT IMPLEMENTED — Dojo absent
- Haptic system: NOT IMPLEMENTED
- Reduced motion contract: PARTIAL — gate-unlock-pulse + fillblank-shake
  honor it; rest of app needs audit

**Sprint that implements this:** `xDocs/active/motion-2026-q2/`.

---

## Provenance

**Synthesizes:**

- Framer Motion spring physics model — contributed spring vocabulary
  and component implementations
- GSAP timeline model — contributed signature moment sequencing
- Apple HIG motion principles — contributed haptic pattern design
- Disney's 12 Principles of Animation (Thomas & Johnston) —
  anticipation, follow-through, timing
- Linear's interaction model — "physics not decoration" philosophy
- Web Animations API spec (W3C) — ambient system primitives
- WCAG 2.2 + prefers-reduced-motion — reduced motion contract

**Novel contributions:**

- DURA Spring Vocabulary (5 named springs, 5 contexts)
- The 5 Signature Moments as a design primitive
- Haptic vocabulary for learning interactions (rating-specific patterns)
- Depth Model (4 layers, each with blur/brightness spec)
- Glass morphism single-use rule

**Version history:** v2.0 — 2026-04-25 — Initial motion + polish layer

---

_DURA Design Language Standard v2.0 — Motion & Polish Layer_
_Depends on: DLS-1.0 | Part of DURA Standards Family v1.0_
_Review trigger: any new signature moment, any change to spring vocabulary,
any change to haptic patterns, any new glass surface (requires standard amendment)_
