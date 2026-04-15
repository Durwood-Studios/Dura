"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

/**
 * Initializes Lenis smooth scroll globally.
 * Respects prefers-reduced-motion — native scroll when reduced motion is on.
 * Elements with [data-lenis-prevent] attribute scroll independently.
 */
export function LenisProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Skip if user prefers reduced motion
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    function raf(time: number): void {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Listen for system preference changes
    const onChange = (): void => {
      if (mq.matches) {
        lenis.destroy();
        lenisRef.current = null;
      }
    };
    mq.addEventListener("change", onChange);

    return () => {
      mq.removeEventListener("change", onChange);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
