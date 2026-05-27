"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";

const ARRAY_SIZE = 30;
const TICK_MS = 40;

interface SortStep {
  array: number[];
  active: number[];
  comparisons: number;
  writes: number;
  done: boolean;
}

/** Fisher-Yates shuffle. */
function shuffle(input: number[]): number[] {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** ──── Sort generators ────────────────────────────────────────────────── */

function* bubbleSort(initial: number[]): Generator<SortStep, void, unknown> {
  const a = [...initial];
  const n = a.length;
  let comparisons = 0;
  let writes = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      if (a[j]! > a[j + 1]!) {
        [a[j], a[j + 1]] = [a[j + 1]!, a[j]!];
        writes += 2;
        yield { array: [...a], active: [j, j + 1], comparisons, writes, done: false };
      } else {
        yield { array: [...a], active: [j, j + 1], comparisons, writes, done: false };
      }
    }
  }
  yield { array: [...a], active: [], comparisons, writes, done: true };
}

function* mergeSort(initial: number[]): Generator<SortStep, void, unknown> {
  const a = [...initial];
  const n = a.length;
  let comparisons = 0;
  let writes = 0;
  for (let size = 1; size < n; size *= 2) {
    for (let start = 0; start < n; start += 2 * size) {
      const mid = Math.min(start + size, n);
      const end = Math.min(start + 2 * size, n);
      const merged: number[] = [];
      let i = start;
      let j = mid;
      while (i < mid && j < end) {
        comparisons++;
        if (a[i]! <= a[j]!) {
          merged.push(a[i]!);
          i++;
        } else {
          merged.push(a[j]!);
          j++;
        }
      }
      while (i < mid) {
        merged.push(a[i]!);
        i++;
      }
      while (j < end) {
        merged.push(a[j]!);
        j++;
      }
      for (let k = 0; k < merged.length; k++) {
        a[start + k] = merged[k]!;
        writes++;
        yield { array: [...a], active: [start + k], comparisons, writes, done: false };
      }
    }
  }
  yield { array: [...a], active: [], comparisons, writes, done: true };
}

function* quickSort(initial: number[]): Generator<SortStep, void, unknown> {
  const a = [...initial];
  let comparisons = 0;
  let writes = 0;

  function* partition(lo: number, hi: number): Generator<SortStep, number, unknown> {
    const pivot = a[hi]!;
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      comparisons++;
      yield { array: [...a], active: [j, hi], comparisons, writes, done: false };
      if (a[j]! < pivot) {
        i++;
        if (i !== j) {
          [a[i], a[j]] = [a[j]!, a[i]!];
          writes += 2;
        }
      }
    }
    if (i + 1 !== hi) {
      [a[i + 1], a[hi]] = [a[hi]!, a[i + 1]!];
      writes += 2;
    }
    yield { array: [...a], active: [i + 1, hi], comparisons, writes, done: false };
    return i + 1;
  }

  function* qs(lo: number, hi: number): Generator<SortStep, void, unknown> {
    if (lo < hi) {
      const p = yield* partition(lo, hi);
      yield* qs(lo, p - 1);
      yield* qs(p + 1, hi);
    }
  }

  yield* qs(0, a.length - 1);
  yield { array: [...a], active: [], comparisons, writes, done: true };
}

/** ──── Column renderer ───────────────────────────────────────────────── */

interface SortColumnProps {
  name: string;
  complexity: string;
  step: SortStep;
  color: string;
}

function SortColumn({ name, complexity, step, color }: SortColumnProps): React.ReactElement {
  const max = step.array.length;
  return (
    <div className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{name}</h3>
          <p className="font-mono text-[11px] text-[var(--color-text-muted)]">{complexity}</p>
        </div>
        {step.done && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
            style={{ backgroundColor: `${color}1f`, color }}
          >
            done
          </span>
        )}
      </div>

      {/* Bar visualization */}
      <div className="flex h-40 items-end gap-px">
        {step.array.map((value, idx) => {
          const isActive = step.active.includes(idx);
          const fillColor = step.done ? color : isActive ? "#fbbf24" : "var(--color-text-muted)";
          const opacity = step.done ? 0.85 : isActive ? 1 : 0.45;
          return (
            <div
              key={idx}
              className="flex-1 rounded-t-[2px] transition-[height,background-color] duration-100"
              style={{
                height: `${(value / max) * 100}%`,
                backgroundColor: fillColor,
                opacity,
              }}
            />
          );
        })}
      </div>

      {/* Counters */}
      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[var(--color-border)] pt-3 text-center">
        <div>
          <p className="font-mono text-lg font-bold text-[var(--color-text-primary)]">
            {step.comparisons}
          </p>
          <p className="text-[10px] tracking-wide text-[var(--color-text-muted)] uppercase">
            comparisons
          </p>
        </div>
        <div>
          <p className="font-mono text-lg font-bold text-[var(--color-text-primary)]">
            {step.writes}
          </p>
          <p className="text-[10px] tracking-wide text-[var(--color-text-muted)] uppercase">
            writes
          </p>
        </div>
      </div>
    </div>
  );
}

