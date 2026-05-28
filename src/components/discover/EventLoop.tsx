"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";

/**
 * EventLoop — a slowed-down simulation of the JavaScript event loop.
 *
 * Pedagogical bet: most learners can recite "microtasks before macrotasks"
 * without being able to point to a single moment where the choice matters.
 * The bet here is that watching the call stack, microtask queue, macrotask
 * queue, and rAF queue advance one tick at a time — and seeing the paint
 * counter tick over only when the loop genuinely yields — moves the model
 * from a slogan to a mechanism you can step through.
 *
 * What this is NOT: it doesn't execute real timers or real promises. It
 * models the SCHEDULER, not the language. The work items are opaque
 * placeholders ("Promise.then #3") that consume some number of ticks of
 * synchronous CPU. That's enough to surface the four invariants we care
 * about:
 *
 *   1. Microtasks drain to exhaustion between every macrotask.
 *   2. A chain of .then() blocks the next macrotask indefinitely.
 *   3. requestAnimationFrame fires right before a render, not as a microtask.
 *   4. A synchronous CPU loop blocks rendering — the "main thread blocked"
 *      pathology behind every FE performance war story.
 *
 * The completion gate fires after the learner has scheduled at least three
 * distinct kinds of work AND watched 10 or more loop ticks. That's the
 * minimum exposure needed to see at least one microtask-drain and one
 * paint, which is the smallest unit of insight this demo is built to
 * deliver.
 */

type WorkKind = "macrotask" | "microtask" | "raf" | "sync-block";

interface WorkItem {
  /** Stable id for React keys + completion accounting. */
  id: number;
  kind: WorkKind;
  /** Short label shown in the queue cell (e.g. "setTimeout #2"). */
  label: string;
  /** Ticks of synchronous work this item consumes once it starts running. */
  cost: number;
  /** When the .then chains itself: after running, schedule a new microtask. */
  chains?: boolean;
}

interface StackFrame {
  item: WorkItem;
  /** How many ticks of this frame's `cost` have already been consumed. */
  progress: number;
}

interface LogEntry {
  tick: number;
  message: string;
  /** Tints the log line so the learner can scan by event kind. */
  tone: "stack" | "microtask" | "macrotask" | "raf" | "paint" | "info";
}

interface MachineState {
  tick: number;
  stack: StackFrame | null;
  microtasks: WorkItem[];
  macrotasks: WorkItem[];
  raf: WorkItem[];
  /** Increments every time the renderer commits a frame. */
  paints: number;
  /**
   * Ticks since the last paint. The renderer wants to paint roughly every
   * FRAME_BUDGET ticks; if the call stack is busy when that deadline hits,
   * the paint is missed and the budget keeps climbing — that's the visible
   * "jank" effect.
   */
  budget: number;
  /** Total ticks the main thread spent running sync-block items. */
  blockedTicks: number;
  /** Items finished (used for the commentary that explains what just ran). */
  finishedKinds: Set<WorkKind>;
  log: LogEntry[];
}

/** How many ticks the renderer waits between paints when it can. */
const FRAME_BUDGET = 6;
/** How many ticks per Play interval. ~100ms each. */
const PLAY_INTERVAL_MS = 100;
/** Max log entries kept around — older lines scroll off. */
const LOG_LIMIT = 40;
/** Completion gate: minimum distinct work kinds scheduled. */
const REQUIRED_KINDS = 3;
/** Completion gate: minimum ticks observed. */
const REQUIRED_TICKS = 10;

let nextId = 1;
function mkId(): number {
  return nextId++;
}

function initialState(): MachineState {
  return {
    tick: 0,
    stack: null,
    microtasks: [],
    macrotasks: [],
    raf: [],
    paints: 0,
    budget: 0,
    blockedTicks: 0,
    finishedKinds: new Set(),
    log: [
      {
        tick: 0,
        message: "Loop idle. Schedule some work to wake it up.",
        tone: "info",
      },
    ],
  };
}

function appendLog(log: LogEntry[], entry: LogEntry): LogEntry[] {
  const next = [...log, entry];
  return next.length > LOG_LIMIT ? next.slice(next.length - LOG_LIMIT) : next;
}

