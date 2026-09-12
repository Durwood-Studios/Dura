"use client";

import { useCallback, useId, useState, useSyncExternalStore } from "react";
import { assertCurrentStorageGeneration } from "@/lib/storage/reset-coordination";

interface WrittenExerciseProps {
  title?: string;
  instructions: string;
  starterText?: string;
  rubric: string[];
  modelAnswer: string;
}

const DRAFT_EVENT = "dura:written-draft-change";
const unsavedDrafts = new Map<string, string>();

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(DRAFT_EVENT, callback);
  return (): void => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(DRAFT_EVENT, callback);
  };
}

/** Offline written assessment with a visible rubric; self-review is never an automated grade. */
export function WrittenExercise({
  title = "Practice and review",
  instructions,
  starterText = "",
  rubric,
  modelAnswer,
}: WrittenExerciseProps): React.ReactElement {
  const id = useId();
  const storageKey = `dura:written:${encodeURIComponent(`${title}|${instructions}`)}`;
  const [saveError, setSaveError] = useState<string | null>(null);
  const read = useCallback((): string => {
    const unsaved = unsavedDrafts.get(storageKey);
    if (unsaved !== undefined) return unsaved;
    try {
      return localStorage.getItem(storageKey) ?? starterText;
    } catch {
      return starterText;
    }
  }, [storageKey, starterText]);
  const readServer = useCallback((): string => starterText, [starterText]);
  const answer = useSyncExternalStore(subscribe, read, readServer);

  const update = (value: string): void => {
    try {
      assertCurrentStorageGeneration();
      unsavedDrafts.set(storageKey, value);
      localStorage.setItem(storageKey, value);
      unsavedDrafts.delete(storageKey);
      setSaveError(null);
    } catch (error: unknown) {
      console.error("[written-exercise] Draft could not be saved", error);
      setSaveError(
        "Your draft could not be saved on this device. Copy it before leaving this page."
      );
    } finally {
      window.dispatchEvent(new Event(DRAFT_EVENT));
    }
  };

  return (
    <section
      className="my-8 space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5"
      aria-labelledby={`${id}-title`}
    >
      <h3 id={`${id}-title`} className="text-lg font-semibold">
        {title}
      </h3>
      <p id={`${id}-instructions`} className="text-base whitespace-pre-wrap">
        {instructions}
      </p>
      <label htmlFor={`${id}-answer`} className="block text-sm font-medium">
        Your response
      </label>
      <textarea
        id={`${id}-answer`}
        aria-describedby={`${id}-instructions ${id}-storage`}
        value={answer}
        onChange={(event): void => update(event.target.value)}
        rows={8}
        maxLength={12000}
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3 text-base text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
      />
      <p id={`${id}-storage`} className="text-sm text-[var(--color-text-secondary)]">
        Drafts save on this device. Review your work against each criterion; this activity does not
        award an automated score.
      </p>
      {saveError && (
        <p role="alert" className="text-sm text-[var(--color-text-primary)]">
          {saveError}
        </p>
      )}
      <fieldset className="space-y-2">
        <legend className="mb-2 text-base font-medium">Review your evidence</legend>
        {rubric.map(
          (criterion: string, index: number): React.ReactElement => (
            <label
              key={`${index}-${criterion}`}
              className="flex min-h-12 items-start gap-3 rounded-lg p-2 text-sm"
            >
              <input type="checkbox" className="mt-1 h-5 w-5 accent-[var(--color-accent)]" />
              <span>{criterion}</span>
            </label>
          )
        )}
      </fieldset>
      <details className="rounded-lg border border-[var(--color-border)] p-3">
        <summary className="min-h-12 cursor-pointer py-3 text-sm font-medium">
          Compare with a worked response
        </summary>
        <p className="text-base whitespace-pre-wrap">{modelAnswer}</p>
      </details>
    </section>
  );
}
