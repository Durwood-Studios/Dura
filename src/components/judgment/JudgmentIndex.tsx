"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getJudgmentAttempts } from "@/lib/db/judgment";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import type { JudgmentAttempt, JudgmentCase } from "@/lib/judgment/types";

/** Browse authored cases with saved-stage and due-return state from this learner's journal. */
export function JudgmentIndex({ cases }: { cases: readonly JudgmentCase[] }): React.ReactElement {
  const [attempts, setAttempts] = useState<JudgmentAttempt[]>([]);
  const [error, setError] = useState<string | null>(null);
  const now = useCurrentTime(true, 60000);
  useEffect(() => {
    let active = true;
    void getJudgmentAttempts()
      .then((records) => {
        if (active) setAttempts(records);
      })
      .catch((failure) => {
        console.error("[judgment] Journal unavailable", failure);
        if (active)
          setError(
            "Saved practice status could not be read. Cases remain available; reload before continuing a draft."
          );
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <div className="space-y-5">
      {error && (
        <p role="alert" className="text-sm text-[var(--color-error)]">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {cases.map((scenario) => {
          const records = attempts.filter((attempt) => attempt.caseId === scenario.id);
          const latest = records.sort((a, b) => b.updatedAt - a.updatedAt)[0];
          const due =
            latest?.stage === "reviewed" &&
            latest.reviewDueAt !== undefined &&
            latest.reviewDueAt <= now;
          const label = latest
            ? (
                {
                  draft: "Draft saved",
                  committed: "Initial decision recorded — revise next",
                  revised: "Revision recorded — self-review next",
                  reviewed: "Self-review recorded",
                } as const
              )[latest.stage]
            : "Start this case";
          return (
            <article
              key={scenario.id}
              className="min-w-0 space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5"
            >
              <p className="text-sm text-[var(--color-text-secondary)]">
                {scenario.domain} · {scenario.difficulty} · about {scenario.estimatedMinutes}{" "}
                minutes
              </p>
              <h2 className="text-lg font-semibold">
                <Link
                  className="underline decoration-[var(--color-accent)] underline-offset-4"
                  href={`/judgment/${scenario.id}`}
                >
                  {scenario.title}
                </Link>
              </h2>
              <p className="text-sm">{due ? "Ready for a fresh retrieval attempt" : label}</p>
              {records.length > 0 && (
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {records.length} saved {records.length === 1 ? "attempt" : "attempts"}.
                  Self-review is practice evidence, not a competency credential.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
