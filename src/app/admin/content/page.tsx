import type { ReactElement } from "react";

import { createClient } from "@/lib/supabase/server";
import { BarChart } from "../_components/charts";
import { getLearningReport } from "@/lib/admin/learning-report";

const LESSON_EVENT_HINT = "lesson_started";
const SEARCH_EVENT_HINT = "dictionary_searched";
const QUIZ_EVENT_HINT = "quiz_started / quiz_completed / quiz_answered";

/** Exact 30-day content counts from the admin-session report RPC. */
export default async function AdminContentPage(): Promise<ReactElement> {
  const supabase = await createClient();

  const { data, error } = await getLearningReport(supabase);
  const lessonCounts = data?.lessons ?? [];
  const searchCounts = data?.searches ?? [];
  const quizCounts = data?.quizzes ?? [];
  const hasAnyContentEvents =
    lessonCounts.length > 0 || searchCounts.length > 0 || quizCounts.length > 0;

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Content Insights</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Opted-in content activity across the current UTC day and preceding 29 days. Counts are
          aggregated in the database.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-[var(--color-error)] bg-[var(--color-bg-surface)] p-4 text-sm text-[var(--color-error)]"
        >
          <strong>Query error:</strong> {error.message}
        </div>
      )}

      {!error && !hasAnyContentEvents && (
        <div className="mb-6 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            No content events yet
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            This page fills in as users opt in to analytics. It charts events named like:
          </p>
          <ul className="mt-2 space-y-1 font-mono text-xs text-[var(--color-text-secondary)]">
            <li>{LESSON_EVENT_HINT} — most opened lessons</li>
            <li>{SEARCH_EVENT_HINT} — top searched dictionary terms</li>
            <li>{QUIZ_EVENT_HINT} — quiz activity</li>
          </ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Most opened lessons"
          description={`Counts of ${LESSON_EVENT_HINT} events, by lesson id or slug.`}
        >
          <BarChart
            items={lessonCounts}
            label="Most opened lessons by event count"
            valueFormat={(v: number): string => v.toLocaleString("en-US")}
          />
        </ChartCard>

        <ChartCard
          title="Top searched dictionary terms"
          description={`Counts of ${SEARCH_EVENT_HINT} events, by searched term.`}
        >
          <BarChart
            items={searchCounts}
            label="Top searched dictionary terms by event count"
            valueFormat={(v: number): string => v.toLocaleString("en-US")}
          />
        </ChartCard>

        <ChartCard
          title="Quiz activity"
          description={`Counts of ${QUIZ_EVENT_HINT} events, by quiz or lesson.`}
        >
          <BarChart
            items={quizCounts}
            label="Quiz activity by event count"
            valueFormat={(v: number): string => v.toLocaleString("en-US")}
          />
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}): ReactElement {
  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
      <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h2>
      <p className="mt-0.5 mb-4 text-xs text-[var(--color-text-secondary)]">{description}</p>
      {children}
    </section>
  );
}
