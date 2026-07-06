import type { ReactElement } from "react";

import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { formatCount } from "@/app/admin/_lib/data";

/** Feedback row shape as selected from the `feedback` table. */
interface FeedbackRow {
  id: string;
  user_id: string | null;
  message: string;
  category: string | null;
  page_url: string | null;
  created_at: string;
}

interface FeedbackSearchParams {
  category?: string;
  page?: string;
}

const PAGE_SIZE = 25;

/** Known feedback categories — drives filter chips and per-category KPI counts. */
const CATEGORIES = ["bug", "feature", "content", "general"] as const;

/** Per-category chip accents; unknown categories fall back to the muted style. */
const CATEGORY_STYLES: Record<string, string> = {
  bug: "border-[var(--color-error)]/40 text-[var(--color-error)]",
  feature: "border-[var(--color-accent)]/40 text-[var(--color-accent)]",
  content: "border-[var(--color-warning)]/40 text-[var(--color-warning)]",
  general: "border-[var(--color-border)] text-[var(--color-text-secondary)]",
};

/** Formats an ISO timestamp as a relative phrase ("3 hours ago"), falling back to a short date beyond ~30 days. */
function relativeTime(iso: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return iso;

  const diff = ms - Date.now();
  const abs = Math.abs(diff);
  const MINUTE = 60_000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;

  if (abs < MINUTE) return "just now";

  const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
  if (abs < HOUR) return rtf.format(Math.round(diff / MINUTE), "minute");
  if (abs < DAY) return rtf.format(Math.round(diff / HOUR), "hour");
  if (abs < 30 * DAY) return rtf.format(Math.round(diff / DAY), "day");

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(ms));
}

