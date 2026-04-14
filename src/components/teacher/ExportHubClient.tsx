"use client";

import { useRef, useState } from "react";
import {
  BookOpen,
  Brain,
  FileText,
  Layers,
  ListChecks,
  Printer,
  type LucideIcon,
} from "lucide-react";
import type { StandardRef } from "@/lib/curriculum";
import type { LessonMeta } from "@/types/curriculum";

interface ExportHubClientProps {
  lessons: LessonMeta[];
  standards: StandardRef[];
  dictionaryCount: number;
  questionCount: number;
  authoredLessons: number;
}

interface ExportCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  count?: string;
  formats: { label: string; onClick: () => void; disabled?: boolean }[];
}

function ExportCard({
  icon: Icon,
  title,
  description,
  count,
  formats,
}: ExportCardProps): React.ReactElement {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 shadow-sm">
      <header className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 text-emerald-600" aria-hidden />
        <div className="flex-1">
          <h3 className="font-semibold text-[var(--color-text-primary)]">{title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
            {description}
          </p>
        </div>
        {count && (
          <span className="rounded-full border border-[var(--color-border)] px-2 py-0.5 font-mono text-[10px] text-[var(--color-text-muted)]">
            {count}
          </span>
        )}
      </header>
      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        {formats.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={f.onClick}
            disabled={f.disabled}
            className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] transition hover:border-emerald-400 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {f.label}
          </button>
        ))}
      </div>
    </article>
  );
}

export function ExportHubClient({
  lessons,
  standards,
  dictionaryCount,
  questionCount,
  authoredLessons,
}: ExportHubClientProps): React.ReactElement {
  const [status, setStatus] = useState<string | null>(null);
  const generating = useRef(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = (msg: string) => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setStatus(msg);
    flashTimer.current = setTimeout(() => setStatus(null), 2000);
  };

  /** Wraps an export action: prevents concurrent clicks, shows status, catches errors. */
  const guard = (label: string, fn: () => Promise<void> | void) => async () => {
    if (generating.current) return;
    generating.current = true;
    setStatus(`Generating ${label}…`);
    try {
      await fn();
      flash(`Downloaded ${label}`);
    } catch (error) {
      console.error(`[export] ${label} failed:`, error);
      flash(`Export failed — try again`);
    } finally {
      generating.current = false;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ExportCard
          icon={Brain}
          title="Vocabulary deck"
          description="Every verified dictionary term with all three tiers. CSV for spreadsheets, Anki TXT for flashcard import, or raw JSON."
          count={`${dictionaryCount} terms`}
          formats={[
            {
              label: "CSV",
              onClick: guard("dura-dictionary.csv", async () => {
                const { dictionaryCSV } = await import("@/lib/exports/dictionary-export");
                const { downloadCSV } = await import("@/lib/exports/download");
                downloadCSV("dura-dictionary.csv", dictionaryCSV());
              }),
            },
            {
              label: "Anki TXT",
              onClick: guard("dura-dictionary-anki.txt", async () => {
                const { dictionaryAnki } = await import("@/lib/exports/dictionary-export");
                const { downloadText } = await import("@/lib/exports/download");
                downloadText("dura-dictionary-anki.txt", dictionaryAnki(), "text/plain");
              }),
            },
            {
              label: "JSON",
              onClick: guard("dura-dictionary.json", async () => {
                const { dictionaryJSON } = await import("@/lib/exports/dictionary-export");
                const { downloadJSON } = await import("@/lib/exports/download");
                downloadJSON("dura-dictionary.json", dictionaryJSON());
              }),
            },
          ]}
        />

        <ExportCard
          icon={ListChecks}
          title="Quiz bank"
          description="Every assessment question across every authored phase, with options, correct answers, explanations, and difficulty tags."
          count={`${questionCount} questions`}
          formats={[
            {
              label: "JSON",
              onClick: guard("dura-quiz-bank.json", async () => {
                const { quizBankJSON } = await import("@/lib/exports/quiz-export");
                const { downloadJSON } = await import("@/lib/exports/download");
                downloadJSON("dura-quiz-bank.json", quizBankJSON());
              }),
            },
            {
              label: "CSV",
              onClick: guard("dura-quiz-bank.csv", async () => {
                const { quizBankCSV } = await import("@/lib/exports/quiz-export");
                const { downloadCSV } = await import("@/lib/exports/download");
                downloadCSV("dura-quiz-bank.csv", quizBankCSV());
              }),
            },
          ]}
        />

        <ExportCard
          icon={Layers}
          title="Standards map"
          description="Every lesson's tagged standards from CS2023, SWEBOK, SFIA, Bloom, and Dreyfus, cross-referenced to lesson titles."
          count={`${standards.length} codes`}
          formats={[
            {
              label: "CSV",
              onClick: guard("dura-standards.csv", async () => {
                const { standardsCSV } = await import("@/lib/exports/standards-export");
                const { downloadCSV } = await import("@/lib/exports/download");
                downloadCSV("dura-standards.csv", standardsCSV(standards, lessons));
              }),
            },
          ]}
        />

        <ExportCard
          icon={BookOpen}
          title="Lesson index"
          description="Flat list of every authored lesson with phase, module, estimated time, difficulty, Bloom level, and Dreyfus stage."
          count={`${authoredLessons} lessons`}
          formats={[
            {
              label: "JSON",
              onClick: guard("dura-lessons.json", async () => {
                const { downloadJSON } = await import("@/lib/exports/download");
                downloadJSON("dura-lessons.json", {
                  exportedAt: new Date().toISOString(),
                  count: lessons.length,
                  lessons,
                });
              }),
            },
          ]}
        />

        <ExportCard
          icon={FileText}
          title="Curriculum map"
          description="Single-page overview of every phase, module, and lesson — ready to print as PDF from your browser."
          formats={[
            {
              label: "Open print view",
              onClick: () => window.open("/teach/print/curriculum", "_blank"),
            },
          ]}
        />

        <ExportCard
          icon={Printer}
          title="Module workbooks"
          description="Print-friendly per-module pages with the full lesson body, exercises, and summary. Open the module and use your browser's Save as PDF."
          formats={[
            {
              label: "Browse modules",
              onClick: () => window.open("/teach/print/modules", "_blank"),
            },
          ]}
        />
      </div>

      {status && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-6 bottom-6 z-40 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-700 shadow-lg"
        >
          {status}
        </div>
      )}
    </div>
  );
}
