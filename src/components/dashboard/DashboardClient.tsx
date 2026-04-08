"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Trophy, BookOpen, Repeat, ArrowRight } from "lucide-react";
import { getDB } from "@/lib/db";
import { getDueCards } from "@/lib/db/flashcards";
import { levelProgress } from "@/lib/xp";
import { isStreakAlive, type StreakState, INITIAL_STREAK } from "@/lib/streak";
import { formatMinutes } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { TOTAL_LESSONS } from "@/content/phases";
import type { LessonProgress } from "@/types/curriculum";

interface DashboardData {
  totalXp: number;
  completedCount: number;
  inProgressCount: number;
  totalTimeMs: number;
  dueCardCount: number;
  streak: StreakState;
  lastLesson: LessonProgress | null;
}

async function loadDashboard(): Promise<DashboardData> {
  try {
    const db = await getDB();
    const allProgress = await db.getAll("progress");
    const completed = allProgress.filter((p) => p.completedAt !== null);
    const inProgress = allProgress.filter((p) => p.completedAt === null);
    const totalXp = completed.reduce((sum, p) => sum + p.xpEarned, 0);
    const totalTimeMs = allProgress.reduce((sum, p) => sum + p.timeSpentMs, 0);
    const due = await getDueCards();
    const lastLesson =
      allProgress.slice().sort((a, b) => (b.startedAt ?? 0) - (a.startedAt ?? 0))[0] ?? null;

    return {
      totalXp,
      completedCount: completed.length,
      inProgressCount: inProgress.length,
      totalTimeMs,
      dueCardCount: due.length,
      streak: INITIAL_STREAK,
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  const level = levelProgress(data.totalXp);
  const streakAlive = isStreakAlive(data.streak);
  const continueHref = data.lastLesson
    ? `/paths/${data.lastLesson.phaseId}/${data.lastLesson.moduleId}/${data.lastLesson.lessonId}`
    : "/paths/0/0-1/01";

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Trophy className="h-4 w-4 text-amber-500" />}
          label="Level"
          value={String(level.level)}
          hint={`${level.current} / ${level.needed} XP to next`}
        />
        <StatCard
          icon={<Flame className="h-4 w-4 text-rose-500" />}
          label="Streak"
          value={`${data.streak.current}d`}
          hint={streakAlive ? "Keep it going" : "Start today"}
        />
        <StatCard
          icon={<BookOpen className="h-4 w-4 text-emerald-500" />}
          label="Lessons"
          value={`${data.completedCount} / ${TOTAL_LESSONS}`}
          hint={data.inProgressCount ? `${data.inProgressCount} in progress` : "All clear"}
        />
        <StatCard
          icon={<Repeat className="h-4 w-4 text-purple-500" />}
          label="Due to review"
          value={String(data.dueCardCount)}
          hint={`${formatMinutes(Math.round(data.totalTimeMs / 60_000))} total`}
        />
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        <h2 className="mb-1 text-xl font-semibold text-[var(--color-text-primary)]">
          {data.lastLesson ? "Continue where you left off" : "Start learning"}
        </h2>
        <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
          {data.lastLesson
            ? `Resume ${data.lastLesson.lessonId} in ${data.lastLesson.moduleId}.`
            : "Phase 0 begins with a single lesson on binary."}
        </p>
        <Link
          href={continueHref}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          {data.lastLesson ? "Continue lesson" : "Start lesson 1"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}

function StatCard({ icon, label, value, hint }: StatCardProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-text-muted)] uppercase">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-semibold text-[var(--color-text-primary)]">{value}</div>
      <div className="text-xs text-[var(--color-text-muted)]">{hint}</div>
    </div>
  );
}
