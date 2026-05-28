/**
 * DURA Haptic Vocabulary (DLS-2.0 §Haptic Choreography).
 *
 * Every significant interaction has a distinct haptic signature on mobile.
 * Haptics are never gratuitous — they confirm state changes. The patterns
 * below are the canonical DLS-2.0 spec; changing them requires a
 * CODEOWNERS-gated amendment to standards/dls/dls-2.0.md.
 *
 * Constraints (DLS-2.0 §Haptic rules):
 *   1. Never haptic during reading/thinking moments.
 *   2. Rating haptics fire ON the rating button tap, not after.
 *   3. Mastery haptic fires at end of animation sequence, not start.
 *   4. Session start haptic fires at "lean forward" moment.
 *   5. If `prefers-reduced-motion: reduce` is set: no haptics.
 *   6. Never repeat a haptic within 500ms (debounce).
 *
 * navigator.vibrate() pattern format: [duration, pause, duration, pause, ...]
 */

export const HAPTICS = {
  // Rating feedback — distinct for each rating
  ratingAgain: [8],
  ratingHard: [8, 8, 8],
  ratingGood: [12],
  ratingEasy: [8, 6, 12],

  // Session events
  sessionStart: [16],
  sessionEnd: [20, 30, 20, 30, 60],

  // Mastery
  masteryUnlock: [30, 20, 60],

  // Card flip — subtle physical feedback
  cardFlip: [6],

  // Error / warning
  blocked: [8, 8, 8, 8, 8],
} as const;

export type HapticPattern = keyof typeof HAPTICS;

const DEBOUNCE_MS = 500;
let lastHapticAt = 0;

// First-gesture gate. Chromium 90+ logs a console error on every
// navigator.vibrate() call that happens before the page has received
// a user gesture — even though the call still resolves successfully.
// (https://www.chromestatus.com/feature/5644273861001216.) Some
// learner-positive haptics fire as soon as a session screen mounts
// (e.g. sessionStart), which is exactly when the gesture quota hasn't
// landed yet. Flip the flag on first interaction and gate haptics
// behind it; the user can't perceive a haptic before their first
// interaction anyway.
let userHasInteracted = false;
if (typeof window !== "undefined") {
  const armed = (): void => {
    userHasInteracted = true;
    window.removeEventListener("pointerdown", armed);
    window.removeEventListener("keydown", armed);
    window.removeEventListener("touchstart", armed);
  };
  window.addEventListener("pointerdown", armed, { once: true, passive: true });
  window.addEventListener("keydown", armed, { once: true });
  window.addEventListener("touchstart", armed, { once: true, passive: true });
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/**
 * Fire a named haptic pattern. No-op if:
 *   - Running outside a browser (SSR).
 *   - `navigator.vibrate` is unavailable (desktop, iOS Safari without
 *     iOS 16.4+, etc.).
 *   - The user has `prefers-reduced-motion: reduce` set.
 *   - Less than 500ms has elapsed since the last haptic call.
 */
export function haptic(pattern: HapticPattern): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return;
  }
  if (!userHasInteracted) return;
  if (prefersReducedMotion()) return;

  const now = Date.now();
  if (now - lastHapticAt < DEBOUNCE_MS) return;
  lastHapticAt = now;

  navigator.vibrate(HAPTICS[pattern] as readonly number[] as number[]);
}

/**
 * Test-only helper that resets the debounce timer. Used by the haptic
 * test suite to assert pattern values without waiting 500ms between
 * each `it` block.
 */
export function __resetHapticDebounce(): void {
  lastHapticAt = 0;
}

/**
 * Test-only helper. The first-gesture gate suppresses haptics until
 * the user interacts; tests assert pattern values without a real
 * gesture, so they flip the flag manually.
 */
export function __armHapticForTest(): void {
  userHasInteracted = true;
}
