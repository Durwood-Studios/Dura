"use client";

import { useEffect, useRef } from "react";
// Type-only import (erased at build); the runtime library is loaded lazily
// inside the effect so its ~480KB never lands in the first-load bundle.
import type Lenis from "lenis";

/**
 * Initializes Lenis smooth scroll globally.
 * Respects prefers-reduced-motion — native scroll when reduced motion is on.
 * Elements with [data-lenis-prevent] attribute scroll independently.
 *
 * Lenis is dynamically imported on mount (and skipped entirely under reduced
 * motion), so it loads after first paint instead of blocking it.
 */
export function LenisProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Skip if user prefers reduced motion
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    let rafId = 0;
    let cancelled = false;

    void (async () => {
      const { default: Lenis } = await import("lenis");
      if (cancelled || mq.matches) return;

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
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    })();

    // Listen for system preference changes
    const onChange = (): void => {
      if (mq.matches && lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
    mq.addEventListener("change", onChange);

    return () => {
      cancelled = true;
      mq.removeEventListener("change", onChange);
      if (rafId) cancelAnimationFrame(rafId);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