/** Builds the /admin/feedback href for a given filter + page, omitting default params. */
function feedbackHref(category: string | null, page: number): string {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/feedback?${qs}` : "/admin/feedback";
}

/** Small stat chip for the KPI row. */
function KpiChip({ label, value }: { label: string; value: number }): ReactElement {
  return (
    <div className="flex items-baseline gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2">
      <span className="text-lg font-semibold text-[var(--color-text-primary)] tabular-nums">
        {formatCount(value)}
      </span>
      <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
    </div>
  );
}

/**
 * Admin feedback page: KPI counts, category filter (?category=), and a
 * paginated table (?page=, 25/page) of feedback rows read via RLS.
 */
export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<FeedbackSearchParams>;
}): Promise<ReactElement> {
  const params = await searchParams;

  const rawCategory = params.category ?? null;
  const activeCategory = CATEGORIES.includes(rawCategory as (typeof CATEGORIES)[number])
    ? rawCategory
    : null;

  const parsedPage = Number.parseInt(params.page ?? "1", 10);
  const requestedPage = Number.isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);

  const supabase = await createClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [totalRes, weekRes, ...categoryResults] = await Promise.all([
    supabase.from("feedback").select("id", { count: "exact", head: true }),
    supabase
      .from("feedback")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgo),
    ...CATEGORIES.map((cat) =>
      supabase.from("feedback").select("id", { count: "exact", head: true }).eq("category", cat)
    ),
  ]);

  const categoryCounts = CATEGORIES.map((cat, i) => ({
    category: cat,
    count: categoryResults[i]?.count ?? 0,
  }));

  // Clamp the requested page to real bounds before .range() so a stale or
  // hand-typed ?page= never produces a PostgREST PGRST103 out-of-range error
  // (mirrors users/page.tsx). Filtered count reuses the head-count queries.
  const filteredCount = activeCategory
    ? (categoryCounts.find((c) => c.category === activeCategory)?.count ?? 0)
    : (totalRes.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let listQuery = supabase
    .from("feedback")
    .select("id, user_id, message, category, page_url, created_at")
    .order("created_at", { ascending: false })
    .range(from, to);
  if (activeCategory) {
    listQuery = listQuery.eq("category", activeCategory);
  }
  const listRes = await listQuery;

  const errors = [
    listRes.error,
    totalRes.error,
    weekRes.error,
    ...categoryResults.map((r) => r.error),
  ]
    .filter((e): e is NonNullable<typeof e> => e != null)
    .map((e) => e.message);
  if (errors.length > 0) {
    // Surface every distinct failure; never swallow query errors.
    console.error("[admin/feedback] query error(s):", errors);
  }

  const rows: FeedbackRow[] = (listRes.data ?? []) as FeedbackRow[];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Feedback</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Learner-submitted feedback, read via RLS — no service role.
        </p>
      </div>

      {errors.length > 0 && (
        <div className="mb-6 rounded-xl border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-4 text-sm text-[var(--color-error)]">
          <strong>Query error:</strong> {[...new Set(errors)].join("; ")}
        </div>
      )}

      {/* KPI row */}
      <div className="mb-6 flex flex-wrap gap-2">
        <KpiChip label="total" value={totalRes.count ?? 0} />
        <KpiChip label="this week" value={weekRes.count ?? 0} />
        {categoryCounts.map(({ category, count }) => (
          <KpiChip key={category} label={category} value={count} />
        ))}
      </div>

      {/* Category filter chips (plain links; server-side .eq when set) */}
      <nav aria-label="Filter feedback by category" className="mb-6 flex flex-wrap gap-2">
        {[null, ...CATEGORIES].map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <Link
              key={cat ?? "all"}
              href={feedbackHref(cat, 1)}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex min-h-12 items-center rounded-full border px-4 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${
                isActive
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15 font-medium text-[var(--color-accent)]"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {cat ?? "All"}
            </Link>
          );
        })}
      </nav>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-surface)] py-16 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">No feedback yet</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {activeCategory
              ? `No ${activeCategory} feedback — try another category.`
              : "Submissions appear here as learners send feedback."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] text-left">
                <th
                  scope="col"
                  className="px-4 py-3 text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase"
                >
                  Message
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-3 text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase lg:table-cell"
                >
                  Page
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-3 text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase sm:table-cell"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase"
                >
                  Sent
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {rows.map((fb) => (
                <tr key={fb.id}>
                  <td className="px-4 py-3 text-[var(--color-text-primary)]">
                    <p className="max-w-prose break-words whitespace-pre-wrap">{fb.message}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium tracking-wide uppercase ${
                        CATEGORY_STYLES[fb.category ?? "general"] ?? CATEGORY_STYLES.general
                      }`}
                    >
                      {fb.category ?? "general"}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span
                      title={fb.page_url ?? undefined}
                      className="block max-w-[180px] truncate font-mono text-xs text-[var(--color-text-muted)]"
                    >
                      {fb.page_url ?? "—"}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span
                      title={fb.user_id ?? undefined}
                      className="block max-w-[100px] truncate font-mono text-xs text-[var(--color-text-muted)]"
                    >
                      {fb.user_id ? `${fb.user_id.slice(0, 8)}…` : "anon"}
                    </span>
                  </td>
                  <td
                    title={fb.created_at}
                    className="px-4 py-3 text-right text-xs whitespace-nowrap text-[var(--color-text-secondary)]"
                  >
                    {relativeTime(fb.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredCount > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-xs text-[var(--color-text-muted)] tabular-nums">
            Page {page} of {totalPages} — {formatCount(filteredCount)} total
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={feedbackHref(activeCategory, page - 1)}
                className="inline-flex min-h-12 items-center rounded-lg border border-[var(--color-border)] px-4 text-sm text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              >
                ← Previous
              </Link>
            ) : (
              <span className="inline-flex min-h-12 items-center rounded-lg border border-[var(--color-border)] px-4 text-sm text-[var(--color-text-muted)] opacity-50">
                ← Previous
              </span>
            )}
            {page < totalPages ? (
              <Link
                href={feedbackHref(activeCategory, page + 1)}
                className="inline-flex min-h-12 items-center rounded-lg border border-[var(--color-border)] px-4 text-sm text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              >
                Next →
              </Link>
            ) : (
              <span className="inline-flex min-h-12 items-center rounded-lg border border-[var(--color-border)] px-4 text-sm text-[var(--color-text-muted)] opacity-50">
                Next →
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
