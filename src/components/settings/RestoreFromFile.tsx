"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileArchive, Check, Loader2, CircleAlert } from "lucide-react";
import {
  applyLearnerRecord,
  parseLearnerRecordZip,
  LearnerRecordImportError,
  type ImportSummary,
} from "@/lib/learner-record/import";

/**
 * "Restore from file" — the inverse of the existing "Export my data"
 * button. Reads a DURA learner-record ZIP, previews the counts, asks
 * for confirmation, then writes to IndexedDB.
 *
 * Flow:
 *   1. Idle → file picker
 *   2. File chosen → preview (counts + source date + source learner ID)
 *   3. Confirm → apply (with status spinner)
 *   4. Done → success card with restored counts
 *
 * Per the design in src/lib/learner-record/import.ts, the merge
 * strategy is last-write-wins by `last_modified` — local data that's
 * been touched more recently than the imported record stays put.
 * Cards without a recoverable termSlug surface in the "skipped"
 * count so the learner can manually re-add them.
 */
type Phase =
  | { kind: "idle" }
  | { kind: "preview"; preview: ImportSummary; file: Blob }
  | { kind: "applying" }
  | { kind: "done"; result: ImportSummary }
  | { kind: "error"; message: string };

export function RestoreFromFile(): React.ReactElement {
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onFile = useCallback(async (file: File) => {
    try {
      const { summary } = await parseLearnerRecordZip(file);
      setPhase({ kind: "preview", preview: summary, file });
    } catch (err) {
      setPhase({
        kind: "error",
        message:
          err instanceof LearnerRecordImportError
            ? err.message
            : `Couldn't read this file: ${(err as Error).message}`,
      });
    }
  }, []);

  const apply = useCallback(async () => {
    if (phase.kind !== "preview") return;
    setPhase({ kind: "applying" });
    try {
      const parsed = await parseLearnerRecordZip(phase.file);
      const result = await applyLearnerRecord({
        canonical: parsed.canonical,
        sidecar: parsed.sidecar,
      });
      setPhase({ kind: "done", result });
    } catch (err) {
      setPhase({
        kind: "error",
        message:
          err instanceof LearnerRecordImportError
            ? err.message
            : `Restore failed: ${(err as Error).message}`,
      });
    }
  }, [phase]);

  const reset = useCallback(() => {
    setPhase({ kind: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  if (phase.kind === "idle") {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-2 text-xs font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-subtle)]"
        >
          <Upload className="h-3.5 w-3.5" aria-hidden />
          Restore from file
        </button>
        <p className="text-xs text-[var(--color-text-muted)]">
          Load a DURA save file (the ZIP from &ldquo;Export my data&rdquo;). Useful when your
          browser cleared site data, or you&rsquo;re moving to a new device.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".zip,application/zip"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onFile(file);
          }}
        />
      </div>
    );
  }

  if (phase.kind === "preview") {
    const { preview } = phase;
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 text-xs text-[var(--color-text-secondary)]">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
          <FileArchive className="h-4 w-4 text-[var(--color-accent)]" aria-hidden />
          Save file ready to restore
        </div>
        <dl className="grid grid-cols-2 gap-y-1">
          <Row label="Flashcards" value={`${preview.cardsRestored} of ${preview.cardsParsed}`} />
          {preview.cardsSkippedNoContent > 0 && (
            <Row
              label="Skipped (no content)"
              value={`${preview.cardsSkippedNoContent}`}
              tone="warn"
            />
          )}
          <Row label="Review history" value={`${preview.reviewLogsRestored}`} />
          <Row label="Modules" value={`${preview.modulesRestored}`} />
          <Row label="Lessons" value={`${preview.lessonProgressRestored}`} />
          <Row label="Goals" value={`${preview.goalsRestored}`} />
          <Row
            label="Source export"
            value={new Date(preview.sourceGeneratedAt).toLocaleDateString()}
          />
        </dl>
        <p className="mt-3 text-xs text-[var(--color-text-muted)]">
          Last-write-wins: anything you&rsquo;ve done locally since this save will be kept. Nothing
          is deleted.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void apply()}
            className="rounded-md bg-[var(--color-accent)] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
          >
            Restore now
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-[var(--color-border)] px-3.5 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)]"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (phase.kind === "applying") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 text-xs text-[var(--color-text-secondary)]">
        <Loader2 className="h-4 w-4 animate-spin text-[var(--color-accent)]" aria-hidden />
        Writing to local storage…
      </div>
    );
  }

  if (phase.kind === "done") {
    const { result } = phase;
    return (
      <div className="rounded-xl border border-emerald-300 bg-emerald-50/60 p-4 text-xs text-[var(--color-text-secondary)] dark:border-emerald-700 dark:bg-emerald-950/30">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-900 dark:text-emerald-200">
          <Check className="h-4 w-4" aria-hidden />
          Restored
        </div>
        <p>
          {result.cardsRestored} flashcards · {result.reviewLogsRestored} review entries ·{" "}
          {result.modulesRestored} modules · {result.lessonProgressRestored} lessons ·{" "}
          {result.goalsRestored} goals
          {result.cardsSkippedNoContent > 0 ? (
            <>
              {" "}
              · {result.cardsSkippedNoContent} card
              {result.cardsSkippedNoContent === 1 ? "" : "s"} skipped (no content to recover)
            </>
          ) : null}
        </p>
        <div className="mt-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1 text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-rose-300 bg-rose-50/60 p-4 text-xs text-rose-900 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <CircleAlert className="h-4 w-4" aria-hidden />
        Couldn&rsquo;t restore
      </div>
      <p>{phase.message}</p>
      <div className="mt-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1 text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "warn";
}): React.ReactElement {
  return (
    <>
      <dt className="text-[var(--color-text-muted)]">{label}</dt>
      <dd
        className={
          "text-right font-mono " +
          (tone === "warn"
            ? "text-amber-700 dark:text-amber-300"
            : "text-[var(--color-text-primary)]")
        }
      >
        {value}
      </dd>
    </>
  );
}
