"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";

/**
 * Pathfinding — three classical algorithms on the same grid.
 *
 * Pedagogical bet: side-by-side stats (cells explored, path length, runtime)
 * make the trade-off between BFS, Dijkstra, and A* visible. BFS finds the
 * shortest unweighted path. Dijkstra handles weights. A* uses a heuristic
 * to focus the search toward the goal — same guarantee as Dijkstra, less
 * exploration when the heuristic is good.
 *
 * The learner can: drop walls, drop "mud" (high-cost tiles), move the start
 * and goal, then watch each algorithm sweep the grid in parallel.
 */

const COLS = 24;
const ROWS = 14;
const TICK_MS = 22;

type CellKind = "open" | "wall" | "mud";

interface Cell {
  kind: CellKind;
  cost: number;
}

interface Point {
  r: number;
  c: number;
}

type AlgoId = "bfs" | "dijkstra" | "astar";

interface Step {
  /** Cells the algorithm has popped from the open set. */
  closed: Set<number>;
  /** Cells currently in the open set / queue. */
  open: Set<number>;
  /** Backtracked path from start to current goal (only on `done`). */
  path: number[] | null;
  /** Cells popped so far. Drives the "explored" stat. */
  exploredCount: number;
  done: boolean;
  /** Did the algorithm reach the goal? */
  reached: boolean;
}

const key = (r: number, c: number): number => r * COLS + c;
const fromKey = (k: number): Point => ({ r: Math.floor(k / COLS), c: k % COLS });

function defaultGrid(): Cell[] {
  return Array.from({ length: ROWS * COLS }, () => ({ kind: "open" as const, cost: 1 }));
}

function neighbors(k: number, grid: Cell[]): { k: number; cost: number }[] {
  const { r, c } = fromKey(k);
  const out: { k: number; cost: number }[] = [];
  const moves: Point[] = [
    { r: -1, c: 0 },
    { r: 1, c: 0 },
    { r: 0, c: -1 },
    { r: 0, c: 1 },
  ];
  for (const m of moves) {
    const nr = r + m.r;
    const nc = c + m.c;
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
    const nk = key(nr, nc);
    const cell = grid[nk];
    if (!cell || cell.kind === "wall") continue;
    out.push({ k: nk, cost: cell.cost });
  }
  return out;
}

function reconstruct(prev: Map<number, number>, end: number): number[] {
  const path: number[] = [];
  let cur: number | undefined = end;
  while (cur !== undefined) {
    path.push(cur);
    cur = prev.get(cur);
  }
  return path.reverse();
}

function manhattan(a: number, b: number): number {
  const A = fromKey(a);
  const B = fromKey(b);
  return Math.abs(A.r - B.r) + Math.abs(A.c - B.c);
}

/** Tiny indexed min-heap. Inlined so we don't pull lodash. */
class MinHeap {
  private arr: { k: number; p: number }[] = [];
  push(k: number, p: number): void {
    this.arr.push({ k, p });
    this.bubbleUp(this.arr.length - 1);
  }
  pop(): { k: number; p: number } | undefined {
    if (this.arr.length === 0) return undefined;
    const top = this.arr[0];
    const last = this.arr.pop()!;
    if (this.arr.length > 0) {
      this.arr[0] = last;
      this.sinkDown(0);
    }
    return top;
  }
  get size(): number {
    return this.arr.length;
  }
  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.arr[parent]!.p <= this.arr[i]!.p) break;
      [this.arr[parent], this.arr[i]] = [this.arr[i]!, this.arr[parent]!];
      i = parent;
    }
  }
  private sinkDown(i: number): void {
    const n = this.arr.length;
    while (true) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      let smallest = i;
      if (l < n && this.arr[l]!.p < this.arr[smallest]!.p) smallest = l;
      if (r < n && this.arr[r]!.p < this.arr[smallest]!.p) smallest = r;
      if (smallest === i) break;
      [this.arr[smallest], this.arr[i]] = [this.arr[i]!, this.arr[smallest]!];
      i = smallest;
    }
  }
}

/** ──── Algorithm generators ─────────────────────────────────────────────── */

