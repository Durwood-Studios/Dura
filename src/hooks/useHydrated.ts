import { useSyncExternalStore } from "react";

const subscribe = (): (() => void) => (): void => {};
const clientSnapshot = (): boolean => true;
const serverSnapshot = (): boolean => false;

/** Expose browser-only UI after hydration without a cascading effect update. */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
}
