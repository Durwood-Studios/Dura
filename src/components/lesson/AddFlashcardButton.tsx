"use client";

import { useId, useRef, useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { BookOpen, Check, X } from "lucide-react";
import { createCard } from "@/lib/fsrs";
import { putCard } from "@/lib/db/flashcards";
import { track } from "@/lib/analytics";
import { cn, generateId } from "@/lib/utils";

interface AddFlashcardButtonProps {
  lessonId: string;
  lessonTitle: string;
}

/**
 * Floating "Add to flashcards" button rendered on every lesson page.
 * Available with or without an account. Creates a card in IDB (local-first)
 * with the lesson's title pre-filled as the front, so learners can save any
 * concept from a lesson — not just the 44 lessons that have VocabTooltip terms.
 *
 * Positioned on the left edge to avoid stacking conflicts with the AI Tutor
 * FAB (right edge) and the ToastLayer (right edge).
 */
export function AddFlashcardButton({
  lessonId,
  lessonTitle,
}: AddFlashcardButtonProps): React.ReactElement | null {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState(lessonTitle);
  const [definition, setDefinition] = useState("");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const termRef = useRef<HTMLInputElement | null>(null);
  const formId = useId();

  const handleSave = async (): Promise<void> => {
    const trimmedTerm = term.trim();
    const trimmedDef = definition.trim();
    if (!trimmedTerm || !trimmedDef) {
      setError("Both fields are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const card = createCard({
        id: generateId("card"),
        front: trimmedTerm,
        back: trimmedDef,
        lessonId,
        termSlug: null,
      });
      await putCard(card);
      setJustSaved(true);
      setOpen(false);
      setDefinition("");
      setTerm(lessonTitle);
      // Auto-clear the success state after 2.5 s
      setTimeout(() => setJustSaved(false), 2500);
      void track("flashcard_rated", { source: "lesson-fab", lessonId });
    } catch (err) {
      console.error("[AddFlashcardButton] Failed to save card:", err);
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const changeOpen = (nextOpen: boolean): void => {
    if (nextOpen && justSaved) return;
    setOpen(nextOpen);
    if (nextOpen) {
      setTerm(lessonTitle);
      setDefinition("");
      setError(null);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={changeOpen}>
      {/* Inline form popover — opens above the FAB */}
      <Popover.Portal>
        <Popover.Positioner
          side="top"
          align="start"
          sideOffset={12}
          positionMethod="fixed"
          sticky
          collisionPadding={12}
          collisionAvoidance={{ side: "flip", align: "shift" }}
          className="z-50"
        >
          <Popover.Popup
            initialFocus={termRef}
            finalFocus
            role="dialog"
            aria-label="Add flashcard"
            className="max-h-[min(var(--available-height),calc(100dvh-24px))] w-80 max-w-[min(var(--available-width),calc(100vw-24px))] overflow-y-auto overscroll-contain rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 shadow-xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                Add flashcard
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex min-h-12 min-w-12 items-center justify-center rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <label
              htmlFor={`${formId}-term`}
              className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]"
            >
              Term (front)
            </label>
            <input
              id={`${formId}-term`}
              ref={termRef}
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              maxLength={200}
              className="mb-3 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none"
            />

            <label
              htmlFor={`${formId}-definition`}
              className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]"
            >
              Definition (back)
            </label>
            <textarea
              id={`${formId}-definition`}
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Describe the concept in your own words…"
              className="mb-3 w-full resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] focus:outline-none"
            />

            {error && (
              <p className="mb-2 text-xs text-rose-500" role="alert">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-12 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className={cn(
                  "min-h-12 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition",
                  saving
                    ? "cursor-not-allowed bg-[var(--color-accent)] opacity-60"
                    : "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]"
                )}
              >
                {saving ? "Saving…" : "Save card"}
              </button>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>

      {/* FAB — shows success state briefly after save */}
      <Popover.Trigger
        type="button"
        aria-label={open ? "Close flashcard form" : "Add to flashcards"}
        aria-expanded={open}
        className={cn(
          "fixed bottom-[calc(96px+env(safe-area-inset-bottom))] left-4 z-30 flex min-h-12 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium shadow-lg transition lg:bottom-6 lg:left-6",
          justSaved
            ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
            : "border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]"
        )}
      >
        {justSaved ? (
          <Check className="h-4 w-4" aria-hidden />
        ) : (
          <BookOpen className="h-4 w-4" aria-hidden />
        )}
        <span>{justSaved ? "Card saved!" : "Add to flashcards"}</span>
      </Popover.Trigger>
    </Popover.Root>
  );
}
