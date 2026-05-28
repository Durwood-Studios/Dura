"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";
import { isAIConsented, subscribeAIConsentChanges } from "@/lib/ai/consent-gate";
import { hasAnthropicKey } from "@/lib/ai/key-storage";
import type { LessonMeta } from "@/types/curriculum";

/**
 * Mount point for the AI Tutor — a floating button on every lesson page
 * that opens a slide-in chat panel scoped to the current lesson.
 *
 * The panel itself is dynamic-imported so a learner who never opens it
 * pays zero bundle cost. The button is small and only renders when AI
 * features are enabled (consent + key on file). Before either gate is
 * met the mount renders `null`.
 */
const AITutorPanel = dynamic(
  () => import("@/components/lesson/AITutor/AITutorPanel").then((m) => m.AITutorPanel),
  { ssr: false }
);

interface AITutorMountProps {
  meta: LessonMeta;
  lessonBody: string;
}

export function AITutorMount({ meta, lessonBody }: AITutorMountProps): React.ReactElement | null {
  const [hydrated, setHydrated] = useState(false);
  const [available, setAvailable] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const refresh = (): void => {
      setAvailable(isAIConsented() && hasAnthropicKey());
    };
    refresh();
    return subscribeAIConsentChanges(refresh);
  }, []);

  if (!hydrated || !available) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ask Claude about this lesson"
        className="fixed right-4 bottom-[calc(96px+env(safe-area-inset-bottom)+72px)] z-30 flex items-center gap-2 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-bg-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] shadow-lg transition hover:bg-[var(--color-bg-subtle)] lg:right-6 lg:bottom-6"
      >
        <Sparkles className="h-4 w-4 text-[var(--color-accent)]" aria-hidden />
        Ask Claude
      </button>
      {open && <AITutorPanel meta={meta} lessonBody={lessonBody} onClose={() => setOpen(false)} />}
    </>
  );
}
