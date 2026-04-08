"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface ParsonsPanelProps {
  blocks: string[];
  solution: number[];
}

/**
 * Base Parsons panel: button-based reorder with up/down controls.
 * Phase B (B4) replaces the controls with native HTML5 drag-and-drop +
 * touch support and adds distractor blocks plus indentation.
 */
export function ParsonsPanel({ blocks, solution }: ParsonsPanelProps): React.ReactElement {
  const [order, setOrder] = useState<number[]>(() => blocks.map((_, i) => i));
  const [result, setResult] = useState<"idle" | "correct" | "wrong">("idle");

  const move = (from: number, delta: number) => {
    const to = from + delta;
    if (to < 0 || to >= order.length) return;
    setOrder((prev) => {
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
    setResult("idle");
  };

  const check = () => {
    const correct = order.length === solution.length && order.every((id, i) => id === solution[i]);
    setResult(correct ? "correct" : "wrong");
    void track("quiz_attempted", { type: "parsons", correct });
  };

  const reset = () => {
    setOrder(blocks.map((_, i) => i));
    setResult("idle");
  };

  return (
    <section className="my-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
      <p className="mb-3 text-sm text-[var(--color-text-secondary)]">
        Reorder the blocks to form a valid solution.
      </p>
      <ol className="flex flex-col gap-2">
        {order.map((blockId, i) => (
          <li
            key={`${blockId}-${i}`}
            className={cn(
              "flex items-center gap-2 rounded-lg border bg-[var(--color-bg-subtle)] px-3 py-2 font-mono text-sm",
              result === "correct" && "border-emerald-500 bg-emerald-50",
              result === "wrong" && "border-rose-500 bg-rose-50",
              result === "idle" && "border-[var(--color-border)]"
            )}
          >
            <span className="flex flex-col">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Move up"
                className="text-[var(--color-text-muted)] hover:text-emerald-600 disabled:opacity-30"
              >
                <ArrowUp className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === order.length - 1}
                aria-label="Move down"
                className="text-[var(--color-text-muted)] hover:text-emerald-600 disabled:opacity-30"
              >
                <ArrowDown className="h-3 w-3" />
              </button>
            </span>
            <code className="flex-1 whitespace-pre">{blocks[blockId]}</code>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={check}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          Check
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-subtle)]"
        >
          Reset
        </button>
      </div>
      {result === "wrong" && (
        <p className="mt-3 text-sm text-rose-600">Not quite — try a different order.</p>
      )}
      {result === "correct" && (
        <p className="mt-3 text-sm font-medium text-emerald-600">Correct order.</p>
      )}
    </section>
  );
}
