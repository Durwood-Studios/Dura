"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DISCOVERY_ACTIVITIES } from "@/lib/discovery/registry";
import { getDiscoveryPassport } from "@/lib/discovery/passport";
import { DISCOVERY_CHANGED } from "@/components/discover/DiscoveryStampStatus";

/** Current, reachable Discovery stamps from the owner-scoped portable learner record. */
export function Passport(): React.ReactElement {
  const [completed, setCompleted] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    let request = 0;
    const load = (): void => {
      const current = ++request;
      setCompleted([]);
      void getDiscoveryPassport()
        .then((record) => {
          if (active && current === request) {
            setCompleted(record.activities);
            setWarning(record.warning ?? null);
            setError(null);
          }
        })
        .catch((failure) => {
          if (active && current === request)
            setError(failure instanceof Error ? failure.message : "Passport unavailable.");
        });
    };
    load();
    window.addEventListener(DISCOVERY_CHANGED, load);
    window.addEventListener("dura:storage-owner-ready", load);
    window.addEventListener("focus", load);
    return () => {
      active = false;
      window.removeEventListener(DISCOVERY_CHANGED, load);
      window.removeEventListener("dura:storage-owner-ready", load);
      window.removeEventListener("focus", load);
    };
  }, [reload]);
  const completedSet = new Set(completed);
  return (
    <section className="mt-16 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 [overflow-wrap:anywhere]">
      <h2 className="mb-2 text-center text-2xl font-bold">Discovery Passport</h2>
      <p className="mb-4 text-center text-sm">
        {completed.length} of {DISCOVERY_ACTIVITIES.length} explored
      </p>
      <p className="mb-6 text-center text-sm text-[var(--color-text-secondary)]">
        Stamps record exploration, not mastery. This learner’s passport is included in their
        progress export.
      </p>
      {warning && (
        <p role="status" className="mb-3 text-sm">
          {warning}
        </p>
      )}
      {error && (
        <div role="alert" className="mb-3 text-sm">
          <p>{error}</p>
          <button
            type="button"
            className="min-h-12 underline"
            onClick={() => setReload((value) => value + 1)}
          >
            Retry loading passport
          </button>
        </div>
      )}
      <ul className="grid gap-3 sm:grid-cols-2">
        {DISCOVERY_ACTIVITIES.map((activity) => (
          <li key={activity.slug}>
            <Link
              href={`/discover/${activity.roomSlug}/${activity.slug}`}
              className="flex min-h-12 min-w-0 items-center gap-3 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
            >
              <span
                aria-hidden
                className={
                  completedSet.has(activity.slug)
                    ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-celebration)] text-white"
                    : "h-8 w-8 shrink-0 rounded-full border-2 border-dashed border-[var(--color-border)]"
                }
              >
                {completedSet.has(activity.slug) ? "✓" : ""}
              </span>
              <span>
                {activity.title}
                <span className="block text-xs text-[var(--color-text-secondary)]">
                  {completedSet.has(activity.slug) ? "Explored" : "Not yet explored"} ·{" "}
                  {activity.roomName}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
export default Passport;
