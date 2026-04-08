"use client";

import type { ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

interface ScrollRevealProps {
  children: ReactNode;
  /** Delay before the animation starts, in seconds. */
  delay?: number;
  /** Animation duration, in seconds. */
  duration?: number;
  /** Vertical offset (px) the element starts at before sliding to 0. */
  y?: number;
  /** Optional className applied to the wrapper element. */
  className?: string;
  /** ScrollTrigger start position. Defaults to "top 85%". */
  start?: string;
  /** Replay on every scroll-in. Defaults to false (play once). */
  replay?: boolean;
}

/**
 * Fade-up + slide a block into view when it enters the viewport.
 * Built on GSAP ScrollTrigger via the shared useGSAP hook (auto-cleanup on unmount).
 * Coexists with framer-motion — use this for scroll-driven reveals,
 * use motion/react for hover/mount/layout transitions.
 */
export function ScrollReveal({
  children,
  delay = 0,
  duration = 0.7,
  y = 24,
  className,
  start = "top 85%",
  replay = false,
}: ScrollRevealProps): React.ReactElement {
  const ref = useGSAP<HTMLDivElement>(
    (scope) => {
      gsap.fromTo(
        scope,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: "power2.out",
          scrollTrigger: {
            trigger: scope,
            start,
            toggleActions: replay ? "play reverse play reverse" : "play none none none",
          },
        }
      );
    },
    [delay, duration, y, start, replay]
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
