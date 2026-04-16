"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

/**
 * Shows a small non-intrusive indicator when the user goes offline.
 * Disappears when connection is restored. Reassures that data is safe.
 */
export function OfflineIndicator(): React.ReactElement | null {
  const [offline, setOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const goOffline = () => {
      setOffline(true);
      setDismissed(false);
    };
    const goOnline = () => setOffline(false);

    // Check initial state
    if (!navigator.onLine) goOffline();

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!offline || dismissed) return null;

  return (
    <div className="fixed top-16 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 shadow-md dark:border-amber-800 dark:bg-amber-950/80">
        <WifiOff className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
          Offline — your data is safe
        </span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="ml-1 text-xs text-amber-500 hover:text-amber-700 dark:hover:text-amber-200"
          aria-label="Dismiss"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
