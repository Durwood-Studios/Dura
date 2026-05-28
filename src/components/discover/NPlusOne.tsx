"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";

/**
 * NPlusOne — side-by-side visualizer of the N+1 query problem.
 *
 * Pedagogical bet: the naive ORM pattern ("for each user, fetch their posts")
 * looks innocent in code and runs fine in development with 5 fake users.
 * Production data (50, 100, 200 real users) is what surfaces the bug — and
 * at that point the dashboard is already slow, the bill is already higher,
 * and the on-call engineer is staring at a flame graph. The fix is one line:
 * a JOIN, an IN clause, or an ORM eager-load directive.
 *
 * The learner runs both patterns side-by-side, watches the round-trip cost
 * accumulate linearly on the naive side, then sees the optimized side land
 * in one query. Multi-run sparkline shows the curve. Completion fires after
 * both patterns have been run with at least 50 users.
 */

const MIN_USERS = 5;
const MAX_USERS = 200;
const MIN_LATENCY = 1;
const MAX_LATENCY = 50;
const COMPLETION_THRESHOLD = 50;
const TICK_MS = 40;
const MAX_VISIBLE_USERS = 12; // beyond this we collapse the list

interface RunState {
  /** Whether this side has finished its simulated run. */
  done: boolean;
  /** Number of queries issued so far. */
  queries: number;
  /** Total simulated time elapsed (ms). */
  elapsed: number;
  /** Index of the user currently being fetched (naive mode); -1 if not running. */
  cursorUser: number;
  /** Query log lines, most recent at the bottom. */
  log: QueryLogEntry[];
  /** "DB load" — peaks while a query is in flight, decays. Cosmetic. */
  load: number;
}

interface QueryLogEntry {
  id: number;
  sql: string;
  /** Latency of this single query in ms. */
  ms: number;
}

interface HistoryPoint {
  users: number;
  naiveMs: number;
  optimizedMs: number;
}

const initialRunState = (): RunState => ({
  done: false,
  queries: 0,
  elapsed: 0,
  cursorUser: -1,
  log: [],
  load: 0,
});

/** Tiny deterministic name generator so the fake users feel real. */
const FIRST_NAMES = [
  "Ada",
  "Linus",
  "Grace",
  "Alan",
  "Margaret",
  "Dennis",
  "Ken",
  "Brian",
  "Donald",
  "Edsger",
  "John",
  "Barbara",
  "Tim",
  "Vint",
  "Radia",
  "Hedy",
];
const LAST_NAMES = [
  "Lovelace",
  "Torvalds",
  "Hopper",
  "Turing",
  "Hamilton",
  "Ritchie",
  "Thompson",
  "Kernighan",
  "Knuth",
  "Dijkstra",
  "McCarthy",
  "Liskov",
  "Berners-Lee",
  "Cerf",
  "Perlman",
  "Lamarr",
];

function userName(i: number): string {
  const first = FIRST_NAMES[i % FIRST_NAMES.length] ?? "User";
  const last = LAST_NAMES[(i * 7) % LAST_NAMES.length] ?? "Doe";
  return `${first} ${last}`;
}

/** Tiny LCG for stable post counts per user index across renders. */
function postCountFor(i: number): number {
  // 0–4 posts; the exact count doesn't matter pedagogically, but the variation
  // makes the list feel like real data rather than a sequence.
  const seed = (i * 9301 + 49297) % 233280;
  return Math.floor((seed / 233280) * 5);
}

const NAIVE_COLOR = "#fb7185";
const OPTIMIZED_COLOR = "#34d399";

