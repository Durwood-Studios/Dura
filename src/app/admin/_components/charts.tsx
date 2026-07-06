import type { ReactElement } from "react";

/**
 * Server-compatible inline-SVG chart primitives for the admin dashboard.
 *
 * No hooks, no client JS — every component renders as a Server Component.
 * All colors come from DLS tokens (var(--color-accent), var(--color-border),
 * text tokens); marks are thin and axes recessive per the dataviz standard.
 */

interface SparklineProps {
  /** Ordered values to plot, oldest first. */
  points: number[];
  /** SVG width in px. */
  width?: number;
  /** SVG height in px. */
  height?: number;
  /** Accessible description of what the sparkline shows. */
  label: string;
}

interface LineChartSeriesPoint {
  /** ISO date (YYYY-MM-DD) for the bucket. */
  date: string;
  /** Value for that day. */
  value: number;
}

interface LineChartProps {
  /** Daily points, oldest first (use bucketByDay to produce these). */
  series: LineChartSeriesPoint[];
  /** Plot height in px. */
  height?: number;
  /** Accessible description of what the chart shows. */
  label: string;
  /** Formats axis/summary values (defaults to String). */
  valueFormat?: (value: number) => string;
}

interface BarChartItem {
  /** Row label (e.g. a user or event name). */
  label: string;
  /** Row value; bars scale to the max value. */
  value: number;
}

interface BarChartProps {
  /** Rows to display, any order — rendered as given. */
  items: BarChartItem[];
  /** Accessible description of what the chart shows. */
  label: string;
  /** Maximum number of bars to render (default 10). */
  maxBars?: number;
  /** Formats the right-aligned value (defaults to String). */
  valueFormat?: (value: number) => string;
}

/** Shared intentional-looking empty state for all chart primitives. */
function EmptyState({ label }: { label: string }): ReactElement {
  return (
    <div
      role="img"
      aria-label={`${label}: no data yet`}
      className="flex min-h-12 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-text-tertiary)]"
    >
      No data yet — data appears as users opt in
    </div>
  );
}

/**
 * Largest finite value in the series, floored at 1 so scaling never divides
 * by zero. A single NaN/Infinity row must not poison Math.max — that would
 * turn every plotted coordinate into "NaN" and blank the whole chart.
 */
function finiteMax(values: number[]): number {
  let max = 1;
  for (const value of values) {
    if (Number.isFinite(value) && value > max) max = value;
  }
  return max;
}

/**
 * Clamps value/max to [0, 1]; non-finite or negative values plot at the
 * baseline instead of emitting NaN coords or drawing outside the viewBox.
 */
function safeRatio(value: number, max: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(value / max, 1);
}

