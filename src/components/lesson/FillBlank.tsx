"use client";

import { useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface FillBlankProps {
  prompt: string;
  answers: string[];
  hints?: string[];
}

interface BlankState {
  attempts: number;
  status: "idle" | "correct" | "wrong";
  revealed: boolean;
}

const REVEAL_AFTER_ATTEMPTS = 2;

/**
 * Fill-in-the-blank with per-blank attempt tracking, tab navigation,
 * shake-on-wrong animation, and answer reveal after two failed attempts.
 */
export function FillBlank({ prompt, answers, hints = [] }: FillBlankProps): React.ReactElement {
  const safePrompt = prompt ?? "";
  const safeAnswers = answers ?? [];
  const segments = useMemo(() => safePrompt.split("___"), [safePrompt]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [values, setValues] = useState<string[]>(() => safeAnswers.map(() => ""));
  const [blanks, setBlanks] = useState<BlankState[]>(() =>
    safeAnswers.map(() => ({ attempts: 0, status: "idle", revealed: false }))
  );

  const allCorrect = blanks.every((b) => b.status === "correct");

  const focusNext = (i: number) => {
    const next = inputRefs.current[i + 1];
    if (next) next.focus();
  };

  const onChange = (i: number, value: string) => {
    if (blanks[i].status === "correct" || blanks[i].revealed) return;
    setValues((vs) => {
      const next = [...vs];
      next[i] = value;
      return next;
    });
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      check();
    }
  };

  const check = () => {
    let nextValues = values;
    const nextBlanks = blanks.map((b, i) => {
      if (b.status === "correct" || b.revealed) return b;
      const isCorrect = values[i].trim().toLowerCase() === safeAnswers[i].trim().toLowerCase();
      const attempts = b.attempts + 1;
      if (isCorrect) {
        return { attempts, status: "correct" as const, revealed: false };
      }
      if (attempts >= REVEAL_AFTER_ATTEMPTS) {
        nextValues = nextValues.map((v, j) => (j === i ? safeAnswers[i] : v));
        return { attempts, status: "correct" as const, revealed: true };
      }
      return { attempts, status: "wrong" as const, revealed: false };
    });
    setValues(nextValues);
    setBlanks(nextBlanks);
    void track("quiz_attempted", {
      type: "fill-blank",
      correct: nextBlanks.filter((b) => b.status === "correct" && !b.revealed).length,
      revealed: nextBlanks.filter((b) => b.revealed).length,
      total: safeAnswers.length,
    });
    // focus the next still-wrong blank
    const nextWrong = nextBlanks.findIndex((b) => b.status !== "correct");
    if (nextWrong >= 0) focusNext(nextWrong - 1);
  };

  return (
    <section className="my-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
      <p className="leading-[1.9] text-[var(--color-text-primary)]">
        {segments.map((seg, i) => (
          <span key={i}>
            {seg}
            {i < safeAnswers.length && (
              <span className="relative inline-flex items-center">
                <input
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  value={values[i]}
                  onChange={(e) => onChange(i, e.target.value)}
                  onKeyDown={(e) => onKeyDown(i, e)}
                  disabled={blanks[i].status === "correct"}
                  aria-label={`Blank ${i + 1}`}
                  aria-invalid={blanks[i].status === "wrong"}
                  className={cn(
                    "mx-1 inline-block min-w-[6ch] rounded border px-2 py-0.5 font-mono text-sm transition",
                    blanks[i].status === "correct" &&
                      !blanks[i].revealed &&
                      "border-emerald-500 bg-emerald-50 text-emerald-900",
                    blanks[i].revealed && "border-amber-400 bg-amber-50 text-amber-900",
                    blanks[i].status === "wrong" &&
                      "fillblank-shake border-rose-500 bg-rose-50 text-rose-900",
                    blanks[i].status === "idle" &&
                      "border-[var(--color-border)] bg-[var(--color-bg-subtle)]"
                  )}
                />
                {blanks[i].status === "correct" && !blanks[i].revealed && (
                  <Check
                    className="pointer-events-none absolute top-1/2 -right-4 h-3.5 w-3.5 -translate-y-1/2 text-emerald-600"
                    aria-hidden
                  />
                )}
              </span>
            )}
          </span>
        ))}
      </p>
      {!allCorrect && hints.length > 0 && (
        <ul className="mt-4 flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
          {hints.map((hint, i) =>
            blanks[i] && blanks[i].attempts > 0 && blanks[i].status !== "correct" ? (
              <li key={i}>
                Hint {i + 1}: {hint}
              </li>
            ) : null
          )}
        </ul>
      )}
      {!allCorrect && (
        <button
          type="button"
          onClick={check}
          className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          Check answers
        </button>
      )}
      {allCorrect && (
        <p className="mt-4 text-sm font-medium text-emerald-600">
          {blanks.some((b) => b.revealed) ? "Got it — keep practicing." : "All correct."}
        </p>
      )}
    </section>
  );
}
