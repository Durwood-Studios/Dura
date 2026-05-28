"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";

/**
 * OptimisticUI — the FE/BE contract boundary, made visible.
 *
 * Pedagogical bet: "optimistic UI feels faster" is something learners can
 * recite — but the cost of that speed is invisible until they watch a real
 * rollback flicker happen in front of them, and feel the queued wait of the
 * pessimistic alternative. The trade-off only becomes legible when both
 * modes run on the same controls (latency, failure rate, rapid-click) and
 * the side-by-side stats panel shows perceived latency and rollback count
 * diverging.
 *
 * The simulator runs entirely in memory. There is no server; the "request"
 * is a setTimeout whose resolution is decided by a seeded coin flip against
 * the failure-rate slider. That keeps the moving parts honest: the learner
 * can point at exactly which request failed and exactly when the UI was
 * reconciled.
 *
 * Completion gate: at least one observed rollback in optimistic mode AND at
 * least three clicks logged in pessimistic mode. The learner has to have
 * felt the trade-off in both directions.
 */

type Mode = "optimistic" | "pessimistic";
type RequestStatus = "in-flight" | "settled" | "failed";

interface RequestRecord {
  id: number;
  /** Whether the click intended to like (+1) or unlike (-1). */
  intent: "like" | "unlike";
  status: RequestStatus;
  /** When the click was issued (ms, from performance.now). */
  startedAt: number;
  /** When the server resolved or rejected (ms). undefined while in-flight. */
  settledAt?: number;
  /** Optimistic mode only — did this request trigger a visible rollback? */
  rolledBack: boolean;
  /** The mode the click was issued in. */
  mode: Mode;
}

interface Stats {
  clicks: number;
  confirmations: number;
  rollbacks: number;
  /** Mean perceived latency in ms. "Perceived" = time until UI reflects intent. */
  perceivedLatencyMs: number;
}

const ROLLBACK_FLICKER_MS = 280; // how long the rollback frame is highlighted

/** Default control values — chosen to make the trade-off pop quickly. */
const DEFAULTS = {
  latencyMs: 600,
  failureRatePct: 20,
};

const COLORS = {
  optimistic: "#60a5fa",
  pessimistic: "#fbbf24",
  inFlight: "#94a3b8",
  settled: "#34d399",
  failed: "#fb7185",
};

