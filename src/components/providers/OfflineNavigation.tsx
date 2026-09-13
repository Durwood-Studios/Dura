"use client";

import { useEffect } from "react";

/** Offline curriculum links use cached HTML documents instead of requesting missing RSC variants. */
export function OfflineNavigation(): null {
  useEffect(() => {
    const navigate = (event: MouseEvent): void => {
      if (
        navigator.onLine ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (
        !(anchor instanceof HTMLAnchorElement) ||
        anchor.target ||
        anchor.hasAttribute("download")
      )
        return;
      const url = new URL(anchor.href);
      if (
        url.origin !== location.origin ||
        !(
          url.pathname.startsWith("/paths") ||
          url.pathname.startsWith("/judgment") ||
          url.pathname.startsWith("/labs")
        )
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      window.location.assign(url.href);
    };
    document.addEventListener("click", navigate, true);
    return () => document.removeEventListener("click", navigate, true);
  }, []);
  return null;
}
