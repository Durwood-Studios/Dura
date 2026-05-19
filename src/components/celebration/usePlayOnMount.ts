"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useMotionPreference } from "@/hooks/use-reduced-motion";

/**
 * Imperative handle exposed by every @lucide-animated icon.
 * The catalog is structurally consistent, so a single type covers all icons.
 */
export interface AnimatedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

/**
 * Trigger an animated icon once on mount, and replay it any time `replayKey`
 * changes. Respects `prefers-reduced-motion` per DLS-2.0 §Reduced Motion
 * Contract — under reduced motion the icon stays in its static (`normal`)
 * variant and the imperative trigger is skipped entirely.
 *
 * Usage:
 *   const ref = usePlayOnMount();
 *   return <PartyPopperIcon ref={ref} size={48} className="..." />;
 *
 *   // Or, replaying when a value changes (e.g. streak day count):
 *   const ref = usePlayOnMount(streakDays);
 *   return <FlameIcon ref={ref} size={20} />;
 */
export function usePlayOnMount(replayKey?: string | number): RefObject<AnimatedIconHandle | null> {
  const ref = useRef<AnimatedIconHandle | null>(null);
  const { shouldAnimate } = useMotionPreference();

  useEffect(() => {
    if (!shouldAnimate) return;
    // Defer one frame so the icon has its ref attached before we trigger.
    const raf = requestAnimationFrame(() => {
      ref.current?.startAnimation();
    });
    return () => cancelAnimationFrame(raf);
  }, [shouldAnimate, replayKey]);

  return ref;
}
