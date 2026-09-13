"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { JUDGMENT_CASES } from "@/lib/judgment/cases";
import { getJudgmentAttempts, saveJudgmentAttempt } from "@/lib/db/judgment";
import {
  createAttempt,
  commitInitial,
  commitRevision,
  completeReflection,
  exportAttemptMarkdown,
} from "@/lib/judgment/logic";
import {
  JUDGMENT_RUBRIC_IDS,
  type JudgmentAttempt,
  type JudgmentCase,
  type JudgmentDecision,
  type JudgmentRubric,
  type JudgmentRubricId,
  type JudgmentSource,
} from "@/lib/judgment/types";

interface JudgmentCaseClientProps {
  scenario: JudgmentCase;
  rubrics: readonly JudgmentRubric[];
  sources: readonly JudgmentSource[];
}
const FIELDS: {
  key:
    | "constraints"
    | "evidence"
    | "tradeoffs"
    | "standardReasoning"
    | "validationPlan"
    | "stopRule";
  title: string;
  hint: string;
}[] = [
  {
    key: "constraints",
    title: "Frame the decision",
    hint: "What must the solution achieve? Name the constraints and the decision you are making.",
  },
  {
    key: "evidence",
    title: "Evidence and assumptions",
    hint: "Cite the evidence IDs you used. Separate observations from assumptions and explain what is missing.",
  },
  {
    key: "tradeoffs",
    title: "Compare alternatives",
    hint: "Explain the benefit, cost and risk of your choice and at least one alternative.",
  },
  {
    key: "standardReasoning",
    title: "Apply the standard",
    hint: "Explain how the selected source informs this particular decision. A citation alone is not reasoning.",
  },
  {
    key: "validationPlan",
    title: "Test the decision",
    hint: "What would you measure, compare or test next? State the result that would change your mind.",
  },
  {
    key: "stopRule",
    title: "Stopping or escalation rule",
    hint: "When would you stop, roll back, or ask for more qualified review?",
  },
];

