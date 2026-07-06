import type { ReactElement } from "react";

import { createClient } from "@/lib/supabase/server";
import { BarChart, LineChart } from "../_components/charts";
import { bucketByDay, countBy, dauWau, formatCount } from "../_lib/data";

/** Row shape for the bounded aggregate fetch (timestamp/name/user_id only). */
interface AggregateEventRow {
  name: string;
  user_id: string | null;
  timestamp: string | number;
}

/** Row shape for the recent-events table. */
interface RecentEventRow {
  id: string;
  user_id: string | null;
  name: string;
  timestamp: string | number;
  properties: unknown;
}

/**
 * Formats an ISO timestamp as a relative time ("3m ago", "2d ago").
 * Falls back to the raw string when unparseable, and to an absolute
 * date past 30 days so old rows stay readable.
 */
function relativeTime(value: string | number, now: number): string {
  // Bigint epoch-ms can serialize as a numeric string — Date.parse would
  // NaN on it, so parse digit-only strings as epoch ms directly.
  const ms =
    typeof value === "number" ? value : /^\d+$/.test(value) ? Number(value) : Date.parse(value);
  if (Number.isNaN(ms)) return String(value);
  const diffSec = Math.max(0, Math.round((now - ms) / 1000));
  if (diffSec < 60) return "just now";
  const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "always", style: "narrow" });
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return rtf.format(-diffMin, "minute");
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return rtf.format(-diffHr, "hour");
  const diffDay = Math.round(diffHr / 24);
  if (diffDay <= 30) return rtf.format(-diffDay, "day");
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(ms));
}

/** Truncates a string to `max` chars, appending an ellipsis when cut. */
function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

/** Small labeled stat card for the KPI row. */
function StatCard({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
      <p className="text-xs font-medium tracking-wide text-[var(--color-text-secondary)] uppercase">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)] tabular-nums">
        {value}
      </p>
    </div>
  );
}

/** Visible, non-swallowed error banner for a failed query. */
function QueryError({ scope, message }: { scope: string; message: string }): ReactElement {
  return (
    <div
      role="alert"
      className="rounded-xl border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-4 text-sm text-[var(--color-error)]"
    >
      <strong>{scope} query failed:</strong> {message}
    </div>
  );
}

/**
 * Admin analytics page: consent-gated event KPIs, a 30-day event volume
 * line chart, top event names, and the latest 50 raw events.
 *
 * All reads run through the admin session's RLS-enforced Supabase client;
 * aggregate fetches are bounded to 10,000 narrow rows and grouped in JS.
 */
