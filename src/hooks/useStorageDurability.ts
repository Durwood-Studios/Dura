"use client";

import { useEffect, useState } from "react";
import { restoreFromOPFSIfNeeded } from "@/lib/storage/restore";
import { registerShadowWriteFlushers } from "@/lib/storage/shadow-write";

/**
 * Storage durability status (LFLRS-R1).
 *
 * - `unknown`: initial state, before the bootstrap resolves
 * - `persistent`: the browser has granted persistent storage; data
 *   should survive eviction pressure
 * - `best-effort`: the browser uses best-effort storage; data can be
 *   evicted under quota pressure (Safari evicts after 7 days of no
 *   visit on non-installed PWAs). The OPFS shadow layer still
 *   protects against this — see src/lib/storage/.
 * - `unsupported`: navigator.storage.persist is not available in this
 *   environment
 */
export type DurabilityStatus = "unknown" | "persistent" | "best-effort" | "unsupported";

/**
 * Bootstrap local storage durability on mount:
 *   1. Restore from OPFS shadow if IndexedDB is empty
 *   2. Request persistent storage from the browser
 *   3. Register shadow-write flushers (pagehide / visibilitychange / periodic)
 *
 * Returns the persistence status so a sibling component can warn the
 * user when the browser declines persistence.
 */
export function useStorageDurability(): DurabilityStatus {
  const [status, setStatus] = useState<DurabilityStatus>("unknown");

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.storage?.persist) {
      setStatus("unsupported");
      return;
    }

    let cancelled = false;
    let unregisterFlushers: (() => void) | null = null;

    (async () => {
      try {
        await restoreFromOPFSIfNeeded();
      } catch (error) {
        console.error("[storage-durability] restore failed", error);
      }
      if (cancelled) return;

      try {
        const persisted = await navigator.storage.persist();
        if (!cancelled) setStatus(persisted ? "persistent" : "best-effort");
      } catch (error) {
        console.error("[storage-durability] persist() failed", error);
        if (!cancelled) setStatus("best-effort");
      }

      if (!cancelled) {
        unregisterFlushers = registerShadowWriteFlushers();
      }
    })();

    return () => {
      cancelled = true;
      if (unregisterFlushers) unregisterFlushers();
    };
  }, []);

  return status;
}
