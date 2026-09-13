"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { usePreferencesStore } from "@/stores/preferences";

/** Animate route entry without replacing the router's live learner-state subtree. */
export function PageTransition({ children }: { children: React.ReactNode }): React.ReactElement {
  const pathname = usePathname();
  const reducedMotion = usePreferencesStore((state) => state.prefs.reducedMotion);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = container.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element || reducedMotion || preference.matches || !element.animate) return;
    // App Router can update children while an outgoing keyed presence wrapper exits.
    // Keeping one DOM parent prevents that destination from mounting twice and losing drafts.
    const animation = element.animate(
      pathname.startsWith("/discover")
        ? [
            { opacity: 0, transform: "translateX(40px)" },
            { opacity: 1, transform: "none" },
          ]
        : [{ opacity: 0 }, { opacity: 1 }],
      {
        duration: pathname.startsWith("/discover") ? 250 : 350,
        easing: "cubic-bezier(.25,.1,.25,1)",
      }
    );
    const stop = (): void => animation.cancel();
    preference.addEventListener("change", stop);
    return (): void => {
      animation.cancel();
      preference.removeEventListener("change", stop);
    };
  }, [pathname, reducedMotion]);

  return <div ref={container}>{children}</div>;
}
