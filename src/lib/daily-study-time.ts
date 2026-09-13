import { z } from "zod";

/** Local calendar buckets preserve actual study time without rewriting historical totals. */
export const DAILY_TIME_SCHEMA = z
  .record(z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.number().finite().min(0).max(86400000))
  .refine((value) => Object.keys(value).length <= 36600, "Too many daily study records");

/** Attribute an observed interval to local calendar days, splitting at midnight. */
export function addDailyStudyTime(
  existing: Record<string, number>,
  deltaMs: number,
  now: number = Date.now()
): Record<string, number> {
  if (!Number.isFinite(deltaMs) || deltaMs <= 0 || deltaMs > 60000 || !Number.isFinite(now))
    return existing;
  const next = { ...existing };
  let cursor = now - deltaMs;
  while (cursor < now) {
    const date = new Date(cursor);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const boundary = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime();
    const end = Math.min(now, boundary);
    next[key] = Math.min(86400000, (next[key] ?? 0) + end - cursor);
    cursor = end;
  }
  return next;
}
