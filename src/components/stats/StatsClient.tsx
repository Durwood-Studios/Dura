"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, BookOpen, Clock, Award, Sparkles } from "lucide-react";
import { getDB } from "@/lib/db";
import { getTotalXP, getXPBySource } from "@/lib/db/xp";
import { getAllCards } from "@/lib/db/flashcards";
import { getCurrentStreak } from "@/lib/streak-manager";
import { levelProgress } from "@/lib/xp";
import { formatMinutes, formatTime } from "@/lib/utils";
import { PHASES } from "@/content/phases";
import { summarizeAllPhases, type PhaseSummary } from "@/lib/progress-aggregate";
import { StreakFlame } from "@/components/gamification/StreakFlame";
import { Skeleton } from "@/components/ui/Skeleton";
import type { LessonProgress } from "@/types/curriculum";
import type { StreakState } from "@/lib/streak";

/** Phase colors for the phase progress cards. */
const PHASE_COLORS: Record<string, string> = {
  "0": "#6ee7b7",
  "1": "#93c5fd",
  "2": "#c4b5fd",
  "3": "#fda4af",
  "4": "#fdba74",
  "5": "#f0abfc",
  "6": "#67e8f9",
  "7": "#fcd34d",
  "8": "#a3e635",
  "9": "#f472b6",
};