/** A saved decision/revision workflow; all ratings are explicitly learner self-assessment. */
export function JudgmentCaseClient({
  scenario,
  rubrics,
  sources,
}: JudgmentCaseClientProps): React.ReactElement {
  const router = useRouter();
  const [history, setHistory] = useState<JudgmentAttempt[]>([]);
  const [attempt, setAttempt] = useState<JudgmentAttempt | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState("Loading your local practice…");
  const [reload, setReload] = useState(0);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const pending = useRef<JudgmentAttempt | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ratings, setRatings] = useState<Partial<Record<JudgmentRubricId, number>>>({});
  const [reflection, setReflection] = useState("");

  const caseId = scenario.id;
  const caseVersion = scenario.version;
  useEffect(() => {
    let active = true;
    void (async (): Promise<void> => {
      try {
        const records = await getJudgmentAttempts();
        const latest = records
          .filter((record) => record.caseId === caseId && record.caseVersion === caseVersion)
          .sort((a, b) => b.updatedAt - a.updatedAt)[0];
        const definition = JUDGMENT_CASES.find(
          (entry) => entry.id === caseId && entry.version === caseVersion
        );
        if (!definition) throw new Error("This practice case version is unavailable.");
        const selected = latest ?? createAttempt(definition);
        if (!latest) await saveJudgmentAttempt(selected);
        if (active && !pending.current) {
          setHistory(latest ? records : [...records, selected]);
          setAttempt(selected);
          setRatings(selected.selfAssessment ?? {});
          setReflection(selected.reflection ?? "");
          setSaveStatus("Saved on this device");
          setError(null);
        }
      } catch (failure) {
        console.error("[judgment] Could not load practice", failure);
        if (active)
          setError("Your practice could not be loaded. Retry before entering a response.");
      }
    })();
    return () => {
      active = false;
    };
  }, [caseId, caseVersion, reload]);

  async function persist(next: JudgmentAttempt): Promise<boolean> {
    const write = queue.current.then(() => saveJudgmentAttempt(next));
    queue.current = write.catch(() => undefined);
    try {
      await write;
      setHistory((records) => [...records.filter((record) => record.id !== next.id), next]);
      if (pending.current?.updatedAt === next.updatedAt && pending.current?.id === next.id) {
        pending.current = null;
        setIsDirty(false);
      }
      setSaveStatus("Saved on this device");
      setError(null);
      return true;
    } catch (failure) {
      console.error("[judgment] Could not save practice", failure);
      setError(
        failure instanceof Error
          ? failure.message
          : "Your practice could not be saved. Retry or export a copy before leaving."
      );
      setSaveStatus("Not saved");
      return false;
    }
  }

  function stage(next: JudgmentAttempt): void {
    setAttempt(next);
    setIsDirty(true);
    setSaveStatus("Unsaved changes");
    pending.current = next;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void persist(next);
    }, 600);
  }

  async function flush(): Promise<boolean> {
    if (timer.current) clearTimeout(timer.current);
    return pending.current ? persist(pending.current) : true;
  }

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent): void => {
      if (pending.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
      if (timer.current) clearTimeout(timer.current);
      const next = pending.current;
      if (next) {
        const write = queue.current.then(() => saveJudgmentAttempt(next));
        void write.catch((failure) => console.error("[judgment] Final draft save failed", failure));
      }
    };
  }, []);

  async function transition(action: () => JudgmentAttempt): Promise<void> {
    if (isBusy) return;
    setIsBusy(true);
    setError(null);
    try {
      if (!(await flush())) return;
      const next = action();
      if (await persist(next)) {
        setAttempt(next);
        setRatings(next.selfAssessment ?? {});
        setReflection(next.reflection ?? "");
        pending.current = null;
        setIsDirty(false);
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Check every response and retry.");
    } finally {
      setIsBusy(false);
    }
  }

  function download(): void {
    if (!attempt) return;
    try {
      const blob = new Blob([exportAttemptMarkdown(scenario, attempt)], {
        type: "text/markdown;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dura-judgment-${scenario.id}-${attempt.id}.md`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (failure) {
      console.error("[judgment] Export failed", failure);
      setError("The practice export could not be created. Please retry.");
    }
  }

  if (!attempt)
    return (
      <section className="my-6 space-y-3">
        <p role="status">{saveStatus}</p>
        {error && (
          <>
            <p role="alert">{error}</p>
            <button
              type="button"
              onClick={() => setReload((value) => value + 1)}
              className="min-h-12 rounded-lg border px-4"
            >
              Retry loading practice
            </button>
          </>
        )}
      </section>
    );
  const decision =
    attempt.stage === "draft" ? attempt.initial : (attempt.revision ?? attempt.initial);
  const canEdit = attempt.stage === "draft" || attempt.stage === "committed";
  const selectedFeedback = scenario.options.find(
    (option) => option.id === attempt.initial.optionId
  )?.feedback;

  return (
    <section className="mt-8 min-w-0 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-y border-[var(--color-border)] py-3">
        <p role="status" className="text-sm">
          {isDirty ? "Unsaved changes" : saveStatus}
        </p>
        <button type="button" onClick={download} className="min-h-12 px-3 text-sm underline">
          Export this attempt as Markdown
        </button>
        {isDirty && (
          <button
            type="button"
            onClick={() => void flush()}
            className="min-h-12 px-3 text-sm underline"
          >
            Save now
          </button>
        )}
      </div>
      {history.filter(
        (record) => record.caseId === scenario.id && record.caseVersion === scenario.version
      ).length > 1 && (
        <label className="block text-sm">
          Saved attempts for this case version
          <select
            className="mt-2 block min-h-12 w-full min-w-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3"
            value={attempt.id}
            disabled={isBusy}
            onChange={(event) => {
              const id = event.target.value;
              void flush().then((saved) => {
                if (!saved) return;
                const selected = history.find((record) => record.id === id);
                if (selected) {
                  setAttempt(selected);
                  setRatings(selected.selfAssessment ?? {});
                  setReflection(selected.reflection ?? "");
                }
              });
            }}
          >
            {history
              .filter(
                (record) => record.caseId === scenario.id && record.caseVersion === scenario.version
              )
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((record) => (
                <option key={record.id} value={record.id}>
                  {new Date(record.createdAt).toLocaleString()} · {record.stage}
                </option>
              ))}
          </select>
        </label>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-[var(--color-error)] p-3 text-sm text-[var(--color-error)]"
        >
          {error}
        </p>
      )}
      {scenario.difficulty === "guided" && attempt.stage === "draft" && (
        <aside className="space-y-2 rounded-xl border border-[var(--color-border)] p-4">
          <h2 className="font-semibold">Worked starting example</h2>
          <p className="text-sm whitespace-pre-wrap">{scenario.workedExample.initial}</p>
          <p className="text-sm">
            Use the example to understand the structure, then explain your own decision.
          </p>
        </aside>
      )}
      {attempt.stage !== "draft" && (
        <aside className="space-y-3 rounded-xl border border-[var(--color-border)] p-4">
          <h2 className="text-lg font-semibold">New evidence: reconsider your decision</h2>
          <p className="whitespace-pre-wrap">{scenario.newEvidence}</p>
          <p>{scenario.revisionPrompt}</p>
          <p className="text-sm">
            <strong>Authored feedback on your initial option:</strong> {selectedFeedback}
          </p>
          <details>
            <summary className="min-h-12 cursor-pointer py-3 text-sm">
              Read your committed initial decision
            </summary>
            <DecisionSummary decision={attempt.initial} />
          </details>
        </aside>
      )}
      {canEdit && (
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            void transition(() =>
              attempt.stage === "draft"
                ? commitInitial(attempt, decision)
                : commitRevision(attempt, decision)
            );
          }}
        >
          <h2 className="text-xl font-semibold">
            {attempt.stage === "draft"
              ? "Make and explain your initial decision"
              : "Revise using the new evidence"}
          </h2>
          <label className="block text-sm">
            Choose an option
            <select
              required
              disabled={isBusy}
              value={decision.optionId}
              onChange={(event) => updateDecision({ optionId: event.target.value })}
              className="mt-2 block min-h-12 w-full min-w-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3"
            >
              <option value="">Choose an option</option>
              {scenario.options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {FIELDS.map((field) => (
            <label key={field.key} className="block space-y-2 text-sm">
              <span className="font-semibold">{field.title}</span>
              <span className="block text-[var(--color-text-secondary)]">{field.hint}</span>
              <textarea
                required
                minLength={15}
                disabled={isBusy}
                maxLength={8000}
                rows={4}
                value={decision[field.key]}
                onChange={(event) => updateDecision({ [field.key]: event.target.value })}
                className="block w-full resize-y rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3"
              />
            </label>
          ))}
          <fieldset className="space-y-2">
            <legend className="font-semibold">Sources informing your decision</legend>
            {scenario.standards.map((standard) => {
              const source = sources.find((entry) => entry.id === standard.sourceId);
              return (
                <label
                  key={standard.sourceId}
                  className="flex min-h-12 items-start gap-3 py-2 text-sm"
                >
                  <input
                    className="mt-1"
                    type="checkbox"
                    disabled={isBusy}
                    checked={decision.standardIds.includes(standard.sourceId)}
                    onChange={(event) =>
                      updateDecision({
                        standardIds: event.target.checked
                          ? [...decision.standardIds, standard.sourceId]
                          : decision.standardIds.filter((id) => id !== standard.sourceId),
                      })
                    }
                  />
                  <span>{source?.title ?? standard.sourceId}</span>
                </label>
              );
            })}
          </fieldset>
          <label className="block text-sm">
            Confidence in this decision: {decision.confidence}%
            <input
              className="mt-2 block min-h-12 w-full"
              type="range"
              min={0}
              max={100}
              step={5}
              value={decision.confidence}
              disabled={isBusy}
              onChange={(event) => updateDecision({ confidence: Number(event.target.value) })}
            />
            <span className="text-[var(--color-text-secondary)]">
              A self-estimate of confidence, not a calibrated probability or score.
            </span>
          </label>
          <button
            type="submit"
            disabled={isBusy}
            className="min-h-12 rounded-lg bg-[var(--color-accent)] px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isBusy
              ? "Saving…"
              : attempt.stage === "draft"
                ? "Commit initial decision and reveal new evidence"
                : "Commit revision and compare reasoning"}
          </button>
        </form>
      )}
      {(attempt.stage === "revised" || attempt.stage === "reviewed") && (
        <div className="space-y-5">
          <h2 className="text-xl font-semibold">Compare your reasoning with a worked example</h2>
          <DecisionSummary decision={attempt.revision ?? attempt.initial} />
          <div className="space-y-3 rounded-xl border border-[var(--color-border)] p-4">
            <p className="whitespace-pre-wrap">{scenario.workedExample.revised}</p>
            <p className="text-sm">{scenario.workedExample.why}</p>
            <p className="text-sm">
              This is one reasoned response, not an automatic grading key. Other choices can be
              defensible if supported by the evidence and constraints.
            </p>
          </div>
          {attempt.stage === "revised" && (
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                void transition(() => {
                  const complete = Object.fromEntries(
                    JUDGMENT_RUBRIC_IDS.map((id) => {
                      const rating = ratings[id];
                      if (rating === undefined)
                        throw new Error("Choose a self-assessment anchor for every dimension.");
                      return [id, rating];
                    })
                  ) as Record<JudgmentRubricId, number>;
                  return completeReflection(attempt, complete, reflection);
                });
              }}
            >
              <h3 className="font-semibold">Self-review with anchored criteria</h3>
              <p className="text-sm">
                These ratings are yours. They are not an external assessment, credential, or
                automated evaluation.
              </p>
              {rubrics.map((rubric) => (
                <label key={rubric.id} className="block space-y-2 text-sm">
                  <span className="font-semibold">{rubric.title}</span>
                  <select
                    disabled={isBusy}
                    required
                    className="block min-h-12 w-full min-w-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3"
                    value={ratings[rubric.id] ?? ""}
                    onChange={(event) => {
                      const next = { ...ratings };
                      if (event.target.value === "") delete next[rubric.id];
                      else next[rubric.id] = Number(event.target.value);
                      setRatings(next);
                      stage({
                        ...attempt,
                        selfAssessment: next,
                        updatedAt: Math.max(Date.now(), attempt.updatedAt + 1),
                      });
                    }}
                  >
                    <option value="">Choose the best description of your response</option>
                    {rubric.anchors.map((anchor, index) => (
                      <option key={index} value={index}>
                        {index}: {anchor}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
              <label className="block space-y-2 text-sm">
                <span className="font-semibold">
                  What changed your mind? What transfers to a different problem?
                </span>
                <span className="block">{scenario.transferPrompt}</span>
                <textarea
                  required
                  minLength={30}
                  disabled={isBusy}
                  rows={5}
                  maxLength={8000}
                  value={reflection}
                  onChange={(event) => {
                    setReflection(event.target.value);
                    stage({
                      ...attempt,
                      reflection: event.target.value,
                      updatedAt: Math.max(Date.now(), attempt.updatedAt + 1),
                    });
                  }}
                  className="w-full resize-y rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3"
                />
              </label>
              <button
                type="submit"
                disabled={isBusy}
                className="min-h-12 rounded-lg bg-[var(--color-accent)] px-5 text-sm text-white"
              >
                Save self-review and schedule a return
              </button>
            </form>
          )}
        </div>
      )}
      {attempt.stage === "reviewed" && (
        <div className="space-y-3 rounded-xl border border-[var(--color-celebration)] p-4">
          <h2 className="font-semibold">Self-review recorded</h2>
          <p className="text-sm whitespace-pre-wrap">{attempt.reflection}</p>
          <p className="text-sm">
            Return on{" "}
            {attempt.reviewDueAt
              ? new Date(attempt.reviewDueAt).toLocaleDateString()
              : "a later day"}{" "}
            to try a new attempt without copying this response. Your earlier attempts remain in your
            local record.
          </p>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void transition(() => createAttempt(scenario))}
            className="min-h-12 rounded-lg border border-[var(--color-border)] px-4 text-sm"
          >
            Start a new attempt
          </button>
        </div>
      )}
      <div className="flex flex-wrap gap-4 text-sm">
        <Link
          href="/judgment"
          onClick={(event) => {
            event.preventDefault();
            void flush().then((saved) => {
              if (saved) router.push("/judgment");
            });
          }}
          className="min-h-12 py-3 underline"
        >
          All judgment cases
        </Link>
        <Link href="/judgment/guide" className="min-h-12 py-3 underline">
          Printable teacher guide
        </Link>
      </div>
    </section>
  );

  function updateDecision(patch: Partial<JudgmentDecision>): void {
    if (!attempt || !canEdit) return;
    const nextDecision = { ...decision, ...patch };
    stage({
      ...attempt,
      updatedAt: Math.max(Date.now(), attempt.updatedAt + 1),
      ...(attempt.stage === "draft" ? { initial: nextDecision } : { revision: nextDecision }),
    });
  }
}

function DecisionSummary({ decision }: { decision: JudgmentDecision }): React.ReactElement {
  return (
    <dl className="space-y-3 rounded-lg border border-[var(--color-border)] p-4 text-sm">
      <div>
        <dt className="font-semibold">Chosen option</dt>
        <dd>{decision.optionId}</dd>
      </div>
      {FIELDS.map((field) => (
        <div key={field.key}>
          <dt className="font-semibold">{field.title}</dt>
          <dd className="mt-1 break-words whitespace-pre-wrap">{decision[field.key]}</dd>
        </div>
      ))}
      <div>
        <dt className="font-semibold">Confidence</dt>
        <dd>{decision.confidence}% (self-estimate)</dd>
      </div>
    </dl>
  );
}
