"use client";

import type { ConfidenceLevel } from "@/lib/diagnostic/types";

interface ConfidenceProps {
  value: ConfidenceLevel | undefined;
  onChange: (next: ConfidenceLevel) => void;
  disabled?: boolean;
}

const LEVELS: { value: ConfidenceLevel; label: string; description: string }[] = [
  { value: 1, label: "Guessing", description: "I have no idea" },
  { value: 2, label: "Leaning", description: "I lean one way but I'm not sure" },
  { value: 3, label: "Maybe", description: "I think so, no proof" },
  { value: 4, label: "Confident", description: "I'm pretty sure" },
  { value: 5, label: "Certain", description: "I know this cold" },
];

export function Confidence({ value, onChange, disabled }: ConfidenceProps): React.ReactElement {
  return (
    <fieldset
      className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4"
      disabled={disabled}
    >
      <legend className="px-1 text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
        How sure are you?
      </legend>
      <div className="flex gap-2">
        {LEVELS.map((level) => (
          <button
            key={level.value}
            type="button"
            onClick={() => onChange(level.value)}
            aria-pressed={value === level.value}
            aria-label={`${level.label} — ${level.description}`}
            className="flex flex-1 flex-col items-center gap-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors"
            style={{
              backgroundColor:
                value === level.value ? "var(--color-accent)" : "var(--color-bg-surface)",
              borderColor: value === level.value ? "var(--color-accent)" : "var(--color-border)",
              color: value === level.value ? "#ffffff" : "var(--color-text-secondary)",
            }}
          >
            <span className="font-mono text-base">{level.value}</span>
            <span>{level.label}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-[var(--color-text-muted)]">
        Confidence is recorded only for this session and powers the calibration feedback below. It
        is never transmitted.
      </p>
    </fieldset>
  );
}
