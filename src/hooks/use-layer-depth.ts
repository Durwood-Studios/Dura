/**
 * useLayerDepth — DLS-2.0 §Depth Model
 *
 * Call this inside any Layer 2+ component (modal, drawer, sheet) to
 * automatically apply the receding/background CSS classes to the main
 * app content layer while the surface is mounted.
 *
 * Layer 2 (modal): main content gets `.layer-1-receding`
 * Layer 3 (overlay on top of modal): all lower layers get `.layer-1-background`
 *
 * The hook operates on `#main-content` (the app layout landmark). It is
 * a no-op on SSR and in contexts where the element doesn't exist.
 *
 * Usage:
 *   // Inside a modal component:
 *   useLayerDepth(2);
 */

import { useEffect } from "react";

const MAIN_CONTENT_ID = "main-content";

/** Depth level — 2 = modal above content, 3 = overlay above modal */
type LayerLevel = 2 | 3;

export function useLayerDepth(level: LayerLevel): void {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const el = document.getElementById(MAIN_CONTENT_ID);
    if (!el) return;

    const cls = level >= 3 ? "layer-1-background" : "layer-1-receding";
    el.classList.add(cls);

    return () => {
      el.classList.remove(cls);
    };
  }, [level]);
}