export function OptimisticUI(): React.ReactElement {
  const [mode, setMode] = useState<Mode>("optimistic");
  const [latencyMs, setLatencyMs] = useState<number>(DEFAULTS.latencyMs);
  const [failureRatePct, setFailureRatePct] = useState<number>(DEFAULTS.failureRatePct);

  /** Displayed heart state (what the learner sees on the post). */
  const [displayLiked, setDisplayLiked] = useState<boolean>(false);
  const [displayCount, setDisplayCount] = useState<number>(42);

  /**
   * The server's truth. The optimistic mode lies to the UI in advance and
   * reconciles back to this on failure; the pessimistic mode mirrors this
   * exactly once the request resolves.
   */
  const serverLikedRef = useRef<boolean>(false);
  const serverCountRef = useRef<number>(42);

  /** Pessimistic mode shows a spinner while a click is in flight. */
  const [pessimisticPending, setPessimisticPending] = useState<boolean>(false);

  /** Briefly highlight the heart when a rollback fires, so the flicker is visible. */
  const [rollbackFlash, setRollbackFlash] = useState<boolean>(false);

  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const nextIdRef = useRef<number>(1);

  /** Pending setTimeout handles, so reset can cancel in-flight requests. */
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  /** Completion-gate tracking. */
  const optimisticRollbacksRef = useRef<number>(0);
  const pessimisticClicksRef = useRef<number>(0);
  const completedRef = useRef<boolean>(false);

  /** Cleanup outstanding timeouts on unmount. */
  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      for (const t of timeouts) clearTimeout(t);
      timeouts.clear();
    };
  }, []);

  const updateRequest = useCallback((id: number, patch: Partial<RequestRecord>): void => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  /**
   * The "server." Resolves after `latencyMs` with success or failure based on
   * `failureRatePct`. We use a fresh Math.random() per request — the learner
   * is meant to see different runs of the same configuration produce
   * different outcomes, which is the whole point of stress-testing the UI.
   */
  const issueRequest = useCallback(
    (id: number, onSuccess: () => void, onFailure: () => void): void => {
      const handle = setTimeout(() => {
        timeoutsRef.current.delete(handle);
        const failed = Math.random() * 100 < failureRatePct;
        if (failed) onFailure();
        else onSuccess();
      }, latencyMs);
      timeoutsRef.current.add(handle);
    },
    [latencyMs, failureRatePct]
  );

  const fireOptimisticClick = useCallback((): void => {
    const id = nextIdRef.current++;
    const intent: "like" | "unlike" = displayLiked ? "unlike" : "like";
    const delta = intent === "like" ? 1 : -1;
    const startedAt = performance.now();

    // 1. Optimistic apply: UI updates instantly.
    setDisplayLiked(intent === "like");
    setDisplayCount((c) => c + delta);

    setRequests((prev) => [
      ...prev,
      {
        id,
        intent,
        status: "in-flight",
        startedAt,
        rolledBack: false,
        mode: "optimistic",
      },
    ]);

    // 2. Server resolves later. On failure, we reconcile against the
    //    server's truth — not against a snapshot of pre-click state.
    //    That distinction matters: if a second click landed in between,
    //    rolling back to the pre-click snapshot would clobber it.
    issueRequest(
      id,
      () => {
        // Success: server state advances by the intent.
        serverLikedRef.current = intent === "like";
        serverCountRef.current += delta;
        updateRequest(id, { status: "settled", settledAt: performance.now() });
      },
      () => {
        // Failure: reconcile display to server truth. If other in-flight
        // requests have already moved the UI further, this is a "partial
        // rollback" — the learner sees only this request's contribution
        // reverted, which mirrors how production code with idempotency
        // keys + version numbers would behave.
        const before = displayLikedRef.current;
        const beforeCount = displayCountRef.current;
        // Reverse just this request's delta.
        setDisplayCount((c) => c - delta);
        // For "liked": if the intent was to like, undo to "not liked"
        // only if the server still says not-liked. Otherwise keep current.
        setDisplayLiked((cur) => {
          // If our intent was the most recent visible state, revert it.
          if (cur === (intent === "like")) return !cur;
          return cur;
        });
        optimisticRollbacksRef.current += 1;
        setRollbackFlash(true);
        const flashHandle = setTimeout(() => {
          timeoutsRef.current.delete(flashHandle);
          setRollbackFlash(false);
        }, ROLLBACK_FLICKER_MS);
        timeoutsRef.current.add(flashHandle);
        updateRequest(id, {
          status: "failed",
          settledAt: performance.now(),
          rolledBack: true,
        });
        // Silence unused-var lint for the snapshot we documented.
        void before;
        void beforeCount;
      }
    );
  }, [displayLiked, issueRequest, updateRequest]);

  /**
   * Mirror displayLiked / displayCount into refs so the failure callback
   * sees the latest snapshot without re-binding the closure on every
   * render. This is what production code uses version numbers for — and
   * the comment above fireOptimisticClick names that explicitly.
   */
  const displayLikedRef = useRef<boolean>(displayLiked);
  const displayCountRef = useRef<number>(displayCount);
  useEffect(() => {
    displayLikedRef.current = displayLiked;
  }, [displayLiked]);
  useEffect(() => {
    displayCountRef.current = displayCount;
  }, [displayCount]);

  const firePessimisticClick = useCallback((): void => {
    if (pessimisticPending) return; // ignore clicks while one is in flight
    const id = nextIdRef.current++;
    const intent: "like" | "unlike" = serverLikedRef.current ? "unlike" : "like";
    const delta = intent === "like" ? 1 : -1;
    const startedAt = performance.now();

    setPessimisticPending(true);
    setRequests((prev) => [
      ...prev,
      {
        id,
        intent,
        status: "in-flight",
        startedAt,
        rolledBack: false,
        mode: "pessimistic",
      },
    ]);
    pessimisticClicksRef.current += 1;

    issueRequest(
      id,
      () => {
        serverLikedRef.current = intent === "like";
        serverCountRef.current += delta;
        // Only NOW does the UI reflect the action.
        setDisplayLiked(serverLikedRef.current);
        setDisplayCount(serverCountRef.current);
        setPessimisticPending(false);
        updateRequest(id, { status: "settled", settledAt: performance.now() });
      },
      () => {
        // Server rejected: UI never moved, so there is nothing to roll back.
        // This is the whole point of pessimistic mode — no rollback path
        // because the UI never lied to the user in the first place.
        setPessimisticPending(false);
        updateRequest(id, { status: "failed", settledAt: performance.now() });
      }
    );
  }, [pessimisticPending, issueRequest, updateRequest]);

  const onLikeClick = useCallback((): void => {
    if (mode === "optimistic") fireOptimisticClick();
    else firePessimisticClick();
  }, [mode, fireOptimisticClick, firePessimisticClick]);

  const fireBurst = useCallback((): void => {
    // 5 clicks in quick succession. The interval is small enough that
    // optimistic mode will likely have multiple requests in flight at once
    // — that's the race surface we want the learner to feel.
    for (let i = 0; i < 5; i++) {
      const handle = setTimeout(() => {
        timeoutsRef.current.delete(handle);
        onLikeClick();
      }, i * 40);
      timeoutsRef.current.add(handle);
    }
  }, [onLikeClick]);

  const reset = useCallback((): void => {
    for (const t of timeoutsRef.current) clearTimeout(t);
    timeoutsRef.current.clear();
    serverLikedRef.current = false;
    serverCountRef.current = 42;
    setDisplayLiked(false);
    setDisplayCount(42);
    setPessimisticPending(false);
    setRollbackFlash(false);
    setRequests([]);
    optimisticRollbacksRef.current = 0;
    pessimisticClicksRef.current = 0;
    nextIdRef.current = 1;
    // Note: completedRef is intentionally NOT reset — once earned, the
    // activity stays complete. The learner shouldn't lose Passport credit
    // by tinkering after the gate fires.
  }, []);

  // Completion gate: at least one optimistic rollback AND at least three
  // pessimistic clicks. The learner has felt both directions of the trade.
  useEffect(() => {
    if (completedRef.current) return;
    const haveRollback = optimisticRollbacksRef.current >= 1;
    const havePessimistic = pessimisticClicksRef.current >= 3;
    if (haveRollback && havePessimistic) {
      completedRef.current = true;
      markActivityComplete("optimistic-ui");
    }
  }, [requests]);

  /** Derived stats from the request log. */
  const stats: { optimistic: Stats; pessimistic: Stats } = useMemo(() => {
    const empty = (): Stats => ({
      clicks: 0,
      confirmations: 0,
      rollbacks: 0,
      perceivedLatencyMs: 0,
    });
    const out = { optimistic: empty(), pessimistic: empty() };
    const perceivedSums = { optimistic: 0, pessimistic: 0 };
    const perceivedCounts = { optimistic: 0, pessimistic: 0 };
    for (const r of requests) {
      const bucket = out[r.mode];
      bucket.clicks += 1;
      if (r.status === "settled") bucket.confirmations += 1;
      if (r.rolledBack) bucket.rollbacks += 1;
      // Perceived latency: optimistic = ~0 (UI moved immediately, so the
      // perceived time-to-feedback is the click frame itself, ~16ms).
      // Pessimistic = the actual round-trip until UI moved.
      if (r.mode === "optimistic") {
        perceivedSums.optimistic += 16;
        perceivedCounts.optimistic += 1;
      } else if (r.mode === "pessimistic" && r.settledAt !== undefined) {
        perceivedSums.pessimistic += r.settledAt - r.startedAt;
        perceivedCounts.pessimistic += 1;
      }
    }
    if (perceivedCounts.optimistic > 0) {
      out.optimistic.perceivedLatencyMs = perceivedSums.optimistic / perceivedCounts.optimistic;
    }
    if (perceivedCounts.pessimistic > 0) {
      out.pessimistic.perceivedLatencyMs = perceivedSums.pessimistic / perceivedCounts.pessimistic;
    }
    return out;
  }, [requests]);

  const inFlightCount = requests.filter((r) => r.status === "in-flight").length;

  /** Show the last 12 requests in the queue visualization. */
  const queueSlice = useMemo(() => requests.slice(-12), [requests]);

  const completionState = {
    rollbacks: optimisticRollbacksRef.current,
    pessimisticClicks: pessimisticClicksRef.current,
    done: completedRef.current,
  };

  return (
    <div className="space-y-5">
      {/* Mode + controls */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div
            role="radiogroup"
            aria-label="UI update mode"
            className="inline-flex overflow-hidden rounded-md border border-[var(--color-border)]"
          >
            {(["optimistic", "pessimistic"] as const).map((m) => {
              const active = mode === m;
              const color = COLORS[m];
              return (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setMode(m)}
                  className="px-3 py-1.5 text-xs font-semibold capitalize transition"
                  style={{
                    background: active ? `${color}22` : "transparent",
                    color: active ? color : "var(--color-text-secondary)",
                  }}
                >
                  {m}
                </button>
              );
            })}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={fireBurst}
              className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-subtle)]"
            >
              Burst ×5
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-subtle)]"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Sliders */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                Latency
              </span>
              <span className="font-mono text-[11px] text-[var(--color-text-muted)]">
                {latencyMs} ms
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1500}
              step={50}
              value={latencyMs}
              onChange={(e) => setLatencyMs(Number(e.target.value))}
              className="mt-1.5 w-full accent-[var(--color-accent)]"
              aria-label="Server latency in milliseconds"
            />
          </label>
          <label className="block">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                Server failure rate
              </span>
              <span className="font-mono text-[11px] text-[var(--color-text-muted)]">
                {failureRatePct}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={failureRatePct}
              onChange={(e) => setFailureRatePct(Number(e.target.value))}
              className="mt-1.5 w-full accent-[var(--color-accent)]"
              aria-label="Server failure rate as a percentage"
            />
          </label>
        </div>
      </div>

      {/* The "post" with the like button — the thing the user actually sees */}
      <div
        className="relative rounded-xl border bg-[var(--color-bg-surface)] p-6 transition-colors"
        style={{
          borderColor: rollbackFlash ? COLORS.failed : "var(--color-border)",
          boxShadow: rollbackFlash ? `0 0 0 2px ${COLORS.failed}33` : undefined,
        }}
      >
        <div className="flex items-start gap-4">
          {/* Avatar placeholder */}
          <div
            className="h-10 w-10 shrink-0 rounded-full"
            style={{ background: "var(--color-bg-subtle)" }}
            aria-hidden
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">@dura · 2h</p>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              The hardest part of optimistic UI isn&rsquo;t the optimism — it&rsquo;s the path back
              when the server says no.
            </p>

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={onLikeClick}
                disabled={mode === "pessimistic" && pessimisticPending}
                aria-label={displayLiked ? "Unlike post" : "Like post"}
                aria-pressed={displayLiked}
                className="group inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium transition hover:bg-[var(--color-bg-subtle)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {/* Heart icon — outline when not liked, filled when liked.
                    Pessimistic-pending shows a small spinner instead. */}
                {mode === "pessimistic" && pessimisticPending ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 animate-spin"
                    fill="none"
                    stroke={COLORS.pessimistic}
                    strokeWidth={2}
                    aria-hidden
                  >
                    <circle cx="12" cy="12" r="9" opacity="0.25" />
                    <path d="M21 12a9 9 0 0 0-9-9" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 transition-transform group-active:scale-90"
                    fill={displayLiked ? "#f43f5e" : "none"}
                    stroke={displayLiked ? "#f43f5e" : "var(--color-text-secondary)"}
                    strokeWidth={2}
                    aria-hidden
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                )}
                <span className="font-mono text-[var(--color-text-primary)] tabular-nums">
                  {displayCount}
                </span>
              </button>

              {/* Subtle hint about what mode is doing */}
              <span className="text-xs text-[var(--color-text-muted)]">
                {mode === "optimistic"
                  ? inFlightCount > 0
                    ? `${inFlightCount} request${inFlightCount === 1 ? "" : "s"} in flight`
                    : "UI updates instantly"
                  : pessimisticPending
                    ? "waiting on server…"
                    : "UI waits for server"}
              </span>
            </div>
          </div>
        </div>

        {rollbackFlash && (
          <p
            className="absolute top-4 right-4 rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ background: `${COLORS.failed}22`, color: COLORS.failed }}
            role="status"
          >
            rolled back
          </p>
        )}
      </div>

      {/* Stats side-by-side */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(["optimistic", "pessimistic"] as const).map((m) => {
          const s = stats[m];
          const color = COLORS[m];
          const active = mode === m;
          return (
            <div
              key={m}
              className="rounded-xl border bg-[var(--color-bg-surface)] p-4 transition-colors"
              style={{
                borderColor: active ? color : `${color}33`,
                boxShadow: active ? `0 0 0 2px ${color}22` : undefined,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)] capitalize">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: color }}
                    aria-hidden
                  />
                  {m}
                </span>
                <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                  {active ? "active" : ""}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs">
                <dt className="text-[var(--color-text-muted)]">Clicks issued</dt>
                <dd className="text-right font-mono text-[var(--color-text-primary)]">
                  {s.clicks}
                </dd>
                <dt className="text-[var(--color-text-muted)]">Server confirms</dt>
                <dd className="text-right font-mono text-[var(--color-text-primary)]">
                  {s.confirmations}
                </dd>
                <dt className="text-[var(--color-text-muted)]">Rollbacks</dt>
                <dd
                  className="text-right font-mono"
                  style={{ color: s.rollbacks > 0 ? COLORS.failed : "var(--color-text-primary)" }}
                >
                  {s.rollbacks}
                </dd>
                <dt className="text-[var(--color-text-muted)]">Avg perceived latency</dt>
                <dd className="text-right font-mono text-[var(--color-text-primary)]">
                  {s.clicks === 0 ? "—" : `${Math.round(s.perceivedLatencyMs)} ms`}
                </dd>
              </dl>
            </div>
          );
        })}
      </div>

      {/* Request queue visualization — last 12 */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">Request queue</p>
          <p className="font-mono text-[11px] text-[var(--color-text-muted)]">
            {requests.length === 0
              ? "no requests yet"
              : `${inFlightCount} in flight · ${requests.length} total`}
          </p>
        </div>
        {queueSlice.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            Click the heart. Each request shows up here while it&rsquo;s in flight, then settles or
            fails.
          </p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {queueSlice.map((r) => {
              const statusColor =
                r.status === "in-flight"
                  ? COLORS.inFlight
                  : r.status === "settled"
                    ? COLORS.settled
                    : COLORS.failed;
              const modeColor = COLORS[r.mode];
              const elapsed =
                r.settledAt !== undefined ? Math.round(r.settledAt - r.startedAt) : null;
              return (
                <li
                  key={r.id}
                  className="flex items-center gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2.5 py-1.5"
                >
                  <span
                    className="font-mono text-[10px] tabular-nums"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    #{r.id.toString().padStart(3, "0")}
                  </span>
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-medium capitalize"
                    style={{ background: `${modeColor}22`, color: modeColor }}
                  >
                    {r.mode === "optimistic" ? "opt" : "pess"}
                  </span>
                  <span className="text-[11px] text-[var(--color-text-secondary)]">{r.intent}</span>
                  <span
                    className="ml-auto inline-flex items-center gap-1.5 font-mono text-[11px]"
                    style={{ color: statusColor }}
                  >
                    <span
                      className={
                        "h-2 w-2 rounded-full " + (r.status === "in-flight" ? "animate-pulse" : "")
                      }
                      style={{ background: statusColor }}
                      aria-hidden
                    />
                    {r.status}
                    {elapsed !== null && (
                      <span className="text-[var(--color-text-muted)]">{elapsed}ms</span>
                    )}
                    {r.rolledBack && (
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                        style={{ background: `${COLORS.failed}22`, color: COLORS.failed }}
                      >
                        rolled back
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Completion-gate hint — quiet, but tells the learner what they still need */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
        <p className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
          Felt the trade?
        </p>
        <ul className="mt-2 space-y-1 text-xs text-[var(--color-text-secondary)]">
          <li className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full border"
              style={{
                background: completionState.rollbacks >= 1 ? COLORS.settled : "transparent",
                borderColor:
                  completionState.rollbacks >= 1 ? COLORS.settled : "var(--color-border)",
              }}
              aria-hidden
            />
            See at least one rollback in optimistic mode
            <span className="ml-1 font-mono text-[10px] text-[var(--color-text-muted)]">
              ({completionState.rollbacks}/1)
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full border"
              style={{
                background: completionState.pessimisticClicks >= 3 ? COLORS.settled : "transparent",
                borderColor:
                  completionState.pessimisticClicks >= 3 ? COLORS.settled : "var(--color-border)",
              }}
              aria-hidden
            />
            Click at least three times in pessimistic mode
            <span className="ml-1 font-mono text-[10px] text-[var(--color-text-muted)]">
              ({Math.min(completionState.pessimisticClicks, 3)}/3)
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default OptimisticUI;
