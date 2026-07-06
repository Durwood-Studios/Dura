import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import {
  MessageSquare,
  BarChart2,
  Users,
  Zap,
  HandCoins,
  BookOpen,
  Flag,
  HardDrive,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/payments/stripe";
import { Sparkline, LineChart } from "@/app/admin/_components/charts";
import { bucketByDay, formatCount } from "@/app/admin/_lib/data";

const DAY_MS = 24 * 60 * 60 * 1000;
const TREND_DAYS = 14;

/** Result of the 30-day tips-revenue lookup, one state per card variant. */
type TipsRevenue =
  | { state: "unconfigured" }
  | { state: "error" }
  | { state: "ok"; count: number; totals: string[] };

/** Formats a minor-unit Stripe amount as localized currency (e.g. 1250 -> "$12.50"). */
function formatCurrency(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountMinor / 100);
}

/**
 * Sums succeeded Stripe payment intents from the last 30 days.
 * Returns "unconfigured" when tipping is dormant (no STRIPE_SECRET_KEY)
 * and "error" when the Stripe API call fails — never throws.
 */
async function getTipsRevenue(): Promise<TipsRevenue> {
  const stripe = getStripe();
  if (!stripe) return { state: "unconfigured" };

  try {
    const since = Math.floor((Date.now() - 30 * DAY_MS) / 1000);

    const byCurrency = new Map<string, number>();
    let count = 0;
    let scanned = 0;
    // Auto-paginate so totals stay exact past the first 100 intents; the hard
    // cap bounds worst-case Stripe API calls on a runaway 30-day window.
    const MAX_SCANNED_INTENTS = 10000;
    for await (const intent of stripe.paymentIntents.list({
      limit: 100,
      created: { gte: since },
    })) {
      scanned += 1;
      if (scanned > MAX_SCANNED_INTENTS) break;
      if (intent.status !== "succeeded") continue;
      count += 1;
      byCurrency.set(
        intent.currency,
        (byCurrency.get(intent.currency) ?? 0) + intent.amount_received
      );
    }

    const totals =
      byCurrency.size > 0
        ? Array.from(byCurrency, ([currency, amount]) => formatCurrency(amount, currency))
        : [formatCurrency(0, "usd")];
    return { state: "ok", count, totals };
  } catch (error) {
    console.error("Tips revenue lookup failed:", error);
    return { state: "error" };
  }
}

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  href?: string;
  note?: string;
  /** Last-14-day daily counts for the sparkline; omit to skip the chart. */
  trend?: number[];
  /** Accessible description for the sparkline. */
  trendLabel?: string;
  /** Visible inline error shown instead of the note when a query failed. */
  error?: string;
}

/** KPI stat card with an optional 14-day sparkline and error state. */
function StatCard({
  label,
  value,
  icon,
  href,
  note,
  trend,
  trendLabel,
  error,
}: StatCardProps): ReactElement {
  const inner = (
    <div className="h-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 transition hover:border-[var(--color-accent)]">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-[var(--color-text-secondary)] uppercase">
          {label}
        </span>
        <span className="text-[var(--color-text-secondary)]" aria-hidden>
          {icon}
        </span>
      </div>
      <div className="text-3xl font-bold text-[var(--color-text-primary)] tabular-nums">
        {value}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-[var(--color-error)]">{error}</p>
      ) : (
        note && <p className="mt-1.5 text-xs text-[var(--color-text-secondary)]">{note}</p>
      )}
      {trend && trend.length > 0 && trend.some((v) => v > 0) && (
        <div className="mt-3">
          <Sparkline points={trend} label={trendLabel ?? `${label}, last ${TREND_DAYS} days`} />
        </div>
      )}
    </div>
  );
  return href ? (
    <Link
      href={href}
      className="rounded-xl focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      {inner}
    </Link>
  ) : (
    inner
  );
}

