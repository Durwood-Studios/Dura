"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buildPlan } from "@/lib/prescription/engine";
import { buildLiveInputs } from "@/lib/prescription/sources";
import type { DailyPlan } from "@/lib/prescription/types";
import { DailyPrescription } from "./DailyPrescription";

type Status =
  | { kind: "loading" }
  | { kind: "ready"; plan: DailyPlan }
  | { kind: "error"; message: string };

/**
 * Live-data daily prescription. Reads FSRS + LessonProgress from local
 * IndexedDB on mount, runs the pure engine, renders the plan.
 *
 * Tolerates store-read failures: the source adapters return zeros + cold-start
 * positions when reads fail, so the engine still produces a plan — usually the
 * fresh-start plan. The UI never blocks on a database error.
 */
export function LiveDailyPrescription(): React.ReactElement {
  const [status, setStatus] = useState<Status>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      try {
        const inputs = await buildLiveInputs();
        if (cancelled) return;
        setStatus({ kind: "ready", plan: buildPlan(inputs) });
      } catch (error) {
        if (cancelled) return;
        setStatus({
          kind: "error",
          message: error instanceof Error ? error.message : "Could not load local data",
        });
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status.kind === "loading") {
    return (
      <section
        aria-busy
        className="flex h-48 animate-pulse items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-sm text-[var(--color-text-muted)]"
      >
        Computing today&apos;s plan…
      </section>
    );
  }

  if (status.kind === "error") {
    // Degraded, not broken: local records were unreadable (commonly a
    // key waiting on sign-in). Keep the learner moving instead of
    // showing a red wall — their data is intact on this device.
    return (
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
          Today&apos;s plan is taking a break.
        </p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Your saved work is safe on this device — we just can&apos;t read it for planning right
          now. Signing in usually brings it back. Meanwhile, picking up where you left off works
          fine.
        </p>
        <Link
          href="/paths"
          className="mt-3 inline-flex items-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          Continue learning
        </Link>
        <p className="mt-3 font-mono text-xs text-[var(--color-text-muted)]">{status.message}</p>
      </section>
    );
  }

  return <DailyPrescription plan={status.plan} />;
}