/**
 * One tick of the event loop. Pure: returns a new state.
 *
 * The order of checks is the part that teaches the lesson:
 *
 *   1. If a frame is on the stack, run one tick of it.
 *   2. Else, if any microtasks are queued, take ONE — and the act of
 *      taking one will trigger more if it chains. The loop will keep
 *      coming back here, draining the microtask queue to exhaustion,
 *      before it even looks at the macrotask queue.
 *   3. Else, if the renderer's frame budget has elapsed AND the rAF
 *      queue is non-empty, run all rAF callbacks, then paint.
 *   4. Else, if the budget elapsed with no rAFs, paint anyway.
 *   5. Else, pull ONE macrotask onto the stack.
 *
 * Note: real engines fold rAF into a "render steps" phase that runs
 * between macrotasks when the compositor decides it's time to paint.
 * The order above is faithful to that intent: rAF is tied to RENDER,
 * not to the microtask queue.
 */
function tickMachine(state: MachineState): MachineState {
  const tick = state.tick + 1;

  // 1. Stack busy → advance the current frame.
  if (state.stack) {
    const frame = state.stack;
    const nextProgress = frame.progress + 1;
    if (nextProgress >= frame.item.cost) {
      // Frame is finishing this tick. Process its completion side effects.
      const finishedKinds = new Set(state.finishedKinds);
      finishedKinds.add(frame.item.kind);

      let microtasks = state.microtasks;
      // A chained .then() schedules another microtask when it resolves.
      if (frame.item.chains) {
        microtasks = [
          ...microtasks,
          {
            id: mkId(),
            kind: "microtask",
            label: `.then chain #${state.tick}`,
            cost: 1,
            chains: false,
          },
        ];
      }
      const blockedTicks =
        state.blockedTicks + (frame.item.kind === "sync-block" ? frame.item.cost : 0);

      return {
        ...state,
        tick,
        stack: null,
        microtasks,
        blockedTicks,
        finishedKinds,
        log: appendLog(state.log, {
          tick,
          message: `Finished ${frame.item.label}`,
          tone: frame.item.kind === "sync-block" ? "info" : kindToTone(frame.item.kind),
        }),
      };
    }
    // Still working on this frame.
    return {
      ...state,
      tick,
      stack: { ...frame, progress: nextProgress },
      // Sync work prevents painting. The budget keeps climbing — but no
      // paint is committed until the stack actually clears.
    };
  }

  // 2. Stack empty → drain microtasks one at a time (until queue empty).
  if (state.microtasks.length > 0) {
    const [next, ...rest] = state.microtasks;
    if (!next) {
      // Defensive: array.length was > 0 but destructure failed. Should not
      // happen; just no-op the tick.
      return { ...state, tick };
    }
    return {
      ...state,
      tick,
      stack: { item: next, progress: 0 },
      microtasks: rest,
      log: appendLog(state.log, {
        tick,
        message: `Microtask → ${next.label}${
          rest.length > 0 ? ` (${rest.length} queued behind it)` : ""
        }`,
        tone: "microtask",
      }),
    };
  }

  // 3-4. Render phase: if the frame budget has elapsed, paint now.
  // Real engines use the rAF queue as a "before paint" hook; we run all
  // pending rAFs, then commit the paint in the same tick.
  if (state.budget >= FRAME_BUDGET) {
    if (state.raf.length > 0) {
      // Pull ONE rAF off and run it. (Multiple rAFs could run in one
      // frame; we run them one at a time so the learner can see each.)
      const [next, ...rest] = state.raf;
      if (!next) {
        return { ...state, tick };
      }
      return {
        ...state,
        tick,
        stack: { item: next, progress: 0 },
        raf: rest,
        log: appendLog(state.log, {
          tick,
          message: `rAF → ${next.label} (runs right before paint)`,
          tone: "raf",
        }),
      };
    }
    // Budget elapsed and no rAFs → just paint.
    return {
      ...state,
      tick,
      paints: state.paints + 1,
      budget: 0,
      log: appendLog(state.log, {
        tick,
        message: `Paint #${state.paints + 1} committed`,
        tone: "paint",
      }),
    };
  }

  // 5. Pull one macrotask onto the stack, if any. This is the "next task"
  // step in the HTML spec's event loop.
  if (state.macrotasks.length > 0) {
    const [next, ...rest] = state.macrotasks;
    if (!next) {
      return { ...state, tick, budget: state.budget + 1 };
    }
    return {
      ...state,
      tick,
      stack: { item: next, progress: 0 },
      macrotasks: rest,
      budget: state.budget + 1,
      log: appendLog(state.log, {
        tick,
        message: `Macrotask → ${next.label}`,
        tone: "macrotask",
      }),
    };
  }

  // Nothing to do. The loop spins, the frame budget accumulates.
  return {
    ...state,
    tick,
    budget: state.budget + 1,
  };
}

