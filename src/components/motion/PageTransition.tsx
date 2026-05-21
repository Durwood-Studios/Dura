"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { usePreferencesStore } from "@/stores/preferences";
import { SPRINGS } from "@/lib/motion/springs";

/** Routes that are part of the Discover surface */
const isDiscover = (path: string): boolean => path.startsWith("/discover");

/**
 * Page-level transition wrapper.
 *
 * Default: subtle fade + 8px slide-up (300ms ease-out).
 * Any → Discover: source slides left, Discover enters from the right (250ms,
 *   SPRINGS.fluid). DLS-2.0 §Surface Transitions.
 * Discover → Any: reverse — Discover slides left, target enters from right.
 *
 * Respects prefers-reduced-motion and the user's reducedMotion preference.
 */
export function PageTransition({ children }: { children: React.ReactNode }): React.ReactElement {
  const pathname = usePathname();
  const reducedMotion = usePreferencesStore((s) => s.prefs.reducedMotion);

  if (reducedMotion) {
    return <>{children}</>;
  }

  // Discover surface gets a horizontal slide; everything else gets the default fade
  const toDiscover = isDiscover(pathname);

  const variants = toDiscover
    ? {
        initial: { opacity: 0, x: 40 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -40 },
      }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -4 },
      };

  const transition = toDiscover
    ? { ...SPRINGS.fluid, duration: undefined }
    : { duration: 0.25, ease: "easeOut" as const };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={transition}
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
