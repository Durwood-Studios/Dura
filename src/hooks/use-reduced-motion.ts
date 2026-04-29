/**
 * useMotionPreference — DLS-2.0 §Reduced Motion Contract.
 *
 * Returns the learner's reduced-motion preference and pre-baked spring/
 * duration values that motion components should consult before applying
 * any animation. The contract:
 *
 *   - `shouldAnimate: false` ⇒ skip every spring + transition; collapse
 *     to instant state changes.
 *   - `spring` is either SPRINGS.fluid (the app default) or a 0-duration
 *     transition object that Framer Motion treats as "instant."
 *   - `duration` is `undefined` (animate as specified) or `0` (instant).
 *
 * Usage:
 *   const { shouldAnimate, spring } = useMotionPreference();
 *   <motion.div animate={...} transition={spring} />
 *
 * Server-safe — returns `shouldAnimate: true` during SSR (no preference
 * detectable until hydration). Updates client-side once the matchMedia
 * subscription fires.
 */

import { useEffect, useState } from "react";
import { SPRINGS } from "@/lib/motion/springs";

const MEDIA_QUERY = "(prefers-reduced-motion: reduce)";

interface MotionPreference {
  shouldAnimate: boolean;
  spring: typeof SPRINGS.fluid | { duration: 0 };
  duration: number | undefined;
}

const FULL_MOTION: MotionPreference = {
  shouldAnimate: true,
  spring: SPRINGS.fluid,
  duration: undefined,
};

const REDUCED_MOTION: MotionPreference = {
  shouldAnimate: false,
  spring: { duration: 0 },
  duration: 0,
};

function readPreference(): MotionPreference {
  if (typeof window === "undefined" || !window.matchMedia) return FULL_MOTION;
  try {
    return window.matchMedia(MEDIA_QUERY).matches ? REDUCED_MOTION : FULL_MOTION;
  } catch {
    return FULL_MOTION;
  }
}

export function useMotionPreference(): MotionPreference {
  // Default to full motion for SSR — hydration corrects on first effect.
  const [pref, setPref] = useState<MotionPreference>(FULL_MOTION);

  useEffect(() => {
    setPref(readPreference());
    if (typeof window === "undefined" || !window.matchMedia) return;

    let mql: MediaQueryList;
    try {
      mql = window.matchMedia(MEDIA_QUERY);
    } catch {
      return;
    }

    const onChange = (): void => {
      setPref(mql.matches ? REDUCED_MOTION : FULL_MOTION);
    };

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }
    // Safari < 14 fallback
    if (typeof mql.addListener === "function") {
      mql.addListener(onChange);
      return () => mql.removeListener(onChange);
    }
  }, []);

  return pref;
}

/**
 * Synchronous read — useful for non-React callers (utility helpers,
 * imperative animations). Doesn't subscribe to changes.
 */
export function readMotionPreference(): MotionPreference {
  return readPreference();
}
