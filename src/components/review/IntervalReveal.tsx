"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useMotionPreference } from "@/hooks/use-reduced-motion";

interface IntervalRevealProps {
  /** Formatted interval string (e.g. "3d", "2mo"). Null hides the component. */
  interval: string | null;
  /** Rating label shown alongside the interval (e.g. "Good"). */
  rating: string | null;
}

/**
 * DLS-1.0 §FSRS Interval Reveal — shown during the card-exit window (~400ms)
 * so learners see the chosen interval as outcome, not as a prompt.
 *
 * Rendering contract:
 *   - Fades in over 120ms when `interval` is non-null.
 *   - Parent controls when to null-out `interval` (typically after card advance).
 *   - Reduced-motion: instant appear, no fade.
 */
export function IntervalReveal({
  interval,
  rating,
}: IntervalRevealProps): React.ReactElement | null {
  const { shouldAnimate } = useMotionPreference();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (interval) {
      // Tiny defer so the element mounts before the opacity transition fires
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
    }
  }, [interval]);

  if (!interval) return null;

  return (
    <div
      aria-live="polite"
      className={cn(
        "mt-3 flex items-center justify-center gap-2 text-center",
        shouldAnimate ? "transition-opacity duration-[120ms]" : "",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      <span className="text-xs text-[var(--color-text-muted)]">
        {rating && (
          <span className="mr-1.5 font-medium text-[var(--color-text-secondary)]">{rating}</span>
        )}
        Next review in
      </span>
      <span className="font-mono text-sm font-semibold text-[var(--color-text-primary)]">
        {interval}
      </span>
    </div>
  );
}
