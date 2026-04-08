"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins exactly once on the client.
// The module-level guard prevents double-registration during fast refresh.
let registered = false;
if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export { gsap, ScrollTrigger };

/**
 * Run a GSAP setup callback scoped to a container ref. All tweens, timelines,
 * and ScrollTriggers created inside the callback are auto-reverted on unmount
 * via gsap.context() — the canonical GSAP cleanup pattern for React.
 *
 * @param setup Callback that creates animations. Receives the resolved DOM node.
 * @param deps  Re-run dependencies. Defaults to empty array (mount-only).
 * @returns Ref to attach to the scope container element.
 */
export function useGSAP<T extends HTMLElement = HTMLDivElement>(
  setup: (scope: T) => void,
  deps: ReadonlyArray<unknown> = []
): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const scope = ref.current;
    if (!scope) return;

    const ctx = gsap.context(() => setup(scope), scope);

    return () => {
      ctx.revert();
    };
    // setup is intentionally excluded — callers control re-runs via deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
