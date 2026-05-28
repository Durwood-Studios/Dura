"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";

/**
 * EmbeddingGalaxy — a 2D plot of curated concept embeddings.
 *
 * Pedagogical bet: "embeddings" sounds mystical until you can click one and
 * watch its semantic neighbors light up. By hand-placing ~35 concepts the
 * learner already knows on a 2D map clustered by meaning (data structures
 * together, networking together, databases together), the demo collapses
 * three abstractions at once:
 *
 *   1. Concepts live in a vector space — meaning is a position.
 *   2. "Similar" is a geometric relationship between positions.
 *   3. Cosine and euclidean measure that relationship differently — and the
 *      reason every modern NLP system uses cosine becomes visible when the
 *      learner toggles between them.
 *
 * Real embeddings come from a neural net (BERT, OpenAI ada, sentence-
 * transformers) trained to push semantically related text near each other
 * in a 768- or 1536-dimensional space. The math the learner uses below is
 * the same — we just hand-placed the points in 2D so the geometry is
 * visible to the eye, instead of inferring it from a model.
 *
 * Required interactions:
 *   - Click a node → top-3 cosine-nearest highlight, scores in side panel.
 *   - Toggle distance metric (cosine vs euclidean) with explanation.
 *   - Search input filters/highlights matching concept labels.
 *   - markActivityComplete("embedding-galaxy") once the learner has
 *     selected 5 different nodes.
 */

/** ──── Data: curated 2D "embeddings" of CS concepts. ─────────────────── */

interface Concept {
  id: string;
  label: string;
  category: string;
  /** Hand-placed 2D coordinates in [-1, 1]. Clustered by meaning. */
  x: number;
  y: number;
}

/**
 * 36 concepts, hand-placed so semantically related ones cluster. NOT real
 * embeddings — this is a teaching demo, and the clusters are the lesson.
 *
 * Cluster map (roughly):
 *   top-left      : data structures      (array, list, stack, queue, tree, graph, hash)
 *   top-right     : ML / linear algebra  (neuron, vector, scalar, matrix, gradient, regression)
 *   center-right  : storage / databases  (SQL, Redis, Postgres, cache, RAM)
 *   bottom-right  : infra / deployment   (Docker, Kubernetes, thread, mutex, deadlock)
 *   bottom-left   : encoding / formats   (binary, octal, ASCII, UTF-8, JSON, YAML, CSV, RGB)
 *   center-left   : networking           (TCP, promise, GC, CPU, GPU)
 *
 * Coordinates picked by hand so the visual map reads as a believable
 * "semantic space" — the same shape a real embedding's UMAP/t-SNE plot
 * would produce if it learned these concepts well.
 */
