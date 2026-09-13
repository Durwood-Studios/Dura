"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Target } from "lucide-react";
import { useGoalsStore } from "@/stores/goals";
import { GoalCard } from "@/components/goals/GoalCard";
import { GoalCreator } from "@/components/goals/GoalCreator";
import { Skeleton } from "@/components/ui/Skeleton";
import { getAllEncryptedLessonProgress } from "@/lib/idb/encrypted-store";
import { getDB } from "@/lib/db";
import { goalProgress, goalTarget } from "@/lib/goals/progress";
import type { LessonProgress } from "@/types/curriculum";
import type { Goal } from "@/types/goal";

async function computeProgress(goals: Goal[]): Promise<Map<string, number>> {
  try {
    const db = await getDB();
    const records: LessonProgress[] = await getAllEncryptedLessonProgress(db);
    return new Map(goals.map((goal) => [goal.id, goalProgress(goal, records, Date.now())]));
  } catch (error) {
    console.error("[goals] Progress could not be read", error);
    throw error;
  }
}

export function GoalsClient(): React.ReactElement {
  const goals = useGoalsStore((s) => s.goals);
  const hydrated = useGoalsStore((s) => s.hydrated);
  const load = useGoalsStore((s) => s.load);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [progressMap, setProgressMap] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (!hydrated) void load();
  }, [hydrated, load]);

  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    const refresh = (): void => {
      void computeProgress(goals)
        .then((result) => {
          if (active) {
            setProgressMap(result);
            setProgressError(null);
          }
        })
        .catch(() => {
          if (active)
            setProgressError("Goal progress could not be loaded. Please reload and retry.");
        });
    };
    refresh();
    const timer = setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
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
      <button
        type="button"
        onClick={() => setCreatorOpen(true)}
        aria-label="Add goal"
        className="mb-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 text-sm font-semibold text-white"
      >
        <Plus className="h-5 w-5" aria-hidden />
        Add goal
      </button>
      {progressError && (
        <p role="alert" className="mb-3 text-sm text-[var(--color-error)]">
          {progressError}
        </p>
      )}
      <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
        Daily minutes count observed study time since day tracking was enabled. Career goals measure
        mapped lesson completion, not job readiness. Older career goals without a role must be
        recreated.
      </p>
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
                    <GoalCard
                      goal={{ ...goal, target: goalTarget(goal) }}
                      progress={progressMap.get(goal.id) ?? 0}
                    />
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
                    <GoalCard
                      goal={{ ...goal, target: goalTarget(goal) }}
                      progress={progressMap.get(goal.id) ?? 0}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <GoalCreator open={creatorOpen} onClose={() => setCreatorOpen(false)} />
    </>
  );
}
