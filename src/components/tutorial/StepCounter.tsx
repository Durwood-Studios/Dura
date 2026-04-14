"use client";

interface StepCounterProps {
  /** Current step (1-based for display) */
  current: number;
  /** Total steps */
  total: number;
}

/** Compact step indicator showing "Step N of M". */
export function StepCounter({ current, total }: StepCounterProps): React.ReactElement {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-bg-surface)] px-3 py-1.5 text-sm">
      <span className="font-medium text-emerald-400">Step {current}</span>
      <span className="text-[var(--color-text-muted)]">of {total}</span>
    </div>
  );
}