/** Tips revenue card rendered from the tri-state Stripe lookup. */
function TipsCard({ revenue }: { revenue: TipsRevenue }): ReactElement {
  return (
    <div className="h-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-[var(--color-text-secondary)] uppercase">
          Tips (30d)
        </span>
        <span className="text-[var(--color-text-secondary)]" aria-hidden>
          <HandCoins className="h-4 w-4" />
        </span>
      </div>
      {revenue.state === "unconfigured" && (
        <p className="text-sm text-[var(--color-text-secondary)]">Tipping not configured</p>
      )}
      {revenue.state === "error" && (
        <p className="text-sm text-[var(--color-text-secondary)]">Revenue unavailable</p>
      )}
      {revenue.state === "ok" && (
        <>
          {/* --color-text-primary, not --color-celebration: DLS-1.0 reserves
              celebration for learner-positive moments, never admin chrome. */}
          <div className="text-3xl font-bold text-[var(--color-text-primary)] tabular-nums">
            {revenue.totals.join(" + ")}
          </div>
          <p className="mt-1.5 text-xs text-[var(--color-text-secondary)] tabular-nums">
            {revenue.count} {revenue.count === 1 ? "tip" : "tips"} in the last 30 days
          </p>
        </>
      )}
    </div>
  );
}

const QUICK_LINKS = [
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/content", label: "Content", icon: BookOpen },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/admin/annotations", label: "Moderation", icon: Flag },
  { href: "/admin/local", label: "Local", icon: HardDrive },
] as const;

/**
 * Admin Overview dashboard: KPI stat cards with 14-day sparklines,
 * 30-day tips revenue, an events-per-day line chart, recent feedback,
 * and quick links to the other admin sections. Server Component;
 * all queries run under the admin user's RLS-enforced session.
 */
