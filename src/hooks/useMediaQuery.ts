import { useCallback, useSyncExternalStore } from "react";

/** Subscribe to a browser media query with a stable false server snapshot. */
export function useMediaQuery(query: string): boolean {
  const read = useCallback((): boolean => {
    try {
      return typeof window !== "undefined" && Boolean(window.matchMedia?.(query).matches);
    } catch {
      return false;
    }
  }, [query]);
  const subscribe = useCallback(
    (notify: () => void): (() => void) => {
      if (typeof window === "undefined" || !window.matchMedia) return (): void => {};
      try {
        const media = window.matchMedia(query);
        if (typeof media.addEventListener === "function") {
          media.addEventListener("change", notify);
          return (): void => media.removeEventListener("change", notify);
        }
        media.addListener?.(notify);
        return (): void => media.removeListener?.(notify);
      } catch {
        return (): void => {};
      }
    },
    [query]
  );
  return useSyncExternalStore(subscribe, read, (): boolean => false);
}
