"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";

/**
 * GcVisualizer — mark-and-sweep garbage collection on a tiny heap.
 *
 * Pedagogical bet: the wave of green sweeping through the reachable set is
 * the moment GC clicks. Once a learner sees "live = reachable from a root",
 * they understand the invariant every tracing collector preserves — and why
 * cycles are the failure mode of naive reference counting (toggle on for the
 * RC comparison).
 *
 * The learner can: allocate objects (attached to roots or to existing
 * objects), drop roots, mutate references, build cycles, then run GC and
 * watch mark + sweep phases animate. The side panel surfaces the counts
 * the algorithm cares about.
 */

const COLS = 8;
const ROWS = 6;
const HEAP_SIZE = COLS * ROWS; // 48 cells
const ROOT_COUNT = 4;
const TICK_MS = 110;

type AlgoId = "mark-sweep" | "ref-count";

interface HeapObject {
  id: number;
  /** Outgoing references — indexes into the heap. */
  refs: number[];
  /** Reference count (for the RC algorithm). Equal to # of incoming edges. */
  rc: number;
  /** Visual tint used for the object cell. */
  hue: number;
}

type Slot = HeapObject | null;

type Phase = "idle" | "marking" | "sweeping" | "rc-collecting" | "done";

interface MarkSnapshot {
  /** Cells confirmed reachable so far (mark phase). */
  marked: Set<number>;
  /** Frontier — cells whose neighbors haven't been visited yet. */
  frontier: Set<number>;
  /** Cells flagged for reclamation in the current sweep frame. */
  reclaiming: Set<number>;
}

const COLOR_ACCENT = "var(--color-accent)";
const COLOR_CELEBRATION = "var(--color-celebration, #34d399)";
const COLOR_RECLAIM = "#fb7185";

function emptySnapshot(): MarkSnapshot {
  return {
    marked: new Set(),
    frontier: new Set(),
    reclaiming: new Set(),
  };
}

function makeObject(id: number): HeapObject {
  return {
    id,
    refs: [],
    rc: 0,
    hue: (id * 47) % 360,
  };
}

/** Find the first empty heap slot, or null if the heap is full. */
function firstEmpty(heap: Slot[]): number | null {
  for (let i = 0; i < heap.length; i++) {
    if (heap[i] === null) return i;
  }
  return null;
}

/** Recompute reference counts from scratch. Used after any structural edit. */
function recomputeRefCounts(heap: Slot[], roots: (number | null)[]): Slot[] {
  const next: Slot[] = heap.map((s) => (s ? { ...s, rc: 0 } : null));
  // Roots contribute 1 each
  for (const r of roots) {
    if (r !== null && next[r]) next[r]!.rc += 1;
  }
  // Every outgoing ref contributes 1 to its target
  for (const slot of next) {
    if (!slot) continue;
    for (const ref of slot.refs) {
      if (next[ref]) next[ref]!.rc += 1;
    }
  }
  return next;
}

/** ──── Heap mutations ──────────────────────────────────────────────────── */

interface State {
  heap: Slot[];
  roots: (number | null)[];
  nextId: number;
}

function initialState(): State {
  const heap: Slot[] = Array.from({ length: HEAP_SIZE }, () => null);
  // Seed with a small live structure so the first GC has something to do.
  // Root 0 → obj A → obj B → obj C (a chain)
  // Root 1 → obj D (lonely)
  // Plus two unreachable objects, so the first sweep has something to reclaim.
  const seed: { idx: number; refs: number[] }[] = [
    { idx: 0, refs: [1] }, // A → B
    { idx: 1, refs: [2] }, // B → C
    { idx: 2, refs: [] }, // C
    { idx: 3, refs: [] }, // D
    { idx: 4, refs: [5] }, // unreachable E → F
    { idx: 5, refs: [] }, // unreachable F
  ];
  for (const { idx } of seed) heap[idx] = makeObject(idx);
  for (const { idx, refs } of seed) heap[idx]!.refs = refs;
  const roots: (number | null)[] = Array.from({ length: ROOT_COUNT }, () => null);
  roots[0] = 0;
  roots[1] = 3;
  return {
    heap: recomputeRefCounts(heap, roots),
    roots,
    nextId: 6,
  };
}

