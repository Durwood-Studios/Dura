import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Cryptographically random id when available, otherwise a non-crypto fallback.
 * Safe in both browser and Node runtimes.
 */
export function generateId(prefix?: string): string {
  let id: string;
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    id = crypto.randomUUID();
  } else {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
  return prefix ? `${prefix}_${id}` : id;
}

/** Format milliseconds as a human-readable duration. */
export function formatTime(ms: number): string {
  if (ms < 1000) return "0s";
  const totalSeconds = Math.round(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

/** Format a duration in minutes for "estimated time" UI. */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/** Format a count with K/M suffixes. */
export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

/** Trailing-edge debounce. */
export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  waitMs: number
): (...args: TArgs) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: TArgs) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), waitMs);
  };
}

/** Leading-edge throttle: invokes once per window, ignores subsequent calls. */
export function throttle<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  waitMs: number
): (...args: TArgs) => void {
  let last = 0;
  return (...args: TArgs) => {
    const now = Date.now();
    if (now - last >= waitMs) {
      last = now;
      fn(...args);
    }
  };
}

/** Days between two timestamps using local-day boundaries. */
export function daysBetween(a: number, b: number): number {
  const dayA = new Date(a);
  const dayB = new Date(b);
  dayA.setHours(0, 0, 0, 0);
  dayB.setHours(0, 0, 0, 0);
  return Math.round((dayB.getTime() - dayA.getTime()) / 86_400_000);
}
