"use client";

import { useMemo, useState } from "react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface FillBlankProps {
  prompt: string;
  answers: string[];
  hints?: string[];
}

/**
 * Base fill-in-the-blank. Splits prompt on `___`, renders an input for
 * each gap, and checks all answers on submit. Phase B (B2) adds tab
 * navigation, hint reveals after failed attempts, and shake animation.
 */
export function FillBlank({ prompt, answers, hints = [] }: FillBlankProps): React.ReactElement {
  const segments = useMemo(() => prompt.split("___"), [prompt]);
  const [values, setValues] = useState<string[]>(() => answers.map(() => ""));
  const [results, setResults] = useState<(boolean | null)[]>(() => answers.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const allCorrect = results.every((r) => r === true);

  const onChange = (i: number, value: string) => {
    if (allCorrect) return;
    setValues((vs) => {
      const next = [...vs];
      next[i] = value;
      return next;
    });
  };

  const check = () => {
    const next = answers.map((a, i) => values[i].trim().toLowerCase() === a.trim().toLowerCase());
    setResults(next);
    setSubmitted(true);
    if (!next.every(Boolean)) setShowHints(true);
    void track("quiz_attempted", {
      type: "fill-blank",
      correct: next.filter(Boolean).length,
      total: answers.length,
    });
  };

  return (
    <section className="my-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
      <p className="leading-[1.9] text-[var(--color-text-primary)]">
        {segments.map((seg, i) => (
          <span key={i}>
            {seg}
            {i < answers.length && (
              <input
                type="text"
                value={values[i]}
                onChange={(e) => onChange(i, e.target.value)}
                disabled={allCorrect}
                aria-label={`Blank ${i + 1}`}
                className={cn(
                  "mx-1 inline-block min-w-[6ch] rounded border px-2 py-0.5 font-mono text-sm",
                  results[i] === true && "border-emerald-500 bg-emerald-50 text-emerald-900",
                  results[i] === false && "border-rose-500 bg-rose-50 text-rose-900",
                  results[i] === null && "border-[var(--color-border)] bg-[var(--color-bg-subtle)]"
                )}
              />
            )}
          </span>
        ))}
      </p>
      {showHints && hints.length > 0 && !allCorrect && (
        <ul className="mt-4 flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
          {hints.map((hint, i) => (
            <li key={i}>
              Hint {i + 1}: {hint}
            </li>
          ))}
        </ul>
      )}
      {!allCorrect && (
        <button
          type="button"
          onClick={check}
          className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          {submitted ? "Check again" : "Check answers"}
        </button>
      )}
      {allCorrect && <p className="mt-4 text-sm font-medium text-emerald-600">All correct.</p>}
    </section>
  );
}
