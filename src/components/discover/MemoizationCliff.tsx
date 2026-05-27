"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";

const MIN_N = 1;
const MAX_N = 35;
const VIZ_MAX_N = 5; // beyond this the naive tree becomes too large to show

/** Number of function calls a naive recursive fib(n) makes. */
function naiveCallCount(n: number): number {
  if (n <= 1) return 1;
  let a = 1;
  let b = 1;
  for (let i = 2; i <= n; i++) {
    const c = a + b + 1;
    a = b;
    b = c;
  }
  return b;
}

/** Number of UNIQUE fib values a memoized solver computes (= n + 1). */
function memoComputeCount(n: number): number {
  return n + 1;
}

/** Total node count (compute + cache hit) in a memoized fib(n) call tree. */
function memoNodeCount(n: number): number {
  // T_memo(n): every non-base call generates one recursion (computes a new value)
  // and one cache hit (the value was already computed by the left subtree).
  // T_memo(0) = T_memo(1) = 1, T_memo(n) = T_memo(n-1) + 1 + 1 = T_memo(n-1) + 2.
  // → T_memo(n) = 2n - 1 for n >= 1, T_memo(0) = 1.
  if (n <= 1) return 1;
  return 2 * n - 1;
}

/** ──── Node + Tree rendering ──────────────────────────────────────────── */

type NodeVariant = "compute" | "cache" | "base";

interface NodeProps {
  label: string;
  variant: NodeVariant;
  color: string;
}

function TreeNode({ label, variant, color }: NodeProps): React.ReactElement {
  let style: React.CSSProperties;
  switch (variant) {
    case "compute":
      style = { backgroundColor: color, color: "white", borderColor: color };
      break;
    case "cache":
      style = {
        backgroundColor: `${color}14`,
        color,
        borderColor: color,
        borderStyle: "dashed",
      };
      break;
    case "base":
      style = { backgroundColor: `${color}55`, color, borderColor: color };
      break;
  }
  return (
    <span
      className="inline-block rounded border px-1.5 py-0.5 font-mono text-[10px] leading-tight whitespace-nowrap"
      style={style}
    >
      {label}
    </span>
  );
}

interface NaiveTreeProps {
  n: number;
  color: string;
}

