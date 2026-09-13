"use client";

import { useActivityEvidence, type ActivityProps } from "@/hooks/useActivityEvidence";

import { useEffect, useId, useRef, useState } from "react";
import { getOwnerGeneration, assertOwnerGeneration } from "@/lib/storage/owner";
import type { ActivityEvidence } from "@/lib/activity-evidence";
import { assertCurrentStorageGeneration } from "@/lib/storage/reset-coordination";

interface WrittenExerciseProps extends ActivityProps {
  title?: string;
  instructions: string;
  starterText?: string;
  rubric: string[];
  modelAnswer: string;
}

/** Offline written assessment with a visible rubric; self-review is never an automated grade. */
export function WrittenExercise(props: WrittenExerciseProps): React.ReactElement {
  const activity = useActivityEvidence(props);
  return (
    <WrittenExerciseBody
      key={`${activity.ownerGeneration}:${props.activityLessonId ?? "example"}:${props.activityId ?? props.instructions}`}
      {...props}
      {...activity}
    />
  );
}

interface WrittenExerciseBodyProps extends WrittenExerciseProps {
  evidence: ActivityEvidence | undefined;
  saveEvidence: (value: ActivityEvidence) => Promise<void>;
  isReady: boolean;
  ownerReady: boolean;
  ownerGeneration: number;
}

function WrittenExerciseBody({
  activityId,
  activityLessonId,
  title = "Practice and review",
  instructions,
  starterText = "",
  rubric,
  modelAnswer,
  evidence,
  saveEvidence,
  isReady,
  ownerReady,
  ownerGeneration,
}: WrittenExerciseBodyProps): React.ReactElement {
  const id = useId();
  const [checked, setChecked] = useState<number[]>([]);
  // Unsaved text stays in this component, never in a global map or plaintext storage.
  // It also takes precedence over late hydration and optimistic-store rollback.
  const [draft, setDraft] = useState<string | null>(null);
  const [pending, setPending] = useState<ActivityEvidence | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const latestTimestamp = useRef(0);
  const hasUnsavedResponse = useRef(false);
  const answer = draft ?? evidence?.response ?? starterText;
  const hasContext = Boolean(activityId && activityLessonId);

  useEffect(() => {
    const protectDraft = (event: BeforeUnloadEvent): void => {
      if (!hasUnsavedResponse.current || getOwnerGeneration() !== ownerGeneration) return;
      event.preventDefault();
      // Browsers choose their own warning text; this cannot force persistence on exit.
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", protectDraft);
    return (): void => window.removeEventListener("beforeunload", protectDraft);
  }, [ownerGeneration]);

  useEffect(() => {
    if (!pending || !isReady || !hasContext) return;
    let active = true;
    const write = queue.current.then(async (): Promise<void> => {
      assertOwnerGeneration(ownerGeneration);
      assertCurrentStorageGeneration();
      await saveEvidence(pending);
    });
    queue.current = write.catch((): void => {});
    void write
      .then((): void => {
        if (active && getOwnerGeneration() === ownerGeneration) {
          hasUnsavedResponse.current = false;
          setPending(null);
          setSaveError(null);
        }
      })
      .catch((error: unknown): void => {
        console.error("[written-exercise] Evidence save failed", error);
        if (active && getOwnerGeneration() === ownerGeneration)
          setSaveError("Your response could not be saved. Copy it before leaving, or retry.");
      });
    return (): void => {
      active = false;
    };
  }, [pending, isReady, hasContext, ownerGeneration, saveEvidence]);

  const stage = (value: string, reviewed = false): void => {
    // Set synchronously so refresh immediately after input is protected before effects run.
    hasUnsavedResponse.current = true;
    setDraft(value);
    setSaveError(null);
    const timestamp = Math.max(
      Date.now(),
      latestTimestamp.current + 1,
      (evidence?.updatedAt ?? 0) + 1
    );
    latestTimestamp.current = timestamp;
    setPending({
      kind: "self-reviewed",
      updatedAt: timestamp,
      completedAt: reviewed ? timestamp : null,
      response: value,
    });
  };
  const update = (value: string): void => {
    setChecked([]);
    stage(value);
  };

  return (
    <section
      className="my-8 space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5"
      aria-labelledby={`${id}-title`}
    >
      <h3 id={`${id}-title`} className="text-lg font-semibold">
        {title}
      </h3>
      <p
        id={`${id}-instructions`}
        className="text-base [overflow-wrap:anywhere] whitespace-pre-wrap"
      >
        {instructions}
      </p>
      <label htmlFor={`${id}-answer`} className="block text-sm font-medium">
        Your response
      </label>
      <textarea
        id={`${id}-answer`}
        aria-describedby={`${id}-instructions ${id}-storage`}
        value={answer}
        disabled={!ownerReady}
        onChange={(event): void => update(event.target.value)}
        rows={8}
        maxLength={12000}
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3 text-base text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
      />
      <p id={`${id}-storage`} className="text-sm text-[var(--color-text-secondary)]">
        {hasContext
          ? saveError
            ? "This response is not saved."
            : pending
              ? isReady
                ? "Saving your response…"
                : "Your draft is in this page while the lesson loads."
              : "Responses save with this learner’s encrypted lesson records on this device."
          : "This example has no saved lesson context. Your response stays only on this page; copy it before leaving."}{" "}
        Review your work against each criterion; this activity does not award an automated score.
      </p>
      {saveError && (
        <p role="alert" className="text-sm text-[var(--color-text-primary)]">
          {saveError}
          {hasContext && (
            <button
              type="button"
              className="ml-2 min-h-12 underline"
              onClick={(): void => {
                if (pending) setPending({ ...pending });
              }}
            >
              Retry saving
            </button>
          )}
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
              <input
                type="checkbox"
                checked={checked.includes(index)}
                onChange={(event): void =>
                  setChecked((previous) =>
                    event.target.checked
                      ? [...previous, index]
                      : previous.filter((entry) => entry !== index)
                  )
                }
                className="mt-1 h-5 w-5 accent-[var(--color-accent)]"
              />
              <span>{criterion}</span>
            </label>
          )
        )}
      </fieldset>
      {hasContext && (
        <div className="space-y-2">
          <button
            type="button"
            disabled={!isReady || !answer.trim() || checked.length !== rubric.length}
            onClick={(): void => stage(answer, true)}
            className="min-h-12 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-white disabled:opacity-50"
          >
            Record my self-review
          </button>
          <p role="status" className="text-sm">
            {!pending && !saveError && evidence?.completedAt
              ? "Self-review recorded. This is your assessment of your work, not an independent grade."
              : "Write a response and review every criterion to record practice completion."}
          </p>
        </div>
      )}
      <details className="rounded-lg border border-[var(--color-border)] p-3">
        <summary className="min-h-12 cursor-pointer py-3 text-sm font-medium">
          Compare with a worked response
        </summary>
        <p className="text-base [overflow-wrap:anywhere] whitespace-pre-wrap">{modelAnswer}</p>
      </details>
    </section>
  );
}
