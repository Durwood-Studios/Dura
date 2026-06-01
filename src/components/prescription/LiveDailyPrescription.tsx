"use client";

import { useEffect, useState } from "react";
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
    return (
      <section className="rounded-xl border border-[var(--color-rating-again)]/30 bg-[var(--color-rating-again)]/5 p-5">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
          Could not build a plan from local data.
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">{status.message}</p>
      </section>
    );
  }

  return <DailyPrescription plan={status.plan} />;
}