function NaiveTree({ n, color }: NaiveTreeProps): React.ReactElement {
  if (n <= 1) {
    return (
      <div className="flex flex-col items-center">
        <TreeNode label={`f(${n})`} variant="base" color={color} />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-1">
      <TreeNode label={`f(${n})`} variant="compute" color={color} />
      <div className="flex items-start gap-1.5">
        <NaiveTree n={n - 1} color={color} />
        <NaiveTree n={n - 2} color={color} />
      </div>
    </div>
  );
}

interface MemoTreeProps {
  n: number;
  cache: Set<number>;
  color: string;
}

function MemoTree({ n, cache, color }: MemoTreeProps): React.ReactElement {
  if (cache.has(n)) {
    return (
      <div className="flex flex-col items-center">
        <TreeNode label={`f(${n})`} variant="cache" color={color} />
      </div>
    );
  }
  cache.add(n);
  if (n <= 1) {
    return (
      <div className="flex flex-col items-center">
        <TreeNode label={`f(${n})`} variant="base" color={color} />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-1">
      <TreeNode label={`f(${n})`} variant="compute" color={color} />
      <div className="flex items-start gap-1.5">
        <MemoTree n={n - 1} cache={cache} color={color} />
        <MemoTree n={n - 2} cache={cache} color={color} />
      </div>
    </div>
  );
}

/** ──── Main component ────────────────────────────────────────────────── */

function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function MemoizationCliff(): React.ReactElement {
  const [n, setN] = useState(5);
  const completedRef = useRef(false);

  const naiveCalls = useMemo(() => naiveCallCount(n), [n]);
  const memoCalls = useMemo(() => memoNodeCount(n), [n]);
  const memoComputes = useMemo(() => memoComputeCount(n), [n]);
  const ratio = naiveCalls / memoCalls;

  useEffect(() => {
    if (n !== 5 && !completedRef.current) {
      completedRef.current = true;
      markActivityComplete("memoization-cliff");
    }
  }, [n]);

  const showTrees = n <= VIZ_MAX_N;
  const naiveColor = "#fb7185";
  const memoColor = "#34d399";

  return (
    <div className="space-y-7">
      {/* Slider */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-5 py-5">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="memo-n" className="text-sm font-medium text-[var(--color-text-primary)]">
            Compute fib(<span className="font-mono">{n}</span>)
          </label>
          <span className="text-xs text-[var(--color-text-muted)]">
            Drag to {MIN_N}–{MAX_N}
          </span>
        </div>
        <input
          id="memo-n"
          type="range"
          min={MIN_N}
          max={MAX_N}
          value={n}
          onChange={(e) => setN(Number(e.target.value))}
          className="mt-3 w-full accent-[var(--color-accent)]"
        />
      </div>

      {/* Big counters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border px-5 py-5" style={{ borderColor: `${naiveColor}55` }}>
          <p className="text-xs font-medium tracking-wide uppercase" style={{ color: naiveColor }}>
            Naive recursion · O(2ⁿ)
          </p>
          <p
            className="mt-2 font-mono text-4xl font-bold tabular-nums"
            style={{ color: naiveColor }}
          >
            {formatNumber(naiveCalls)}
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">function calls</p>
        </div>
        <div className="rounded-xl border px-5 py-5" style={{ borderColor: `${memoColor}55` }}>
          <p className="text-xs font-medium tracking-wide uppercase" style={{ color: memoColor }}>
            Memoized · O(n)
          </p>
          <p
            className="mt-2 font-mono text-4xl font-bold tabular-nums"
            style={{ color: memoColor }}
          >
            {formatNumber(memoCalls)}
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {formatNumber(memoComputes)} unique values + {formatNumber(memoCalls - memoComputes)}{" "}
            cache hits
          </p>
        </div>
      </div>

      {/* Ratio dramatically displayed */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-5 py-4 text-center">
        <p className="text-xs tracking-wide text-[var(--color-text-muted)] uppercase">The cliff</p>
        <p className="mt-1 font-mono text-3xl font-bold text-[var(--color-text-primary)]">
          {ratio < 1000
            ? `${ratio.toFixed(1)}×`
            : ratio < 1_000_000
              ? `${(ratio / 1000).toFixed(1)}K×`
              : `${(ratio / 1_000_000).toFixed(2)}M×`}
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          More work the naive version does, for the same answer.
        </p>
      </div>

      {/* Tree visualization */}
      {showTrees ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div
            className="overflow-x-auto rounded-xl border px-4 py-4"
            style={{ borderColor: `${naiveColor}33` }}
          >
            <p
              className="mb-3 text-xs font-medium tracking-wide uppercase"
              style={{ color: naiveColor }}
            >
              Naive — every subtree recomputed
            </p>
            <div className="flex justify-center">
              <NaiveTree n={n} color={naiveColor} />
            </div>
          </div>
          <div
            className="overflow-x-auto rounded-xl border px-4 py-4"
            style={{ borderColor: `${memoColor}33` }}
          >
            <p
              className="mb-3 text-xs font-medium tracking-wide uppercase"
              style={{ color: memoColor }}
            >
              Memoized — cached values collapse to a single lookup
            </p>
            <div className="flex justify-center">
              <MemoTree n={n} cache={new Set()} color={memoColor} />
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] px-5 py-6 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            Trees too large to render past n = {VIZ_MAX_N}. The naive version&rsquo;s tree would
            have {formatNumber(naiveCalls)} nodes; the memoized version&rsquo;s would have{" "}
            {formatNumber(memoCalls)}.
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[var(--color-text-muted)]">
        <span className="inline-flex items-center gap-2">
          <TreeNode label="f(n)" variant="compute" color={memoColor} />
          compute (recurse)
        </span>
        <span className="inline-flex items-center gap-2">
          <TreeNode label="f(n)" variant="cache" color={memoColor} />
          cache hit (no recursion)
        </span>
        <span className="inline-flex items-center gap-2">
          <TreeNode label="f(0)" variant="base" color={memoColor} />
          base case
        </span>
      </div>

      {/* Pedagogical note */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-5 py-4">
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          <strong className="text-[var(--color-text-primary)]">What you&rsquo;re seeing:</strong>{" "}
          the same algorithm, with one tiny addition — caching the result of each sub-call. The call
          count drops from exponential to linear. This is the entire idea of{" "}
          <em>dynamic programming</em>: identify the sub-problems your recursion already solves and
          stop solving them again. The technique scales: at n=50, naive needs ~32 billion calls;
          memo needs 99.
        </p>
      </div>
    </div>
  );
}

export default MemoizationCliff;
