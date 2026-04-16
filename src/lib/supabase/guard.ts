/**
 * Supabase Tier Guard — Dynamic Limits with Circuit Breaker
 *
 * Every Supabase call in DURA goes through this module. It provides:
 *
 * 1. **Graceful degradation** — if Supabase is down, rate-limited, or
 *    a tier limit is hit, the app continues working from IDB.
 *
 * 2. **Automatic circuit breaker** — after N consecutive failures, stop
 *    trying for a cooldown period instead of hammering a dead service.
 *
 * 3. **Dynamic tier switching** — admin can switch between Free/Pro/Team/Enterprise
 *    tiers. Limits update site-wide immediately. Persisted to localStorage.
 *
 * DURA's rule: the app MUST work fully without Supabase. Every feature
 * that uses Supabase has an IDB fallback. This guard ensures that
 * Supabase failures never break the user experience.
 */

export type SupabaseFeature =
  | "auth"
  | "database"
  | "storage"
  | "realtime"
  | "edge-functions"
  | "search";

export type SupabaseTier = "free" | "pro" | "team" | "enterprise";

interface CircuitState {
  failures: number;
  lastFailure: number;
  open: boolean;
  openedAt: number;
}

export interface UsageMetrics {
  apiCalls: number;
  storageBytesUsed: number;
  realtimeConnections: number;
  resetAt: number;
}

export interface TierLimits {
  apiCallsPerSecond: number;
  storageMB: number;
  storageBandwidthMB: number;
  realtimeConnections: number;
  edgeFunctionInvocations: number;
  databaseMB: number;
  monthlyActiveUsers: number;
  syncIntervalMs: number;
  maxCircuitCooldownMs: number;
}

// ─── Tier Definitions ──────────────────────────────────────────────────

const TIER_LIMITS: Record<SupabaseTier, TierLimits> = {
  free: {
    apiCallsPerSecond: 500,
    storageMB: 1_024,
    storageBandwidthMB: 2_048,
    realtimeConnections: 200,
    edgeFunctionInvocations: 500_000,
    databaseMB: 500,
    monthlyActiveUsers: 50_000,
    syncIntervalMs: 30_000,
    maxCircuitCooldownMs: 300_000,
  },
  pro: {
    apiCallsPerSecond: 1_000,
    storageMB: 100_000,
    storageBandwidthMB: 200_000,
    realtimeConnections: 500,
    edgeFunctionInvocations: 2_000_000,
    databaseMB: 8_000,
    monthlyActiveUsers: 100_000,
    syncIntervalMs: 15_000,
    maxCircuitCooldownMs: 60_000,
  },
  team: {
    apiCallsPerSecond: 3_000,
    storageMB: 100_000,
    storageBandwidthMB: 200_000,
    realtimeConnections: 2_000,
    edgeFunctionInvocations: 5_000_000,
    databaseMB: 16_000,
    monthlyActiveUsers: 500_000,
    syncIntervalMs: 10_000,
    maxCircuitCooldownMs: 30_000,
  },
  enterprise: {
    apiCallsPerSecond: 10_000,
    storageMB: 1_000_000,
    storageBandwidthMB: 1_000_000,
    realtimeConnections: 10_000,
    edgeFunctionInvocations: 50_000_000,
    databaseMB: 256_000,
    monthlyActiveUsers: 1_000_000,
    syncIntervalMs: 5_000,
    maxCircuitCooldownMs: 15_000,
  },
};

const TIER_META: Record<SupabaseTier, { name: string; price: string; color: string }> = {
  free: { name: "Free", price: "$0/mo", color: "#a3a3a3" },
  pro: { name: "Pro", price: "$25/mo", color: "#10b981" },
  team: { name: "Team", price: "$599/mo", color: "#06b6d4" },
  enterprise: { name: "Enterprise", price: "Custom", color: "#8b5cf6" },
};

