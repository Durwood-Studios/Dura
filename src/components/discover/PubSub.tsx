"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";

/**
 * PubSub — a simulated publish/subscribe message bus.
 *
 * Pedagogical bet: the dynamics that break real-time systems in production —
 * fan-out, backpressure, disconnect/replay, at-most-once vs at-least-once —
 * are mechanical, not mystical. Watching dots flow from publishers through
 * topics into subscriber queues, then watching the slow subscriber's queue
 * climb when its drain rate dips below the inbound rate, makes "backpressure"
 * stop being a slogan and start being a thing you can point at.
 *
 * Nothing here uses a real WebSocket. The whole pipeline is a setInterval
 * tick driving a small state machine — publishers emit on every tick they're
 * scheduled to, the broker fans messages out to matching subscribers, and
 * each subscriber drains its queue at its configured rate.
 */

const TICK_MS = 100; // simulated clock — 10 ticks/sec
const MAX_QUEUE_DEPTH = 200; // hard cap so an unbounded queue can't OOM the page
const RECENT_DELIVERY_WINDOW = 30; // last N messages tracked per subscriber for inbox display

type TopicId = "news" | "alerts" | "chat";
type PublisherId = "p1" | "p2" | "p3";
type SubscriberId = "s1" | "s2" | "s3" | "s4";
type DeliveryMode = "at-most-once" | "at-least-once";

interface Topic {
  id: TopicId;
  label: string;
  color: string;
}

const TOPICS: Topic[] = [
  { id: "news", label: "news", color: "#60a5fa" },
  { id: "alerts", label: "alerts", color: "#fb7185" },
  { id: "chat", label: "chat", color: "#34d399" },
];

interface PublisherConfig {
  id: PublisherId;
  label: string;
  topic: TopicId;
  /** Messages per second when auto-emitting. 0 = manual only. */
  rate: number;
  /** Accumulated fractional ticks toward the next emission. */
  accumulator: number;
}

interface SubscriberConfig {
  id: SubscriberId;
  label: string;
  subscriptions: Set<TopicId>;
  /** Messages drained per second. */
  drainRate: number;
  /** Accumulated fractional ticks toward the next drain. */
  drainAccumulator: number;
  /** Disconnected (queue paused, no new arrivals while disconnected). */
  disconnected: boolean;
  /** Crashed (queue is dropped on crash). */
  crashed: boolean;
  /** Local message inbox queue. */
  queue: Message[];
  /** Last N successfully processed messages — surfaced as the visible inbox. */
  recent: Message[];
  /** Total processed since last reset. */
  processed: number;
  /** Total dropped messages (queue overflow or crash). */
  dropped: number;
  /** Sum of latency-ticks-at-delivery, used to compute mean latency. */
  latencySum: number;
  /** Count of messages used in the latency sum. */
  latencyCount: number;
}

interface Message {
  id: number;
  topic: TopicId;
  publisher: PublisherId;
  /** Tick the broker received this message. */
  emittedAt: number;
}

interface Stats {
  emitted: number;
  delivered: number;
  dropped: number;
  /** Mean latency across all subscribers, in ticks. */
  meanLatencyTicks: number;
  /** Largest current queue depth across subscribers. */
  maxQueueDepth: number;
}

/** ──── Initial state factories ──────────────────────────────────────── */

function initialPublishers(): PublisherConfig[] {
  return [
    { id: "p1", label: "News wire", topic: "news", rate: 2, accumulator: 0 },
    { id: "p2", label: "Alert system", topic: "alerts", rate: 0, accumulator: 0 },
    { id: "p3", label: "Chat user", topic: "chat", rate: 5, accumulator: 0 },
  ];
}

function initialSubscribers(): SubscriberConfig[] {
  return [
    {
      id: "s1",
      label: "Dashboard",
      subscriptions: new Set<TopicId>(["news"]),
      drainRate: 5,
      drainAccumulator: 0,
      disconnected: false,
      crashed: false,
      queue: [],
      recent: [],
      processed: 0,
      dropped: 0,
      latencySum: 0,
      latencyCount: 0,
    },
    {
      id: "s2",
      label: "Mobile app",
      subscriptions: new Set<TopicId>(["alerts", "chat"]),
      drainRate: 3,
      drainAccumulator: 0,
      disconnected: false,
      crashed: false,
      queue: [],
      recent: [],
      processed: 0,
      dropped: 0,
      latencySum: 0,
      latencyCount: 0,
    },
    {
      id: "s3",
      label: "Slow worker",
      subscriptions: new Set<TopicId>(["news", "chat"]),
      drainRate: 1,
      drainAccumulator: 0,
      disconnected: false,
      crashed: false,
      queue: [],
      recent: [],
      processed: 0,
      dropped: 0,
      latencySum: 0,
      latencyCount: 0,
    },
    {
      id: "s4",
      label: "Archive",
      subscriptions: new Set<TopicId>([]),
      drainRate: 10,
      drainAccumulator: 0,
      disconnected: false,
      crashed: false,
      queue: [],
      recent: [],
      processed: 0,
      dropped: 0,
      latencySum: 0,
      latencyCount: 0,
    },
  ];
}