/** Format ms with appropriate precision. */
function fmt(ms: number): string {
  if (ms < 10) return `${ms.toFixed(1)} ms`;
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function NPlusOne(): React.ReactElement {
  const [users, setUsers] = useState(20);
  const [latency, setLatency] = useState(8);
  const [naive, setNaive] = useState<RunState>(initialRunState);
  const [optimized, setOptimized] = useState<RunState>(initialRunState);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [showSql, setShowSql] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const queryIdRef = useRef(0);
  const naiveDoneRef = useRef(false);
  const optimizedDoneRef = useRef(false);
  /** Tracks whether learner has run both modes with >= COMPLETION_THRESHOLD users. */
  const naiveOver50Ref = useRef(false);
  const optimizedOver50Ref = useRef(false);
  const completedRef = useRef(false);

  const stop = useCallback((): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const reset = useCallback((): void => {
    stop();
    setNaive(initialRunState());
    setOptimized(initialRunState());
    queryIdRef.current = 0;
    naiveDoneRef.current = false;
    optimizedDoneRef.current = false;
  }, [stop]);

  const resetAll = useCallback((): void => {
    reset();
    setHistory([]);
    naiveOver50Ref.current = false;
    optimizedOver50Ref.current = false;
    completedRef.current = false;
  }, [reset]);

  /**
   * Run both naive and optimized simulations side-by-side. The simulation is
   * step-based: every TICK_MS we advance each side by roughly `latency` ms of
   * "simulated time" — so a higher latency setting + more users makes the
   * naive side visibly accumulate queries while optimized lands in one.
   */
  const runBoth = useCallback((): void => {
    if (running) return;
    reset();

    const nUsers = users;
    const lat = latency;
    // Naive: 1 query for the user list, then nUsers queries (one per user).
    const naiveTotalQueries = 1 + nUsers;
    // Optimized: 1 query for the user list, 1 query for ALL posts via IN clause.
    const optimizedTotalQueries = 2;

    let naiveIssued = 0;
    let optimizedIssued = 0;
    /** Simulated ms elapsed on the naive side at the moment of the next query. */
    let naiveSimMs = 0;
    let optimizedSimMs = 0;

    setRunning(true);
    queryIdRef.current = 0;

    intervalRef.current = setInterval(() => {
      let bothDone = true;

      // ── Naive side ────────────────────────────────────────────────────
      if (naiveIssued < naiveTotalQueries) {
        const id = ++queryIdRef.current;
        const isUserList = naiveIssued === 0;
        const userIdx = naiveIssued - 1; // 0-based once we're past the user-list query
        const sql = isUserList
          ? "SELECT id, name FROM users"
          : `SELECT id, title FROM posts WHERE user_id = ${userIdx + 1}`;
        naiveSimMs += lat;
        const entry: QueryLogEntry = { id, sql, ms: lat };
        naiveIssued++;
        const cursor = isUserList ? -1 : userIdx;
        const finished = naiveIssued >= naiveTotalQueries;
        setNaive((prev) => ({
          done: finished,
          queries: prev.queries + 1,
          elapsed: naiveSimMs,
          cursorUser: cursor,
          // keep log bounded for huge runs
          log: prev.log.length > 24 ? [...prev.log.slice(-24), entry] : [...prev.log, entry],
          load: Math.min(1, 0.55 + Math.random() * 0.45),
        }));
        if (!finished) bothDone = false;
      } else if (!naiveDoneRef.current) {
        naiveDoneRef.current = true;
        // decay the load bar one final tick
        setNaive((prev) => ({ ...prev, load: 0 }));
      }

      // ── Optimized side ────────────────────────────────────────────────
      if (optimizedIssued < optimizedTotalQueries) {
        const id = ++queryIdRef.current;
        const isUserList = optimizedIssued === 0;
        const idList = Array.from({ length: nUsers }, (_, i) => i + 1).join(", ");
        const sql = isUserList
          ? "SELECT id, name FROM users"
          : `SELECT user_id, id, title FROM posts WHERE user_id IN (${
              idList.length > 48 ? idList.slice(0, 45) + "…" : idList
            })`;
        // The optimized "all posts" query is heavier than a single naive query
        // (it pulls more rows) but still way cheaper than nUsers round-trips.
        // Use ~1.5× single-query latency for the joined query — round trip is
        // what kills the naive version, not bytes transferred.
        const optMs = isUserList ? lat : lat * 1.5;
        optimizedSimMs += optMs;
        const entry: QueryLogEntry = { id, sql, ms: optMs };
        optimizedIssued++;
        const finished = optimizedIssued >= optimizedTotalQueries;
        setOptimized((prev) => ({
          done: finished,
          queries: prev.queries + 1,
          elapsed: optimizedSimMs,
          cursorUser: -1,
          log: prev.log.length > 8 ? [...prev.log.slice(-8), entry] : [...prev.log, entry],
          load: Math.min(1, 0.55 + Math.random() * 0.45),
        }));
        if (!finished) bothDone = false;
      } else if (!optimizedDoneRef.current) {
        optimizedDoneRef.current = true;
        setOptimized((prev) => ({ ...prev, load: 0 }));
      }

      if (bothDone) {
        // Record history point
        setHistory((prev) => {
          const next: HistoryPoint = {
            users: nUsers,
            naiveMs: naiveSimMs,
            optimizedMs: optimizedSimMs,
          };
          // keep the most recent 16 runs
          return prev.length >= 16 ? [...prev.slice(-15), next] : [...prev, next];
        });

        // Completion tracking: BOTH modes need to have run with >= threshold users.
        if (nUsers >= COMPLETION_THRESHOLD) {
          naiveOver50Ref.current = true;
          optimizedOver50Ref.current = true;
        }
        if (naiveOver50Ref.current && optimizedOver50Ref.current && !completedRef.current) {
          completedRef.current = true;
          markActivityComplete("n-plus-one");
        }

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setRunning(false);
      }
    }, TICK_MS);
  }, [running, reset, users, latency]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Derived stats for the gap callout
  const gap = useMemo(() => {
    if (!naive.done || !optimized.done) return null;
    const ratio = optimized.elapsed > 0 ? naive.elapsed / optimized.elapsed : 0;
    return {
      queryGap: naive.queries - optimized.queries,
      msGap: naive.elapsed - optimized.elapsed,
      ratio,
    };
  }, [naive, optimized]);

  // Build the user list (memoized so it doesn't churn while typing).
  const userList = useMemo(
    () =>
      Array.from({ length: users }, (_, i) => ({
        id: i + 1,
        name: userName(i),
        postCount: postCountFor(i),
      })),
    [users]
  );

  return (
    <div className="space-y-6">
      {/* ─── Controls ───────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-5 py-4">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <div className="flex items-baseline justify-between">
              <label
                htmlFor="np-users"
                className="text-sm font-medium text-[var(--color-text-primary)]"
              >
                Users in dataset
              </label>
              <span className="font-mono text-sm text-[var(--color-text-primary)]">{users}</span>
            </div>
            <input
              id="np-users"
              type="range"
              min={MIN_USERS}
              max={MAX_USERS}
              value={users}
              onChange={(e) => {
                setUsers(Number(e.target.value));
                if (!running) reset();
              }}
              disabled={running}
              className="mt-2 w-full accent-[var(--color-accent)] disabled:opacity-60"
            />
            <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
              In dev you see 5. In prod you see 200. Same code, different pain.
            </p>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <label
                htmlFor="np-latency"
                className="text-sm font-medium text-[var(--color-text-primary)]"
              >
                Round-trip latency per query
              </label>
              <span className="font-mono text-sm text-[var(--color-text-primary)]">
                {latency} ms
              </span>
            </div>
            <input
              id="np-latency"
              type="range"
              min={MIN_LATENCY}
              max={MAX_LATENCY}
              value={latency}
              onChange={(e) => {
                setLatency(Number(e.target.value));
                if (!running) reset();
              }}
              disabled={running}
              className="mt-2 w-full accent-[var(--color-accent)] disabled:opacity-60"
            />
            <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
              1 ms = same-host SQLite. 50 ms = a database in another region.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={runBoth}
            disabled={running}
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
          >
            {running ? "Running…" : "Run both"}
          </button>
          <button
            type="button"
            onClick={resetAll}
            disabled={running}
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-subtle)] disabled:opacity-50"
          >
            Reset
          </button>
          <span className="ml-auto text-xs text-[var(--color-text-muted)]">
            {history.length > 0
              ? `${history.length} run${history.length === 1 ? "" : "s"} recorded`
              : "No runs yet — try 5, then 50, then 200."}
          </span>
        </div>
      </div>

      {/* ─── Side-by-side panels ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SidePanel
          title="Naive (N+1)"
          subtitle={`1 query for users + N queries for posts = ${1 + users}`}
          color={NAIVE_COLOR}
          state={naive}
          users={userList}
          highlightCursor
        />
        <SidePanel
          title="Optimized (single round-trip)"
          subtitle="1 query for users + 1 IN-clause query for posts = 2"
          color={OPTIMIZED_COLOR}
          state={optimized}
          users={userList}
          highlightCursor={false}
        />
      </div>

      {/* ─── Gap callout ────────────────────────────────────────────────── */}
      {gap !== null && (
        <div
          className="rounded-xl border px-5 py-4"
          style={{
            borderColor: `${OPTIMIZED_COLOR}55`,
            backgroundColor: `${OPTIMIZED_COLOR}0d`,
          }}
        >
          <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
            <Stat
              label="Query-count gap"
              value={`${gap.queryGap}`}
              hint={`naive issued ${naive.queries}, optimized issued ${optimized.queries}`}
            />
            <Stat
              label="Time gap"
              value={fmt(gap.msGap)}
              hint={`naive: ${fmt(naive.elapsed)} · optimized: ${fmt(optimized.elapsed)}`}
            />
            <Stat
              label="Naive ÷ Optimized"
              value={gap.ratio >= 100 ? `${Math.round(gap.ratio)}×` : `${gap.ratio.toFixed(1)}×`}
              hint="grows linearly with users"
            />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            With <span className="font-mono">{users}</span> users at{" "}
            <span className="font-mono">{latency} ms</span> per round-trip, the naive pattern issued{" "}
            <span className="font-mono">{naive.queries}</span> queries; the optimized pattern issued{" "}
            <span className="font-mono">2</span>. Double the user count and the naive side roughly
            doubles its time. The optimized side barely moves.
          </p>
        </div>
      )}

      {/* ─── History sparkline ──────────────────────────────────────────── */}
      {history.length >= 2 && <HistoryChart history={history} />}

      {/* ─── The antidote ───────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
              The antidote
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              The fix is one line in every major ORM.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSql((s) => !s)}
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-subtle)]"
            aria-expanded={showSql}
          >
            {showSql ? "Hide" : "Reveal"} the fix
          </button>
        </div>

        {showSql && (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <CodeBlock
              label="Naive (N+1) — looks fine, ships fine, scales badly"
              accent={NAIVE_COLOR}
              code={`# Django\nusers = User.objects.all()\nfor u in users:\n    print(u.posts.all())  # 1 query per user\n\n# Prisma\nconst users = await prisma.user.findMany()\nfor (const u of users) {\n  const posts = await prisma.post\n    .findMany({ where: { userId: u.id } })\n}`}
            />
            <CodeBlock
              label="Eager-load — one query, one round-trip"
              accent={OPTIMIZED_COLOR}
              code={`# Django\nusers = User.objects.prefetch_related("posts")\nfor u in users:\n    print(u.posts.all())  # cached, 0 extra queries\n\n# Prisma\nconst users = await prisma.user.findMany({\n  include: { posts: true },\n})\n\n-- Raw SQL\nSELECT u.id, u.name, p.id, p.title\nFROM users u\nLEFT JOIN posts p ON p.user_id = u.id`}
            />
          </div>
        )}
      </div>

      {/* ─── Pedagogical note ───────────────────────────────────────────── */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-5 py-4">
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          <strong className="text-[var(--color-text-primary)]">What you&rsquo;re seeing:</strong>{" "}
          the most common backend performance bug in the world. At 5 users you can&rsquo;t see it;
          at 200 users it&rsquo;s a 100× slowdown. ORMs hide it because{" "}
          <span className="font-mono">user.posts</span> looks like a property access, not a network
          call. The fix has names — <span className="font-mono">prefetch_related</span> (Django),{" "}
          <span className="font-mono">include</span> (Prisma),{" "}
          <span className="font-mono">with</span> (Laravel),{" "}
          <span className="font-mono">DataLoader</span> (GraphQL) — and every one of them does the
          same thing: collect the IDs, fire one query, distribute the results.
        </p>
      </div>
    </div>
  );
}

/** ──── Side panel ─────────────────────────────────────────────────────── */

interface UserRow {
  id: number;
  name: string;
  postCount: number;
}

interface SidePanelProps {
  title: string;
  subtitle: string;
  color: string;
  state: RunState;
  users: UserRow[];
  highlightCursor: boolean;
}

function SidePanel({
  title,
  subtitle,
  color,
  state,
  users,
  highlightCursor,
}: SidePanelProps): React.ReactElement {
  const collapsed = users.length > MAX_VISIBLE_USERS;
  // When collapsed, show first 6 and last 3 with an ellipsis row in between
  const visibleUsers = collapsed ? [...users.slice(0, 6), ...users.slice(-3)] : users;

  return (
    <div
      className="flex flex-col rounded-xl border bg-[var(--color-bg-surface)] p-4"
      style={{ borderColor: `${color}55` }}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold" style={{ color }}>
            {title}
          </h3>
          <p className="mt-0.5 font-mono text-[11px] text-[var(--color-text-muted)]">{subtitle}</p>
        </div>
        {state.done && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
            style={{ backgroundColor: `${color}1f`, color }}
          >
            done
          </span>
        )}
      </div>

      {/* DB load bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-[10px] tracking-wide text-[var(--color-text-muted)] uppercase">
          <span>DB load</span>
          <span className="font-mono">{Math.round(state.load * 100)}%</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
          <div
            className="h-full transition-all duration-100"
            style={{
              width: `${Math.round(state.load * 100)}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-3 grid grid-cols-2 gap-2 border-b border-[var(--color-border)] pb-3 text-center">
        <div>
          <p className="font-mono text-lg font-bold text-[var(--color-text-primary)]">
            {state.queries}
          </p>
          <p className="text-[10px] tracking-wide text-[var(--color-text-muted)] uppercase">
            queries
          </p>
        </div>
        <div>
          <p className="font-mono text-lg font-bold text-[var(--color-text-primary)]">
            {fmt(state.elapsed)}
          </p>
          <p className="text-[10px] tracking-wide text-[var(--color-text-muted)] uppercase">
            total time
          </p>
        </div>
      </div>

      {/* Users list */}
      <div className="mb-3">
        <p className="mb-1.5 text-[10px] tracking-wide text-[var(--color-text-muted)] uppercase">
          Users
        </p>
        <ul className="max-h-[180px] space-y-1 overflow-y-auto pr-1">
          {visibleUsers.map((u, idx) => {
            // Determine "currently fetching" highlight (only for naive panel).
            const cursor = state.cursorUser;
            const realIdx =
              collapsed && idx >= 6 ? users.length - (visibleUsers.length - idx) : idx;
            const isCurrent = highlightCursor && cursor >= 0 && cursor === realIdx && !state.done;
            const wasFetched = highlightCursor && cursor >= 0 && realIdx <= cursor;
            // Optimized side: everyone is fetched together once query 2 fires.
            const optimizedFetched = !highlightCursor && state.queries >= 2;
            const fetched = wasFetched || optimizedFetched;
            return (
              <li
                key={u.id}
                className="flex items-center justify-between rounded px-2 py-1 text-[11px] transition-colors"
                style={{
                  backgroundColor: isCurrent
                    ? `${color}26`
                    : fetched
                      ? `${color}10`
                      : "transparent",
                  color: fetched ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                }}
              >
                <span className="truncate">
                  <span className="font-mono text-[var(--color-text-muted)]">#{u.id}</span> {u.name}
                </span>
                <span className="ml-2 shrink-0 font-mono text-[10px] text-[var(--color-text-muted)]">
                  {u.postCount} posts
                </span>
              </li>
            );
          })}
          {collapsed && (
            <li className="px-2 py-0.5 text-center text-[10px] text-[var(--color-text-muted)]">
              … {users.length - 9} more …
            </li>
          )}
        </ul>
      </div>

      {/* Query log */}
      <div className="mt-auto">
        <p className="mb-1.5 text-[10px] tracking-wide text-[var(--color-text-muted)] uppercase">
          Query log
        </p>
        <div
          className="max-h-[160px] space-y-1 overflow-y-auto rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-2"
          aria-live="polite"
        >
          {state.log.length === 0 ? (
            <p className="text-center font-mono text-[10px] text-[var(--color-text-muted)]">
              (no queries yet)
            </p>
          ) : (
            state.log.map((entry) => (
              <div
                key={entry.id}
                className="flex items-baseline gap-2 font-mono text-[10px] leading-tight"
              >
                <span className="shrink-0 text-[var(--color-text-muted)]">#{entry.id}</span>
                <span className="flex-1 truncate text-[var(--color-text-primary)]">
                  {entry.sql}
                </span>
                <span className="shrink-0 text-[var(--color-text-muted)]">
                  {entry.ms.toFixed(0)}ms
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/** ──── Small stat card ────────────────────────────────────────────────── */

interface StatProps {
  label: string;
  value: string;
  hint: string;
}

function Stat({ label, value, hint }: StatProps): React.ReactElement {
  return (
    <div>
      <p className="text-[10px] tracking-wide text-[var(--color-text-muted)] uppercase">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold text-[var(--color-text-primary)] tabular-nums">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">{hint}</p>
    </div>
  );
}

/** ──── Code block ─────────────────────────────────────────────────────── */

interface CodeBlockProps {
  label: string;
  accent: string;
  code: string;
}

function CodeBlock({ label, accent, code }: CodeBlockProps): React.ReactElement {
  return (
    <div className="overflow-hidden rounded-lg border" style={{ borderColor: `${accent}55` }}>
      <div
        className="px-3 py-1.5 text-[10px] font-semibold tracking-wide uppercase"
        style={{ backgroundColor: `${accent}1a`, color: accent }}
      >
        {label}
      </div>
      <pre className="overflow-x-auto bg-[var(--color-bg-subtle)] p-3 font-mono text-[11px] leading-relaxed text-[var(--color-text-primary)]">
        {code}
      </pre>
    </div>
  );
}

/** ──── History sparkline ──────────────────────────────────────────────── */

interface HistoryChartProps {
  history: HistoryPoint[];
}

function HistoryChart({ history }: HistoryChartProps): React.ReactElement {
  // Establish chart bounds. We plot users on X (0..MAX_USERS) and time on Y
  // (0..max(naiveMs) with a 10% headroom). Optimized line uses the same Y axis
  // so the gap is honest.
  const maxMs = Math.max(...history.map((h) => h.naiveMs), 1) * 1.1;
  const sorted = [...history].sort((a, b) => a.users - b.users);

  const W = 520;
  const H = 140;
  const PAD = 24;

  const xFor = (users: number): number =>
    PAD + ((users - MIN_USERS) / (MAX_USERS - MIN_USERS)) * (W - PAD * 2);
  const yFor = (ms: number): number => H - PAD - (ms / maxMs) * (H - PAD * 2);

  const naivePoints = sorted.map((p) => `${xFor(p.users)},${yFor(p.naiveMs)}`).join(" ");
  const optimizedPoints = sorted.map((p) => `${xFor(p.users)},${yFor(p.optimizedMs)}`).join(" ");

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-5 py-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
          Time vs users (across runs)
        </p>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: NAIVE_COLOR }}
              aria-hidden
            />
            <span className="text-[var(--color-text-muted)]">naive</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: OPTIMIZED_COLOR }}
              aria-hidden
            />
            <span className="text-[var(--color-text-muted)]">optimized</span>
          </span>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-[160px] w-full"
        role="img"
        aria-label="Naive vs optimized query time across recorded runs"
      >
        {/* Axes */}
        <line
          x1={PAD}
          y1={H - PAD}
          x2={W - PAD}
          y2={H - PAD}
          stroke="var(--color-border)"
          strokeWidth="1"
        />
        <line
          x1={PAD}
          y1={PAD}
          x2={PAD}
          y2={H - PAD}
          stroke="var(--color-border)"
          strokeWidth="1"
        />
        {/* Naive polyline */}
        {sorted.length >= 2 && (
          <polyline
            points={naivePoints}
            fill="none"
            stroke={NAIVE_COLOR}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        )}
        {/* Optimized polyline */}
        {sorted.length >= 2 && (
          <polyline
            points={optimizedPoints}
            fill="none"
            stroke={OPTIMIZED_COLOR}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        )}
        {/* Points */}
        {sorted.map((p) => (
          <g key={`${p.users}-${p.naiveMs}-${p.optimizedMs}`}>
            <circle cx={xFor(p.users)} cy={yFor(p.naiveMs)} r="3" fill={NAIVE_COLOR} />
            <circle cx={xFor(p.users)} cy={yFor(p.optimizedMs)} r="3" fill={OPTIMIZED_COLOR} />
          </g>
        ))}
        {/* X axis ticks: 5, 50, 100, 200 */}
        {[MIN_USERS, 50, 100, MAX_USERS].map((u) => (
          <g key={u}>
            <line
              x1={xFor(u)}
              y1={H - PAD}
              x2={xFor(u)}
              y2={H - PAD + 3}
              stroke="var(--color-border)"
              strokeWidth="1"
            />
            <text
              x={xFor(u)}
              y={H - PAD + 14}
              textAnchor="middle"
              fontSize="9"
              fill="var(--color-text-muted)"
            >
              {u}
            </text>
          </g>
        ))}
        <text x={W / 2} y={H - 2} textAnchor="middle" fontSize="9" fill="var(--color-text-muted)">
          users
        </text>
        <text x={PAD - 6} y={PAD + 4} textAnchor="end" fontSize="9" fill="var(--color-text-muted)">
          {fmt(maxMs)}
        </text>
        <text
          x={PAD - 6}
          y={H - PAD + 4}
          textAnchor="end"
          fontSize="9"
          fill="var(--color-text-muted)"
        >
          0
        </text>
      </svg>
      <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
        Run again at higher user counts to extend the curves. Naive grows linearly with users;
        optimized barely moves.
      </p>
    </div>
  );
}

export default NPlusOne;
