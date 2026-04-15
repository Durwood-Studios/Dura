"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Repeat, ArrowRight, Clock, Flame, Zap, Trophy } from "lucide-react";
import { getDB } from "@/lib/db";
import { getAllCards, getDueCards } from "@/lib/db/flashcards";
import { levelProgress } from "@/lib/xp";
import { getTotalXP } from "@/lib/db/xp";
import { isStreakAlive, type StreakState, INITIAL_STREAK } from "@/lib/streak";
import { getCurrentStreak } from "@/lib/streak-manager";
import { StreakFlame } from "@/components/gamification/StreakFlame";
import { LevelBadge } from "@/components/gamification/LevelBadge";
import { cn, formatMinutes } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { TOTAL_LESSONS, getPhase } from "@/content/phases";
import type { LessonProgress } from "@/types/curriculum";

interface DashboardData {
  totalXp: number;
  completedCount: number;
  inProgressCount: number;
  totalTimeMs: number;
  dueCardCount: number;
  nextDue: number | null;
  streak: StreakState;
  lastLesson: LessonProgress | null;
}

async function loadDashboard(): Promise<DashboardData> {
  try {
    const db = await getDB();
    const allProgress = await db.getAll("progress");
    const completed = allProgress.filter((p) => p.completedAt !== null);
    const inProgress = allProgress.filter((p) => p.completedAt === null);
    const totalXp = await getTotalXP();
    const totalTimeMs = allProgress.reduce((sum, p) => sum + p.timeSpentMs, 0);
    const streak = await getCurrentStreak();
    const due = await getDueCards();
    let nextDue: number | null = null;
    if (due.length === 0) {
      const all = await getAllCards();
      const now = Date.now();
      for (const card of all) {
        if (card.due > now && (nextDue === null || card.due < nextDue)) nextDue = card.due;
      }
    }
    const lastLesson =
      allProgress.slice().sort((a, b) => (b.startedAt ?? 0) - (a.startedAt ?? 0))[0] ?? null;

    return {
      totalXp,
      completedCount: completed.length,
      inProgressCount: inProgress.length,
      totalTimeMs,
      dueCardCount: due.length,
      nextDue,
      streak,
      lastLesson,
    };
  } catch (error) {
    console.error("[dashboard] load failed", error);
    return {
      totalXp: 0,
      completedCount: 0,
      inProgressCount: 0,
      totalTimeMs: 0,
      dueCardCount: 0,
      nextDue: null,
      streak: INITIAL_STREAK,
      lastLesson: null,
    };
  }
}

