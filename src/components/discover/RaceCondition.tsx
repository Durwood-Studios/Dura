"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";

/**
 * RaceCondition — two threads share a counter; the learner watches the final
 * value drift away from the expected 100 when increments are not atomic.
 *
 * Pedagogical bet: most learners can recite "race conditions are bad" without
 * being able to point to where the race lives. The bet here is that watching
 * the read/+1/write sequence interleave across two threads — and seeing the
 * histogram of final values fan out as you run it again and again — moves the
 * concept from a slogan to a mechanism you can point at. The atomic toggle is
 * the contrast: same workload, lock added, variance collapses.
 *
 * No timers, no fake parallelism. The interleaving is an explicit random
 * schedule over the two threads' operation streams, advanced one step at a
 * time. That keeps the model honest — the only source of nondeterminism is
 * the scheduler choice you can see in the seed.
 */

const PER_THREAD_OPS = 50; // each thread does 50 read/+1/write triples
const HISTOGRAM_SIZE = 20; // last N runs displayed
const TARGET_MS_PER_OP = 8; // step interval when "Run" is pressed

type Phase = "read" | "add" | "write" | "lock" | "unlock";

interface Op {
  /** Which thread emitted this op. */
  thread: 0 | 1;
  phase: Phase;
}

interface ThreadState {
  /** Index into that thread's op stream. */
  pc: number;
  /** Last value this thread read from the shared counter. */
  reg: number;
  /** Does this thread currently hold the lock? Only meaningful in atomic mode. */
  holdsLock: boolean;
  /** Has this thread finished all its operations? */
  done: boolean;
}

interface MachineState {
  counter: number;
  threads: [ThreadState, ThreadState];
  /** Which thread (if any) currently holds the global lock. null = free. */
  lockOwner: 0 | 1 | null;
  /** Total ops executed so far. */
  step: number;
  /** Last op executed (for the log + highlight). null until first step. */
  lastOp: { thread: 0 | 1; phase: Phase; before: number; after: number } | null;
  done: boolean;
}

interface RunResult {
  final: number;
  atomic: boolean;
}

/** Tiny seeded PRNG (mulberry32). Determinism makes the scheduler inspectable. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function (): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Build the per-thread op stream. Non-atomic: read → add → write × N. */
function buildOpsNonAtomic(): Op[][] {
  const make = (thread: 0 | 1): Op[] => {
    const ops: Op[] = [];
    for (let i = 0; i < PER_THREAD_OPS; i++) {
      ops.push({ thread, phase: "read" });
      ops.push({ thread, phase: "add" });
      ops.push({ thread, phase: "write" });
    }
    return ops;
  };
  return [make(0), make(1)];
}

/** Atomic mode: lock → read → add → write → unlock × N. */
function buildOpsAtomic(): Op[][] {
  const make = (thread: 0 | 1): Op[] => {
    const ops: Op[] = [];
    for (let i = 0; i < PER_THREAD_OPS; i++) {
      ops.push({ thread, phase: "lock" });
      ops.push({ thread, phase: "read" });
      ops.push({ thread, phase: "add" });
      ops.push({ thread, phase: "write" });
      ops.push({ thread, phase: "unlock" });
    }
    return ops;
  };
  return [make(0), make(1)];
}

function initialState(): MachineState {
  return {
    counter: 0,
    threads: [
      { pc: 0, reg: 0, holdsLock: false, done: false },
      { pc: 0, reg: 0, holdsLock: false, done: false },
    ],
    lockOwner: null,
    step: 0,
    lastOp: null,
    done: false,
  };
}

/**
 * Choose which thread advances next.
 *
 * Atomic mode: if a thread holds the lock, it MUST keep advancing until it
 * unlocks. That's the whole point of a lock — the critical section runs
 * uninterrupted. Otherwise pick any non-done thread.
 *
 * Non-atomic mode: pick any non-done thread uniformly at random.
 *
 * Returns null when every thread is done.
 */
function pickThread(state: MachineState, rng: () => number, atomic: boolean): 0 | 1 | null {
  if (atomic && state.lockOwner !== null) {
    return state.lockOwner;
  }
  const t0Done = state.threads[0].done;
  const t1Done = state.threads[1].done;
  if (t0Done && t1Done) return null;
  if (t0Done) return 1;
  if (t1Done) return 0;
  return rng() < 0.5 ? 0 : 1;
}