function kindToTone(kind: WorkKind): LogEntry["tone"] {
  switch (kind) {
    case "microtask":
      return "microtask";
    case "macrotask":
      return "macrotask";
    case "raf":
      return "raf";
    case "sync-block":
      return "info";
    default:
      return "info";
  }
}

/* ─── Schedulers exposed via the toolbar ──────────────────────────────────── */

function scheduleSetTimeout(state: MachineState, counter: number): MachineState {
  const item: WorkItem = {
    id: mkId(),
    kind: "macrotask",
    label: `setTimeout #${counter}`,
    cost: 2,
  };
  return {
    ...state,
    macrotasks: [...state.macrotasks, item],
    log: appendLog(state.log, {
      tick: state.tick,
      message: `Queued macrotask: ${item.label}`,
      tone: "macrotask",
    }),
  };
}

function schedulePromiseThen(state: MachineState, counter: number): MachineState {
  const item: WorkItem = {
    id: mkId(),
    kind: "microtask",
    label: `Promise.then #${counter}`,
    cost: 1,
  };
  return {
    ...state,
    microtasks: [...state.microtasks, item],
    log: appendLog(state.log, {
      tick: state.tick,
      message: `Queued microtask: ${item.label}`,
      tone: "microtask",
    }),
  };
}

function scheduleChainedThen(state: MachineState, counter: number): MachineState {
  // A chained .then that schedules another .then when it resolves.
  // 5 in a row demonstrates the "microtask starvation of macrotasks" effect.
  const item: WorkItem = {
    id: mkId(),
    kind: "microtask",
    label: `chain root #${counter}`,
    cost: 1,
    chains: true,
  };
  // Pre-fill 4 chained children so the chain has real depth.
  const items: WorkItem[] = [item];
  for (let i = 1; i < 5; i++) {
    items.push({
      id: mkId(),
      kind: "microtask",
      label: `chain #${counter}.${i}`,
      cost: 1,
      chains: i < 4, // last one stops chaining
    });
  }
  return {
    ...state,
    microtasks: [...state.microtasks, ...items],
    log: appendLog(state.log, {
      tick: state.tick,
      message: `Queued 5-deep .then chain: ${item.label}`,
      tone: "microtask",
    }),
  };
}

function scheduleRaf(state: MachineState, counter: number): MachineState {
  const item: WorkItem = {
    id: mkId(),
    kind: "raf",
    label: `rAF #${counter}`,
    cost: 1,
  };
  return {
    ...state,
    raf: [...state.raf, item],
    log: appendLog(state.log, {
      tick: state.tick,
      message: `Queued animation frame: ${item.label}`,
      tone: "raf",
    }),
  };
}

function scheduleSyncBlock(state: MachineState, counter: number): MachineState {
  // A 5-tick sync block on the stack. Models the "for-loop that pegs the
  // main thread" pattern. Pushed STRAIGHT onto the stack so it pre-empts
  // any queue draining — that's how synchronous code actually behaves.
  const item: WorkItem = {
    id: mkId(),
    kind: "sync-block",
    label: `sync 50ms block #${counter}`,
    cost: 5,
  };
  // If the stack is busy, queue as a macrotask instead — closest analog
  // when the demo is mid-tick. Logged either way.
  if (state.stack) {
    return {
      ...state,
      macrotasks: [...state.macrotasks, { ...item, kind: "macrotask" }],
      log: appendLog(state.log, {
        tick: state.tick,
        message: `Queued as macrotask (stack busy): ${item.label}`,
        tone: "macrotask",
      }),
    };
  }
  return {
    ...state,
    stack: { item, progress: 0 },
    log: appendLog(state.log, {
      tick: state.tick,
      message: `Synchronous block on stack: ${item.label}`,
      tone: "info",
    }),
  };
}

/* ─── Presentational atoms ───────────────────────────────────────────────── */

const KIND_STYLES: Record<WorkKind, { color: string; label: string }> = {
  microtask: { color: "#a78bfa", label: "microtask" },
  macrotask: { color: "#fbbf24", label: "macrotask" },
  raf: { color: "#34d399", label: "rAF" },
  "sync-block": { color: "#fb7185", label: "sync" },
};

interface QueueLaneProps {
  title: string;
  subtitle: string;
  items: WorkItem[];
  kind: WorkKind;
  active?: number | null;
}

