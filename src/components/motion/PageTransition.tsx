"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { usePreferencesStore } from "@/stores/preferences";

/**
 * Wraps page content with a subtle fade + slide-up animation on route change.
 * Respects prefers-reduced-motion and the user's reducedMotion preference.
 */
export function PageTransition({ children }: { children: React.ReactNode }): React.ReactElement {
  const pathname = usePathname();
  const reducedMotion = usePreferencesStore((s) => s.prefs.reducedMotion);

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.3, ease: "easeOut" as const }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
