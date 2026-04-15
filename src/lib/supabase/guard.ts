/**
 * Supabase Free Tier Guard
 *
 * Every Supabase call in DURA goes through this module. It provides:
 *
 * 1. **Graceful degradation** — if Supabase is down, rate-limited, or
 *    the free tier limit is hit, the app continues working from IDB.
 *
 * 2. **Automatic circuit breaker** — after N consecutive failures, stop
 *    trying for a cooldown period instead of hammering a dead service.
 *
 * 3. **Cost tier awareness** — tracks usage patterns and warns before
 *    hitting limits. Designed for the free tier with hooks for upgrading.
 *
 * Free tier limits (as of 2026):
 * - Database: 500MB storage
 * - Auth: 50,000 MAU
 * - Storage: 1GB files, 2GB bandwidth/month
 * - Edge Functions: 500,000 invocations/month
 * - Realtime: 200 concurrent connections
 * - API: 500 requests/second
 *
 * DURA's rule: the app MUST work fully without Supabase. Every feature
 * that uses Supabase has an IDB fallback. This guard ensures that
 * Supabase failures never break the user experience.
 */

type SupabaseFeature = "auth" | "database" | "storage" | "realtime" | "edge-functions" | "search";

interface CircuitState {
  failures: number;
  lastFailure: number;
  open: boolean;
  openedAt: number;
}

interface UsageMetrics {
  apiCalls: number;
  storageBytesUsed: number;
  realtimeConnections: number;
  resetAt: number; // Start of current billing period
}

// Circuit breaker config per feature
const CIRCUIT_CONFIG: Record<SupabaseFeature, { maxFailures: number; cooldownMs: number }> = {
  auth: { maxFailures: 3, cooldownMs: 60_000 }, // 1 min cooldown
  database: { maxFailures: 5, cooldownMs: 30_000 }, // 30s cooldown
  storage: { maxFailures: 3, cooldownMs: 120_000 }, // 2 min cooldown
  realtime: { maxFailures: 3, cooldownMs: 300_000 }, // 5 min cooldown
  "edge-functions": { maxFailures: 3, cooldownMs: 60_000 },
  search: { maxFailures: 5, cooldownMs: 60_000 },
};

// Free tier limits
const FREE_TIER_LIMITS = {
  apiCallsPerSecond: 500,
  storageMB: 1024,
  storageBandwidthMB: 2048,
  realtimeConnections: 200,
  edgeFunctionInvocations: 500_000,
  databaseMB: 500,
  monthlyActiveUsers: 50_000,
} as const;

// In-memory circuit state (resets on page reload — intentional)
const circuits: Map<SupabaseFeature, CircuitState> = new Map();

// Usage tracking (persists to sessionStorage for the current session)
const usage: UsageMetrics = loadUsage();

function loadUsage(): UsageMetrics {
  if (typeof window === "undefined") {
    return { apiCalls: 0, storageBytesUsed: 0, realtimeConnections: 0, resetAt: Date.now() };
  }
  try {
    const raw = sessionStorage.getItem("dura-supabase-usage");
    if (raw) return JSON.parse(raw) as UsageMetrics;
  } catch {
    // ignore
  }
  return { apiCalls: 0, storageBytesUsed: 0, realtimeConnections: 0, resetAt: Date.now() };
}

function saveUsage(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem("dura-supabase-usage", JSON.stringify(usage));
  } catch {
    // ignore
  }
}

function getCircuit(feature: SupabaseFeature): CircuitState {
  if (!circuits.has(feature)) {
    circuits.set(feature, { failures: 0, lastFailure: 0, open: false, openedAt: 0 });
  }
  return circuits.get(feature)!;
}

/**
 * Check if a Supabase feature is available (circuit closed).
 * If the circuit is open but cooldown has passed, half-open it (allow one attempt).
 */
export function isFeatureAvailable(feature: SupabaseFeature): boolean {
  // If Supabase env vars aren't set, nothing is available
  if (typeof window !== "undefined" && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return false;
  }

  const circuit = getCircuit(feature);
  if (!circuit.open) return true;

  const config = CIRCUIT_CONFIG[feature];
  const elapsed = Date.now() - circuit.openedAt;
  if (elapsed >= config.cooldownMs) {
    // Half-open: allow one attempt
    circuit.open = false;
    circuit.failures = 0;
    return true;
  }

  return false;
}

/**
 * Record a successful Supabase call. Resets the circuit breaker.
 */
export function recordSuccess(feature: SupabaseFeature): void {
  const circuit = getCircuit(feature);
  circuit.failures = 0;
  circuit.open = false;
  usage.apiCalls++;
  saveUsage();
}

/**
 * Record a failed Supabase call. May open the circuit breaker.
 */