/** ──── Mark-and-sweep step generator ──────────────────────────────────── */

function* markAndSweep(
  heap: Slot[],
  roots: (number | null)[]
): Generator<MarkSnapshot, MarkSnapshot, unknown> {
  const marked = new Set<number>();
  let frontier = new Set<number>();
  for (const r of roots) {
    if (r !== null && heap[r]) frontier.add(r);
  }
  // Mark phase — BFS from roots, one wave per tick
  while (frontier.size > 0) {
    yield { marked: new Set(marked), frontier: new Set(frontier), reclaiming: new Set() };
    const next = new Set<number>();
    for (const k of frontier) {
      marked.add(k);
      const obj = heap[k];
      if (!obj) continue;
      for (const r of obj.refs) {
        if (!marked.has(r) && !frontier.has(r)) next.add(r);
      }
    }
    frontier = next;
  }
  // Final mark snapshot — empty frontier
  yield { marked: new Set(marked), frontier: new Set(), reclaiming: new Set() };

  // Sweep phase — collect everything unmarked, animate in batches
  const toReclaim: number[] = [];
  for (let k = 0; k < heap.length; k++) {
    if (heap[k] !== null && !marked.has(k)) toReclaim.push(k);
  }
  const reclaimSet = new Set(toReclaim);
  yield { marked: new Set(marked), frontier: new Set(), reclaiming: reclaimSet };

  return { marked, frontier: new Set(), reclaiming: reclaimSet };
}

/** ──── Reference-counting collection ──────────────────────────────────── */

/** Cells whose rc==0 — these are the ONLY cells RC can reclaim. Cycles stay. */
function rcReclaimable(heap: Slot[]): Set<number> {
  // RC reclaims iteratively: drop rc==0, decrement their referents, repeat.
  const next: Slot[] = heap.map((s) => (s ? { ...s, rc: s.rc } : null));
  const reclaimed = new Set<number>();
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < next.length; i++) {
      const obj = next[i];
      if (!obj || reclaimed.has(i)) continue;
      if (obj.rc === 0) {
        reclaimed.add(i);
        for (const r of obj.refs) {
          if (next[r] && !reclaimed.has(r)) next[r]!.rc -= 1;
        }
        changed = true;
      }
    }
  }
  return reclaimed;
}

/** ──── Component ──────────────────────────────────────────────────────── */

interface Stats {
  allocated: number;
  reachable: number;
  unreachable: number;
  freeSlots: number;
  totalCollected: number;
  gcCycles: number;
}