/** Advance one operation. Pure: returns a new state. */
function stepMachine(
  state: MachineState,
  ops: Op[][],
  rng: () => number,
  atomic: boolean
): MachineState {
  if (state.done) return state;
  const tid = pickThread(state, rng, atomic);
  if (tid === null) {
    return { ...state, done: true };
  }
  const thread = state.threads[tid];
  const stream = ops[tid]!;
  const op = stream[thread.pc];
  if (!op) {
    // Defensive: thread had pc past its stream — mark done.
    const newThreads: [ThreadState, ThreadState] = [
      { ...state.threads[0] },
      { ...state.threads[1] },
    ];
    newThreads[tid] = { ...thread, done: true };
    return {
      ...state,
      threads: newThreads,
      done: newThreads[0].done && newThreads[1].done,
    };
  }

  // Lock acquire/release semantics. In atomic mode, "lock" blocks until the
  // lock is free; here, because we only select threads that can make progress,
  // a thread choosing to "lock" must be the one we pick AND the lock must be
  // free. If the lock is held by the OTHER thread, this thread can't proceed,
  // so we hand control back to the lock holder.
  if (op.phase === "lock") {
    if (state.lockOwner !== null && state.lockOwner !== tid) {
      // Should not happen because pickThread sticks with the lock owner,
      // but be defensive: re-run with the lock owner forced.
      return stepMachine(state, ops, rng, atomic);
    }
    const newThreads: [ThreadState, ThreadState] = [
      { ...state.threads[0] },
      { ...state.threads[1] },
    ];
    newThreads[tid] = { ...thread, pc: thread.pc + 1, holdsLock: true };
    return {
      ...state,
      threads: newThreads,
      lockOwner: tid,
      step: state.step + 1,
      lastOp: {
        thread: tid,
        phase: "lock",
        before: state.counter,
        after: state.counter,
      },
    };
  }

  if (op.phase === "unlock") {
    const newThreads: [ThreadState, ThreadState] = [
      { ...state.threads[0] },
      { ...state.threads[1] },
    ];
    newThreads[tid] = { ...thread, pc: thread.pc + 1, holdsLock: false };
    // If this was the last op, mark thread done.
    if (newThreads[tid].pc >= stream.length) {
      newThreads[tid].done = true;
    }
    return {
      ...state,
      threads: newThreads,
      lockOwner: null,
      step: state.step + 1,
      lastOp: {
        thread: tid,
        phase: "unlock",
        before: state.counter,
        after: state.counter,
      },
      done: newThreads[0].done && newThreads[1].done,
    };
  }

  if (op.phase === "read") {
    const newThreads: [ThreadState, ThreadState] = [
      { ...state.threads[0] },
      { ...state.threads[1] },
    ];
    newThreads[tid] = { ...thread, pc: thread.pc + 1, reg: state.counter };
    return {
      ...state,
      threads: newThreads,
      step: state.step + 1,
      lastOp: {
        thread: tid,
        phase: "read",
        before: state.counter,
        after: state.counter,
      },
    };
  }

  if (op.phase === "add") {
    const newThreads: [ThreadState, ThreadState] = [
      { ...state.threads[0] },
      { ...state.threads[1] },
    ];
    newThreads[tid] = { ...thread, pc: thread.pc + 1, reg: thread.reg + 1 };
    return {
      ...state,
      threads: newThreads,
      step: state.step + 1,
      lastOp: {
        thread: tid,
        phase: "add",
        before: thread.reg,
        after: thread.reg + 1,
      },
    };
  }

  // write
  const newCounter = thread.reg;
  const newThreads: [ThreadState, ThreadState] = [{ ...state.threads[0] }, { ...state.threads[1] }];
  newThreads[tid] = { ...thread, pc: thread.pc + 1 };
  if (newThreads[tid].pc >= stream.length) {
    newThreads[tid].done = true;
  }
  return {
    ...state,
    counter: newCounter,
    threads: newThreads,
    step: state.step + 1,
    lastOp: {
      thread: tid,
      phase: "write",
      before: state.counter,
      after: newCounter,
    },
    done: newThreads[0].done && newThreads[1].done,
  };
}

/** Run the machine to completion without yielding — used for "Run" + auto-tally. */
function runToEnd(ops: Op[][], rng: () => number, atomic: boolean): MachineState {
  let s = initialState();
  // Safety cap: total ops are bounded, but defend against any infinite loop.
  const cap = (atomic ? 5 : 3) * PER_THREAD_OPS * 2 + 50;
  let i = 0;
  while (!s.done && i < cap) {
    s = stepMachine(s, ops, rng, atomic);
    i++;
  }
  return s;
}