function* bfs(grid: Cell[], start: number, goal: number): Generator<Step, void, unknown> {
  const queue: number[] = [start];
  const visited = new Set<number>([start]);
  const closed = new Set<number>();
  const prev = new Map<number, number>();
  let explored = 0;

  while (queue.length > 0) {
    const cur = queue.shift()!;
    closed.add(cur);
    explored++;
    if (cur === goal) {
      yield {
        closed,
        open: new Set(queue),
        path: reconstruct(prev, cur),
        exploredCount: explored,
        done: true,
        reached: true,
      };
      return;
    }
    for (const { k: n } of neighbors(cur, grid)) {
      if (visited.has(n)) continue;
      visited.add(n);
      prev.set(n, cur);
      queue.push(n);
    }
    yield {
      closed,
      open: new Set(queue),
      path: null,
      exploredCount: explored,
      done: false,
      reached: false,
    };
  }

  yield {
    closed,
    open: new Set(),
    path: null,
    exploredCount: explored,
    done: true,
    reached: false,
  };
}

function* dijkstra(grid: Cell[], start: number, goal: number): Generator<Step, void, unknown> {
  const dist = new Map<number, number>([[start, 0]]);
  const prev = new Map<number, number>();
  const heap = new MinHeap();
  heap.push(start, 0);
  const closed = new Set<number>();
  let explored = 0;

  while (heap.size > 0) {
    const { k: cur, p } = heap.pop()!;
    if (closed.has(cur)) continue;
    closed.add(cur);
    explored++;
    if (cur === goal) {
      yield {
        closed,
        open: new Set(),
        path: reconstruct(prev, cur),
        exploredCount: explored,
        done: true,
        reached: true,
      };
      return;
    }
    for (const { k: n, cost } of neighbors(cur, grid)) {
      const alt = p + cost;
      const known = dist.get(n);
      if (known === undefined || alt < known) {
        dist.set(n, alt);
        prev.set(n, cur);
        heap.push(n, alt);
      }
    }
    yield {
      closed,
      open: new Set(dist.keys()),
      path: null,
      exploredCount: explored,
      done: false,
      reached: false,
    };
  }

  yield {
    closed,
    open: new Set(),
    path: null,
    exploredCount: explored,
    done: true,
    reached: false,
  };
}

function* astar(grid: Cell[], start: number, goal: number): Generator<Step, void, unknown> {
  const gScore = new Map<number, number>([[start, 0]]);
  const prev = new Map<number, number>();
  const heap = new MinHeap();
  heap.push(start, manhattan(start, goal));
  const closed = new Set<number>();
  let explored = 0;

  while (heap.size > 0) {
    const { k: cur } = heap.pop()!;
    if (closed.has(cur)) continue;
    closed.add(cur);
    explored++;
    if (cur === goal) {
      yield {
        closed,
        open: new Set(),
        path: reconstruct(prev, cur),
        exploredCount: explored,
        done: true,
        reached: true,
      };
      return;
    }
    const curG = gScore.get(cur) ?? 0;
    for (const { k: n, cost } of neighbors(cur, grid)) {
      const alt = curG + cost;
      const known = gScore.get(n);
      if (known === undefined || alt < known) {
        gScore.set(n, alt);
        prev.set(n, cur);
        heap.push(n, alt + manhattan(n, goal));
      }
    }
    yield {
      closed,
      open: new Set(gScore.keys()),
      path: null,
      exploredCount: explored,
      done: false,
      reached: false,
    };
  }

  yield {
    closed,
    open: new Set(),
    path: null,
    exploredCount: explored,
    done: true,
    reached: false,
  };
}

const ALGOS: { id: AlgoId; label: string; color: string; run: typeof bfs }[] = [
  { id: "bfs", label: "BFS", color: "#60a5fa", run: bfs },
  { id: "dijkstra", label: "Dijkstra", color: "#f59e0b", run: dijkstra },
  { id: "astar", label: "A*", color: "#10b981", run: astar },
];

type Tool = "wall" | "mud" | "start" | "goal" | "erase";

function initialStep(): Step {
  return {
    closed: new Set(),
    open: new Set(),
    path: null,
    exploredCount: 0,
    done: false,
    reached: false,
  };
}

