"use client";

import { useMemo, useState } from "react";
import { ArrowUp, ArrowDown, ChevronRight, ChevronLeft, X } from "lucide-react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export interface ParsonsBlock {
  id: string;
  content: string;
}

export interface ParsonsSolutionStep {
  id: string;
  indent: number;
}

interface ParsonsPanelProps {
  /** Source blocks the learner can pull from. */
  blocks: ParsonsBlock[];
  /** Wrong-answer blocks that must NOT appear in the solution. */
  distractors?: ParsonsBlock[];
  /** The correct ordered solution, including indentation. */
  solution: ParsonsSolutionStep[];
  /** Maximum indent level. Defaults to 3. */
  maxIndent?: number;
}

interface PlacedBlock {
  id: string;
  indent: number;
}

const REVEAL_AFTER_ATTEMPTS = 3;

/**
 * Parsons problem with native HTML5 drag-and-drop, click-to-move (works
 * on touch), keyboard reorder, and indentation. Distractors live in the
 * source pool but must not appear in the solution.
 */
export function ParsonsPanel({
  blocks,
  distractors = [],
  solution,
  maxIndent = 3,
}: ParsonsPanelProps): React.ReactElement {
  const allBlocks = useMemo<ParsonsBlock[]>(
    () => [...blocks, ...distractors],
    [blocks, distractors]
  );
  const blockMap = useMemo(() => new Map(allBlocks.map((b) => [b.id, b])), [allBlocks]);

  const initialPool = useMemo(() => allBlocks.map((b) => b.id), [allBlocks]);
  const [pool, setPool] = useState<string[]>(initialPool);
  const [placed, setPlaced] = useState<PlacedBlock[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<"idle" | "correct" | "wrong">("idle");
  const [revealed, setRevealed] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const moveToTarget = (id: string) => {
    if (revealed) return;
    if (placed.find((p) => p.id === id)) return;
    setPool((prev) => prev.filter((pid) => pid !== id));
    setPlaced((prev) => [...prev, { id, indent: 0 }]);
    setResult("idle");
  };

  const removeFromTarget = (id: string) => {
    if (revealed) return;
    setPlaced((prev) => prev.filter((p) => p.id !== id));
    setPool((prev) => [...prev, id]);
    setResult("idle");
  };

  const moveWithin = (from: number, delta: -1 | 1) => {
    const to = from + delta;
    if (to < 0 || to >= placed.length) return;
    setPlaced((prev) => {
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
    setResult("idle");
  };

  const setIndent = (i: number, delta: -1 | 1) => {
    setPlaced((prev) => {
      const next = [...prev];
      const target = Math.max(0, Math.min(maxIndent, next[i].indent + delta));
      next[i] = { ...next[i], indent: target };
      return next;
    });
    setResult("idle");
  };

  const onDragStart = (id: string) => (e: React.DragEvent) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };
  const onDragEnd = () => setDraggingId(null);

  const onDropToTarget = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggingId;
    if (id) moveToTarget(id);
    setDraggingId(null);
  };

  const onDropToPool = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggingId;
    if (id && placed.find((p) => p.id === id)) removeFromTarget(id);
    setDraggingId(null);
  };

  const allowDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const check = () => {
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    const correct =
      placed.length === solution.length &&
      placed.every((p, i) => p.id === solution[i].id && p.indent === solution[i].indent);
    setResult(correct ? "correct" : "wrong");
    void track("quiz_attempted", { type: "parsons", correct, attempts: nextAttempts });

    if (!correct && nextAttempts >= REVEAL_AFTER_ATTEMPTS) {
      setRevealed(true);
      setPlaced(solution.map((s) => ({ id: s.id, indent: s.indent })));
      setPool(initialPool.filter((id) => !solution.find((s) => s.id === id)));
    }
  };

  const reset = () => {
    setPool(initialPool);
    setPlaced([]);
    setResult("idle");
    setRevealed(false);
  };

  return (
    <section className="my-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
      <p className="mb-3 text-sm text-[var(--color-text-secondary)]">
        Drag or tap blocks to build a valid solution. Some blocks are distractors and should not
        appear in your answer.
      </p>

      {/* Source pool */}
      <div
        onDragOver={allowDrop}
        onDrop={onDropToPool}
        className="mb-4 flex flex-wrap gap-2 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3"
      >
        {pool.length === 0 && (
          <p className="text-xs text-[var(--color-text-muted)]">All blocks placed.</p>
        )}
        {pool.map((id) => {
          const block = blockMap.get(id);
          if (!block) return null;
          return (
            <button
              key={id}
              type="button"
              draggable
              onDragStart={onDragStart(id)}
              onDragEnd={onDragEnd}
              onClick={() => moveToTarget(id)}
              className={cn(
                "rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-left font-mono text-sm text-[var(--color-text-primary)] shadow-sm transition hover:border-emerald-400",
                draggingId === id && "opacity-50"
              )}
            >
              {block.content}
            </button>
          );
        })}
      </div>

      {/* Solution target */}
      <ol
        onDragOver={allowDrop}
        onDrop={onDropToTarget}
        className="mb-4 flex min-h-[80px] flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3"
      >
        {placed.length === 0 && (
          <p className="text-xs text-[var(--color-text-muted)]">
            Drop or tap blocks here to build your solution.
          </p>
        )}
        {placed.map((p, i) => {
          const block = blockMap.get(p.id);
          if (!block) return null;
          return (
            <li
              key={`${p.id}-${i}`}
              draggable={!revealed}
              onDragStart={onDragStart(p.id)}
              onDragEnd={onDragEnd}
              style={{ paddingLeft: `${p.indent * 20}px` }}
              className={cn(
                "flex items-center gap-2 rounded-lg border bg-[var(--color-bg-surface)] px-3 py-2 font-mono text-sm shadow-sm transition",
                result === "correct" && "border-emerald-500 bg-emerald-50",
                result === "wrong" && "border-rose-500 bg-rose-50",
                result === "idle" && "border-[var(--color-border)]",
                draggingId === p.id && "opacity-50"
              )}
            >
              <span className="flex flex-col">
                <button
                  type="button"
                  onClick={() => moveWithin(i, -1)}
                  disabled={i === 0 || revealed}
                  aria-label="Move up"
                  className="text-[var(--color-text-muted)] hover:text-emerald-600 disabled:opacity-30"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => moveWithin(i, 1)}
                  disabled={i === placed.length - 1 || revealed}
                  aria-label="Move down"
                  className="text-[var(--color-text-muted)] hover:text-emerald-600 disabled:opacity-30"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
              </span>
              <code className="flex-1 whitespace-pre">{block.content}</code>
              <button
                type="button"
                onClick={() => setIndent(i, -1)}
                disabled={p.indent === 0 || revealed}
                aria-label="Indent left"
                className="text-[var(--color-text-muted)] hover:text-emerald-600 disabled:opacity-30"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => setIndent(i, 1)}
                disabled={p.indent === maxIndent || revealed}
                aria-label="Indent right"
                className="text-[var(--color-text-muted)] hover:text-emerald-600 disabled:opacity-30"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => removeFromTarget(p.id)}
                disabled={revealed}
                aria-label="Remove"
                className="text-[var(--color-text-muted)] hover:text-rose-600 disabled:opacity-30"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={check}
          disabled={placed.length === 0 || revealed}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-semibold transition",
            placed.length > 0 && !revealed
              ? "bg-emerald-500 text-white hover:bg-emerald-600"
              : "cursor-not-allowed bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]"
          )}
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

      {result === "wrong" && !revealed && (
        <p className="mt-3 text-sm text-rose-600">
          Not quite — try a different order or indentation. ({REVEAL_AFTER_ATTEMPTS - attempts}{" "}
          attempts left before the answer is revealed.)
        </p>
      )}
      {result === "correct" && !revealed && (
        <p className="mt-3 text-sm font-medium text-emerald-600">Correct.</p>
      )}
      {revealed && (
        <p className="mt-3 text-sm font-medium text-amber-600">
          Here&apos;s the correct solution. Reset to try again.
        </p>
      )}
    </section>
  );
}
