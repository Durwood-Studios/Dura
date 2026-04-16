"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Database,
  BarChart3,
  Settings,
  Trash2,
  Download,
  ExternalLink,
  BookOpen,
  GraduationCap,
  Shield,
  RefreshCw,
  Check,
  AlertTriangle,
} from "lucide-react";
import { PHASES, TOTAL_LESSONS, TOTAL_MODULES, TOTAL_HOURS } from "@/content/phases";
import { DICTIONARY } from "@/content/dictionary";
import { ALL_QUESTIONS } from "@/content/questions";
import type { AnalyticsEvent } from "@/types/analytics";
import { getDB } from "@/lib/db";
import { clearAllData, exportAllData } from "@/lib/clearAllData";
import {
  getAllTiers,
  setTier,
  getCurrentTier,
  getCircuitStatus,
  getUsageMetrics,
  resetAllCircuits,
  type SupabaseTier,
} from "@/lib/supabase/guard";

const IDB_STORES = [
  "progress",
  "moduleProgress",
  "phaseProgress",
  "flashcards",
  "reviewLogs",
  "goals",
  "preferences",
  "dictionaryCache",
  "analytics",
  "sandbox-saves",
  "assessment-results",
  "certificates",
  "xp-events",
  "tutorial-progress",
] as const;

/** Format a timestamp as relative time ("2m ago", "1h ago", etc.) */
function relativeTime(ts: number): string {
  const now = Date.now();
  const diffMs = now - ts;
  if (diffMs < 0) return "just now";

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Stat card for the content inventory grid. */
function StatCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  sub?: string;
}): React.ReactElement {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
      <div className="mb-2 flex items-center gap-2 text-[var(--color-text-secondary)]">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <p className="font-mono text-3xl font-semibold text-[var(--color-text-primary)]">{value}</p>
      {sub && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{sub}</p>}
    </div>
  );
}

/** Section wrapper with a title. */
function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--color-text-primary)]">
        <Icon className="h-5 w-5 text-[var(--color-accent-emerald)]" />
        {title}
      </h2>
      {children}
    </section>
  );
}