/** Formats a short human-readable date (e.g. "Jun 28") from an ISO date string. */
function shortDate(iso: string): string {
  const parsed = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

/**
 * Tiny inline line chart for stat cards. Renders a single accent-colored
 * polyline with no axes; pass a meaningful `label` for screen readers.
 */
export function Sparkline({
  points,
  width = 120,
  height = 32,
  label,
}: SparklineProps): ReactElement {
  if (points.length === 0) {
    return <EmptyState label={label} />;
  }

  const max = finiteMax(points);
  const pad = 2;
  const innerW = Math.max(width - pad * 2, 1);
  const innerH = Math.max(height - pad * 2, 1);
  const step = points.length > 1 ? innerW / (points.length - 1) : innerW;
  const coords = points.map((value, i) => {
    const x = pad + i * step;
    const y = pad + innerH - safeRatio(value, max) * innerH;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  // A one-point polyline renders nothing — extend it into a flat segment.
  if (points.length === 1) {
    const y = pad + innerH - safeRatio(points[0], max) * innerH;
    coords.push(`${(pad + innerW).toFixed(2)},${y.toFixed(2)}`);
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={label}
      className="overflow-visible"
    >
      <title>{label}</title>
      <polyline
        points={coords.join(" ")}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Daily line chart with a 10%-opacity area fill, x-axis date ticks
 * (first / mid / last) and a y-axis max label. Single series, accent-colored.
 */
export function LineChart({
  series,
  height = 160,
  label,
  valueFormat = String,
}: LineChartProps): ReactElement {
  if (series.length === 0) {
    return <EmptyState label={label} />;
  }

  const width = 600;
  const padLeft = 8;
  const padRight = 8;
  // Axis labels are HTML now, so the plot only needs stroke clearance.
  const padTop = 8;
  const padBottom = 8;
  const innerW = Math.max(width - padLeft - padRight, 1);
  const innerH = Math.max(height - padTop - padBottom, 1);
  const max = finiteMax(series.map((p) => p.value));
  // A one-point polyline renders nothing (and its area polygon degenerates
  // to a sliver) — plot a single day as a flat full-width segment instead.
  const plot = series.length === 1 ? [series[0], series[0]] : series;
  const step = innerW / (plot.length - 1);

  const xy = (point: LineChartSeriesPoint, i: number): [number, number] => {
    const x = padLeft + i * step;
    const y = padTop + innerH - safeRatio(point.value, max) * innerH;
    return [x, y];
  };

  const linePoints = plot.map((p, i) =>
    xy(p, i)
      .map((n) => n.toFixed(2))
      .join(",")
  );
  const baseline = padTop + innerH;
  const [firstX] = xy(plot[0], 0);
  const [lastX] = xy(plot[plot.length - 1], plot.length - 1);
  const areaPath = `${linePoints.join(" ")} ${lastX.toFixed(2)},${baseline} ${firstX.toFixed(2)},${baseline}`;

  const midIndex = Math.floor(series.length / 2);
  const ticks = series.length >= 3 ? [0, midIndex, series.length - 1] : series.map((_, i) => i);

  return (
    <div className="w-full">
      {/* Axis labels render as HTML outside the scaling SVG so they hold a
          real 12px (text-xs) at any container width — SVG <text> in the
          600-unit viewBox shrank below the DLS 12px floor on mobile. */}
      <div aria-hidden className="mb-1 text-xs text-[var(--color-text-secondary)] tabular-nums">
        Peak: {valueFormat(max)}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={label}
        className="block w-full"
        height={height}
        preserveAspectRatio="none"
      >
        <title>{label}</title>
        {/* Baseline + max gridline: recessive, border token */}
        <line
          x1={padLeft}
          y1={baseline}
          x2={width - padRight}
          y2={baseline}
          stroke="var(--color-border)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1={padLeft}
          y1={padTop}
          x2={width - padRight}
          y2={padTop}
          stroke="var(--color-border)"
          strokeWidth={1}
          strokeDasharray="2 4"
          vectorEffect="non-scaling-stroke"
        />
        {/* Area fill at 10% opacity */}
        <polygon points={areaPath} fill="var(--color-accent)" fillOpacity={0.1} />
        <polyline
          points={linePoints.join(" ")}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {/* X-axis date ticks: first / mid / last */}
      <div
        aria-hidden
        className="mt-1 flex justify-between text-xs text-[var(--color-text-secondary)]"
      >
        {/* Keyed by index: callers could pass duplicate dates, which would
            collide as keys — tick indices are always unique. */}
        {ticks.map((i) => (
          <span key={i}>{shortDate(series[i].date)}</span>
        ))}
      </div>
    </div>
  );
}

/**
 * Horizontal bar chart for leaderboards. Labels truncate with a `title`
 * attribute for the full text; values are right-aligned tabular-nums.
 */
export function BarChart({
  items,
  label,
  maxBars = 10,
  valueFormat = String,
}: BarChartProps): ReactElement {
  if (items.length === 0) {
    return <EmptyState label={label} />;
  }

  // Clamp so maxBars <= 0 still shows at least one row (a bare empty <ul>
  // is not an intentional empty state) and negatives don't slice from the end.
  const visible = items.slice(0, Math.max(1, Math.floor(maxBars)));
  const max = finiteMax(visible.map((item) => item.value));

  return (
    // A real list, not role="img": the labels/values are DOM text screen
    // readers should reach — only the decorative bar SVGs are hidden.
    <ul aria-label={label} className="flex list-none flex-col gap-2">
      {visible.map((item, index) => {
        const pct = Math.max(safeRatio(item.value, max) * 100, 0.5);
        return (
          // Label alone can't key the row: two users can share a display name.
          <li key={`${index}-${item.label}`} className="flex items-center gap-3">
            <span
              title={item.label}
              className="w-32 shrink-0 truncate text-xs text-[var(--color-text-secondary)] sm:w-40"
            >
              {item.label}
            </span>
            <svg
              className="h-2.5 min-w-0 flex-1"
              role="presentation"
              aria-hidden="true"
              preserveAspectRatio="none"
            >
              <title>{`${item.label}: ${valueFormat(item.value)}`}</title>
              <rect
                x={0}
                y={0}
                width={`${pct.toFixed(2)}%`}
                height="100%"
                rx={2}
                fill="var(--color-accent)"
              />
            </svg>
            <span className="w-14 shrink-0 text-right text-xs text-[var(--color-text-primary)] tabular-nums">
              {valueFormat(item.value)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