export function DashboardClient(): React.ReactElement {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    void loadDashboard().then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        {/* Skeleton welcome */}
        <div className="dura-card p-6">
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        {/* Skeleton stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="dura-card overflow-hidden">
              <div className="h-1 bg-[var(--color-border)]" />
              <div className="flex flex-col gap-3 p-5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          ))}
        </div>
        {/* Skeleton progress */}
        <div className="dura-card p-5">
          <Skeleton className="mb-3 h-4 w-36" />
          <Skeleton className="h-2.5 w-full rounded-full" />
        </div>
        <div className="dura-divider" />
        {/* Skeleton action cards */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="dura-card p-6">
            <Skeleton className="mb-2 h-6 w-48" />
            <Skeleton className="mb-4 h-4 w-64" />
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>
          <div className="dura-card p-6">
            <Skeleton className="mb-2 h-6 w-40" />
            <Skeleton className="mb-4 h-4 w-56" />
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  const level = levelProgress(data.totalXp);
  const streakAlive = isStreakAlive(data.streak);
  const continueHref = data.lastLesson
    ? `/paths/${data.lastLesson.phaseId}/${data.lastLesson.moduleId}/${data.lastLesson.lessonId}`
    : "/paths/0/0-1/01";
  const phaseColor = data.lastLesson
    ? (getPhase(data.lastLesson.phaseId)?.color ?? "#10b981")
    : "#6ee7b7";
  const completionPercent =
    TOTAL_LESSONS > 0 ? Math.round((data.completedCount / TOTAL_LESSONS) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Welcome section ─────────────────────────────────────────── */}
      <div className="dura-card relative overflow-hidden p-6">
        {/* Subtle gradient background accent */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5" />
        <div className="relative flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <LevelBadge level={level.level} size="lg" />
            <div>
              <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
                Welcome back
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Level {level.level} &middot; {level.current} / {level.needed} XP to next level
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-4">
            {data.streak.current > 0 && (
              <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1.5 dark:bg-amber-500/10">
                <StreakFlame days={data.streak.current} />
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  {data.streak.current} day streak
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Zap className="h-4 w-4" />}
          label="Total XP"
          value={data.totalXp.toLocaleString()}
          hint={`Level ${level.level} — ${level.percent}% to next`}
          accentColor="emerald"
        />
        <StatCard
          icon={<Flame className="h-4 w-4" />}
          label="Streak"
          value={`${data.streak.current}d`}
          hint={streakAlive ? "Keep it going!" : "Start today"}
          accentColor="amber"
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Time spent"
          value={formatMinutes(Math.round(data.totalTimeMs / 60_000))}
          hint={data.inProgressCount ? `${data.inProgressCount} in progress` : "Dedicated learner"}
          accentColor="cyan"
        />
        <StatCard
          icon={<Trophy className="h-4 w-4" />}
          label="Lessons"
          value={`${data.completedCount}`}
          hint={`${data.completedCount} of ${TOTAL_LESSONS} completed`}
          accentColor="purple"
        />
      </div>

      {/* ── Overall progress ────────────────────────────────────────── */}
      <div className="dura-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">
            Overall progress
          </span>
          <span className="dura-stat-gradient text-sm font-bold">{completionPercent}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
          <div
            className="dura-progress h-full transition-all duration-700 ease-out"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          {data.completedCount} of {TOTAL_LESSONS} lessons completed
          {data.inProgressCount > 0 && ` · ${data.inProgressCount} in progress`}
        </p>
      </div>

      <div className="dura-divider" />

      {/* ── Action cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Continue Learning */}
        <Link
          href={continueHref}
          className="dura-card group relative overflow-hidden p-6 no-underline transition-shadow"
          style={{ borderLeft: `4px solid ${phaseColor}` }}
        >
          {/* Background gradient accent */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-transparent to-emerald-500/3 opacity-60 transition-opacity group-hover:opacity-100" />
          <div className="relative">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <h2 className="mb-1 text-lg font-semibold text-[var(--color-text-primary)]">
              {data.lastLesson ? "Continue where you left off" : "Start learning"}
            </h2>
            <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
              {data.lastLesson
                ? `Resume ${data.lastLesson.lessonId} in ${data.lastLesson.moduleId}.`
                : "Phase 0 begins with a single lesson on binary."}
            </p>
            <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all group-hover:bg-emerald-600 group-hover:shadow-md">
              {data.lastLesson ? "Continue lesson" : "Start lesson 1"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>

        {/* Review Flashcards */}
        <Link
          href="/review"
          className={cn(
            "dura-card group relative overflow-hidden p-6 no-underline transition-shadow",
            data.dueCardCount > 0 && "dura-glow-emerald"
          )}
        >
          {/* Background gradient accent */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0 opacity-60 transition-opacity group-hover:opacity-100",
              data.dueCardCount > 0
                ? "bg-gradient-to-br from-purple-500/8 via-transparent to-emerald-500/5"
                : "bg-gradient-to-br from-[var(--color-bg-subtle)]/50 via-transparent to-transparent"
            )}
          />
          <div className="relative">
            <div
              className={cn(
                "mb-3 flex h-10 w-10 items-center justify-center rounded-xl",
                data.dueCardCount > 0
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                  : "bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]"
              )}
            >
              <Repeat className="h-5 w-5" />
            </div>
            <h2 className="mb-1 text-lg font-semibold text-[var(--color-text-primary)]">
              {data.dueCardCount > 0 ? "Review flashcards" : "All caught up"}
            </h2>
            <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
              {data.dueCardCount > 0
                ? `${data.dueCardCount} card${data.dueCardCount === 1 ? "" : "s"} due now.`
                : data.nextDue
                  ? `Next review ${formatRelativeFromNow(data.nextDue)}.`
                  : "Add cards from a lesson to start reviewing."}
            </p>
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition-all group-hover:shadow-md",
                data.dueCardCount > 0
                  ? "bg-emerald-500 text-white group-hover:bg-emerald-600"
                  : "border border-[var(--color-border)] text-[var(--color-text-secondary)] group-hover:bg-[var(--color-bg-subtle)]"
              )}
            >
              {data.dueCardCount > 0 ? `Review ${data.dueCardCount}` : "Open review"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}

function formatRelativeFromNow(timestamp: number, now: number = Date.now()): string {
  const ms = timestamp - now;
  if (ms <= 0) return "now";
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `in ${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `in ${hours}h`;
  const days = Math.round(hours / 24);
  return `in ${days}d`;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  accentColor: "emerald" | "amber" | "cyan" | "purple";
}

const ACCENT_STRIP: Record<StatCardProps["accentColor"], string> = {
  emerald: "from-emerald-400 to-emerald-600",
  amber: "from-amber-400 to-amber-500",
  cyan: "from-cyan-400 to-cyan-600",
  purple: "from-purple-400 to-purple-600",
};

const ACCENT_ICON_BG: Record<StatCardProps["accentColor"], string> = {
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

function StatCard({ icon, label, value, hint, accentColor }: StatCardProps): React.ReactElement {
  return (
    <div className="dura-card overflow-hidden">
      {/* Gradient accent strip */}
      <div className={cn("h-1 bg-gradient-to-r", ACCENT_STRIP[accentColor])} />
      <div className="flex flex-col gap-1.5 p-5">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md",
              ACCENT_ICON_BG[accentColor]
            )}
          >
            {icon}
          </div>
          <span className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
            {label}
          </span>
        </div>
        <div className="dura-stat-gradient text-3xl font-bold tracking-tight">{value}</div>
        <div className="text-xs text-[var(--color-text-muted)]">{hint}</div>
      </div>
    </div>
  );
}
