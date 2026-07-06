import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import { User, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LineChart } from "@/app/admin/_components/charts";
import { bucketByDay, formatCount } from "@/app/admin/_lib/data";

const PAGE_SIZE = 25;
const DAY_MS = 24 * 60 * 60 * 1000;
const SIGNUP_WINDOW_DAYS = 30;
// Bounded fetch for the chart: 10k signups/30d is far beyond current scale,
// and rows are 1 column, so this stays cheap while surviving growth.
const SIGNUP_FETCH_LIMIT = 10_000;

interface ProfileRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface PageSearchParams {
  page?: string | string[];
}

const joinedDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** Parses the ?page= search param into a 1-based page number (min 1). */
function parsePage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
}

function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}): ReactElement {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
      <span className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
        {label}
      </span>
      <div className="mt-3 text-3xl font-bold text-[var(--color-text-primary)] tabular-nums">
        {value}
      </div>
      {note && <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">{note}</p>}
    </div>
  );
}

function QueryError({ scope, message }: { scope: string; message: string }): ReactElement {
  return (
    <div className="rounded-xl border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-4 text-sm text-[var(--color-error)]">
      <strong>{scope} query failed:</strong> {message}
    </div>
  );
}

/** Prev/Next pagination link; renders a non-interactive disabled control at bounds. */
function PageLink({
  page,
  disabled,
  children,
  rel,
}: {
  page: number;
  disabled: boolean;
  children: ReactNode;
  rel: "prev" | "next";
}): ReactElement {
  const base =
    "inline-flex min-h-12 min-w-12 items-center justify-center gap-1.5 rounded-lg border px-4 text-sm transition";
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={`${base} cursor-not-allowed border-[var(--color-border)] text-[var(--color-text-muted)] opacity-50`}
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={`/admin/users?page=${page}`}
      rel={rel}
      className={`${base} border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:outline-none`}
    >
      {children}
    </Link>
  );
}

/**
 * Admin Users page: signup KPIs, a 30-day signups/day line chart, and a
 * paginated profiles table (25/page via the ?page= search param).
 *
 * All reads go through the admin session's RLS — no service role.
 */
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}): Promise<ReactElement> {
  const { page: rawPage } = await searchParams;
  const supabase = await createClient();

  const now = Date.now();
  const todayStartIso = new Date(Math.floor(now / DAY_MS) * DAY_MS).toISOString();
  const weekAgoIso = new Date(now - 7 * DAY_MS).toISOString();
  const windowStartIso = new Date(
    Math.floor(now / DAY_MS) * DAY_MS - (SIGNUP_WINDOW_DAYS - 1) * DAY_MS
  ).toISOString();

  const [totalResult, weekResult, todayResult, signupsResult] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgoIso),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayStartIso),
    supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", windowStartIso)
      .order("created_at", { ascending: true })
      .limit(SIGNUP_FETCH_LIMIT),
  ]);

  const totalUsers = totalResult.count ?? 0;

  // Clamp the requested page to real bounds before the range() query so a
  // stale/hand-typed ?page= never produces a Supabase out-of-range error.
  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));
  const page = Math.min(parsePage(rawPage), totalPages);
  const from = (page - 1) * PAGE_SIZE;

  const pageResult = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  const errors: { scope: string; message: string }[] = [];
  if (totalResult.error) errors.push({ scope: "Total users", message: totalResult.error.message });
  if (weekResult.error) errors.push({ scope: "New this week", message: weekResult.error.message });
  if (todayResult.error) errors.push({ scope: "New today", message: todayResult.error.message });
  if (signupsResult.error)
    errors.push({ scope: "Signup chart", message: signupsResult.error.message });
  if (pageResult.error) errors.push({ scope: "Profiles table", message: pageResult.error.message });

  const signupSeries = bucketByDay(
    (signupsResult.data ?? []).map((row: { created_at: string }) => ({
      timestamp: row.created_at,
    })),
    SIGNUP_WINDOW_DAYS
  );

  const profiles: ProfileRow[] = (pageResult.data as ProfileRow[] | null) ?? [];
  const tableCount = pageResult.count ?? totalUsers;
  const rangeStart = tableCount === 0 ? 0 : from + 1;
  const rangeEnd = Math.min(from + profiles.length, tableCount);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Users</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Profiles read via RLS with the admin session — no service role.
        </p>
      </div>

      {errors.length > 0 && (
        <div className="mb-6 flex flex-col gap-3">
          {errors.map((e) => (
            <QueryError key={e.scope} scope={e.scope} message={e.message} />
          ))}
        </div>
      )}

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total users" value={formatCount(totalUsers)} />
        <StatCard
          label="New this week"
          value={formatCount(weekResult.count ?? 0)}
          note="Rolling 7 days"
        />
        <StatCard
          label="New today"
          value={formatCount(todayResult.count ?? 0)}
          note="Since midnight UTC"
        />
      </div>

      {/* Signups chart */}
      <section className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <h2 className="mb-4 text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
          Signups per day — last {SIGNUP_WINDOW_DAYS} days
        </h2>
        {signupSeries.every((point) => point.value === 0) ? (
          <p className="flex min-h-12 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
            No signups in the last {SIGNUP_WINDOW_DAYS} days — new accounts will appear here.
          </p>
        ) : (
          <LineChart
            series={signupSeries}
            label={`Daily signups over the last ${SIGNUP_WINDOW_DAYS} days`}
            valueFormat={formatCount}
          />
        )}
      </section>

      {/* Profiles table */}
      {profiles.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] py-16 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">No profiles yet.</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            New signups appear here as soon as accounts are created.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] text-left">
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase"
                  >
                    User ID
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase"
                  >
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {profiles.map((profile) => (
                  <tr key={profile.id} className="transition hover:bg-[var(--color-bg-surface)]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-bg-surface)]">
                          {profile.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={profile.avatar_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4 text-[var(--color-text-muted)]" aria-hidden />
                          )}
                        </div>
                        <span className="text-[var(--color-text-primary)]">
                          {profile.display_name ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-4 py-3 font-mono text-xs text-[var(--color-text-muted)]"
                      title={profile.id}
                    >
                      {profile.id.slice(0, 12)}…
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-[var(--color-text-secondary)] tabular-nums">
                      {joinedDate.format(new Date(profile.created_at))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <nav
            aria-label="Users pagination"
            className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3"
          >
            <p className="text-xs text-[var(--color-text-muted)] tabular-nums">
              Showing {rangeStart}–{rangeEnd} of {tableCount}
            </p>
            <div className="flex items-center gap-2">
              <PageLink page={page - 1} disabled={page <= 1} rel="prev">
                <ChevronLeft className="h-4 w-4" aria-hidden />
                Prev
              </PageLink>
              <span className="px-2 text-xs text-[var(--color-text-secondary)] tabular-nums">
                Page {page} of {totalPages}
              </span>
              <PageLink page={page + 1} disabled={page >= totalPages} rel="next">
                Next
                <ChevronRight className="h-4 w-4" aria-hidden />
              </PageLink>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
