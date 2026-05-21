/**
 * Dojo session persistence (IDB dojo-sessions store, DB v6).
 */

import { getDB } from "@/lib/db";
import type { DojoSession } from "@/types/dojo";

/** Persist a completed session. */
export async function putDojoSession(session: DojoSession): Promise<void> {
  const db = await getDB();
  await db.put("dojo-sessions", session);
}

/** Most recent N sessions, newest first. */
export async function getRecentDojoSessions(limit = 20): Promise<DojoSession[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex("dojo-sessions", "by-completed");
  return all.reverse().slice(0, limit);
}

/** All-time stats across every stored session. */
export async function getDojoStats(): Promise<{
  totalSessions: number;
  avgScore: number;
  bestScore: number;
  recentTrend: number[]; // last 10 avg scores, oldest→newest
}> {
  const sessions = await getRecentDojoSessions(100);
  if (sessions.length === 0) {
    return { totalSessions: 0, avgScore: 0, bestScore: 0, recentTrend: [] };
  }
  const scores = sessions.map((s) => s.avgScore);
  const avgScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
  const bestScore = Math.max(...scores);
  const recentTrend = [...scores].reverse().slice(0, 10);
  return { totalSessions: sessions.length, avgScore, bestScore, recentTrend };
}
