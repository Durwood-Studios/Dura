"use client";

interface ProgressBarProps {
  /** Current step (0-based) */
  current: number;
  /** Total number of steps */
  total: number;
  /** Optional label */
  label?: string;
}

/** Animated progress bar for tutorial step completion. */
export function ProgressBar({ current, total, label }: ProgressBarProps): React.ReactElement {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-[var(--color-text-secondary)]">
          {label ?? "Progress"}
        </span>
        <span className="text-[var(--color-text-muted)] tabular-nums">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--color-bg-surface)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