// Circuit breaker config per feature — scales with tier
function getCircuitConfig(
  tier: SupabaseTier
): Record<SupabaseFeature, { maxFailures: number; cooldownMs: number }> {
  const maxCooldown = TIER_LIMITS[tier].maxCircuitCooldownMs;
  return {
    auth: { maxFailures: 3, cooldownMs: Math.min(60_000, maxCooldown) },
    database: { maxFailures: 5, cooldownMs: Math.min(30_000, maxCooldown) },
    storage: { maxFailures: 3, cooldownMs: Math.min(120_000, maxCooldown) },
    realtime: { maxFailures: 3, cooldownMs: maxCooldown },
    "edge-functions": { maxFailures: 3, cooldownMs: Math.min(60_000, maxCooldown) },
    search: { maxFailures: 5, cooldownMs: Math.min(60_000, maxCooldown) },
  };
}

// ─── Persistence ───────────────────────────────────────────────────────

const TIER_STORAGE_KEY = "dura-supabase-tier";
const USAGE_STORAGE_KEY = "dura-supabase-usage";

function loadTier(): SupabaseTier {
  if (typeof window === "undefined") return "free";
  try {
    const stored = localStorage.getItem(TIER_STORAGE_KEY);
    if (stored && stored in TIER_LIMITS) return stored as SupabaseTier;
  } catch {
    // ignore
  }
  return "free";
}

function saveTier(tier: SupabaseTier): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TIER_STORAGE_KEY, tier);
  } catch {
    // ignore
  }
}

function loadUsage(): UsageMetrics {
  if (typeof window === "undefined") {
    return { apiCalls: 0, storageBytesUsed: 0, realtimeConnections: 0, resetAt: Date.now() };
  }
  try {
    const raw = sessionStorage.getItem(USAGE_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as UsageMetrics;
  } catch {
    // ignore
  }
  return { apiCalls: 0, storageBytesUsed: 0, realtimeConnections: 0, resetAt: Date.now() };
}

function saveUsage(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage));
  } catch {
    // ignore
  }
}

// ─── State ─────────────────────────────────────────────────────────────

let currentTier: SupabaseTier = loadTier();
const circuits: Map<SupabaseFeature, CircuitState> = new Map();
const usage: UsageMetrics = loadUsage();

function getCircuit(feature: SupabaseFeature): CircuitState {
  if (!circuits.has(feature)) {
    circuits.set(feature, { failures: 0, lastFailure: 0, open: false, openedAt: 0 });
  }
  return circuits.get(feature)!;
}

// ─── Tier Management ───────────────────────────────────────────────────

/** Get the current Supabase tier. */
export function getCurrentTier(): SupabaseTier {
  return currentTier;
}

/** Get limits for the current tier. */
export function getCurrentLimits(): TierLimits {
  return TIER_LIMITS[currentTier];
}

/** Get all available tiers with metadata. */
export function getAllTiers(): {
  id: SupabaseTier;
  name: string;
  price: string;
  color: string;
  limits: TierLimits;
  active: boolean;
}[] {
  return (Object.keys(TIER_LIMITS) as SupabaseTier[]).map((id) => ({
    id,
    ...TIER_META[id],
    limits: TIER_LIMITS[id],
    active: id === currentTier,
  }));
}

/**
 * Switch the Supabase tier. Updates limits site-wide immediately.
 * Resets all circuit breakers on tier change (new limits = fresh start).
 * Persists to localStorage so the setting survives page reloads.
 */
export function setTier(tier: SupabaseTier): void {
  currentTier = tier;
  saveTier(tier);
  circuits.clear(); // Fresh start with new limits
  console.info(`[supabase-guard] Tier switched to "${tier}". Limits updated, circuits reset.`);
}

// ─── Circuit Breaker ───────────────────────────────────────────────────

