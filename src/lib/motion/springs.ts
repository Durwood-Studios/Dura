/**
 * DURA Spring Vocabulary (DLS-2.0 §Spring Physics).
 *
 * Five named springs, used for distinct interaction contexts. Never mix
 * vocabulary across a single interaction sequence — a card that enters
 * with `fluid` must exit with `fluid`. Spring behavior is real physics
 * (mass + stiffness + damping), not easing curves.
 *
 * Usage:
 *   - SPRINGS.snappy  → rating buttons, keyboard shortcut feedback,
 *                       toggle switches, checkbox states
 *   - SPRINGS.fluid   → card enter/exit, panel slide, navigation
 *   - SPRINGS.settle  → mastery unlock, session complete, modal entrance
 *   - SPRINGS.drift   → Discover card parallax, ambient background
 *   - SPRINGS.bounce  → AI score reveal ONLY (one use per session)
 *
 * The values below are the canonical DLS-2.0 spec — do not tweak without
 * a CODEOWNERS-gated amendment to standards/dls/dls-2.0.md §Spring
 * Vocabulary. The spring tests in tests/motion/springs.test.ts verify
 * the values match the spec; loosening them will fail CI.
 */

export const SPRINGS = {
  /** Snappy — UI feedback, button presses, rating confirmation.
   *  Fast settle, minimal overshoot. Like a quality key press. */
  snappy: {
    type: "spring" as const,
    stiffness: 500,
    damping: 35,
    mass: 0.8,
  },

  /** Fluid — card transitions, panel slides, content entry.
   *  Medium settle, slight personality. Like a heavy door on good hinges. */
  fluid: {
    type: "spring" as const,
    stiffness: 280,
    damping: 26,
    mass: 1,
  },

  /** Settle — mastery unlocks, session complete, modal entrance.
   *  Slower settle, visible overshoot. Like something clicking into place. */
  settle: {
    type: "spring" as const,
    stiffness: 180,
    damping: 18,
    mass: 1.2,
  },

  /** Drift — ambient systems, background elements, Discover card hover.
   *  Very slow, large mass, barely perceptible. Like clouds. */
  drift: {
    type: "spring" as const,
    stiffness: 60,
    damping: 20,
    mass: 2,
  },

  /** Bounce — celebration moments (session complete only).
   *  Used sparingly. Max once per session. The AI score reveal badge
   *  is the canonical user. */
  bounce: {
    type: "spring" as const,
    stiffness: 400,
    damping: 12,
    mass: 0.6,
  },
} as const;

export type SpringName = keyof typeof SPRINGS;

/**
 * Default Framer Motion transition. Wrap the app root with
 * `<MotionConfig transition={motionConfig.transition}>` so unspecified
 * transitions default to `fluid` per DLS-2.0.
 */
export const motionConfig = {
  transition: SPRINGS.fluid,
} as const;
