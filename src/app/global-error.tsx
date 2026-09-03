"use client";

import { useEffect, useState } from "react";

/**
 * Last-resort error boundary. Renders when the ROOT layout itself
 * throws — the one case src/app/error.tsx cannot catch. Without this
 * file that failure is a fully blank window with no way out.
 *
 * Must render its own <html>/<body> (it replaces the root layout) and
 * must not assume globals.css loaded, so styling is self-contained.
 * "Repair & reload" drops the service worker + HTTP caches — the usual
 * culprit is a stale cached shell — but never touches IndexedDB or
 * localStorage, so learner data survives.
 */

async function repairAndReload(): Promise<void> {
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
    if ("caches" in window) {
      const keys = await window.caches.keys();
      await Promise.all(keys.map((key) => window.caches.delete(key)));
    }
  } catch (err) {
    console.error("[global-error] Repair failed, reloading anyway:", err);
  } finally {
    window.location.replace("/");
  }
}

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}): React.ReactElement {
  const [repairing, setRepairing] = useState(false);

  useEffect(() => {
    console.error("[dura] Global error boundary caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <style>{`
          .dura-ge {
            min-height: 100vh; display: flex; flex-direction: column;
            align-items: center; justify-content: center; gap: 16px;
            padding: 32px; text-align: center;
            font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
            background: #fafafa; color: #18181b;
          }
          .dura-ge h1 { font-size: 24px; font-weight: 600; margin: 0; }
          .dura-ge p { max-width: 420px; line-height: 1.6; margin: 0; color: #52525b; }
          .dura-ge button {
            border: 0; border-radius: 8px; padding: 12px 24px;
            font-size: 14px; font-weight: 600; cursor: pointer;
            background: #10b981; color: #fff;
          }
          .dura-ge button:disabled { opacity: 0.6; cursor: wait; }
          .dura-ge a { color: #10b981; font-size: 14px; }
          .dura-ge .fine { font-size: 12px; color: #a1a1aa; }
          @media (prefers-color-scheme: dark) {
            .dura-ge { background: #101014; color: #fafafa; }
            .dura-ge p { color: #a1a1aa; }
          }
        `}</style>
        <div className="dura-ge">
          <h1>DURA hit a snag</h1>
          <p>
            The app failed to start — usually a stale cached version after an update. Repair clears
            the cached app files and reloads. Your lessons, progress, and flashcards are stored
            separately on this device and are not touched.
          </p>
          <button
            type="button"
            disabled={repairing}
            onClick={() => {
              setRepairing(true);
              void repairAndReload();
            }}
          >
            {repairing ? "Repairing…" : "Repair & reload"}
          </button>
          {/* Plain location navigation on purpose: the router itself may be
              part of what crashed, so <Link> is not trustworthy here. */}
          <button
            type="button"
            style={{ background: "none", color: "#10b981", padding: 0, fontWeight: 400 }}
            onClick={() => window.location.replace("/")}
          >
            Or just try again
          </button>
          <p className="fine">DURA · your data lives on this device</p>
        </div>
      </body>
    </html>
  );
}