export default async function AdminOverviewPage(): Promise<ReactElement> {
  const supabase = await createClient();

  const trendSinceIso = new Date(Date.now() - TREND_DAYS * DAY_MS).toISOString();
  const todayStartIso = new Date(Math.floor(Date.now() / DAY_MS) * DAY_MS).toISOString();

  const [
    profilesCountRes,
    eventsCountRes,
    feedbackCountRes,
    eventsTodayRes,
    eventTimestampsRes,
    profileTrendRes,
    feedbackTrendRes,
    recentFeedbackRes,
    tipsRevenue,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("analytics_events").select("*", { count: "exact", head: true }),
    supabase.from("feedback").select("*", { count: "exact", head: true }),
    supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .gte("timestamp", todayStartIso),
    // Order newest-first so the .limit() truncation deterministically drops
    // the oldest rows instead of an arbitrary Postgres subset (matches
    // analytics/page.tsx).
    supabase
      .from("analytics_events")
      .select("timestamp")
      .gte("timestamp", trendSinceIso)
      .order("timestamp", { ascending: false })
      .limit(10000),
    supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", trendSinceIso)
      .order("created_at", { ascending: false })
      .limit(10000),
    supabase
      .from("feedback")
      .select("created_at")
      .gte("created_at", trendSinceIso)
      .order("created_at", { ascending: false })
      .limit(10000),
    supabase
      .from("feedback")
      .select("id, message, category, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    getTipsRevenue(),
  ]);

  const queryError = (label: string, error: { message: string } | null): string | undefined => {
    if (!error) return undefined;
    console.error(`Admin overview: ${label} query failed:`, error.message);
    return "Query failed — check RLS";
  };

  const eventSeries = bucketByDay(eventTimestampsRes.data ?? [], TREND_DAYS);
  const profileSeries = bucketByDay(
    (profileTrendRes.data ?? []).map((row) => ({ timestamp: row.created_at as string })),
    TREND_DAYS
  );
  const feedbackSeries = bucketByDay(
    (feedbackTrendRes.data ?? []).map((row) => ({ timestamp: row.created_at as string })),
    TREND_DAYS
  );

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Overview</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Live platform data — refreshes on each page load.
        </p>
      </div>

      {/* KPI stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Users"
          value={formatCount(profilesCountRes.count ?? 0)}
          icon={<Users className="h-4 w-4" />}
          href="/admin/users"
          note="Created profiles"
          trend={profileSeries.map((p) => p.value)}
          trendLabel={`New profiles per day, last ${TREND_DAYS} days`}
          error={queryError("profiles count", profilesCountRes.error)}
        />
        <StatCard
          label="Events"
          value={formatCount(eventsCountRes.count ?? 0)}
          icon={<BarChart2 className="h-4 w-4" />}
          href="/admin/analytics"
          note="Consent-gated, aggregated"
          trend={eventSeries.map((p) => p.value)}
          trendLabel={`Analytics events per day, last ${TREND_DAYS} days`}
          error={queryError("events count", eventsCountRes.error)}
        />
        <StatCard
          label="Feedback"
          value={formatCount(feedbackCountRes.count ?? 0)}
          icon={<MessageSquare className="h-4 w-4" />}
          href="/admin/feedback"
          note="All-time submissions"
          trend={feedbackSeries.map((p) => p.value)}
          trendLabel={`Feedback per day, last ${TREND_DAYS} days`}
          error={queryError("feedback count", feedbackCountRes.error)}
        />
        <StatCard
          label="Events today"
          value={formatCount(eventsTodayRes.count ?? 0)}
          icon={<Zap className="h-4 w-4" />}
          note="Since midnight UTC"
          error={queryError("events today", eventsTodayRes.error)}
        />
        <TipsCard revenue={tipsRevenue} />
      </div>

      {/* Events per day */}
      <div className="mb-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <h2 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
          Events per day — last {TREND_DAYS} days
        </h2>
        {eventTimestampsRes.error ? (
          <p className="py-6 text-center text-sm text-[var(--color-error)]">
            Couldn&apos;t load events — check the admin RLS policy and try again.
          </p>
        ) : eventSeries.every((p) => p.value === 0) ? (
          <p className="py-6 text-center text-sm text-[var(--color-text-secondary)]">
            No events yet — data appears as users opt in.
          </p>
        ) : (
          <LineChart
            series={eventSeries}
            label={`Analytics events per day for the last ${TREND_DAYS} days`}
            valueFormat={formatCount}
          />
        )}
      </div>

      {/* Recent feedback */}
      <div className="mb-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Recent Feedback
          </h2>
          <Link
            href="/admin/feedback"
            className="flex min-h-12 items-center rounded-lg px-2 text-xs text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
          >
            View all →
          </Link>
        </div>

        {recentFeedbackRes.error ? (
          <p className="py-6 text-center text-sm text-[var(--color-error)]">
            Couldn&apos;t load feedback — check the admin RLS policy and try again.
          </p>
        ) : !recentFeedbackRes.data || recentFeedbackRes.data.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--color-text-secondary)]">
            No feedback yet — submissions appear here as they arrive.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {recentFeedbackRes.data.map((fb) => (
              <li key={fb.id as string} className="flex items-start gap-3 py-3">
                <span
                  className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium tracking-wide uppercase ${
                    fb.category === "bug"
                      ? "bg-[var(--color-error)]/15 text-[var(--color-error)]"
                      : fb.category === "feature"
                        ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
                        : fb.category === "content"
                          ? "bg-[var(--color-warning)]/15 text-[var(--color-warning)]"
                          : "bg-[var(--color-border)] text-[var(--color-text-secondary)]"
                  }`}
                >
                  {fb.category as string}
                </span>
                <p className="line-clamp-2 flex-1 text-sm text-[var(--color-text-primary)]">
                  {fb.message as string}
                </p>
                <time className="shrink-0 text-xs text-[var(--color-text-secondary)] tabular-nums">
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                  }).format(new Date(fb.created_at as string))}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick links */}
      <nav aria-label="Admin sections" className="flex flex-wrap gap-3">
        {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex min-h-12 items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 text-sm text-[var(--color-text-secondary)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