export default async function AdminAnalyticsPage(): Promise<ReactElement> {
  const supabase = await createClient();
  const now = Date.now();
  // analytics_events.timestamp is bigint epoch-ms — filter numerically.
  const thirtyDaysAgoMs = now - 30 * 24 * 60 * 60 * 1000;

  const [totalResult, aggregateResult, recentResult] = await Promise.all([
    // Exact count via head request — no rows transferred.
    supabase.from("analytics_events").select("id", { count: "exact", head: true }),
    // Bounded aggregate fetch: narrow columns, newest first so the 30-day
    // window and DAU/WAU stay accurate even past 10,000 total events.
    supabase
      .from("analytics_events")
      .select("name, user_id, timestamp")
      .gte("timestamp", thirtyDaysAgoMs)
      .order("timestamp", { ascending: false })
      .limit(10000),
    supabase
      .from("analytics_events")
      .select("id, user_id, name, timestamp, properties")
      .order("timestamp", { ascending: false })
      .limit(50),
  ]);

  const errors: { scope: string; message: string }[] = [];
  if (totalResult.error) {
    console.error("analytics total count failed:", totalResult.error);
    errors.push({ scope: "Total events", message: totalResult.error.message });
  }
  if (aggregateResult.error) {
    console.error("analytics aggregate fetch failed:", aggregateResult.error);
    errors.push({ scope: "Aggregates", message: aggregateResult.error.message });
  }
  if (recentResult.error) {
    console.error("analytics recent events fetch failed:", recentResult.error);
    errors.push({ scope: "Recent events", message: recentResult.error.message });
  }

  const totalEvents = totalResult.count ?? 0;
  const aggregateRows: AggregateEventRow[] =
    (aggregateResult.data as AggregateEventRow[] | null) ?? [];
  const recentEvents: RecentEventRow[] = (recentResult.data as RecentEventRow[] | null) ?? [];

  const { dau, wau } = dauWau(
    aggregateRows.filter((row): row is AggregateEventRow & { user_id: string } =>
      Boolean(row.user_id)
    )
  );
  const distinctNames = new Set(aggregateRows.map((row) => row.name)).size;
  const eventsPerDay = bucketByDay(aggregateRows, 30);
  const topEventNames = countBy(aggregateRows, (row) => row.name).slice(0, 10);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Analytics</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Consent-gated events — only users who opted in appear here.
        </p>
      </div>

      {errors.length > 0 && (
        <div className="mb-6 flex flex-col gap-3">
          {errors.map((err) => (
            <QueryError key={err.scope} scope={err.scope} message={err.message} />
          ))}
        </div>
      )}

      {/* KPI row */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total events" value={formatCount(totalEvents)} />
        <StatCard label="Daily active users" value={formatCount(dau)} />
        <StatCard label="Weekly active users" value={formatCount(wau)} />
        <StatCard label="Distinct event names" value={formatCount(distinctNames)} />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-5">
        {/* Events per day */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 lg:col-span-3">
          <h2 className="mb-4 text-sm font-semibold text-[var(--color-text-secondary)]">
            Events per day — last 30 days
          </h2>
          {aggregateRows.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
              No events yet — data appears as users opt in.
            </p>
          ) : (
            <LineChart
              series={eventsPerDay}
              label="Analytics events per day over the last 30 days"
              valueFormat={formatCount}
            />
          )}
        </section>

        {/* Top event names */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-[var(--color-text-secondary)]">
            Top event names — last 30 days
          </h2>
          {topEventNames.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
              No events yet — data appears as users opt in.
            </p>
          ) : (
            <BarChart
              items={topEventNames}
              label="Top 10 event names by count over the last 30 days"
              maxBars={10}
              valueFormat={formatCount}
            />
          )}
        </section>
      </div>

      {/* Latest events table */}
      <section className="overflow-hidden rounded-xl border border-[var(--color-border)]">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--color-text-secondary)]">
            Latest events
          </h2>
        </div>

        {recentEvents.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">
              No events yet — data appears as users opt in.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">
                The 50 most recent consent-gated analytics events
              </caption>
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left">
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-medium tracking-wide text-[var(--color-text-secondary)] uppercase"
                  >
                    Event
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-medium tracking-wide text-[var(--color-text-secondary)] uppercase"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-medium tracking-wide text-[var(--color-text-secondary)] uppercase"
                  >
                    Time
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-medium tracking-wide text-[var(--color-text-secondary)] uppercase"
                  >
                    Properties
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {recentEvents.map((ev) => {
                  const propsJson = JSON.stringify(ev.properties ?? {});
                  return (
                    <tr key={ev.id}>
                      <td className="px-4 py-2.5 font-mono text-xs text-[var(--color-text-primary)]">
                        {ev.name}
                      </td>
                      <td
                        className="px-4 py-2.5 font-mono text-xs text-[var(--color-text-secondary)]"
                        title={ev.user_id ?? "anonymous"}
                      >
                        {ev.user_id ? `${ev.user_id.slice(0, 8)}…` : "anon"}
                      </td>
                      <td
                        className="px-4 py-2.5 text-xs whitespace-nowrap text-[var(--color-text-secondary)] tabular-nums"
                        title={String(ev.timestamp)}
                      >
                        {relativeTime(ev.timestamp, now)}
                      </td>
                      <td
                        className="max-w-xs px-4 py-2.5 font-mono text-xs break-all text-[var(--color-text-muted)]"
                        title={propsJson}
                      >
                        {truncate(propsJson, 80)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
