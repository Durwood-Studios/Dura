"use client";

import { useRef, useCallback } from "react";
import { useSpring, motion } from "motion/react";
import { SPRINGS } from "@/lib/motion/springs";
import { useMotionPreference } from "@/hooks/use-reduced-motion";

interface ParallaxCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * DLS-2.0 §Ambient System — Discover parallax card.
 *
 * Max 4° rotation on X/Y axes, spring-driven via SPRINGS.drift.
 * Mouse-position-aware on desktop; static on touch/mobile.
 * Reduced-motion: no rotation, no spring — static wrapper only.
 */
export function ParallaxCard({ children, className }: ParallaxCardProps): React.ReactElement {
  const { shouldAnimate } = useMotionPreference();
  const ref = useRef<HTMLDivElement>(null);

  const rotateX = useSpring(0, SPRINGS.drift);
  const rotateY = useSpring(0, SPRINGS.drift);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      if (!shouldAnimate || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      // Normalize to [-1, 1]
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      rotateY.set(nx * 4);
      rotateX.set(-ny * 4);
    },
    [shouldAnimate, rotateX, rotateY]
  );

  const onMouseLeave = useCallback((): void => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </motion.div>
  );
}
