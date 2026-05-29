"use client";

import { useMemo, useState } from "react";
import { buildPlan } from "@/lib/prescription/engine";
import { ALL_FIXTURES } from "@/lib/prescription/fixtures";
import { DailyPrescription } from "./DailyPrescription";

export function PrescriptionDemo(): React.ReactElement {
  const [fixtureId, setFixtureId] = useState<string>(ALL_FIXTURES[0].id);

  const active = ALL_FIXTURES.find((f) => f.id === fixtureId) ?? ALL_FIXTURES[0];
  const plan = useMemo(() => buildPlan(active.inputs), [active]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
        <span className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
          Scenario
        </span>
        <div className="flex flex-wrap gap-2">
          {ALL_FIXTURES.map((f) => {
            const isActive = f.id === fixtureId;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFixtureId(f.id)}
                aria-pressed={isActive}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: isActive ? "var(--color-accent)" : "var(--color-bg-surface)",
                  borderColor: isActive ? "var(--color-accent)" : "var(--color-border)",
                  color: isActive ? "#ffffff" : "var(--color-text-secondary)",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <DailyPrescription plan={plan} />

      <details className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
        <summary className="cursor-pointer text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
          Input that produced this plan
        </summary>
        <pre className="mt-3 overflow-x-auto font-mono text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
          {JSON.stringify(active.inputs, null, 2)}
        </pre>
      </details>
    </div>
  );
}