export function GcVisualizer(): React.ReactElement {
  const [{ heap, roots }, setState] = useState<State>(() => initialState());
  const [algo, setAlgo] = useState<AlgoId>("mark-sweep");
  const [phase, setPhase] = useState<Phase>("idle");
  const [snap, setSnap] = useState<MarkSnapshot>(() => emptySnapshot());
  const [totalCollected, setTotalCollected] = useState(0);
  const [gcCycles, setGcCycles] = useState(0);
  const [message, setMessage] = useState<string>("Heap seeded. Run GC to start.");
  const [selected, setSelected] = useState<number | null>(null);

  const completedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const genRef = useRef<Generator<MarkSnapshot, MarkSnapshot, unknown> | null>(null);

  // Track activity completion: 2+ GC cycles
  useEffect(() => {
    if (gcCycles >= 2 && !completedRef.current) {
      completedRef.current = true;
      markActivityComplete("gc-visualizer");
    }
  }, [gcCycles]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const stopAnimation = useCallback((): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    genRef.current = null;
  }, []);

  const stats: Stats = useMemo(() => {
    const allocated = heap.reduce((acc, s) => (s ? acc + 1 : acc), 0);
    // Compute reachable set from roots (same logic as mark, fully)
    const reach = new Set<number>();
    const queue: number[] = [];
    for (const r of roots) {
      if (r !== null && heap[r]) {
        queue.push(r);
        reach.add(r);
      }
    }
    while (queue.length > 0) {
      const k = queue.shift()!;
      const obj = heap[k];
      if (!obj) continue;
      for (const ref of obj.refs) {
        if (!reach.has(ref) && heap[ref]) {
          reach.add(ref);
          queue.push(ref);
        }
      }
    }
    return {
      allocated,
      reachable: reach.size,
      unreachable: allocated - reach.size,
      freeSlots: HEAP_SIZE - allocated,
      totalCollected,
      gcCycles,
    };
  }, [heap, roots, totalCollected, gcCycles]);

  /** ── User actions ────────────────────────────────────────────────── */

  const allocate = useCallback((): void => {
    if (phase !== "idle" && phase !== "done") return;
    stopAnimation();
    setPhase("idle");
    setSnap(emptySnapshot());

    setState((prev) => {
      const slot = firstEmpty(prev.heap);
      if (slot === null) {
        setMessage("Heap full — run GC to reclaim unused objects.");
        return prev;
      }
      const obj = makeObject(prev.nextId);
      const heap2 = [...prev.heap];
      heap2[slot] = obj;
      // Attach to either an empty root or a random existing object
      const emptyRootIdx = prev.roots.findIndex((r) => r === null);
      const roots2 = [...prev.roots];
      if (emptyRootIdx >= 0 && Math.random() < 0.4) {
        roots2[emptyRootIdx] = slot;
        setMessage(`Allocated obj #${obj.id} at slot ${slot}, attached to root R${emptyRootIdx}.`);
      } else {
        // Attach to a random existing object as an outgoing ref
        const others: number[] = [];
        for (let i = 0; i < heap2.length; i++) {
          if (i !== slot && heap2[i] !== null) others.push(i);
        }
        if (others.length > 0) {
          const target = others[Math.floor(Math.random() * others.length)]!;
          heap2[target] = { ...heap2[target]!, refs: [...heap2[target]!.refs, slot] };
          setMessage(
            `Allocated obj #${obj.id} at slot ${slot}, referenced by obj #${heap2[target]!.id}.`
          );
        } else if (emptyRootIdx >= 0) {
          roots2[emptyRootIdx] = slot;
          setMessage(
            `Allocated obj #${obj.id} at slot ${slot}, attached to root R${emptyRootIdx}.`
          );
        } else {
          setMessage(`Allocated obj #${obj.id} at slot ${slot} (orphan — will be collected).`);
        }
      }
      return {
        heap: recomputeRefCounts(heap2, roots2),
        roots: roots2,
        nextId: prev.nextId + 1,
      };
    });
  }, [phase, stopAnimation]);

  const dropRoot = useCallback((): void => {
    if (phase !== "idle" && phase !== "done") return;
    stopAnimation();
    setPhase("idle");
    setSnap(emptySnapshot());

    setState((prev) => {
      const heldRoots: number[] = [];
      prev.roots.forEach((r, i) => {
        if (r !== null) heldRoots.push(i);
      });
      if (heldRoots.length === 0) {
        setMessage("No roots to drop. Allocate first.");
        return prev;
      }
      const dropIdx = heldRoots[Math.floor(Math.random() * heldRoots.length)]!;
      const target = prev.roots[dropIdx]!;
      const roots2 = [...prev.roots];
      roots2[dropIdx] = null;
      setMessage(
        `Dropped root R${dropIdx} → slot ${target}. Objects only reachable through it are now garbage.`
      );
      return {
        heap: recomputeRefCounts(prev.heap, roots2),
        roots: roots2,
        nextId: prev.nextId,
      };
    });
  }, [phase, stopAnimation]);

  const mutateRef = useCallback((): void => {
    if (phase !== "idle" && phase !== "done") return;
    stopAnimation();
    setPhase("idle");
    setSnap(emptySnapshot());

    setState((prev) => {
      // Find an object with at least one outgoing ref
      const candidates: number[] = [];
      for (let i = 0; i < prev.heap.length; i++) {
        if (prev.heap[i] && prev.heap[i]!.refs.length > 0) candidates.push(i);
      }
      if (candidates.length === 0) {
        setMessage("Nothing to mutate — no objects with outgoing references.");
        return prev;
      }
      const src = candidates[Math.floor(Math.random() * candidates.length)]!;
      const others: number[] = [];
      for (let i = 0; i < prev.heap.length; i++) {
        if (i !== src && prev.heap[i] !== null) others.push(i);
      }
      if (others.length === 0) return prev;
      const newTarget = others[Math.floor(Math.random() * others.length)]!;
      const heap2 = [...prev.heap];
      const obj = heap2[src]!;
      const refIdx = Math.floor(Math.random() * obj.refs.length);
      const newRefs = [...obj.refs];
      const oldTarget = newRefs[refIdx]!;
      newRefs[refIdx] = newTarget;
      heap2[src] = { ...obj, refs: newRefs };
      setMessage(
        `Re-pointed obj #${obj.id}'s edge from slot ${oldTarget} → slot ${newTarget}. Watch for newly-orphaned objects.`
      );
      return {
        heap: recomputeRefCounts(heap2, prev.roots),
        roots: prev.roots,
        nextId: prev.nextId,
      };
    });
  }, [phase, stopAnimation]);

  const makeCycle = useCallback((): void => {
    if (phase !== "idle" && phase !== "done") return;
    stopAnimation();
    setPhase("idle");
    setSnap(emptySnapshot());

    setState((prev) => {
      // Need two empty slots
      const empties: number[] = [];
      for (let i = 0; i < prev.heap.length; i++) {
        if (prev.heap[i] === null) empties.push(i);
        if (empties.length >= 2) break;
      }
      if (empties.length < 2) {
        setMessage("Need two free slots to build a cycle.");
        return prev;
      }
      const [a, b] = empties as [number, number];
      const objA = makeObject(prev.nextId);
      const objB = makeObject(prev.nextId + 1);
      objA.refs = [b];
      objB.refs = [a];
      const heap2 = [...prev.heap];
      heap2[a] = objA;
      heap2[b] = objB;
      // Cycle is intentionally unrooted — that's the RC failure mode.
      setMessage(
        `Built cycle: #${objA.id} ⇄ #${objB.id}, both unreachable from any root. Tracing reclaims it; RC cannot.`
      );
      return {
        heap: recomputeRefCounts(heap2, prev.roots),
        roots: prev.roots,
        nextId: prev.nextId + 2,
      };
    });
  }, [phase, stopAnimation]);

  /** ── GC drivers ──────────────────────────────────────────────────── */

  const runMarkSweep = useCallback((): void => {
    if (phase !== "idle" && phase !== "done") return;
    stopAnimation();
    genRef.current = markAndSweep(heap, roots);
    setPhase("marking");
    setMessage("Mark phase: BFS from roots. Reachable objects glow green.");

    intervalRef.current = setInterval(() => {
      const g = genRef.current;
      if (!g) return;
      const next = g.next();
      if (next.done) {
        // next.value is the final snapshot — apply the sweep
        const finalSnap = next.value;
        const reclaimed = finalSnap.reclaiming.size;
        setSnap(finalSnap);
        setPhase("sweeping");
        setMessage(
          reclaimed > 0
            ? `Sweep phase: reclaiming ${reclaimed} unmarked object${reclaimed === 1 ? "" : "s"}.`
            : "Sweep phase: nothing to reclaim — the heap is fully reachable."
        );
        // After a short beat, actually clear the reclaimed cells
        setTimeout(() => {
          setState((prev) => {
            const heap2 = [...prev.heap];
            for (const k of finalSnap.reclaiming) heap2[k] = null;
            // Also clear any outgoing refs that now point at empty slots
            for (let i = 0; i < heap2.length; i++) {
              const obj = heap2[i];
              if (!obj) continue;
              const filtered = obj.refs.filter((r) => heap2[r] !== null);
              if (filtered.length !== obj.refs.length) {
                heap2[i] = { ...obj, refs: filtered };
              }
            }
            // Clear root entries that now point at empty slots
            const roots2 = prev.roots.map((r) => (r !== null && heap2[r] === null ? null : r));
            return {
              heap: recomputeRefCounts(heap2, roots2),
              roots: roots2,
              nextId: prev.nextId,
            };
          });
          setTotalCollected((n) => n + reclaimed);
          setGcCycles((n) => n + 1);
          setPhase("done");
          setSnap(emptySnapshot());
          setMessage(
            reclaimed > 0
              ? `GC complete — ${reclaimed} object${reclaimed === 1 ? "" : "s"} reclaimed.`
              : "GC complete — no garbage this cycle."
          );
          stopAnimation();
        }, 700);
        stopAnimation();
        return;
      }
      setSnap(next.value);
    }, TICK_MS);
  }, [phase, heap, roots, stopAnimation]);

  const runRefCount = useCallback((): void => {
    if (phase !== "idle" && phase !== "done") return;
    stopAnimation();
    const reclaimed = rcReclaimable(heap);
    setPhase("rc-collecting");
    setSnap({ marked: new Set(), frontier: new Set(), reclaiming: reclaimed });
    if (reclaimed.size === 0) {
      const totalGarbage = stats.unreachable;
      setMessage(
        totalGarbage > 0
          ? `Reference counting reclaimed 0 — ${totalGarbage} unreachable object${totalGarbage === 1 ? "" : "s"} trapped in cycles. This is RC's blind spot.`
          : "Reference counting reclaimed 0 — heap is fully reachable."
      );
    } else {
      setMessage(`Reference counting reclaimed ${reclaimed.size} object(s) with rc=0.`);
    }
    setTimeout(() => {
      setState((prev) => {
        const heap2 = [...prev.heap];
        for (const k of reclaimed) heap2[k] = null;
        for (let i = 0; i < heap2.length; i++) {
          const obj = heap2[i];
          if (!obj) continue;
          const filtered = obj.refs.filter((r) => heap2[r] !== null);
          if (filtered.length !== obj.refs.length) {
            heap2[i] = { ...obj, refs: filtered };
          }
        }
        const roots2 = prev.roots.map((r) => (r !== null && heap2[r] === null ? null : r));
        return {
          heap: recomputeRefCounts(heap2, roots2),
          roots: roots2,
          nextId: prev.nextId,
        };
      });
      setTotalCollected((n) => n + reclaimed.size);
      setGcCycles((n) => n + 1);
      setPhase("done");
      setSnap(emptySnapshot());
    }, 900);
  }, [phase, heap, stopAnimation, stats.unreachable]);

  const runGc = useCallback((): void => {
    if (algo === "mark-sweep") runMarkSweep();
    else runRefCount();
  }, [algo, runMarkSweep, runRefCount]);

  const resetHeap = useCallback((): void => {
    stopAnimation();
    setState(initialState());
    setPhase("idle");
    setSnap(emptySnapshot());
    setTotalCollected(0);
    setGcCycles(0);
    setMessage("Heap reset. Run GC to start.");
    setSelected(null);
  }, [stopAnimation]);

  /** ── Render helpers ──────────────────────────────────────────────── */

  const isAnimating = phase === "marking" || phase === "sweeping" || phase === "rc-collecting";
  const selectedObj = selected !== null ? heap[selected] : null;

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setAlgo("mark-sweep")}
            disabled={isAnimating}
            className={
              "rounded-md px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-50 " +
              (algo === "mark-sweep"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]")
            }
          >
            Mark &amp; Sweep
          </button>
          <button
            type="button"
            onClick={() => setAlgo("ref-count")}
            disabled={isAnimating}
            className={
              "rounded-md px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-50 " +
              (algo === "ref-count"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]")
            }
          >
            Reference Counting
          </button>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={allocate}
            disabled={isAnimating}
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-subtle)] disabled:opacity-50"
          >
            Allocate
          </button>
          <button
            type="button"
            onClick={dropRoot}
            disabled={isAnimating}
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-subtle)] disabled:opacity-50"
          >
            Drop root
          </button>
          <button
            type="button"
            onClick={mutateRef}
            disabled={isAnimating}
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-subtle)] disabled:opacity-50"
          >
            Mutate ref
          </button>
          <button
            type="button"
            onClick={makeCycle}
            disabled={isAnimating}
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-subtle)] disabled:opacity-50"
          >
            Build cycle
          </button>
          <button
            type="button"
            onClick={resetHeap}
            disabled={isAnimating}
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={runGc}
            disabled={isAnimating}
            className="rounded-md bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-50"
          >
            {isAnimating ? "Running…" : "Run GC"}
          </button>
        </div>
      </div>

      {/* Roots */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3">
        <p className="mb-2 text-[11px] tracking-wide text-[var(--color-text-muted)] uppercase">
          Root set (stack frames)
        </p>
        <div className="flex flex-wrap gap-2">
          {roots.map((slot, i) => {
            const has = slot !== null;
            return (
              <div
                key={i}
                className={
                  "flex items-center gap-2 rounded-md border px-2.5 py-1.5 font-mono text-xs transition " +
                  (has
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-dashed border-[var(--color-border)] text-[var(--color-text-muted)]")
                }
                title={has ? `Root R${i} → slot ${slot}` : `Root R${i} is null`}
              >
                <span className="font-semibold">R{i}</span>
                <span aria-hidden>→</span>
                <span>{has ? `slot ${slot}` : "∅"}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main: heap grid + stats panel */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        {/* Heap grid */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3">
          <p className="mb-2 text-[11px] tracking-wide text-[var(--color-text-muted)] uppercase">
            Heap · {HEAP_SIZE} slots
          </p>
          <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
          >
            {heap.map((slot, k) => {
              const isMarked = snap.marked.has(k);
              const isFrontier = snap.frontier.has(k);
              const isReclaim = snap.reclaiming.has(k);
              const isSelected = selected === k;
              const isRooted = roots.includes(k);

              let bg = "var(--color-bg-surface)";
              let border = "var(--color-border)";
              let label: string | null = null;

              if (slot === null) {
                bg = "transparent";
                border = "var(--color-border)";
              } else {
                bg = `oklch(72% 0.10 ${slot.hue})`;
                border = `oklch(60% 0.12 ${slot.hue})`;
                label = `#${slot.id}`;
              }

              if (isReclaim) {
                bg = COLOR_RECLAIM;
                border = COLOR_RECLAIM;
              } else if (isFrontier) {
                bg = COLOR_CELEBRATION;
                border = COLOR_CELEBRATION;
              } else if (isMarked) {
                bg = `color-mix(in oklch, ${COLOR_CELEBRATION} 55%, var(--color-bg-surface))`;
                border = COLOR_CELEBRATION;
              }

              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSelected(selected === k ? null : slot ? k : null)}
                  className={
                    "relative aspect-square rounded-md border font-mono text-[10px] font-bold transition-all duration-150 " +
                    (slot ? "cursor-pointer" : "cursor-default border-dashed") +
                    (isSelected ? " ring-2 ring-offset-1 ring-offset-transparent" : "")
                  }
                  style={{
                    background: bg,
                    borderColor: border,
                    color: slot ? "rgba(0,0,0,0.75)" : "var(--color-text-muted)",
                    ...(isSelected
                      ? ({ "--tw-ring-color": COLOR_ACCENT } as React.CSSProperties)
                      : {}),
                  }}
                  aria-label={
                    slot
                      ? `Object ${slot.id} at slot ${k}, ${slot.refs.length} outgoing refs`
                      : `empty slot ${k}`
                  }
                  title={
                    slot
                      ? `slot ${k} · obj #${slot.id} · rc=${slot.rc} · refs→[${slot.refs.join(", ") || "—"}]`
                      : `slot ${k} · empty`
                  }
                >
                  {label && <span>{label}</span>}
                  {isRooted && slot !== null && (
                    <span
                      className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border border-white"
                      style={{ background: COLOR_ACCENT }}
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
          </div>
          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-[var(--color-text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full border"
                style={{ background: COLOR_CELEBRATION, borderColor: COLOR_CELEBRATION }}
              />
              frontier (BFS wave)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm border"
                style={{
                  background: `color-mix(in oklch, ${COLOR_CELEBRATION} 55%, transparent)`,
                  borderColor: COLOR_CELEBRATION,
                }}
              />
              marked (reachable)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ background: COLOR_RECLAIM }}
              />
              reclaiming
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: COLOR_ACCENT }}
              />
              rooted
            </span>
          </div>
        </div>

        {/* Stats panel */}
        <div className="space-y-3">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
            <p className="text-[11px] tracking-wide text-[var(--color-text-muted)] uppercase">
              Heap state
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-y-2 text-xs">
              <dt className="text-[var(--color-text-muted)]">Allocated</dt>
              <dd className="text-right font-mono text-[var(--color-text-primary)]">
                {stats.allocated} / {HEAP_SIZE}
              </dd>
              <dt className="text-[var(--color-text-muted)]">Reachable</dt>
              <dd className="text-right font-mono text-emerald-600 dark:text-emerald-400">
                {stats.reachable}
              </dd>
              <dt className="text-[var(--color-text-muted)]">Unreachable</dt>
              <dd className="text-right font-mono text-rose-600 dark:text-rose-400">
                {stats.unreachable}
              </dd>
              <dt className="text-[var(--color-text-muted)]">Free slots</dt>
              <dd className="text-right font-mono text-[var(--color-text-primary)]">
                {stats.freeSlots}
              </dd>
            </dl>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
            <p className="text-[11px] tracking-wide text-[var(--color-text-muted)] uppercase">
              GC history
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-y-2 text-xs">
              <dt className="text-[var(--color-text-muted)]">Cycles run</dt>
              <dd className="text-right font-mono text-[var(--color-text-primary)]">
                {stats.gcCycles}
              </dd>
              <dt className="text-[var(--color-text-muted)]">Total collected</dt>
              <dd className="text-right font-mono text-[var(--color-text-primary)]">
                {stats.totalCollected}
              </dd>
              <dt className="text-[var(--color-text-muted)]">Algorithm</dt>
              <dd className="text-right font-mono text-[var(--color-text-primary)]">
                {algo === "mark-sweep" ? "M&S" : "RC"}
              </dd>
            </dl>
          </div>

          {selectedObj ? (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
              <p className="text-[11px] tracking-wide text-[var(--color-text-muted)] uppercase">
                Selected: slot {selected}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-y-2 text-xs">
                <dt className="text-[var(--color-text-muted)]">Object id</dt>
                <dd className="text-right font-mono text-[var(--color-text-primary)]">
                  #{selectedObj.id}
                </dd>
                <dt className="text-[var(--color-text-muted)]">Ref count</dt>
                <dd className="text-right font-mono text-[var(--color-text-primary)]">
                  {selectedObj.rc}
                </dd>
                <dt className="text-[var(--color-text-muted)]">Outgoing refs</dt>
                <dd className="text-right font-mono text-[var(--color-text-primary)]">
                  {selectedObj.refs.length > 0 ? `→ [${selectedObj.refs.join(", ")}]` : "—"}
                </dd>
              </dl>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 text-xs text-[var(--color-text-muted)]">
              Tap an object cell to inspect its references and rc.
            </div>
          )}
        </div>
      </div>

      {/* Status line */}
      <div
        className="rounded-lg border px-4 py-3 text-sm"
        style={{
          borderColor:
            phase === "marking" || phase === "sweeping" || phase === "rc-collecting"
              ? "color-mix(in oklch, var(--color-celebration, #34d399) 55%, transparent)"
              : "var(--color-border)",
          background:
            phase === "marking" || phase === "sweeping" || phase === "rc-collecting"
              ? "color-mix(in oklch, var(--color-celebration, #34d399) 6%, var(--color-bg-surface))"
              : "var(--color-bg-surface)",
          color: "var(--color-text-secondary)",
        }}
        aria-live="polite"
      >
        {message}
      </div>

      {/* Pedagogical note */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-5 py-4">
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          <strong className="text-[var(--color-text-primary)]">The invariant:</strong> an object is{" "}
          <em>live</em> if and only if it&rsquo;s reachable from a root. Mark-and-sweep walks the
          graph from roots, paints everything reachable green, then deletes the rest. Reference
          counting tracks incoming edges per object — it&rsquo;s incremental and cheap, but{" "}
          <em>cannot</em> reclaim cycles whose external references all dropped (build one and watch
          RC strand it). Tracing collectors (mark-and-sweep, generational, concurrent) are the
          standard answer in Java, JavaScript, Go, and Python; RC alone ships in Swift and CPython
          (with a cycle-detector bolted on).
        </p>
      </div>
    </div>
  );
}

export default GcVisualizer;
