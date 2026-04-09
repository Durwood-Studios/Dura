"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Target } from "lucide-react";
import { useGoalsStore } from "@/stores/goals";
import { GoalCard } from "@/components/goals/GoalCard";
import { GoalCreator } from "@/components/goals/GoalCreator";
import { Skeleton } from "@/components/ui/Skeleton";
import { getDB } from "@/lib/db";
import { getCertificatesByPhase } from "@/lib/db/certificates";
import type { LessonProgress } from "@/types/curriculum";
import type { Goal } from "@/types/goal";
import { PHASES } from "@/content/phases";

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function startOfWeek(ts: number): number {
  const d = new Date(ts);
  const day = d.getDay();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d.getTime();
}

async function computeProgress(goals: Goal[]): Promise<Map<string, number>> {
  try {
    const db = await getDB();
    const allProgress: LessonProgress[] = await db.getAll("progress");
    const completed = allProgress.filter((p) => p.completedAt !== null);
    const now = Date.now();
    const today = startOfDay(now);
    const week = startOfWeek(now);

    const progressMap = new Map<string, number>();

    for (const goal of goals) {
      if (goal.type === "daily") {
        if (goal.unit === "lessons") {
          const count = completed.filter((p) => (p.completedAt ?? 0) >= today).length;
          progressMap.set(goal.id, count);
        } else if (goal.unit === "minutes") {
          const todayRecords = allProgress.filter((p) => (p.completedAt ?? p.startedAt) >= today);
          const minutes = Math.round(
            todayRecords.reduce((sum, p) => sum + p.timeSpentMs, 0) / 60_000
          );
          progressMap.set(goal.id, minutes);
        }
      } else if (goal.type === "weekly") {
        const count = completed.filter((p) => (p.completedAt ?? 0) >= week).length;
        progressMap.set(goal.id, count);
      } else if (goal.type === "phase") {
        // target is 1 (finish the phase); progress = fraction completed
        const phaseRecords = completed.filter((p) => p.phaseId === "0");
        // use the label to identify the phase — simplest: if any cert exists for phase 0, 1 else fraction
        // We stored target=1 for phase goals; progress is lessons-completed-in-phase / total
        // Since we don't know which phase from the goal object alone, parse from label as a fallback.
        const match = /Phase (\d+)/.exec(goal.label);
        const phaseId = match ? match[1] : null;
        if (phaseId) {
          const phase = PHASES.find((p) => p.id === phaseId);
          if (phase) {
            const done = completed.filter((p) => p.phaseId === phaseId).length;
            progressMap.set(goal.id, done / Math.max(1, phase.lessonCount));
          } else {
            progressMap.set(goal.id, phaseRecords.length);
          }
        } else {
          progressMap.set(goal.id, 0);
        }
      } else if (goal.type === "career") {
        // Count completed phases via certificates
        let verifiedCount = 0;
        for (const phase of PHASES) {
          const certs = await getCertificatesByPhase(phase.id);
          if (certs.length > 0) verifiedCount++;
        }
        progressMap.set(goal.id, verifiedCount);
      } else {
        progressMap.set(goal.id, 0);
      }
    }

    return progressMap;
  } catch (error) {
    console.error("[goals] computeProgress failed", error);
    return new Map();
  }
}

export function GoalsClient(): React.ReactElement {
  const goals = useGoalsStore((s) => s.goals);
  const hydrated = useGoalsStore((s) => s.hydrated);
  const load = useGoalsStore((s) => s.load);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [progressMap, setProgressMap] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (!hydrated) void load();
  }, [hydrated, load]);

  useEffect(() => {
    if (!hydrated) return;
    void computeProgress(goals).then(setProgressMap);
  }, [goals, hydrated]);

  const active = useMemo(() => goals.filter((g) => g.achievedAt === null), [goals]);
  const achieved = useMemo(() => goals.filter((g) => g.achievedAt !== null), [goals]);

  if (!hydrated) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }, (_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  return (
    <>
      {active.length === 0 && achieved.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-12 text-center">
          <Target className="mx-auto h-12 w-12 text-[var(--color-text-muted)]" aria-hidden />
          <h2 className="mt-4 text-xl font-semibold text-[var(--color-text-primary)]">
            Set your first goal
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Goals turn good intentions into compound progress.
          </p>
          <button
            type="button"
            onClick={() => setCreatorOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4" />
            Set your first goal
          </button>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold tracking-widest text-[var(--color-text-muted)] uppercase">
                Active
              </h2>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {active.map((goal) => (
                  <li key={goal.id}>
                    <GoalCard goal={goal} progress={progressMap.get(goal.id) ?? 0} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {achieved.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-3 text-sm font-semibold tracking-widest text-[var(--color-text-muted)] uppercase">
                Achieved
              </h2>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {achieved.map((goal) => (
                  <li key={goal.id}>
                    <GoalCard goal={goal} progress={progressMap.get(goal.id) ?? 0} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <button
        type="button"
        onClick={() => setCreatorOpen(true)}
        aria-label="Add goal"
        className="fixed right-6 bottom-24 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition hover:bg-emerald-600 lg:bottom-6"
      >
        <Plus className="h-5 w-5" />
      </button>

      <GoalCreator open={creatorOpen} onClose={() => setCreatorOpen(false)} />
    </>
  );
}