export function AdminDashboard(): React.ReactElement {
  const [storeCounts, setStoreCounts] = useState<Record<string, number>>({});
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const loadIDBData = useCallback(async (): Promise<void> => {
    try {
      const db = await getDB();
      const counts: Record<string, number> = {};
      for (const store of IDB_STORES) {
        try {
          counts[store] = await db.count(store);
        } catch {
          counts[store] = -1;
        }
      }
      setStoreCounts(counts);

      try {
        const events = await db.getAll("analytics");
        setAnalyticsEvents(events.slice(-50).reverse());
      } catch {
        setAnalyticsEvents([]);
      }
    } catch (error) {
      console.error("[AdminDashboard] Failed to load IDB data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadIDBData();
  }, [loadIDBData]);

  async function handleClear(): Promise<void> {
    if (!window.confirm("This will permanently delete ALL local data. Continue?")) return;
    setIsClearing(true);
    try {
      await clearAllData();
      window.location.href = "/";
    } catch (error) {
      console.error("[AdminDashboard] Clear failed:", error);
      setIsClearing(false);
    }
  }

  async function handleExport(): Promise<void> {
    setIsExporting(true);
    try {
      const json = await exportAllData();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dura-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[AdminDashboard] Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  }

  // Phase breakdown string
  const phaseBreakdown = PHASES.map((p) => `P${p.id}: ${p.lessonCount}`).join(", ");

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div className="flex items-center gap-3">
        <Settings className="h-7 w-7 text-[var(--color-accent-emerald)]" />
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Admin Dashboard</h1>
      </div>

      {/* Content Inventory */}
      <Section title="Content Inventory" icon={BookOpen}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total Lessons"
            value={TOTAL_LESSONS}
            icon={BookOpen}
            sub={phaseBreakdown}
          />
          <StatCard
            label="Total Modules"
            value={TOTAL_MODULES}
            icon={GraduationCap}
            sub={`${TOTAL_HOURS} estimated hours`}
          />
          <StatCard label="Dictionary Terms" value={DICTIONARY.length} icon={BookOpen} />
          <StatCard
            label="Assessment Questions"
            value={ALL_QUESTIONS.length}
            icon={GraduationCap}
          />
          <StatCard label="How-To Guides" value={35} icon={BookOpen} />
          <StatCard label="Tutorials" value={100} icon={GraduationCap} />
        </div>
      </Section>

      {/* IDB Data */}
      <Section title="IndexedDB Stores" icon={Database}>
        {isLoading ? (
          <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-secondary)]">
                  <th className="pr-4 pb-2 font-medium">Store Name</th>
                  <th className="pb-2 font-medium">Record Count</th>
                </tr>
              </thead>
              <tbody>
                {IDB_STORES.map((store) => (
                  <tr key={store} className="border-b border-[var(--color-border)]/50">
                    <td className="py-2 pr-4 font-mono text-[var(--color-text-primary)]">
                      {store}
                    </td>
                    <td className="py-2 font-mono text-[var(--color-text-primary)]">
                      {storeCounts[store] === -1 ? (
                        <span className="text-red-400">error</span>
                      ) : (
                        (storeCounts[store] ?? "—")
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Analytics Events */}
      <Section title="Recent Analytics Events" icon={BarChart3}>
        {isLoading ? (
          <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>
        ) : analyticsEvents.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            No analytics events recorded yet.
          </p>
        ) : (
          <div className="max-h-96 overflow-auto rounded-lg">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[var(--color-bg-surface)]">
                <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-secondary)]">
                  <th className="pr-4 pb-2 font-medium">Timestamp</th>
                  <th className="pr-4 pb-2 font-medium">Event Name</th>
                  <th className="pb-2 font-medium">Properties</th>
                </tr>
              </thead>
              <tbody>
                {analyticsEvents.map((evt, i) => (
                  <tr key={i} className="border-b border-[var(--color-border)]/50">
                    <td className="py-2 pr-4 font-mono text-xs whitespace-nowrap text-[var(--color-text-muted)]">
                      {relativeTime(evt.timestamp)}
                    </td>
                    <td className="py-2 pr-4 font-mono text-[var(--color-text-primary)]">
                      {evt.name}
                    </td>
                    <td className="max-w-xs truncate py-2 font-mono text-xs text-[var(--color-text-secondary)]">
                      {JSON.stringify(evt.properties)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Quick Actions */}
      <Section title="Quick Actions" icon={Settings}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => void handleClear()}
            disabled={isClearing}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {isClearing ? "Clearing…" : "Clear All Data"}
          </button>

          <button
            onClick={() => void handleExport()}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-surface-hover)] disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting…" : "Export Data"}
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-surface-hover)]"
          >
            <ExternalLink className="h-4 w-4" />
            View Site
          </Link>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3">
            <p className="mb-1 text-xs font-medium text-[var(--color-text-secondary)]">
              Build Info
            </p>
            <p className="font-mono text-xs text-[var(--color-text-muted)]">
              Next.js 15 &middot; {process.env.NODE_ENV} &middot;{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </Section>

      {/* Supabase Tier & Circuit Breaker */}
      <SupabaseTierPanel />
    </div>
  );
}

function SupabaseTierPanel(): React.ReactElement {
  const [activeTier, setActiveTier] = useState<SupabaseTier>(getCurrentTier());
  const [circuits, setCircuits] = useState(getCircuitStatus());
  const [metrics, setMetrics] = useState(getUsageMetrics());

  useEffect(() => {
    const id = setInterval(() => {
      setCircuits(getCircuitStatus());
      setMetrics(getUsageMetrics());
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const handleTierChange = (tier: SupabaseTier): void => {
    setTier(tier);
    setActiveTier(tier);
    setCircuits(getCircuitStatus());
    setMetrics(getUsageMetrics());
  };

  const handleResetCircuits = (): void => {
    resetAllCircuits();
    setCircuits(getCircuitStatus());
  };

  const tiers = getAllTiers();
  const currentLimits = metrics.limits;

  return (
    <>
      <Section title="Supabase Tier" icon={Shield}>
        <p className="mb-4 text-xs text-[var(--color-text-secondary)]">
          Switch tiers to update rate limits, sync intervals, and circuit breaker tolerances
          site-wide. This setting persists across page reloads.
        </p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {tiers.map((tier) => (
            <button
              key={tier.id}
              type="button"
              onClick={() => handleTierChange(tier.id)}
              className={`relative rounded-xl border-2 p-4 text-left transition ${
                tier.id === activeTier
                  ? "border-emerald-500 bg-emerald-500/5"
                  : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]"
              }`}
            >
              {tier.id === activeTier && (
                <Check className="absolute top-2 right-2 h-4 w-4 text-emerald-500" />
              )}
              <div className="mb-2 h-2 w-8 rounded-full" style={{ background: tier.color }} />
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{tier.name}</p>
              <p className="font-mono text-xs text-[var(--color-text-muted)]">{tier.price}</p>
            </button>
          ))}
        </div>

        {/* Current limits table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-muted)]">
                <th className="pb-2 font-medium">Resource</th>
                <th className="pb-2 font-medium">Limit</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[var(--color-text-secondary)]">
              <tr className="border-b border-[var(--color-border-subtle)]">
                <td className="py-1.5">Database</td>
                <td className="py-1.5">{(currentLimits.databaseMB / 1000).toFixed(1)} GB</td>
              </tr>
              <tr className="border-b border-[var(--color-border-subtle)]">
                <td className="py-1.5">Storage</td>
                <td className="py-1.5">{(currentLimits.storageMB / 1000).toFixed(0)} GB</td>
              </tr>
              <tr className="border-b border-[var(--color-border-subtle)]">
                <td className="py-1.5">Bandwidth</td>
                <td className="py-1.5">
                  {(currentLimits.storageBandwidthMB / 1000).toFixed(0)} GB/mo
                </td>
              </tr>
              <tr className="border-b border-[var(--color-border-subtle)]">
                <td className="py-1.5">Realtime connections</td>
                <td className="py-1.5">{currentLimits.realtimeConnections.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-[var(--color-border-subtle)]">
                <td className="py-1.5">Edge Functions</td>
                <td className="py-1.5">
                  {(currentLimits.edgeFunctionInvocations / 1000).toFixed(0)}K/mo
                </td>
              </tr>
              <tr className="border-b border-[var(--color-border-subtle)]">
                <td className="py-1.5">API rate</td>
                <td className="py-1.5">{currentLimits.apiCallsPerSecond.toLocaleString()} req/s</td>
              </tr>
              <tr className="border-b border-[var(--color-border-subtle)]">
                <td className="py-1.5">Monthly active users</td>
                <td className="py-1.5">{(currentLimits.monthlyActiveUsers / 1000).toFixed(0)}K</td>
              </tr>
              <tr>
                <td className="py-1.5">Sync interval</td>
                <td className="py-1.5">{currentLimits.syncIntervalMs / 1000}s</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* Circuit Breaker Status */}
      <Section title="Circuit Breakers" icon={AlertTriangle}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs text-[var(--color-text-secondary)]">
            Auto-refreshes every 5 seconds. Open circuits fall back to IndexedDB.
          </p>
          <button
            type="button"
            onClick={handleResetCircuits}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-subtle)]"
          >
            <RefreshCw className="h-3 w-3" />
            Reset All
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {Object.entries(circuits).map(([feature, state]) => (
            <div
              key={feature}
              className={`rounded-lg border p-3 ${
                state.open
                  ? "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/20"
                  : state.failures > 0
                    ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20"
                    : "border-[var(--color-border)] bg-[var(--color-bg-surface)]"
              }`}
            >
              <p className="mb-1 text-[10px] font-medium tracking-wider text-[var(--color-text-muted)] uppercase">
                {feature}
              </p>
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    state.open
                      ? "bg-rose-500"
                      : state.failures > 0
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                />
                <span className="font-mono text-xs text-[var(--color-text-primary)]">
                  {state.open ? "OPEN" : state.failures > 0 ? `${state.failures} fail` : "OK"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Session usage */}
        <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3">
          <p className="mb-1 text-[10px] font-medium tracking-wider text-[var(--color-text-muted)] uppercase">
            Session Usage
          </p>
          <p className="font-mono text-sm text-[var(--color-text-primary)]">
            {metrics.apiCalls.toLocaleString()} API calls
            <span className="mx-2 text-[var(--color-text-muted)]">&middot;</span>
            Tier: {metrics.tierName}
          </p>
        </div>
      </Section>
    </>
  );
}