const CONCEPTS: Concept[] = [
  // ─── Data structures (top-left) ─────────────────────────────────
  { id: "array", label: "array", category: "data structures", x: -0.78, y: 0.74 },
  { id: "list", label: "linked list", category: "data structures", x: -0.7, y: 0.62 },
  { id: "stack", label: "stack", category: "data structures", x: -0.86, y: 0.58 },
  { id: "queue", label: "queue", category: "data structures", x: -0.82, y: 0.48 },
  { id: "tree", label: "tree", category: "data structures", x: -0.62, y: 0.78 },
  { id: "graph", label: "graph", category: "data structures", x: -0.55, y: 0.66 },
  { id: "hash", label: "hash map", category: "data structures", x: -0.68, y: 0.46 },

  // ─── ML / linear algebra (top-right) ────────────────────────────
  { id: "neuron", label: "neuron", category: "machine learning", x: 0.62, y: 0.78 },
  { id: "vector", label: "vector", category: "linear algebra", x: 0.74, y: 0.66 },
  { id: "scalar", label: "scalar", category: "linear algebra", x: 0.82, y: 0.56 },
  { id: "matrix", label: "matrix", category: "linear algebra", x: 0.68, y: 0.58 },
  { id: "gradient", label: "gradient", category: "machine learning", x: 0.56, y: 0.66 },
  { id: "regression", label: "regression", category: "machine learning", x: 0.5, y: 0.76 },

  // ─── Storage / databases (center-right) ─────────────────────────
  { id: "sql", label: "SQL", category: "databases", x: 0.7, y: 0.04 },
  { id: "redis", label: "Redis", category: "databases", x: 0.8, y: -0.06 },
  { id: "postgres", label: "Postgres", category: "databases", x: 0.62, y: -0.1 },
  { id: "cache", label: "cache", category: "databases", x: 0.86, y: 0.14 },
  { id: "ram", label: "RAM", category: "hardware", x: 0.78, y: 0.24 },

  // ─── Infra / concurrency (bottom-right) ────────────────────────
  { id: "docker", label: "Docker", category: "infrastructure", x: 0.58, y: -0.62 },
  { id: "k8s", label: "Kubernetes", category: "infrastructure", x: 0.7, y: -0.74 },
  { id: "thread", label: "thread", category: "concurrency", x: 0.42, y: -0.5 },
  { id: "mutex", label: "mutex", category: "concurrency", x: 0.5, y: -0.42 },
  { id: "deadlock", label: "deadlock", category: "concurrency", x: 0.36, y: -0.38 },

  // ─── Encoding / formats (bottom-left) ──────────────────────────
  { id: "binary", label: "binary", category: "encoding", x: -0.78, y: -0.58 },
  { id: "octal", label: "octal", category: "encoding", x: -0.86, y: -0.46 },
  { id: "ascii", label: "ASCII", category: "encoding", x: -0.68, y: -0.42 },
  { id: "utf8", label: "UTF-8", category: "encoding", x: -0.6, y: -0.5 },
  { id: "json", label: "JSON", category: "data formats", x: -0.5, y: -0.7 },
  { id: "yaml", label: "YAML", category: "data formats", x: -0.42, y: -0.62 },
  { id: "csv", label: "CSV", category: "data formats", x: -0.56, y: -0.78 },
  { id: "rgb", label: "RGB", category: "encoding", x: -0.74, y: -0.7 },

  // ─── Networking / runtime (center-left) ────────────────────────
  { id: "tcp", label: "TCP", category: "networking", x: -0.32, y: -0.04 },
  { id: "promise", label: "promise", category: "concurrency", x: 0.08, y: -0.28 },
  { id: "gc", label: "GC", category: "runtime", x: -0.04, y: -0.14 },
  { id: "cpu", label: "CPU", category: "hardware", x: 0.18, y: 0.34 },
  { id: "gpu", label: "GPU", category: "hardware", x: 0.3, y: 0.46 },
];

/** ──── Math: cosine similarity + euclidean distance. ─────────────────── */

function dot(a: Concept, b: Concept): number {
  return a.x * b.x + a.y * b.y;
}

function magnitude(a: Concept): number {
  return Math.sqrt(a.x * a.x + a.y * a.y);
}

/** Cosine similarity ∈ [-1, 1]. 1 = same direction, 0 = orthogonal, -1 = opposite. */
function cosineSimilarity(a: Concept, b: Concept): number {
  const denom = magnitude(a) * magnitude(b);
  if (denom === 0) return 0;
  return dot(a, b) / denom;
}

/** Euclidean distance in 2D. Smaller = closer. */
function euclideanDistance(a: Concept, b: Concept): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

type Metric = "cosine" | "euclidean";

interface Neighbor {
  concept: Concept;
  score: number;
}

/**
 * Top-K nearest concepts to the selected one, by the chosen metric.
 * Cosine: higher = closer, sort descending.
 * Euclidean: lower = closer, sort ascending.
 */
function topKNeighbors(selected: Concept, metric: Metric, k: number): Neighbor[] {
  const others = CONCEPTS.filter((c) => c.id !== selected.id);
  const scored = others.map((c) => ({
    concept: c,
    score: metric === "cosine" ? cosineSimilarity(selected, c) : euclideanDistance(selected, c),
  }));
  scored.sort((a, b) => (metric === "cosine" ? b.score - a.score : a.score - b.score));
  return scored.slice(0, k);
}

/** ──── Viewport / projection. ─────────────────────────────────────────── */

const VIEW_W = 600;
const VIEW_H = 420;
const PAD = 28;

/** Map a [-1, 1] world coordinate to SVG pixels with padding. */
function projectX(x: number): number {
  return PAD + ((x + 1) / 2) * (VIEW_W - 2 * PAD);
}
function projectY(y: number): number {
  // Flip Y so +1 renders at the top (math convention) instead of the bottom.
  return PAD + ((1 - y) / 2) * (VIEW_H - 2 * PAD);
}

const TOP_K = 3;
const REQUIRED_SELECTIONS = 5;

/** Category → accent. Used for the node fill so clusters read visually. */
const CATEGORY_COLOR: Record<string, string> = {
  "data structures": "#60a5fa",
  "machine learning": "#a78bfa",
  "linear algebra": "#c4b5fd",
  databases: "#f59e0b",
  hardware: "#fbbf24",
  infrastructure: "#34d399",
  concurrency: "#10b981",
  encoding: "#f472b6",
  "data formats": "#fb7185",
  networking: "#38bdf8",
  runtime: "#94a3b8",
};