/** ──── Main component ────────────────────────────────────────────────── */

export function SortingRace(): React.ReactElement {
  const initialArray = useMemo(
    () => shuffle(Array.from({ length: ARRAY_SIZE }, (_, i) => i + 1)),
    []
  );
  const [array, setArray] = useState(initialArray);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const completedRef = useRef(false);

  const initialStep = (arr: number[]): SortStep => ({
    array: arr,
    active: [],
    comparisons: 0,
    writes: 0,
    done: false,
  });

  const [bubbleStep, setBubbleStep] = useState<SortStep>(() => initialStep(initialArray));
  const [mergeStep, setMergeStep] = useState<SortStep>(() => initialStep(initialArray));
  const [quickStep, setQuickStep] = useState<SortStep>(() => initialStep(initialArray));

  const bubbleGen = useRef<Generator<SortStep, void, unknown> | null>(null);
  const mergeGen = useRef<Generator<SortStep, void, unknown> | null>(null);
  const quickGen = useRef<Generator<SortStep, void, unknown> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback((newArray: number[]): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setArray(newArray);
    setBubbleStep(initialStep(newArray));
    setMergeStep(initialStep(newArray));
    setQuickStep(initialStep(newArray));
    bubbleGen.current = null;
    mergeGen.current = null;
    quickGen.current = null;
    setRunning(false);
    setCompleted(false);
  }, []);

  const start = useCallback(
    (sourceArray: number[] = array): void => {
      if (running) return;
      bubbleGen.current = bubbleSort(sourceArray);
      mergeGen.current = mergeSort(sourceArray);
      quickGen.current = quickSort(sourceArray);
      setRunning(true);
      setCompleted(false);

      intervalRef.current = setInterval(() => {
        let allDone = true;

        if (bubbleGen.current) {
          const next = bubbleGen.current.next();
          if (!next.done) {
            setBubbleStep(next.value);
            allDone = false;
          }
        }
        if (mergeGen.current) {
          const next = mergeGen.current.next();
          if (!next.done) {
            setMergeStep(next.value);
            allDone = false;
          }
        }
        if (quickGen.current) {
          const next = quickGen.current.next();
          if (!next.done) {
            setQuickStep(next.value);
            allDone = false;
          }
        }

        if (allDone && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setRunning(false);
          setCompleted(true);
          if (!completedRef.current) {
            completedRef.current = true;
            markActivityComplete("sorting-race");
          }
        }
      }, TICK_MS);
    },
    [array, running]
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  /** Shuffle the array and immediately start the race — used by "Race again". */
  const raceAgain = useCallback((): void => {
    const newArray = shuffle(Array.from({ length: ARRAY_SIZE }, (_, i) => i + 1));
    reset(newArray);
    // start synchronously with the new array so we don't depend on state having
    // re-rendered yet; the array argument lets start() bypass closure.
    start(newArray);
  }, [reset, start]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-5 py-4">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            {ARRAY_SIZE} elements, identical starting array, three algorithms.
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            Comparisons + writes count every operation. Watch the gap between the two columns on the
            right and the one on the left.
          </p>
        </div>
        <div className="flex gap-2">
          {!running && !completed && (
            <button
              type="button"
              onClick={() => start()}
              className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-accent-hover)]"
            >
              Start race
            </button>
          )}
          {running && (
            <span className="rounded-lg bg-[var(--color-bg-subtle)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)]">
              Running…
            </span>
          )}
          {completed && (
            <button
              type="button"
              onClick={raceAgain}
              className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-accent-hover)]"
            >
              Race again
            </button>
          )}
          <button
            type="button"
            onClick={() => reset(shuffle(Array.from({ length: ARRAY_SIZE }, (_, i) => i + 1)))}
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-subtle)]"
          >
            Shuffle
          </button>
        </div>
      </div>

      {/* Three columns */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SortColumn name="Bubble Sort" complexity="O(n²)" step={bubbleStep} color="#fb7185" />
        <SortColumn name="Merge Sort" complexity="O(n log n)" step={mergeStep} color="#60a5fa" />
        <SortColumn
          name="Quick Sort"
          complexity="O(n log n) avg"
          step={quickStep}
          color="#34d399"
        />
      </div>

      {/* Pedagogical note */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-5 py-4">
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          <strong className="text-[var(--color-text-primary)]">What you&rsquo;re seeing:</strong>{" "}
          all three columns started with the same shuffled array. Bubble sort runs ~
          <span className="font-mono">n²</span> comparisons; merge and quick run ~
          <span className="font-mono">n log n</span>. With n=30, that&rsquo;s ~900 vs ~150 — a 6×
          gap. With n=1,000, the gap is 100×. With n=1,000,000, it&rsquo;s 50,000×. This is what
          Big-O complexity means in operational time.
        </p>
      </div>
    </div>
  );
}

export default SortingRace;