const PHASE_LABEL: Record<Phase, string> = {
  read: "read",
  add: "+1",
  write: "write",
  lock: "lock",
  unlock: "unlock",
};

const THREAD_COLORS: [string, string] = ["#60a5fa", "#fb7185"];

/**
 * Stable initial seed used during SSR + first client render. After mount we
 * swap in a fresh random seed; that avoids the React #418 hydration mismatch
 * Math.random() would cause in a useState initializer.
 */
const INITIAL_SEED = 1_234_567_890;

export function RaceCondition(): React.ReactElement {
  const [atomic, setAtomic] = useState(false);
  const [seed, setSeed] = useState<number>(INITIAL_SEED);
  const [state, setState] = useState<MachineState>(() => initialState());
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<RunResult[]>([]);
  const [raceCount, setRaceCount] = useState(0);
  /** Number of non-atomic runs the learner has triggered (Run-to-end). */
  const [nonAtomicRuns, setNonAtomicRuns] = useState(0);
  const completedRef = useRef(false);

  const rngRef = useRef<() => number>(mulberry32(INITIAL_SEED));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // After mount, swap in a fresh random seed so two visits don't produce the
  // exact same schedule. Hydration uses INITIAL_SEED on both server and client;
  // this effect runs only on the client, post-hydration.
  useEffect(() => {
    setSeed(Math.floor(Math.random() * 2_000_000_000));
  }, []);

  const ops = useMemo<Op[][]>(() => (atomic ? buildOpsAtomic() : buildOpsNonAtomic()), [atomic]);

  const stop = useCallback((): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const reset = useCallback((): void => {
    stop();
    setState(initialState());
    rngRef.current = mulberry32(seed);
  }, [seed, stop]);

  // Reset machine whenever atomic mode or seed changes.
  useEffect(() => {
    stop();
    setState(initialState());
    rngRef.current = mulberry32(seed);
  }, [atomic, seed, stop]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const recordRun = useCallback(
    (final: number, wasAtomic: boolean): void => {
      setHistory((prev) => {
        const next = [...prev, { final, atomic: wasAtomic }];
        return next.length > HISTOGRAM_SIZE ? next.slice(next.length - HISTOGRAM_SIZE) : next;
      });
      if (!wasAtomic) {
        const isRace = final !== PER_THREAD_OPS * 2;
        setRaceCount((c) => c + (isRace ? 1 : 0));
        setNonAtomicRuns((c) => c + 1);
      }
    },
    [setHistory, setRaceCount, setNonAtomicRuns]
  );

  const step = useCallback((): void => {
    if (running) return;
    setState((prev) => {
      const next = stepMachine(prev, ops, rngRef.current, atomic);
      if (next.done && !prev.done) {
        recordRun(next.counter, atomic);
      }
      return next;
    });
  }, [running, ops, atomic, recordRun]);

  const run = useCallback((): void => {
    if (running) return;
    setRunning(true);
    // Run via interval so the counter visibly climbs. The pace is fast but
    // observable — at TARGET_MS_PER_OP * (~300 ops) the whole race finishes
    // in ~2.5s. We batch a few steps per tick to keep the UI lively without
    // melting React's scheduler.
    intervalRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.done) return prev;
        let cur = prev;
        // Batch ~5 ops per tick.
        for (let i = 0; i < 5; i++) {
          if (cur.done) break;
          cur = stepMachine(cur, ops, rngRef.current, atomic);
        }
        if (cur.done && !prev.done) {
          recordRun(cur.counter, atomic);
          // Stop the interval next tick.
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setRunning(false);
        }
        return cur;
      });
    }, TARGET_MS_PER_OP * 5);
  }, [running, ops, atomic, recordRun]);

  const runMany = useCallback(
    (n: number): void => {
      // Synchronous batch: useful for filling the histogram fast.
      stop();
      let s: MachineState = initialState();
      const results: RunResult[] = [];
      let races = 0;
      let nonAtomic = 0;
      for (let i = 0; i < n; i++) {
        const r = runToEnd(ops, rngRef.current, atomic);
        results.push({ final: r.counter, atomic });
        if (!atomic) {
          nonAtomic++;
          if (r.counter !== PER_THREAD_OPS * 2) races++;
        }
        // keep s as last result for display
        s = r;
      }
      setState(s);
      setHistory((prev) => {
        const merged = [...prev, ...results];
        return merged.length > HISTOGRAM_SIZE
          ? merged.slice(merged.length - HISTOGRAM_SIZE)
          : merged;
      });
      if (!atomic) {
        setRaceCount((c) => c + races);
        setNonAtomicRuns((c) => c + nonAtomic);
      }
    },
    [ops, atomic, stop]
  );

  const newSeed = useCallback((): void => {
    setSeed(Math.floor(Math.random() * 2_000_000_000));
  }, []);

  // Mark complete: at least 3 non-atomic runs AND at least one observed race.
  useEffect(() => {
    if (!completedRef.current && nonAtomicRuns >= 3 && raceCount >= 1) {
      completedRef.current = true;
      markActivityComplete("race-condition");
    }
  }, [nonAtomicRuns, raceCount]);

  const expected = PER_THREAD_OPS * 2;
  const variance = state.done ? expected - state.counter : null;

  // Variance stats over history.
  const stats = useMemo(() => {
    if (history.length === 0) {
      return { min: 0, max: 0, mean: 0, raceRate: 0 };
    }
    const finals = history.map((h) => h.final);
    const min = Math.min(...finals);
    const max = Math.max(...finals);
    const mean = finals.reduce((a, b) => a + b, 0) / finals.length;
    const races = history.filter((h) => !h.atomic && h.final !== expected).length;
    const nonAtomic = history.filter((h) => !h.atomic).length;
    return {
      min,
      max,
      mean,
      raceRate: nonAtomic === 0 ? 0 : races / nonAtomic,
    };
  }, [history, expected]);

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
          <input
            type="checkbox"
            checked={atomic}
            onChange={(e) => setAtomic(e.target.checked)}
            className="h-4 w-4 accent-emerald-500"
          />
          Atomic increment (lock)
        </label>

        <div className="ml-2 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <span>seed</span>
          <code className="rounded bg-[var(--color-bg-subtle)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--color-text-secondary)]">
            {seed}
          </code>
          <button
            type="button"
            onClick={newSeed}
            className="rounded-md border border-[var(--color-border)] px-2 py-1 text-[11px] font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-subtle)]"
          >
            New seed
          </button>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={step}
            disabled={running || state.done}
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-subtle)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Step
          </button>
          <button
            type="button"
            onClick={() => (running ? stop() : run())}
            disabled={state.done && !running}
            className="rounded-md bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {running ? "Pause" : state.done ? "Done" : "Run"}
          </button>
          <button
            type="button"
            onClick={() => runMany(10)}
            disabled={running}
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-subtle)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Run ×10
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={running}
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-subtle)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reset
          </button>
        </div>
      </div>

      {/* The shared counter — the contended resource */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 text-center">
        <p className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
          Shared counter
        </p>
        <p className="mt-1 font-mono text-5xl font-bold text-[var(--color-text-primary)] tabular-nums">
          {state.counter}
        </p>
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          Expected after {PER_THREAD_OPS * 2} increments:{" "}
          <span className="font-mono text-[var(--color-text-secondary)]">{expected}</span>
          {state.done && variance !== null && (
            <>
              {" · "}
              <span
                className={
                  "font-mono " +
                  (variance === 0 ? "text-emerald-500" : "text-rose-500 dark:text-rose-400")
                }
              >
                {variance === 0
                  ? "no lost updates"
                  : `${variance} update${variance === 1 ? "" : "s"} lost`}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Thread panels */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {([0, 1] as const).map((tid) => {
          const t = state.threads[tid];
          const isActive = state.lastOp?.thread === tid;
          const color = THREAD_COLORS[tid];
          const total = ops[tid]!.length;
          const progress = total === 0 ? 0 : Math.round((t.pc / total) * 100);
          const currentOp = ops[tid]![t.pc];
          return (
            <div
              key={tid}
              className="rounded-xl border bg-[var(--color-bg-surface)] p-4 transition-colors"
              style={{
                borderColor: isActive ? color : `${color}55`,
                boxShadow: isActive ? `0 0 0 2px ${color}33` : undefined,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: color }}
                    aria-hidden
                  />
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                    Thread {tid + 1}
                  </span>
                  {t.holdsLock && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                      holds lock
                    </span>
                  )}
                  {t.done && (
                    <span className="rounded-full bg-[var(--color-bg-subtle)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-text-muted)]">
                      done
                    </span>
                  )}
                </div>
                <span className="font-mono text-[11px] text-[var(--color-text-muted)]">
                  {t.pc}/{total}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
                <div
                  className="h-full transition-[width]"
                  style={{ width: `${progress}%`, background: color }}
                />
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs">
                <dt className="text-[var(--color-text-muted)]">Local register</dt>
                <dd className="text-right font-mono text-[var(--color-text-primary)]">{t.reg}</dd>
                <dt className="text-[var(--color-text-muted)]">Next op</dt>
                <dd className="text-right font-mono text-[var(--color-text-primary)]">
                  {t.done ? "—" : currentOp ? PHASE_LABEL[currentOp.phase] : "—"}
                </dd>
              </dl>
            </div>
          );
        })}
      </div>

      {/* Lock + last-op timeline */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_2fr]">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <p className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
            Lock
          </p>
          <p className="mt-2 font-mono text-sm text-[var(--color-text-primary)]">
            {atomic
              ? state.lockOwner === null
                ? "free"
                : `held by Thread ${state.lockOwner + 1}`
              : "no lock"}
          </p>
          <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
            {atomic
              ? "Critical section runs uninterrupted."
              : "Both threads can read and write at any time."}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
              Last op
            </p>
            <span className="font-mono text-[11px] text-[var(--color-text-muted)]">
              step {state.step}
            </span>
          </div>
          {state.lastOp ? (
            <p className="mt-2 font-mono text-sm">
              <span
                className="rounded px-1.5 py-0.5"
                style={{
                  background: `${THREAD_COLORS[state.lastOp.thread]}22`,
                  color: THREAD_COLORS[state.lastOp.thread],
                }}
              >
                T{state.lastOp.thread + 1}
              </span>{" "}
              <span className="text-[var(--color-text-primary)]">
                {PHASE_LABEL[state.lastOp.phase]}
              </span>
              {state.lastOp.phase === "read" && (
                <span className="text-[var(--color-text-muted)]">
                  {" "}
                  → reg = {state.lastOp.before}
                </span>
              )}
              {state.lastOp.phase === "add" && (
                <span className="text-[var(--color-text-muted)]">
                  {" "}
                  {state.lastOp.before} → {state.lastOp.after}
                </span>
              )}
              {state.lastOp.phase === "write" && (
                <span className="text-[var(--color-text-muted)]">
                  {" "}
                  counter {state.lastOp.before} → {state.lastOp.after}
                </span>
              )}
            </p>
          ) : (
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">Waiting to start.</p>
          )}
        </div>
      </div>

      {/* Histogram of last N runs */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            Last {HISTOGRAM_SIZE} runs
          </p>
          <p className="font-mono text-[11px] text-[var(--color-text-muted)]">
            {history.length === 0
              ? "no runs yet"
              : `min ${stats.min} · mean ${stats.mean.toFixed(1)} · max ${stats.max}`}
          </p>
        </div>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            Press Run, then Run again. Each bar is one finished race.
          </p>
        ) : (
          <div className="mt-4 flex h-32 items-end gap-1">
            {history.map((h, i) => {
              const isLost = h.final !== expected;
              const height = (h.final / expected) * 100;
              const barColor = h.atomic
                ? "#34d399"
                : isLost
                  ? "#fb7185"
                  : "var(--color-text-muted)";
              return (
                <div
                  key={i}
                  className="group relative flex flex-1 flex-col items-center justify-end"
                  title={`Run ${i + 1}: ${h.final}${h.atomic ? " (atomic)" : ""}`}
                >
                  <div
                    className="w-full rounded-t-sm transition-all"
                    style={{
                      height: `${Math.max(2, height)}%`,
                      background: barColor,
                      opacity: 0.85,
                    }}
                  />
                  <span className="mt-1 font-mono text-[10px] text-[var(--color-text-muted)]">
                    {h.final}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {history.length > 0 && (
          <p className="mt-3 text-[11px] text-[var(--color-text-muted)]">
            <span className="mr-3 inline-flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-sm"
                style={{ background: "#fb7185" }}
                aria-hidden
              />
              race (lost updates)
            </span>
            <span className="mr-3 inline-flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-sm"
                style={{ background: "var(--color-text-muted)" }}
                aria-hidden
              />
              non-atomic, no race this time
            </span>
            <span className="inline-flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-sm"
                style={{ background: "#34d399" }}
                aria-hidden
              />
              atomic (always {expected})
            </span>
          </p>
        )}
      </div>

      {/* Per-mode tally */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <p className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
            Non-atomic runs
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-[var(--color-text-primary)]">
            {nonAtomicRuns}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <p className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
            Races observed
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-rose-500">{raceCount}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <p className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
            Race rate (last {HISTOGRAM_SIZE})
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-[var(--color-text-primary)]">
            {history.length === 0 ? "—" : `${Math.round(stats.raceRate * 100)}%`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default RaceCondition;