function QueueLane({ title, subtitle, items, kind, active }: QueueLaneProps): React.ReactElement {
  const style = KIND_STYLES[kind];
  return (
    <div
      className="rounded-xl border bg-[var(--color-bg-surface)] p-4"
      style={{ borderColor: `${style.color}55` }}
    >
      <div className="flex items-baseline justify-between">
        <div>
          <p
            className="text-xs font-semibold tracking-wide uppercase"
            style={{ color: style.color }}
          >
            {title}
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">{subtitle}</p>
        </div>
        <span className="font-mono text-[11px] text-[var(--color-text-muted)]">
          {items.length} queued
        </span>
      </div>
      <div className="mt-3 flex min-h-[64px] flex-wrap items-start gap-2">
        {items.length === 0 ? (
          <span className="text-[12px] text-[var(--color-text-muted)] italic">empty</span>
        ) : (
          items.map((item, idx) => {
            const isHead = idx === 0 && active === item.id;
            return (
              <span
                key={item.id}
                className="rounded-md border px-2 py-1 font-mono text-[11px] transition-colors"
                style={{
                  borderColor: isHead ? style.color : `${style.color}66`,
                  background: isHead ? `${style.color}22` : `${style.color}11`,
                  color: "var(--color-text-primary)",
                }}
                title={`${style.label} · cost ${item.cost} tick${item.cost === 1 ? "" : "s"}`}
              >
                {item.label}
              </span>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────────────── */

export function EventLoop(): React.ReactElement {
  const [state, setState] = useState<MachineState>(() => initialState());
  const [running, setRunning] = useState(false);
  /** Schedule counters per kind, so the labels read "setTimeout #1, #2…". */
  const counters = useRef<Record<WorkKind, number>>({
    macrotask: 0,
    microtask: 0,
    raf: 0,
    "sync-block": 0,
  });
  /** Kinds the learner has scheduled at least once (drives the completion gate). */
  const scheduledKinds = useRef<Set<WorkKind>>(new Set());
  const completedRef = useRef(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback((): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const step = useCallback((): void => {
    setState((prev) => tickMachine(prev));
  }, []);

  const play = useCallback((): void => {
    if (running) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setState((prev) => tickMachine(prev));
    }, PLAY_INTERVAL_MS);
  }, [running]);

  const reset = useCallback((): void => {
    stop();
    counters.current = { macrotask: 0, microtask: 0, raf: 0, "sync-block": 0 };
    scheduledKinds.current = new Set();
    completedRef.current = false;
    setState(initialState());
  }, [stop]);

  const schedule = useCallback((kind: WorkKind): void => {
    counters.current[kind] += 1;
    scheduledKinds.current.add(kind);
    const n = counters.current[kind];
    setState((prev) => {
      switch (kind) {
        case "macrotask":
          return scheduleSetTimeout(prev, n);
        case "microtask":
          return schedulePromiseThen(prev, n);
        case "raf":
          return scheduleRaf(prev, n);
        case "sync-block":
          return scheduleSyncBlock(prev, n);
        default:
          return prev;
      }
    });
  }, []);

  const scheduleChain = useCallback((): void => {
    counters.current.microtask += 1;
    scheduledKinds.current.add("microtask");
    const n = counters.current.microtask;
    setState((prev) => scheduleChainedThen(prev, n));
  }, []);

  /** Completion gate: ≥3 distinct kinds scheduled AND ≥10 ticks observed. */
  useEffect(() => {
    if (completedRef.current) return;
    if (state.tick >= REQUIRED_TICKS && scheduledKinds.current.size >= REQUIRED_KINDS) {
      completedRef.current = true;
      markActivityComplete("event-loop");
    }
  }, [state.tick]);

  /** A short, situational commentary keyed off the most recent state. */
  const commentary = useMemo<{ title: string; body: string }>(() => {
    if (state.stack?.item.kind === "sync-block") {
      return {
        title: "Main thread blocked",
        body: "While this frame runs, NOTHING else happens — no microtask drains, no rAF, no paint. Real CPU-heavy work (a tight for-loop, JSON.parse on a big blob, a sync XHR) has exactly this effect on every site you've ever used.",
      };
    }
    if (state.microtasks.length >= 3) {
      return {
        title: "Microtask backlog is starving the macrotask queue",
        body: "The loop will drain every microtask in order before it even looks at the macrotask queue. A long-enough .then chain can postpone the next setTimeout indefinitely.",
      };
    }
    if (state.stack?.item.kind === "microtask") {
      return {
        title: "Running a microtask",
        body: "Microtasks include Promise.then, queueMicrotask, and MutationObserver. They drain to exhaustion between every macrotask — that's why Promise.then runs before the next setTimeout, even when setTimeout was queued first.",
      };
    }
    if (state.stack?.item.kind === "raf") {
      return {
        title: "rAF callback before paint",
        body: "requestAnimationFrame is tied to RENDER, not to the microtask queue. The browser runs your rAF callbacks immediately before committing the next frame — which is why it's the right hook for visual work and the wrong hook for general async coordination.",
      };
    }
    if (state.stack?.item.kind === "macrotask") {
      return {
        title: "Running a macrotask",
        body: "Macrotasks include setTimeout, setInterval, message events, and I/O callbacks. The loop takes ONE macrotask per turn, then drains the microtask queue, then maybe paints, then takes the next macrotask.",
      };
    }
    if (state.paints > 0 && state.macrotasks.length === 0 && state.microtasks.length === 0) {
      return {
        title: "Idle",
        body: "Everything queued has run; the loop is spinning, waiting for new work. Schedule something to wake it up.",
      };
    }
    return {
      title: "Step the loop",
      body: "Schedule different kinds of work, then click Step (or Play) and watch the order the loop runs them in.",
    };
  }, [state]);

  /** Friendly tone styles for the log. */
  const toneClass: Record<LogEntry["tone"], string> = {
    stack: "text-[var(--color-text-primary)]",
    microtask: "text-[#a78bfa]",
    macrotask: "text-[#fbbf24]",
    raf: "text-[#34d399]",
    paint: "text-[#60a5fa]",
    info: "text-[var(--color-text-secondary)]",
  };

  const totalQueued = state.microtasks.length + state.macrotasks.length + state.raf.length;

  return (
    <div className="space-y-5">
      {/* Toolbar — schedule + step/play */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => schedule("macrotask")}
            className="rounded-md border px-3 py-1.5 text-xs font-medium transition"
            style={{
              borderColor: `${KIND_STYLES.macrotask.color}66`,
              color: KIND_STYLES.macrotask.color,
              background: `${KIND_STYLES.macrotask.color}11`,
            }}
          >
            + setTimeout
          </button>
          <button
            type="button"
            onClick={() => schedule("microtask")}
            className="rounded-md border px-3 py-1.5 text-xs font-medium transition"
            style={{
              borderColor: `${KIND_STYLES.microtask.color}66`,
              color: KIND_STYLES.microtask.color,
              background: `${KIND_STYLES.microtask.color}11`,
            }}
          >
            + Promise.then
          </button>
          <button
            type="button"
            onClick={scheduleChain}
            className="rounded-md border px-3 py-1.5 text-xs font-medium transition"
            style={{
              borderColor: `${KIND_STYLES.microtask.color}66`,
              color: KIND_STYLES.microtask.color,
              background: `${KIND_STYLES.microtask.color}11`,
            }}
            title="Adds a 5-deep .then chain — watch it starve the macrotask queue."
          >
            + .then chain ×5
          </button>
          <button
            type="button"
            onClick={() => schedule("raf")}
            className="rounded-md border px-3 py-1.5 text-xs font-medium transition"
            style={{
              borderColor: `${KIND_STYLES.raf.color}66`,
              color: KIND_STYLES.raf.color,
              background: `${KIND_STYLES.raf.color}11`,
            }}
          >
            + requestAnimationFrame
          </button>
          <button
            type="button"
            onClick={() => schedule("sync-block")}
            className="rounded-md border px-3 py-1.5 text-xs font-medium transition"
            style={{
              borderColor: `${KIND_STYLES["sync-block"].color}66`,
              color: KIND_STYLES["sync-block"].color,
              background: `${KIND_STYLES["sync-block"].color}11`,
            }}
            title="Pushes a 5-tick synchronous block straight onto the stack. Watch the paint counter freeze."
          >
            + sync 50ms block
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={step}
              disabled={running}
              className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-subtle)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Step
            </button>
            <button
              type="button"
              onClick={() => (running ? stop() : play())}
              className="rounded-md bg-[var(--color-accent)] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[var(--color-accent-hover)]"
            >
              {running ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-subtle)]"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Top stat row — tick, paints, blocked, queued */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <p className="text-[10px] font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
            Tick
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-[var(--color-text-primary)] tabular-nums">
            {state.tick}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <p className="text-[10px] font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
            Paints
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#60a5fa] tabular-nums">
            {state.paints}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <p className="text-[10px] font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
            Sync-blocked
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#fb7185] tabular-nums">
            {state.blockedTicks}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <p className="text-[10px] font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
            Queued
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-[var(--color-text-primary)] tabular-nums">
            {totalQueued}
          </p>
        </div>
      </div>

      {/* Call stack */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--color-text-primary)] uppercase">
              Call stack
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
              The currently executing function. While this is non-empty, nothing else runs.
            </p>
          </div>
          {state.stack && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
              style={{
                background: `${KIND_STYLES[state.stack.item.kind].color}22`,
                color: KIND_STYLES[state.stack.item.kind].color,
              }}
            >
              {KIND_STYLES[state.stack.item.kind].label}
            </span>
          )}
        </div>
        <div className="mt-3 flex min-h-[56px] items-center gap-3 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3">
          {state.stack ? (
            <>
              <span
                className="font-mono text-sm font-semibold"
                style={{ color: KIND_STYLES[state.stack.item.kind].color }}
              >
                {state.stack.item.label}
              </span>
              <div className="ml-auto flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
                <span className="font-mono">
                  {state.stack.progress + 1}/{state.stack.item.cost}
                </span>
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--color-bg-surface)]">
                  <div
                    className="h-full transition-[width]"
                    style={{
                      width: `${((state.stack.progress + 1) / state.stack.item.cost) * 100}%`,
                      background: KIND_STYLES[state.stack.item.kind].color,
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <span className="text-[12px] text-[var(--color-text-muted)] italic">empty</span>
          )}
        </div>
      </div>

      {/* Three lanes */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <QueueLane
          title="Microtasks"
          subtitle="Promise.then · queueMicrotask · MutationObserver"
          items={state.microtasks}
          kind="microtask"
        />
        <QueueLane
          title="Macrotasks"
          subtitle="setTimeout · setInterval · I/O · message"
          items={state.macrotasks}
          kind="macrotask"
        />
        <QueueLane
          title="Animation frames"
          subtitle="requestAnimationFrame · runs before paint"
          items={state.raf}
          kind="raf"
        />
      </div>

      {/* Render pane + commentary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_3fr]">
        <div className="rounded-xl border border-[#60a5fa55] bg-[var(--color-bg-surface)] p-4">
          <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#60a5fa" }}>
            Renderer
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
            Paints when the loop yields. Budget elapses every {FRAME_BUDGET} ticks.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div
              className="grid h-20 w-20 place-items-center rounded-lg border text-xl font-bold tabular-nums"
              style={{
                borderColor: "#60a5fa55",
                background: `#60a5fa${Math.min(state.paints * 6, 90)
                  .toString(16)
                  .padStart(2, "0")}`,
                color: "var(--color-text-primary)",
              }}
              aria-label={`${state.paints} paints committed`}
            >
              {state.paints}
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-[var(--color-text-muted)]">Frame budget</p>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
                <div
                  className="h-full transition-[width]"
                  style={{
                    width: `${Math.min((state.budget / FRAME_BUDGET) * 100, 100)}%`,
                    background: state.budget >= FRAME_BUDGET && state.stack ? "#fb7185" : "#60a5fa",
                  }}
                />
              </div>
              <p className="mt-1 font-mono text-[11px] text-[var(--color-text-muted)]">
                {state.budget}/{FRAME_BUDGET}
                {state.budget >= FRAME_BUDGET && state.stack && (
                  <span className="ml-2 text-[#fb7185]">missed paint</span>
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <p className="text-xs font-semibold tracking-wide text-[var(--color-text-primary)] uppercase">
            {commentary.title}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {commentary.body}
          </p>
        </div>
      </div>

      {/* Log */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-semibold tracking-wide text-[var(--color-text-primary)] uppercase">
            Loop log
          </p>
          <p className="font-mono text-[11px] text-[var(--color-text-muted)]">
            last {Math.min(state.log.length, LOG_LIMIT)} entries
          </p>
        </div>
        <ol className="mt-3 max-h-56 space-y-1 overflow-y-auto font-mono text-[11px] leading-relaxed">
          {state.log.map((entry, i) => (
            <li
              key={`${entry.tick}-${i}`}
              className={`flex gap-3 rounded px-1 py-0.5 ${toneClass[entry.tone]}`}
            >
              <span className="shrink-0 text-[var(--color-text-muted)] tabular-nums">
                t{entry.tick.toString().padStart(3, "0")}
              </span>
              <span className="min-w-0 break-words">{entry.message}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default EventLoop;