export function recordFailure(feature: SupabaseFeature, error?: unknown): void {
  const circuit = getCircuit(feature);
  circuit.failures++;
  circuit.lastFailure = Date.now();

  const config = CIRCUIT_CONFIG[feature];
  if (circuit.failures >= config.maxFailures) {
    circuit.open = true;
    circuit.openedAt = Date.now();
    console.warn(
      `[supabase-guard] Circuit OPEN for "${feature}" after ${circuit.failures} failures. ` +
        `Cooldown: ${config.cooldownMs / 1000}s. Error:`,
      error
    );
  }
}

/**
 * Check if we're approaching a free tier limit.
 * Returns a warning message if close, null if fine.
 */
export function checkFreeTierWarning(): string | null {
  // This is a heuristic — we can't know exact server-side usage from the client.
  // We track client-side calls as a proxy.
  const sessionMinutes = (Date.now() - usage.resetAt) / 60_000;
  if (sessionMinutes < 1) return null;

  const callsPerMinute = usage.apiCalls / sessionMinutes;
  const estimatedDailyCalls = callsPerMinute * 60 * 24;

  // Warn if we'd exceed 80% of the API limit extrapolated over a day
  if (estimatedDailyCalls > FREE_TIER_LIMITS.apiCallsPerSecond * 60 * 0.8) {
    return "High API usage detected. Consider reducing sync frequency.";
  }

  return null;
}

/**
 * Wraps a Supabase call with circuit breaker + graceful degradation.
 * If the circuit is open or the call fails, returns the fallback value.
 *
 * Usage:
 * ```ts
 * const data = await guardedCall(
 *   "database",
 *   () => supabase.from("profiles").select().single(),
 *   null // fallback if Supabase is unavailable
 * );
 * ```
 */
export async function guardedCall<T>(
  feature: SupabaseFeature,
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  if (!isFeatureAvailable(feature)) {
    return fallback;
  }

  try {
    const result = await fn();
    recordSuccess(feature);
    return result;
  } catch (error) {
    recordFailure(feature, error);
    console.error(`[supabase-guard] ${feature} call failed, using fallback:`, error);
    return fallback;
  }
}

/**
 * Same as guardedCall but for Supabase responses that use { data, error } pattern.
 * Automatically checks the error field and records accordingly.
 */
export async function guardedQuery<T>(
  feature: SupabaseFeature,
  fn: () => Promise<{ data: T | null; error: { message: string; code?: string } | null }>,
  fallback: T
): Promise<T> {
  if (!isFeatureAvailable(feature)) {
    return fallback;
  }

  try {
    const { data, error } = await fn();

    if (error) {
      // Check for specific rate limit / quota errors
      if (isQuotaError(error)) {
        console.warn(`[supabase-guard] Free tier limit hit for "${feature}": ${error.message}`);
        recordFailure(feature, error);
        return fallback;
      }

      recordFailure(feature, error);
      console.error(`[supabase-guard] ${feature} query error:`, error.message);
      return fallback;
    }

    recordSuccess(feature);
    return data ?? fallback;
  } catch (error) {
    recordFailure(feature, error);
    console.error(`[supabase-guard] ${feature} query exception:`, error);
    return fallback;
  }
}

/**
 * Detect if an error is a quota/rate limit error.
 */
function isQuotaError(error: { message: string; code?: string }): boolean {
  const msg = error.message.toLowerCase();
  return (
    msg.includes("rate limit") ||
    msg.includes("too many requests") ||
    msg.includes("quota") ||
    msg.includes("limit exceeded") ||
    msg.includes("429") ||
    error.code === "429" ||
    error.code === "PGRST116" // PostgREST resource limit
  );
}

/**
 * Get the current status of all circuit breakers.
 * Useful for the admin dashboard.
 */
export function getCircuitStatus(): Record<
  SupabaseFeature,
  { available: boolean; failures: number; open: boolean }
> {
  const features: SupabaseFeature[] = [
    "auth",
    "database",
    "storage",
    "realtime",
    "edge-functions",
    "search",
  ];
  const status: Record<string, { available: boolean; failures: number; open: boolean }> = {};
  for (const f of features) {
    const circuit = getCircuit(f);
    status[f] = {
      available: isFeatureAvailable(f),
      failures: circuit.failures,
      open: circuit.open,
    };
  }
  return status as Record<SupabaseFeature, { available: boolean; failures: number; open: boolean }>;
}

/**
 * Get current usage metrics for the session.
 */
export function getUsageMetrics(): UsageMetrics & { freeTierLimits: typeof FREE_TIER_LIMITS } {
  return { ...usage, freeTierLimits: FREE_TIER_LIMITS };
}

/**
 * Reset all circuits. Useful for "retry now" button in admin.
 */
export function resetAllCircuits(): void {
  circuits.clear();
}