function colorFor(category: string): string {
  return CATEGORY_COLOR[category] ?? "#94a3b8";
}

/** ──── Main component. ────────────────────────────────────────────────── */

export function EmbeddingGalaxy(): React.ReactElement {
  const [selectedId, setSelectedId] = useState<string>("vector");
  const [metric, setMetric] = useState<Metric>("cosine");
  const [query, setQuery] = useState("");
  const visitedRef = useRef<Set<string>>(new Set(["vector"]));
  const completedRef = useRef(false);
  const [visitedCount, setVisitedCount] = useState(1);

  const selected = useMemo<Concept>(
    () => CONCEPTS.find((c) => c.id === selectedId) ?? CONCEPTS[0]!,
    [selectedId]
  );

  const neighbors = useMemo<Neighbor[]>(
    () => topKNeighbors(selected, metric, TOP_K),
    [selected, metric]
  );

  const handleSelect = useCallback((id: string): void => {
    setSelectedId(id);
    if (!visitedRef.current.has(id)) {
      visitedRef.current.add(id);
      setVisitedCount(visitedRef.current.size);
    }
  }, []);

  useEffect(() => {
    if (visitedCount >= REQUIRED_SELECTIONS && !completedRef.current) {
      completedRef.current = true;
      markActivityComplete("embedding-galaxy");
    }
  }, [visitedCount]);

  /** Lowercase substring filter against label + category. */
  const matchedIds = useMemo<Set<string>>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return new Set();
    const out = new Set<string>();
    for (const c of CONCEPTS) {
      if (c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)) {
        out.add(c.id);
      }
    }
    return out;
  }, [query]);

  const neighborIds = useMemo<Set<string>>(
    () => new Set(neighbors.map((n) => n.concept.id)),
    [neighbors]
  );

  const isSearchActive = query.trim().length > 0;

  return (
    <div className="space-y-5">
      {/* Toolbar: metric toggle + search + counter */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3">
        {/* Metric segmented control */}
        <div className="flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-0.5">
          {(["cosine", "euclidean"] as Metric[]).map((m) => {
            const active = metric === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMetric(m)}
                className={
                  "rounded px-3 py-1 text-xs font-medium capitalize transition " +
                  (active
                    ? "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]")
                }
                aria-pressed={active}
              >
                {m}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <label className="min-w-[180px] flex-1">
          <span className="sr-only">Find similar to…</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find similar to… (e.g. matrix, queue, JSON)"
            spellCheck={false}
            autoComplete="off"
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </label>

        {/* Progress counter */}
        <div className="ml-auto flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <span className="font-mono tabular-nums">
            {Math.min(visitedCount, REQUIRED_SELECTIONS)}/{REQUIRED_SELECTIONS}
          </span>
          <span>concepts explored</span>
        </div>
      </div>

      {/* Main: SVG galaxy + side panel */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        {/* SVG plot */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3">
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="block w-full"
            role="img"
            aria-label="2D embedding plot of CS concepts"
          >
            {/* Subtle origin axes */}
            <line
              x1={projectX(-1)}
              y1={projectY(0)}
              x2={projectX(1)}
              y2={projectY(0)}
              stroke="var(--color-border)"
              strokeWidth={1}
              strokeDasharray="2 4"
            />
            <line
              x1={projectX(0)}
              y1={projectY(-1)}
              x2={projectX(0)}
              y2={projectY(1)}
              stroke="var(--color-border)"
              strokeWidth={1}
              strokeDasharray="2 4"
            />

            {/* Neighbor lines from selected to each top-K */}
            {neighbors.map((n) => {
              const sx = projectX(selected.x);
              const sy = projectY(selected.y);
              const nx = projectX(n.concept.x);
              const ny = projectY(n.concept.y);
              return (
                <line
                  key={`line-${n.concept.id}`}
                  x1={sx}
                  y1={sy}
                  x2={nx}
                  y2={ny}
                  stroke="var(--color-accent)"
                  strokeWidth={1.5}
                  strokeOpacity={0.55}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Node + label for every concept */}
            {CONCEPTS.map((c) => {
              const cx = projectX(c.x);
              const cy = projectY(c.y);
              const isSelected = c.id === selected.id;
              const isNeighbor = neighborIds.has(c.id);
              const matchesSearch = matchedIds.has(c.id);
              const dimmed = isSearchActive && !matchesSearch;
              const baseColor = colorFor(c.category);
              const opacity = dimmed ? 0.18 : 1;
              const r = isSelected ? 9 : isNeighbor ? 7 : 5;
              const stroke = isSelected
                ? "var(--color-text-primary)"
                : isNeighbor
                  ? "var(--color-accent)"
                  : "transparent";
              const strokeW = isSelected ? 2 : isNeighbor ? 1.5 : 0;
              return (
                <g key={c.id} opacity={opacity} style={{ transition: "opacity 200ms" }}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill={baseColor}
                    stroke={stroke}
                    strokeWidth={strokeW}
                    style={{ cursor: "pointer", transition: "r 150ms" }}
                    onClick={() => handleSelect(c.id)}
                    aria-label={`${c.label} (${c.category})`}
                  >
                    <title>{`${c.label} — ${c.category}`}</title>
                  </circle>
                  <text
                    x={cx + r + 4}
                    y={cy + 3}
                    fontSize={10}
                    fill={
                      isSelected || isNeighbor
                        ? "var(--color-text-primary)"
                        : "var(--color-text-secondary)"
                    }
                    fontWeight={isSelected ? 600 : isNeighbor ? 500 : 400}
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {c.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Side panel: selected + neighbors + metric explanation */}
        <div className="space-y-4">
          {/* Selected concept */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
            <p className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
              Selected
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: colorFor(selected.category) }}
                aria-hidden
              />
              <span className="font-mono text-base font-semibold text-[var(--color-text-primary)]">
                {selected.label}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">{selected.category}</p>
            <p className="mt-2 font-mono text-[11px] text-[var(--color-text-muted)]">
              ({selected.x.toFixed(2)}, {selected.y.toFixed(2)})
            </p>
          </div>

          {/* Top-K neighbors */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
            <p className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
              Top {TOP_K} nearest · {metric}
            </p>
            <ul className="mt-3 space-y-2">
              {neighbors.map((n, i) => (
                <li
                  key={n.concept.id}
                  className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 transition hover:bg-[var(--color-bg-subtle)]"
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(n.concept.id)}
                    className="flex flex-1 items-center gap-2 text-left"
                  >
                    <span className="font-mono text-xs text-[var(--color-text-muted)] tabular-nums">
                      #{i + 1}
                    </span>
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: colorFor(n.concept.category) }}
                      aria-hidden
                    />
                    <span className="font-mono text-sm text-[var(--color-text-primary)]">
                      {n.concept.label}
                    </span>
                  </button>
                  <span className="font-mono text-xs text-[var(--color-text-secondary)] tabular-nums">
                    {metric === "cosine" ? n.score.toFixed(3) : n.score.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-text-muted)]">
              {metric === "cosine"
                ? "Cosine similarity ∈ [-1, 1]. Higher = same direction in semantic space. 1.0 = identical direction; 0.0 = orthogonal; negative = opposite meaning."
                : "Euclidean distance ≥ 0. Lower = closer in absolute position. Measures the straight-line distance between the two points."}
            </p>
          </div>

          {/* Metric explanation — why cosine for embeddings */}
          <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4">
            <p className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
              Why cosine?
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
              In real embedding spaces (hundreds of dimensions), <em>direction</em> carries meaning
              — not magnitude. A long document and a short one about the same topic point the same
              way but have different lengths. Cosine ignores length; euclidean does not. Toggle the
              metric and watch the neighbor list change: cosine groups by <em>theme</em>, euclidean
              groups by <em>map location</em>.
            </p>
          </div>
        </div>
      </div>

      {/* Category legend */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
        <p className="mb-2 text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
          Categories
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--color-text-secondary)]">
          {Object.entries(CATEGORY_COLOR).map(([cat, color]) => (
            <span key={cat} className="inline-flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: color }}
                aria-hidden
              />
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Pedagogical note */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-5 py-4">
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          <strong className="text-[var(--color-text-primary)]">What you&rsquo;re seeing:</strong>{" "}
          every concept lives at a fixed position in a 2D space we made up. &quot;Similarity&quot;
          is just geometry — how close two positions are, or how aligned their directions are from
          the origin. Real embeddings live in 768- or 1536-dimensional spaces produced by a neural
          network, but the math you ran in the side panel is exactly the math a vector database runs
          at query time. Click around, toggle the metric, and notice that clusters survive both —
          but the <em>ranking within a cluster</em> changes depending on which one you pick.
        </p>
      </div>
    </div>
  );
}

export default EmbeddingGalaxy;