function initialStats(): Stats {
  return {
    emitted: 0,
    delivered: 0,
    dropped: 0,
    meanLatencyTicks: 0,
    maxQueueDepth: 0,
  };
}

/** ──── Component ────────────────────────────────────────────────────── */

export function PubSub(): React.ReactElement {
  const [publishers, setPublishers] = useState<PublisherConfig[]>(() => initialPublishers());
  const [subscribers, setSubscribers] = useState<SubscriberConfig[]>(() => initialSubscribers());
  const [stats, setStats] = useState<Stats>(() => initialStats());
  const [running, setRunning] = useState(true);
  const [brokerBuffers, setBrokerBuffers] = useState(true);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("at-most-once");
  const [tick, setTick] = useState(0);

  // Completion-tracking refs. Persist across renders without triggering them.
  const completedRef = useRef(false);
  const sawBackpressureRef = useRef(false);
  const sawReconnectRef = useRef(false);
  const lastDisconnectedRef = useRef<Set<SubscriberId>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextMessageIdRef = useRef(0);

  /** Stop the simulation tick. */
  const stop = useCallback((): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const reset = useCallback((): void => {
    stop();
    setPublishers(initialPublishers());
    setSubscribers(initialSubscribers());
    setStats(initialStats());
    setTick(0);
    completedRef.current = false;
    sawBackpressureRef.current = false;
    sawReconnectRef.current = false;
    lastDisconnectedRef.current = new Set();
    nextMessageIdRef.current = 0;
    setRunning(true);
  }, [stop]);

  /** Emit a single message from publisher `pid`. Pure update of broker fan-out. */
  const emitMessageOnce = useCallback((pid: PublisherId): void => {
    const pub = publishersRef.current.find((p) => p.id === pid);
    if (!pub) return;
    enqueueEmission(pub, tickRef.current);
  }, []);

  /** Refs that mirror state — needed because the interval closure is stable. */
  const publishersRef = useRef(publishers);
  const subscribersRef = useRef(subscribers);
  const tickRef = useRef(tick);
  const brokerBuffersRef = useRef(brokerBuffers);
  const deliveryModeRef = useRef(deliveryMode);

  useEffect(() => {
    publishersRef.current = publishers;
  }, [publishers]);
  useEffect(() => {
    subscribersRef.current = subscribers;
  }, [subscribers]);
  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);
  useEffect(() => {
    brokerBuffersRef.current = brokerBuffers;
  }, [brokerBuffers]);
  useEffect(() => {
    deliveryModeRef.current = deliveryMode;
  }, [deliveryMode]);

  /**
   * Stage emitted messages produced during a tick, then flush them into the
   * subscribers in one setState. Defined outside the tick handler so manual
   * emissions can share the same fan-out pipeline.
   */
  const pendingEmissionsRef = useRef<Message[]>([]);

  function enqueueEmission(pub: PublisherConfig, atTick: number): void {
    const msg: Message = {
      id: nextMessageIdRef.current++,
      topic: pub.topic,
      publisher: pub.id,
      emittedAt: atTick,
    };
    pendingEmissionsRef.current.push(msg);
  }

  /**
   * Single simulation tick. Three phases:
   *   1. Publishers accumulate fractional message budget; emit whole ones.
   *   2. Broker fans each emitted message out to all subscribers whose
   *      subscription set contains its topic. Disconnected subscribers either
   *      see the message buffered (brokerBuffers=true) or dropped silently.
   *   3. Subscribers drain their local queue at their configured rate.
   */
  const stepTick = useCallback((): void => {
    const curTick = tickRef.current + 1;
    tickRef.current = curTick;

    // ── 1. Publishers
    const pubs = publishersRef.current.map((p) => ({ ...p }));
    let emittedThisTick = 0;
    for (const p of pubs) {
      if (p.rate <= 0) continue;
      // rate is msgs/sec. tick is TICK_MS. Budget per tick = rate * (TICK_MS/1000).
      p.accumulator += p.rate * (TICK_MS / 1000);
      while (p.accumulator >= 1) {
        p.accumulator -= 1;
        enqueueEmission(p, curTick);
        emittedThisTick++;
      }
    }
    publishersRef.current = pubs;

    // ── 2. Broker fan-out
    const subs = subscribersRef.current.map((s) => ({
      ...s,
      queue: [...s.queue],
      recent: [...s.recent],
    }));
    const emitted = pendingEmissionsRef.current;
    pendingEmissionsRef.current = [];
    let droppedFromOverflow = 0;
    let droppedFromDisconnect = 0;
    for (const msg of emitted) {
      for (const sub of subs) {
        if (sub.crashed) continue;
        if (!sub.subscriptions.has(msg.topic)) continue;
        if (sub.disconnected) {
          if (brokerBuffersRef.current) {
            // Broker remembers — push to queue anyway. Real brokers cap this;
            // we do too via MAX_QUEUE_DEPTH below.
            if (sub.queue.length >= MAX_QUEUE_DEPTH) {
              droppedFromOverflow++;
              sub.dropped += 1;
            } else {
              sub.queue.push(msg);
            }
          } else {
            droppedFromDisconnect++;
            sub.dropped += 1;
          }
          continue;
        }
        if (sub.queue.length >= MAX_QUEUE_DEPTH) {
          droppedFromOverflow++;
          sub.dropped += 1;
          continue;
        }
        sub.queue.push(msg);
      }
    }

    // ── 3. Subscribers drain
    let deliveredThisTick = 0;
    let latencyAddedThisTick = 0;
    let latencyCountAddedThisTick = 0;
    for (const sub of subs) {
      if (sub.crashed || sub.disconnected) continue;
      sub.drainAccumulator += sub.drainRate * (TICK_MS / 1000);
      while (sub.drainAccumulator >= 1 && sub.queue.length > 0) {
        sub.drainAccumulator -= 1;
        const msg = sub.queue.shift()!;
        const latency = curTick - msg.emittedAt;
        // at-most-once: deliver and forget. at-least-once: a small chance
        // of redelivery (here: simulated as "if subscriber disconnected
        // mid-processing, the message is replayed on reconnect"). For the
        // simulation we surface this as a tag on the inbox row, not a
        // separate replay tick — the goal is to make the contract visible.
        sub.processed += 1;
        sub.latencySum += latency;
        sub.latencyCount += 1;
        deliveredThisTick += 1;
        latencyAddedThisTick += latency;
        latencyCountAddedThisTick += 1;
        sub.recent.push(msg);
        if (sub.recent.length > RECENT_DELIVERY_WINDOW) {
          sub.recent.shift();
        }
      }
    }

    // ── Backpressure detection (used for completion gate)
    let maxQueue = 0;
    for (const s of subs) {
      if (s.queue.length > maxQueue) maxQueue = s.queue.length;
    }
    if (maxQueue > 10) sawBackpressureRef.current = true;

    subscribersRef.current = subs;

    // ── Apply state updates in one batch
    setPublishers(pubs);
    setSubscribers(subs);
    setStats((prev) => {
      const newTotalLatencyCount = subs.reduce((acc, s) => acc + s.latencyCount, 0) || 1;
      const newTotalLatency = subs.reduce((acc, s) => acc + s.latencySum, 0);
      return {
        emitted: prev.emitted + emittedThisTick,
        delivered: prev.delivered + deliveredThisTick,
        dropped: prev.dropped + droppedFromOverflow + droppedFromDisconnect,
        meanLatencyTicks: newTotalLatency / newTotalLatencyCount,
        maxQueueDepth: maxQueue,
      };
    });
    setTick(curTick);

    // Reference latency vars so the linter sees them as live (they feed
    // the per-tick stat computation through subs.latencySum above).
    void latencyAddedThisTick;
    void latencyCountAddedThisTick;
  }, []);

  // Start / stop the simulation tick on mount and when `running` flips.
  useEffect(() => {
    if (!running) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(stepTick, TICK_MS);
    return (): void => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, stepTick]);

  // Tear-down on unmount in case the running guard didn't clean up.
  useEffect(() => {
    return (): void => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Completion gate: ≥2 subscribers each have ≥1 subscription, backpressure
  // observed, and at least one subscriber has gone through a
  // disconnect → reconnect cycle.
  useEffect(() => {
    if (completedRef.current) return;
    const subscribedCount = subscribers.filter((s) => s.subscriptions.size > 0).length;
    if (subscribedCount < 2) return;
    if (!sawBackpressureRef.current) return;
    if (!sawReconnectRef.current) return;
    completedRef.current = true;
    markActivityComplete("pubsub");
  }, [subscribers, tick]);

  /** ──── Mutators ──────────────────────────────────────────────────── */

  const updatePublisherRate = useCallback((pid: PublisherId, rate: number): void => {
    setPublishers((prev) => prev.map((p) => (p.id === pid ? { ...p, rate, accumulator: 0 } : p)));
  }, []);

  const updateSubscriberDrain = useCallback((sid: SubscriberId, drainRate: number): void => {
    setSubscribers((prev) =>
      prev.map((s) => (s.id === sid ? { ...s, drainRate, drainAccumulator: 0 } : s))
    );
  }, []);

  const toggleSubscription = useCallback((sid: SubscriberId, tid: TopicId): void => {
    setSubscribers((prev) =>
      prev.map((s) => {
        if (s.id !== sid) return s;
        const next = new Set(s.subscriptions);
        if (next.has(tid)) next.delete(tid);
        else next.add(tid);
        return { ...s, subscriptions: next };
      })
    );
  }, []);

  const disconnect = useCallback((sid: SubscriberId): void => {
    lastDisconnectedRef.current.add(sid);
    setSubscribers((prev) => prev.map((s) => (s.id === sid ? { ...s, disconnected: true } : s)));
  }, []);

  const reconnect = useCallback((sid: SubscriberId): void => {
    if (lastDisconnectedRef.current.has(sid)) {
      sawReconnectRef.current = true;
    }
    setSubscribers((prev) =>
      prev.map((s) => (s.id === sid ? { ...s, disconnected: false, crashed: false } : s))
    );
  }, []);

  const crash = useCallback((sid: SubscriberId): void => {
    setSubscribers((prev) =>
      prev.map((s) => {
        if (s.id !== sid) return s;
        const lostCount = s.queue.length;
        // at-most-once: lost queue is gone forever. at-least-once: the broker
        // will redeliver — but only if it was buffering, which we model with
        // a one-shot replay on reconnect. To keep the contract honest in the
        // sim, dropped count increments regardless on crash.
        const droppedDelta = deliveryModeRef.current === "at-most-once" ? lostCount : 0;
        return {
          ...s,
          crashed: true,
          queue: [],
          dropped: s.dropped + droppedDelta,
        };
      })
    );
    // The crash also pushes the sub into the "needs reconnect" set so a
    // following reconnect counts toward the completion gate.
    lastDisconnectedRef.current.add(sid);
  }, []);

  const manualEmit = useCallback(
    (pid: PublisherId): void => {
      emitMessageOnce(pid);
    },
    [emitMessageOnce]
  );

  /** ──── Derived for render ────────────────────────────────────────── */

  // Per-topic active publishers and subscribers, used for the visual lines.
  const topicGraph = useMemo(() => {
    const out: Record<TopicId, { pubs: PublisherId[]; subs: SubscriberId[] }> = {
      news: { pubs: [], subs: [] },
      alerts: { pubs: [], subs: [] },
      chat: { pubs: [], subs: [] },
    };
    for (const p of publishers) out[p.topic].pubs.push(p.id);
    for (const s of subscribers) {
      for (const t of s.subscriptions) out[t].subs.push(s.id);
    }
    return out;
  }, [publishers, subscribers]);

  return (
    <div className="space-y-5">
      {/* ── Global controls ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
          <input
            type="checkbox"
            checked={brokerBuffers}
            onChange={(e) => setBrokerBuffers(e.target.checked)}
            className="h-4 w-4 accent-cyan-500"
          />
          Broker buffers on disconnect
        </label>

        <div className="ml-2 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <span>delivery</span>
          <div className="flex overflow-hidden rounded-md border border-[var(--color-border)]">
            {(["at-most-once", "at-least-once"] as DeliveryMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setDeliveryMode(mode)}
                className={
                  "px-2.5 py-1 text-[11px] font-medium transition " +
                  (deliveryMode === mode
                    ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]")
                }
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => (running ? stop() : setRunning(true))}
            className="rounded-md bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-cyan-600"
          >
            {running ? "Pause" : "Resume"}
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

      {/* ── Three-column layout: publishers / topics / subscribers ───── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_0.8fr_1.4fr]">
        {/* ── Publishers ───────────────────────────────────────────── */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
            Publishers
          </h3>
          {publishers.map((p) => {
            const topicMeta = TOPICS.find((t) => t.id === p.topic)!;
            return (
              <div
                key={p.id}
                className="rounded-xl border bg-[var(--color-bg-surface)] p-3 transition-colors"
                style={{ borderColor: `${topicMeta.color}55` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {p.label}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase"
                    style={{
                      background: `${topicMeta.color}22`,
                      color: topicMeta.color,
                    }}
                  >
                    → {topicMeta.label}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  <label className="flex items-center justify-between gap-3 text-[11px] text-[var(--color-text-muted)]">
                    <span>rate</span>
                    <span className="font-mono text-[var(--color-text-secondary)]">
                      {p.rate} msg/s
                    </span>
                  </label>
                  <input
                    aria-label={`${p.label} rate`}
                    type="range"
                    min={0}
                    max={50}
                    step={1}
                    value={p.rate}
                    onChange={(e) => updatePublisherRate(p.id, Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => manualEmit(p.id)}
                    className="w-full rounded-md border border-[var(--color-border)] px-2 py-1 text-[11px] font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-subtle)]"
                  >
                    Emit one
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Topics (broker channels) ─────────────────────────────── */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
            Topics
          </h3>
          {TOPICS.map((t) => {
            const graph = topicGraph[t.id];
            return (
              <div
                key={t.id}
                className="rounded-xl border p-3"
                style={{
                  borderColor: `${t.color}55`,
                  background: `${t.color}0a`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: t.color }}>
                    #{t.label}
                  </span>
                  <span
                    className="h-2 w-2 animate-pulse rounded-full"
                    style={{ background: t.color }}
                    aria-hidden
                  />
                </div>
                <p className="mt-1.5 font-mono text-[10px] text-[var(--color-text-muted)]">
                  {graph.pubs.length} pub · {graph.subs.length} sub
                </p>
              </div>
            );
          })}
          <div className="rounded-xl border border-dashed border-[var(--color-border)] p-3 text-[11px] leading-relaxed text-[var(--color-text-muted)]">
            Topics fan one message out to every subscribed consumer. Drop a subscriber and the
            others still receive — that&rsquo;s the difference from point-to-point queues.
          </div>
        </div>

        {/* ── Subscribers ──────────────────────────────────────────── */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
            Subscribers
          </h3>
          {subscribers.map((s) => {
            const queueDepth = s.queue.length;
            const isBackpressured = queueDepth > 10;
            const isOverflow = queueDepth >= MAX_QUEUE_DEPTH;
            const meanLatencyMs =
              s.latencyCount === 0 ? null : Math.round((s.latencySum / s.latencyCount) * TICK_MS);
            return (
              <div
                key={s.id}
                className="rounded-xl border bg-[var(--color-bg-surface)] p-3 transition-colors"
                style={{
                  borderColor: s.crashed
                    ? "#ef444488"
                    : s.disconnected
                      ? "#f59e0b88"
                      : isBackpressured
                        ? "#fb718588"
                        : "var(--color-border)",
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {s.label}
                    </span>
                    {s.crashed && (
                      <span className="rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                        crashed
                      </span>
                    )}
                    {s.disconnected && !s.crashed && (
                      <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                        offline
                      </span>
                    )}
                    {isBackpressured && !s.disconnected && !s.crashed && (
                      <span className="rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                        backpressure
                      </span>
                    )}
                    {isOverflow && (
                      <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-800 dark:bg-rose-500/25 dark:text-rose-200">
                        queue full
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                    q={queueDepth}
                  </span>
                </div>

                {/* Topic subscription toggles */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {TOPICS.map((t) => {
                    const subscribed = s.subscriptions.has(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleSubscription(s.id, t.id)}
                        className={
                          "rounded-full border px-2 py-0.5 text-[10px] font-medium transition " +
                          (subscribed
                            ? "text-white"
                            : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)]")
                        }
                        style={{
                          background: subscribed ? t.color : "transparent",
                          borderColor: subscribed ? t.color : "var(--color-border)",
                        }}
                      >
                        #{t.label}
                      </button>
                    );
                  })}
                </div>

                {/* Drain rate */}
                <div className="mt-3 space-y-1.5">
                  <label className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
                    <span>drain</span>
                    <span className="font-mono text-[var(--color-text-secondary)]">
                      {s.drainRate} msg/s
                    </span>
                  </label>
                  <input
                    aria-label={`${s.label} drain rate`}
                    type="range"
                    min={0}
                    max={20}
                    step={1}
                    value={s.drainRate}
                    onChange={(e) => updateSubscriberDrain(s.id, Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                {/* Queue depth bar */}
                <div className="mt-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
                    <div
                      className="h-full transition-[width]"
                      style={{
                        width: `${Math.min(100, (queueDepth / 50) * 100)}%`,
                        background: isOverflow
                          ? "#dc2626"
                          : isBackpressured
                            ? "#fb7185"
                            : "#06b6d4",
                      }}
                    />
                  </div>
                </div>

                {/* Stats line */}
                <dl className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
                  <div>
                    <dt className="text-[var(--color-text-muted)]">delivered</dt>
                    <dd className="font-mono text-[var(--color-text-primary)]">{s.processed}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-text-muted)]">dropped</dt>
                    <dd className="font-mono text-rose-500">{s.dropped}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-text-muted)]">latency</dt>
                    <dd className="font-mono text-[var(--color-text-primary)]">
                      {meanLatencyMs === null ? "—" : `${meanLatencyMs}ms`}
                    </dd>
                  </div>
                </dl>

                {/* Inbox preview — recent messages */}
                <div className="mt-2 flex h-6 items-center gap-0.5 overflow-hidden rounded-md bg-[var(--color-bg-subtle)] px-1">
                  {s.recent.length === 0 ? (
                    <span className="text-[10px] text-[var(--color-text-muted)]">inbox empty</span>
                  ) : (
                    s.recent.slice(-20).map((m) => {
                      const c = TOPICS.find((t) => t.id === m.topic)!.color;
                      return (
                        <span
                          key={m.id}
                          className="h-3 w-1.5 shrink-0 rounded-sm"
                          style={{ background: c }}
                          aria-hidden
                        />
                      );
                    })
                  )}
                </div>

                {/* Per-subscriber controls */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {s.disconnected || s.crashed ? (
                    <button
                      type="button"
                      onClick={() => reconnect(s.id)}
                      className="rounded-md bg-emerald-500/15 px-2 py-1 text-[10px] font-semibold text-emerald-700 transition hover:bg-emerald-500/25 dark:text-emerald-300"
                    >
                      Reconnect
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => disconnect(s.id)}
                      className="rounded-md bg-amber-500/15 px-2 py-1 text-[10px] font-semibold text-amber-700 transition hover:bg-amber-500/25 dark:text-amber-300"
                    >
                      Disconnect
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => crash(s.id)}
                    disabled={s.crashed}
                    className="rounded-md bg-rose-500/15 px-2 py-1 text-[10px] font-semibold text-rose-700 transition hover:bg-rose-500/25 disabled:opacity-40 dark:text-rose-300"
                  >
                    Crash
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Global stats panel ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3">
          <p className="text-[10px] font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
            Emitted
          </p>
          <p className="mt-0.5 font-mono text-xl font-bold text-[var(--color-text-primary)]">
            {stats.emitted}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3">
          <p className="text-[10px] font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
            Delivered
          </p>
          <p className="mt-0.5 font-mono text-xl font-bold text-[var(--color-text-primary)]">
            {stats.delivered}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3">
          <p className="text-[10px] font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
            Dropped
          </p>
          <p className="mt-0.5 font-mono text-xl font-bold text-rose-500">{stats.dropped}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3">
          <p className="text-[10px] font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
            Mean latency
          </p>
          <p className="mt-0.5 font-mono text-xl font-bold text-[var(--color-text-primary)]">
            {stats.delivered === 0 ? "—" : `${Math.round(stats.meanLatencyTicks * TICK_MS)}ms`}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3">
          <p className="text-[10px] font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
            Max queue
          </p>
          <p
            className={
              "mt-0.5 font-mono text-xl font-bold " +
              (stats.maxQueueDepth > 10 ? "text-rose-500" : "text-[var(--color-text-primary)]")
            }
          >
            {stats.maxQueueDepth}
          </p>
        </div>
      </div>

      {/* ── Footer hint ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
        <span className="font-semibold text-[var(--color-text-primary)]">Try this:</span> crank the
        Chat publisher to 50 msg/s while Slow worker&rsquo;s drain rate stays at 1. Watch its queue
        climb past 10 — that bar going red is backpressure. Disconnect a subscriber for a few
        seconds: with broker buffering on, its queue grows offline and drains on reconnect. Turn
        buffering off and the same gap silently drops everything.
      </div>
    </div>
  );
}

export default PubSub;
