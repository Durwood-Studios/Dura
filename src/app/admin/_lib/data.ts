/**
 * Pure data helpers for the admin dashboard.
 *
 * All functions are side-effect free and safe to call from Server Components.
 * Time bucketing is UTC throughout so server renders are deterministic.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Returns the UTC YYYY-MM-DD key for a millisecond timestamp. */
function utcDayKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * Parses a row timestamp into epoch milliseconds (NaN when unparseable).
 *
 * Bigint epoch-ms columns (analytics_events.timestamp, xp_events.awarded_at,
 * lesson_progress.started_at/completed_at) normally arrive as JSON numbers,
 * but can surface as digit strings through generated types or JSON paths —
 * Date.parse rejects those, so digit strings are converted numerically.
 * ISO timestamptz strings (created_at etc.) go through Date.parse.
 */
function toEpochMs(timestamp: string | number): number {
  if (typeof timestamp === "number") return timestamp;
  if (/^-?\d+$/.test(timestamp.trim())) return Number(timestamp);
  return Date.parse(timestamp);
}

/**
 * Buckets timestamped rows into zero-filled continuous UTC day buckets
 * ending today. Rows with unparseable timestamps or timestamps outside
 * the window are ignored, so bounded fetches degrade gracefully.
 *
 * @param rows - Rows carrying an epoch-ms number (bigint columns) or ISO timestamp string.
 * @param days - Number of day buckets to return (today inclusive). Must be >= 1.
 * @returns One entry per day, oldest first: { date: "YYYY-MM-DD", value: count }.
 */
export function bucketByDay(
  rows: { timestamp: string | number }[],
  days: number
): { date: string; value: number }[] {
  const safeDays = Math.max(1, Math.floor(days));
  const now = Date.now();
  const todayStart = Math.floor(now / DAY_MS) * DAY_MS;

  const counts = new Map<string, number>();
  for (let i = safeDays - 1; i >= 0; i--) {
    counts.set(utcDayKey(todayStart - i * DAY_MS), 0);
  }

  const windowStart = todayStart - (safeDays - 1) * DAY_MS;
  for (const row of rows) {
    const ms = toEpochMs(row.timestamp);
    // Bounds-check before utcDayKey: non-finite or out-of-Date-range values
    // make Date#toISOString throw, and out-of-window rows can never count.
    if (!Number.isFinite(ms) || ms < windowStart || ms >= todayStart + DAY_MS) continue;
    const key = utcDayKey(Math.floor(ms / DAY_MS) * DAY_MS);
    const current = counts.get(key);
    if (current !== undefined) {
      counts.set(key, current + 1);
    }
  }

  return Array.from(counts, ([date, value]) => ({ date, value }));
}

/**
 * Counts rows grouped by a derived string key, sorted by count descending
 * (ties broken alphabetically for stable rendering).
 *
 * @param rows - Any rows to group.
 * @param key - Extracts the grouping label from a row.
 * @returns Labels with their counts, largest first.
 */
export function countBy<T>(rows: T[], key: (row: T) => string): { label: string; value: number }[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const label = key(row);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return Array.from(counts, ([label, value]) => ({ label, value })).sort(
    (a, b) => b.value - a.value || a.label.localeCompare(b.label)
  );
}

/**
 * Formats a count compactly for stat cards (1200 -> "1.2K").
 *
 * @param n - The count to format.
 * @returns Intl compact-notation string.
 */
export function formatCount(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/**
 * Computes daily and weekly active users from timestamped events:
 * distinct user_ids seen in the last 1 and 7 days (rolling, UTC clock).
 * Rows with invalid timestamps are ignored.
 *
 * @param rows - Events carrying a user_id and an epoch-ms number or ISO timestamp.
 * @returns Distinct-user counts: { dau, wau }.
 */
export function dauWau(rows: { user_id: string; timestamp: string | number }[]): {
  dau: number;
  wau: number;
} {
  const now = Date.now();
  const dayAgo = now - DAY_MS;
  const weekAgo = now - 7 * DAY_MS;

  const daily = new Set<string>();
  const weekly = new Set<string>();
  for (const row of rows) {
    const ms = toEpochMs(row.timestamp);
    if (!Number.isFinite(ms) || ms > now) continue;
    if (ms >= weekAgo) {
      weekly.add(row.user_id);
      if (ms >= dayAgo) {
        daily.add(row.user_id);
      }
    }
  }

  return { dau: daily.size, wau: weekly.size };
}
