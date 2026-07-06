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

  const max = Math.max(...points, 1);
  const pad = 2;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  // A single point can't form a line — draw a flat segment across the width.
  const step = points.length > 1 ? innerW / (points.length - 1) : innerW;
  const coords = points.map((value, i) => {
    const x = points.length > 1 ? pad + i * step : pad + innerW / 2;
    const y = pad + innerH - (value / max) * innerH;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

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
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;
  const max = Math.max(...series.map((p) => p.value), 1);
  const step = series.length > 1 ? innerW / (series.length - 1) : innerW;

  const xy = (point: LineChartSeriesPoint, i: number): [number, number] => {
    const x = series.length > 1 ? padLeft + i * step : padLeft + innerW / 2;
    const y = padTop + innerH - (point.value / max) * innerH;
    return [x, y];
  };

  const linePoints = series.map((p, i) =>
    xy(p, i)
      .map((n) => n.toFixed(2))
      .join(",")
  );
  const baseline = padTop + innerH;
  const [firstX] = xy(series[0], 0);
  const [lastX] = xy(series[series.length - 1], series.length - 1);
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
        {ticks.map((i) => (
          <span key={series[i].date}>{shortDate(series[i].date)}</span>
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

  const visible = items.slice(0, maxBars);
  const max = Math.max(...visible.map((item) => item.value), 1);

  return (
    // A real list, not role="img": the labels/values are DOM text screen
    // readers should reach — only the decorative bar SVGs are hidden.
    <ul aria-label={label} className="flex list-none flex-col gap-2">
      {visible.map((item) => {
        const pct = Math.max((item.value / max) * 100, 0.5);
        return (
          <li key={item.label} className="flex items-center gap-3">
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