interface StatsData {
  totalXp: number;
  lessonXp: number;
  quizXp: number;
  flashcardXp: number;
  sandboxXp: number;
  assessmentXp: number;
  completedCount: number;
  totalTimeMs: number;
  streak: StreakState;
  weekly: number[]; // last 7 days, oldest first
  phases: PhaseSummary[];
  deckSize: number;
  dueToday: number;
  retentionRate: number;
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

async function loadStats(): Promise<StatsData> {
  const db = await getDB();
  const allProgress: LessonProgress[] = await db.getAll("progress");
  const completed = allProgress.filter((p) => p.completedAt !== null);
  const totalTimeMs = allProgress.reduce((sum, p) => sum + p.timeSpentMs, 0);

  const [totalXp, lessonXp, quizXp, flashcardXp, sandboxXp, masteryXp, verifyXp, phaseXp] =
    await Promise.all([
      getTotalXP(),
      getXPBySource("lesson"),
      getXPBySource("quiz"),
      getXPBySource("flashcard"),
      getXPBySource("sandbox"),
      getXPBySource("mastery-gate"),
      getXPBySource("verification"),
      getXPBySource("phase-complete"),
    ]);

  const streak = await getCurrentStreak();

  // Weekly activity: last 7 days
  const weekly: number[] = [];
  const today = startOfDay(Date.now());
  for (let i = 6; i >= 0; i--) {
    const dayStart = today - i * 86_400_000;
    const dayEnd = dayStart + 86_400_000;
    const count = completed.filter(
      (p) => (p.completedAt ?? 0) >= dayStart && (p.completedAt ?? 0) < dayEnd
    ).length;
    weekly.push(count);
  }

  const phases = await summarizeAllPhases();

  const cards = await getAllCards();
  const now = Date.now();
  const dueToday = cards.filter((c) => c.due <= now).length;
  const reviewState = cards.filter((c) => c.state === "review").length;
  const retentionRate = cards.length === 0 ? 0 : reviewState / cards.length;

  return {
    totalXp,
    lessonXp,
    quizXp,
    flashcardXp,
    sandboxXp,
    assessmentXp: masteryXp + verifyXp + phaseXp,
    completedCount: completed.length,
    totalTimeMs,
    streak,
    weekly,
    phases,
    deckSize: cards.length,
    dueToday,
    retentionRate,
  };
}

export function StatsClient(): React.ReactElement {
  const [data, setData] = useState<StatsData | null>(null);

  useEffect(() => {
    void loadStats().then(setData);
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

  // Empty state — fresh user with no activity
  const isEmpty = data.totalXp === 0 && data.completedCount === 0 && data.deckSize === 0;
  if (isEmpty) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-12 text-center">
        <Sparkles className="mx-auto h-12 w-12 text-emerald-500" aria-hidden />
        <h2 className="mt-4 text-xl font-semibold text-[var(--color-text-primary)]">
          Your learning data lives here
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Complete your first lesson and watch this page come alive. Every lesson, flashcard review,
          and assessment adds to your story.
        </p>
        <Link
          href="/paths/0"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          Start Phase 0
        </Link>
      </div>
    );
  }

  const level = levelProgress(data.totalXp);
  const maxWeekly = Math.max(1, ...data.weekly);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayIndex = new Date().getDay();
  const weeklyLabels = Array.from({ length: 7 }, (_, i) => days[(todayIndex - 6 + i + 7) % 7]);

  const xpBreakdown = [
    {
      label: "Lessons",
      amount: data.lessonXp,
      color: "bg-emerald-500",
      gradient: "from-emerald-500 to-emerald-400",
    },
    {
      label: "Quizzes",
      amount: data.quizXp,
      color: "bg-cyan-500",
      gradient: "from-cyan-500 to-cyan-400",
    },
    {
      label: "Flashcards",
      amount: data.flashcardXp,
      color: "bg-purple-500",
      gradient: "from-purple-500 to-purple-400",
    },
    {
      label: "Sandbox",
      amount: data.sandboxXp,
      color: "bg-amber-500",
      gradient: "from-amber-500 to-amber-400",
    },
    {
      label: "Assessments",
      amount: data.assessmentXp,
      color: "bg-rose-500",
      gradient: "from-rose-500 to-rose-400",
    },
  ];
  const totalBreakdown = xpBreakdown.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="flex flex-col gap-10">
      {/* Overview stat cards */}
      <section>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={<Trophy className="h-5 w-5 text-amber-500" />}
            label="Total XP"
            value={String(data.totalXp)}
            hint={`Level ${level.level} · ${level.current}/${level.needed} to next`}
            accentColor="#f59e0b"
          />
          <StatCard
            icon={<StreakFlame days={data.streak.current} />}
            label="Day streak"
            value={`${data.streak.current}`}
            hint={`Longest: ${data.streak.longest}d · Freezes: ${data.streak.freezesAvailable}`}
            accentColor="#ef4444"
          />
          <StatCard
            icon={<BookOpen className="h-5 w-5 text-emerald-500" />}
            label="Lessons done"
            value={String(data.completedCount)}
            hint={`of ${PHASES.reduce((s, p) => s + p.lessonCount, 0)}`}
            accentColor="#10b981"
          />
          <StatCard
            icon={<Clock className="h-5 w-5 text-cyan-500" />}
            label="Study time"
            value={formatMinutes(Math.round(data.totalTimeMs / 60_000))}
            hint={formatTime(data.totalTimeMs)}
            accentColor="#06b6d4"
          />
        </div>
      </section>

      <div className="dura-divider" />

      {/* Weekly Activity */}
      <section className="dura-card p-6">
        <h2 className="mb-6 text-sm font-semibold tracking-widest text-[var(--color-text-muted)] uppercase">
          Last 7 days
        </h2>
        <div className="flex h-36 items-end justify-between gap-3">
          {data.weekly.map((count, i) => {
            const height = count === 0 ? 4 : Math.max(8, (count / maxWeekly) * 100);
            const isToday = i === 6;
            return (
              <div
                key={i}
                className="flex flex-1 flex-col items-center gap-1.5"
                title={`${count} lessons`}
              >
                <div
                  className="w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height: `${height}%`,
                    minHeight: count === 0 ? "2px" : "8px",
                    background: isToday
                      ? "linear-gradient(180deg, #10b981, #06b6d4)"
                      : count > 0
                        ? "linear-gradient(180deg, #10b98180, #06b6d480)"
                        : "var(--color-bg-subtle)",
                  }}
                />
                <span
                  className={`text-[10px] font-medium ${isToday ? "text-emerald-500" : "text-[var(--color-text-muted)]"}`}
                >
                  {weeklyLabels[i]}
                </span>
                <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="dura-divider" />

      {/* Phase Progress */}
      <section>
        <h2 className="mb-4 text-sm font-semibold tracking-widest text-[var(--color-text-muted)] uppercase">
          Phase progress
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.phases.map((p) => {
            const ratio = p.totalLessons === 0 ? 0 : p.completedLessons / p.totalLessons;
            const color = PHASE_COLORS[p.phase.id] ?? p.phase.color;
            return (
              <div key={p.phase.id} className="dura-card flex items-stretch overflow-hidden">
                {/* Phase color tint strip */}
                <div className="w-1 shrink-0" style={{ background: color }} />
                <div
                  className="flex flex-1 items-center gap-4 p-4"
                  style={{ background: `${color}08` }}
                >
                  {/* Phase number */}
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={{ background: `${color}20`, color }}
                  >
                    {p.phase.id}
                  </div>

                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[var(--color-text-primary)]">
                        Phase {p.phase.id}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                          {p.completedLessons}/{p.totalLessons}
                        </span>
                        {p.certificate && (
                          <Award className="h-4 w-4 text-emerald-500" aria-label="Verified" />
                        )}
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
                      <div
                        className={
                          ratio === 1
                            ? "dura-progress h-full"
                            : "h-full rounded-full transition-all duration-500"
                        }
                        style={{
                          width: `${Math.round(ratio * 100)}%`,
                          background: ratio < 1 ? color : undefined,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="dura-divider" />

      {/* XP Breakdown */}
      <section className="dura-card p-6">
        <h2 className="mb-4 text-sm font-semibold tracking-widest text-[var(--color-text-muted)] uppercase">
          XP by source
        </h2>
        {totalBreakdown === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">No XP earned yet.</p>
        ) : (
          <>
            {/* Segmented bar */}
            <div className="mb-4 flex h-3.5 overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
              {xpBreakdown.map((b) => (
                <div
                  key={b.label}
                  className={`bg-gradient-to-r ${b.gradient}`}
                  style={{ width: `${(b.amount / totalBreakdown) * 100}%` }}
                />
              ))}
            </div>
            <ul className="flex flex-col gap-2 text-sm">
              {xpBreakdown.map((b) => (
                <li
                  key={b.label}
                  className="flex items-center justify-between text-[var(--color-text-secondary)]"
                >
                  <span className="flex items-center gap-2.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${b.color}`} />
                    {b.label}
                  </span>
                  <span className="font-mono font-medium">{b.amount} XP</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* Review Stats */}
      {data.deckSize > 0 && (
        <>
          <div className="dura-divider" />
          <section className="dura-card p-6">
            <h2 className="mb-4 text-sm font-semibold tracking-widest text-[var(--color-text-muted)] uppercase">
              Review deck
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="dura-stat-gradient text-3xl font-bold">{data.deckSize}</p>
                <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">Cards total</p>
              </div>
              <div>
                <p className="dura-stat-gradient text-3xl font-bold">{data.dueToday}</p>
                <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">Due now</p>
              </div>
              <div>
                <p className="dura-stat-gradient text-3xl font-bold">
                  {Math.round(data.retentionRate * 100)}%
                </p>
                <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">Retention</p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  accentColor: string;
}

function StatCard({ icon, label, value, hint, accentColor }: StatCardProps): React.ReactElement {
  return (
    <div className="dura-card overflow-hidden">
      {/* Gradient accent strip at top */}
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}60)`,
        }}
      />
      <div className="flex flex-col gap-1.5 p-4">
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-wider text-[var(--color-text-muted)] uppercase">
          {icon}
          {label}
        </div>
        <div className="dura-stat-gradient text-3xl font-bold">{value}</div>
        <div className="text-[10px] text-[var(--color-text-muted)]">{hint}</div>
      </div>
    </div>
  );
}