export function Pathfinding(): React.ReactElement {
  const [grid, setGrid] = useState<Cell[]>(() => defaultGrid());
  const [start, setStart] = useState<number>(() => key(7, 4));
  const [goal, setGoal] = useState<number>(() => key(7, 19));
  const [tool, setTool] = useState<Tool>("wall");
  const [running, setRunning] = useState(false);
  const completedRef = useRef(false);

  const [steps, setSteps] = useState<Record<AlgoId, Step>>({
    bfs: initialStep(),
    dijkstra: initialStep(),
    astar: initialStep(),
  });

  const gens = useRef<Record<AlgoId, Generator<Step, void, unknown> | null>>({
    bfs: null,
    dijkstra: null,
    astar: null,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const paintingRef = useRef(false);

  const stop = useCallback((): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const resetSteps = useCallback((): void => {
    setSteps({ bfs: initialStep(), dijkstra: initialStep(), astar: initialStep() });
    gens.current = { bfs: null, dijkstra: null, astar: null };
  }, []);

  const start_ = useCallback((): void => {
    if (running) return;
    resetSteps();
    gens.current = {
      bfs: bfs(grid, start, goal),
      dijkstra: dijkstra(grid, start, goal),
      astar: astar(grid, start, goal),
    };
    setRunning(true);
    intervalRef.current = setInterval(() => {
      let allDone = true;
      const update: Partial<Record<AlgoId, Step>> = {};
      for (const a of ALGOS) {
        const g = gens.current[a.id];
        if (!g) continue;
        const next = g.next();
        if (!next.done) {
          update[a.id] = next.value;
          if (!next.value.done) allDone = false;
        }
      }
      if (Object.keys(update).length > 0) {
        setSteps((prev) => ({ ...prev, ...update }));
      }
      if (allDone) {
        stop();
        if (!completedRef.current) {
          completedRef.current = true;
          markActivityComplete("pathfinding");
        }
      }
    }, TICK_MS);
  }, [grid, start, goal, running, resetSteps, stop]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const paintCell = useCallback(
    (k: number): void => {
      if (k === start && tool !== "start") return;
      if (k === goal && tool !== "goal") return;
      stop();
      resetSteps();
      if (tool === "start") {
        setStart(k);
        return;
      }
      if (tool === "goal") {
        setGoal(k);
        return;
      }
      setGrid((prev) => {
        const next = [...prev];
        if (tool === "wall") next[k] = { kind: "wall", cost: 1 };
        else if (tool === "mud") next[k] = { kind: "mud", cost: 5 };
        else next[k] = { kind: "open", cost: 1 };
        return next;
      });
    },
    [tool, start, goal, stop, resetSteps]
  );

  const resetAll = useCallback((): void => {
    stop();
    resetSteps();
    setGrid(defaultGrid());
    setStart(key(7, 4));
    setGoal(key(7, 19));
  }, [stop, resetSteps]);

  /** A maze preset that demonstrates A*'s heuristic advantage. */
  const loadMaze = useCallback((): void => {
    stop();
    resetSteps();
    const g = defaultGrid();
    const walls: Point[] = [];
    // U-shaped barrier between start and goal
    for (let r = 2; r <= 11; r++) walls.push({ r, c: 11 });
    for (let c = 11; c <= 18; c++) walls.push({ r: 2, c });
    for (let r = 2; r <= 8; r++) walls.push({ r, c: 18 });
    // Mud band — Dijkstra and A* should detour around, BFS does not care
    const mudTiles: Point[] = [];
    for (let r = 6; r <= 8; r++) {
      for (let c = 4; c <= 9; c++) mudTiles.push({ r, c });
    }
    for (const { r, c } of walls) {
      const k = key(r, c);
      if (k !== start && k !== goal) g[k] = { kind: "wall", cost: 1 };
    }
    for (const { r, c } of mudTiles) {
      const k = key(r, c);
      if (k !== start && k !== goal && g[k]!.kind === "open") {
        g[k] = { kind: "mud", cost: 5 };
      }
    }
    setGrid(g);
  }, [stop, resetSteps, start, goal]);

  /** Combine the three algorithms' states for per-cell highlight on the grid. */
  const cellOverlay = useMemo(() => {
    const overlay: { closedBy: Set<AlgoId>; openBy: Set<AlgoId>; pathBy: Set<AlgoId> }[] =
      Array.from({ length: ROWS * COLS }, () => ({
        closedBy: new Set(),
        openBy: new Set(),
        pathBy: new Set(),
      }));
    for (const a of ALGOS) {
      const s = steps[a.id];
      for (const k of s.closed) overlay[k]!.closedBy.add(a.id);
      for (const k of s.open) overlay[k]!.openBy.add(a.id);
      if (s.path) for (const k of s.path) overlay[k]!.pathBy.add(a.id);
    }
    return overlay;
  }, [steps]);

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3">
        <div className="flex flex-wrap items-center gap-1">
          {(
            [
              { id: "wall", label: "Wall", swatch: "#1f2937" },
              { id: "mud", label: "Mud (cost 5)", swatch: "#a16207" },
              { id: "erase", label: "Erase", swatch: "#e5e7eb" },
              { id: "start", label: "Start", swatch: "#10b981" },
              { id: "goal", label: "Goal", swatch: "#ef4444" },
            ] as { id: Tool; label: string; swatch: string }[]
          ).map((t) => {
            const active = tool === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTool(t.id)}
                className={
                  "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition " +
                  (active
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]")
                }
              >
                <span
                  className="h-3 w-3 rounded-sm border border-black/10"
                  style={{ background: t.swatch }}
                  aria-hidden
                />
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={loadMaze}
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
          >
            Load maze
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => (running ? stop() : start_())}
            className="rounded-md bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-50"
          >
            {running ? "Pause" : "Race"}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div
        className="grid gap-px rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-2 select-none"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        onPointerLeave={() => {
          paintingRef.current = false;
        }}
      >
        {grid.map((cell, k) => {
          const overlay = cellOverlay[k]!;
          const isStart = k === start;
          const isGoal = k === goal;
          let bg = "var(--color-bg-surface)";
          let title = "";
          if (cell.kind === "wall") {
            bg = "#1f2937";
            title = "wall";
          } else if (cell.kind === "mud") {
            bg = "#a16207";
            title = "mud (cost 5)";
          }
          // Visited highlight: blend by which algorithm got there
          if (overlay.pathBy.size > 0) {
            // Path: blend the chosen-algorithm colors at high opacity
            const colors = ALGOS.filter((a) => overlay.pathBy.has(a.id)).map((a) => a.color);
            bg = colors[0] ?? bg;
          } else if (overlay.closedBy.size > 0) {
            const colors = ALGOS.filter((a) => overlay.closedBy.has(a.id)).map((a) => a.color);
            // Low-opacity layered tint
            bg = `${colors[0] ?? "#888888"}55`;
          } else if (overlay.openBy.size > 0) {
            const colors = ALGOS.filter((a) => overlay.openBy.has(a.id)).map((a) => a.color);
            bg = `${colors[0] ?? "#888888"}22`;
          }
          if (isStart) bg = "#10b981";
          if (isGoal) bg = "#ef4444";
          return (
            <button
              key={k}
              type="button"
              title={title || (isStart ? "start" : isGoal ? "goal" : undefined)}
              aria-label={isStart ? "start cell" : isGoal ? "goal cell" : `cell ${title || "open"}`}
              onPointerDown={(e) => {
                e.preventDefault();
                paintingRef.current = true;
                paintCell(k);
              }}
              onPointerEnter={() => {
                if (paintingRef.current) paintCell(k);
              }}
              onPointerUp={() => {
                paintingRef.current = false;
              }}
              className="aspect-square rounded-sm transition-colors"
              style={{ background: bg }}
            >
              {(isStart || isGoal) && (
                <span className="block text-center text-[10px] font-bold text-white">
                  {isStart ? "S" : "G"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {ALGOS.map((a) => {
          const s = steps[a.id];
          return (
            <div
              key={a.id}
              className="rounded-xl border bg-[var(--color-bg-surface)] p-4"
              style={{ borderColor: `${a.color}55` }}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: a.color }}
                    aria-hidden
                  />
                  {a.label}
                </span>
                {s.done && (
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold " +
                      (s.reached
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                        : "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300")
                    }
                  >
                    {s.reached ? "found" : "no path"}
                  </span>
                )}
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs">
                <dt className="text-[var(--color-text-muted)]">Cells explored</dt>
                <dd className="text-right font-mono text-[var(--color-text-primary)]">
                  {s.exploredCount}
                </dd>
                <dt className="text-[var(--color-text-muted)]">Path length</dt>
                <dd className="text-right font-mono text-[var(--color-text-primary)]">
                  {s.path ? s.path.length - 1 : "—"}
                </dd>
                <dt className="text-[var(--color-text-muted)]">Path cost</dt>
                <dd className="text-right font-mono text-[var(--color-text-primary)]">
                  {s.path
                    ? s.path.reduce((acc, k, i) => (i === 0 ? 0 : acc + (grid[k]?.cost ?? 1)), 0)
                    : "—"}
                </dd>
              </dl>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Pathfinding;
