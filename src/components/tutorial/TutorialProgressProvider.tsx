"use client";

import { useEffect, useState } from "react";
import { TutorialProgressContext } from "@/lib/tutorial-progress-context";
import { getTutorialProgress, putTutorialProgress } from "@/lib/db/tutorial-progress";
import type { TutorialProgress } from "@/types/tutorial";

interface TutorialProgressProviderProps {
  /** Tutorial slug — used as the stable, deterministic IDB key. */
  slug: string;
  /** Total step count from the MDX frontmatter. */
  totalSteps: number;
  children: React.ReactNode;
}

/** Derive a stable, deterministic IDB key from the tutorial slug. */
function progressIdForSlug(slug: string): string {
  return `tutorial:${slug}`;
}

/**
 * Client component that loads or creates a TutorialProgress record in IndexedDB
 * for the current tutorial, then provides its id to all descendant Checkpoint
 * components via TutorialProgressContext.
 *
 * This component is intentionally minimal — it owns only the load/create
 * lifecycle. Checkpoint handles its own completion writes via completeCheckpoint.
 */
export function TutorialProgressProvider({
  slug,
  totalSteps,
  children,
}: TutorialProgressProviderProps): React.ReactElement {
  const [progressId, setProgressId] = useState<string | null>(null);

  useEffect(() => {
    const id = progressIdForSlug(slug);

    async function loadOrCreate(): Promise<void> {
      let record = await getTutorialProgress(id);
      if (!record) {
        const now = Date.now();
        const newRecord: TutorialProgress = {
          id,
          slug,
          type: "tutorial",
          currentStep: 1,
          totalSteps,
          checkpoints: [],
          startedAt: now,
          completedAt: null,
          lastActiveAt: now,
        };
        await putTutorialProgress(newRecord);
        record = newRecord;
      }
      setProgressId(record.id);
    }

    void loadOrCreate();
  }, [slug, totalSteps]);

  return (
    <TutorialProgressContext.Provider value={{ progressId }}>
      {children}
    </TutorialProgressContext.Provider>
  );
}
