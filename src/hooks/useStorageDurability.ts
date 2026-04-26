"use client";

import { useEffect, useState } from "react";

/**
 * Storage durability status (LFLRS-R1).
 *
 * - `unknown`: initial state, before the persistence request resolves
 * - `persistent`: the browser has granted persistent storage; data
 *   should survive eviction pressure
 * - `best-effort`: the browser uses best-effort storage; data can be
 *   evicted under quota pressure (Safari evicts after 7 days of no
 *   visit on non-installed PWAs)
 * - `unsupported`: navigator.storage.persist is not available in this
 *   environment
 */
export type DurabilityStatus = "unknown" | "persistent" | "best-effort" | "unsupported";

/**
 * Request persistent storage on mount and surface the result.
 *
 * Closes LFLRS-R1: a learner with months of FSRS scheduling data
 * shouldn't lose it silently to browser eviction. Browsers grant
 * persistence based on user signals (PWA installation, bookmarks,
 * frequent visits). When persistence is denied, the app should
 * surface the durability risk so the user can install / bookmark
 * to harden their data.
 */
export function useStorageDurability(): DurabilityStatus {
  const [status, setStatus] = useState<DurabilityStatus>("unknown");

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.storage?.persist) {
      setStatus("unsupported");
      return;
    }

    let cancelled = false;
    navigator.storage
      .persist()
      .then((persisted) => {
        if (cancelled) return;
        setStatus(persisted ? "persistent" : "best-effort");
      })
      .catch((error: unknown) => {
        console.error("[storage-durability] persist() failed", error);
        if (!cancelled) setStatus("best-effort");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
