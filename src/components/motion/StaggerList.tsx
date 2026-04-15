"use client";

import { Children } from "react";
import { motion } from "motion/react";
import { usePreferencesStore } from "@/stores/preferences";

interface StaggerListProps {
  children: React.ReactNode;
  /** Delay between each child's animation, in ms. Default 80. */
  stagger?: number;
  className?: string;
}

/**
 * Animates a list of children with staggered entrance.
 * Each child fades in and slides up. Animates once on first appearance only.
 * Respects prefers-reduced-motion and the user's reducedMotion preference.
 */
export function StaggerList({
  children,
  stagger = 80,
  className,
}: StaggerListProps): React.ReactElement {
  const reducedMotion = usePreferencesStore((s) => s.prefs.reducedMotion);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={className}>
      {Children.map(children, (child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{
            duration: 0.4,
            ease: "easeOut" as const,
            delay: i * (stagger / 1000),
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