/** Check if a Supabase feature is available (circuit closed). */
export function isFeatureAvailable(feature: SupabaseFeature): boolean {
  if (typeof window !== "undefined" && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return false;
  }

  const circuit = getCircuit(feature);
  if (!circuit.open) return true;

  const config = getCircuitConfig(currentTier)[feature];
  const elapsed = Date.now() - circuit.openedAt;
  if (elapsed >= config.cooldownMs) {
    circuit.open = false;
    circuit.failures = 0;
    return true;
  }

  return false;
}

/** Record a successful Supabase call. */
export function recordSuccess(feature: SupabaseFeature): void {
  const circuit = getCircuit(feature);
  circuit.failures = 0;
  circuit.open = false;
  usage.apiCalls++;
  saveUsage();
}

/** Record a failed Supabase call. May open the circuit breaker. */
export function recordFailure(feature: SupabaseFeature, error?: unknown): void {
  const circuit = getCircuit(feature);
  circuit.failures++;
  circuit.lastFailure = Date.now();

  const config = getCircuitConfig(currentTier)[feature];
  if (circuit.failures >= config.maxFailures) {
    circuit.open = true;
    circuit.openedAt = Date.now();
    console.warn(
      `[supabase-guard] Circuit OPEN for "${feature}" after ${circuit.failures} failures. ` +
        `Tier: ${currentTier}. Cooldown: ${config.cooldownMs / 1000}s. Error:`,
      error
    );
  }
}

// ─── Usage Monitoring ──────────────────────────────────────────────────

/** Check if approaching tier limits. Returns warning message or null. */
export function checkTierWarning(): string | null {
  const limits = TIER_LIMITS[currentTier];
  const sessionMinutes = (Date.now() - usage.resetAt) / 60_000;
  if (sessionMinutes < 1) return null;

  const callsPerMinute = usage.apiCalls / sessionMinutes;
  const estimatedDailyCalls = callsPerMinute * 60 * 24;

  if (estimatedDailyCalls > limits.apiCallsPerSecond * 60 * 0.8) {
    return `High API usage on ${TIER_META[currentTier].name} tier. Consider upgrading or reducing sync frequency.`;
  }

  return null;
}

// ─── Guarded Calls ─────────────────────────────────────────────────────

/** Wraps a Supabase call with circuit breaker. Returns fallback on failure. */
export async function guardedCall<T>(
  feature: SupabaseFeature,
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  if (!isFeatureAvailable(feature)) return fallback;

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

/** Guarded call for Supabase { data, error } responses. */
export async function guardedQuery<T>(
  feature: SupabaseFeature,
  fn: () => Promise<{ data: T | null; error: { message: string; code?: string } | null }>,
  fallback: T
): Promise<T> {
  if (!isFeatureAvailable(feature)) return fallback;

  try {
    const { data, error } = await fn();

    if (error) {
      if (isQuotaError(error)) {
        console.warn(
          `[supabase-guard] Tier limit hit for "${feature}" on ${currentTier}: ${error.message}`
        );
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

function isQuotaError(error: { message: string; code?: string }): boolean {
  const msg = error.message.toLowerCase();
  return (
    msg.includes("rate limit") ||
    msg.includes("too many requests") ||
    msg.includes("quota") ||
    msg.includes("limit exceeded") ||
    msg.includes("429") ||
    error.code === "429" ||
    error.code === "PGRST116"
  );
}

// ─── Admin Helpers ─────────────────────────────────────────────────────

/** Get circuit breaker status for all features. */
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

/** Get usage metrics + current tier limits. */
export function getUsageMetrics(): UsageMetrics & {
  tier: SupabaseTier;
  tierName: string;
  limits: TierLimits;
} {
  return {
    ...usage,
    tier: currentTier,
    tierName: TIER_META[currentTier].name,
    limits: TIER_LIMITS[currentTier],
  };
}

/** Reset all circuit breakers. */
export function resetAllCircuits(): void {
  circuits.clear();
}
