import type { ReactElement } from "react";

import { createClient } from "@/lib/supabase/server";
import { BarChart } from "../_components/charts";
import { countBy } from "../_lib/data";

/**
 * Content Insights — what content is working.
 *
 * Aggregates a bounded slice of analytics_events into three leaderboards:
 * most opened lessons, top searched dictionary terms, and quiz activity.
 * `properties` is untyped jsonb from opted-in clients, so every read is
 * guarded with typeof checks — no shape is ever assumed.
 */

interface ContentEventRow {
  name: string;
  properties: unknown;
  timestamp: string | number;
}

/** Event-name fragments each chart listens for (shown in the empty explainer). */
const LESSON_EVENT_HINT = "lesson_opened / lesson_viewed";
const SEARCH_EVENT_HINT = "dictionary_search / search";
const QUIZ_EVENT_HINT = "quiz_started / quiz_completed / quiz_answered";

/** True when the event name looks like a lesson open/view. */
function isLessonEvent(name: string): boolean {
  const n = name.toLowerCase();
  return n.includes("lesson") && (n.includes("open") || n.includes("view"));
}

/** True when the event name looks like a search (dictionary or global). */
function isSearchEvent(name: string): boolean {
  return name.toLowerCase().includes("search");
}

/** True when the event name looks quiz-related. */
function isQuizEvent(name: string): boolean {
  return name.toLowerCase().includes("quiz");
}

/**
 * Reads the first non-empty string found under any of `keys` in an unknown
 * jsonb value. Returns null when properties isn't an object or no key holds
 * a usable string — callers decide the fallback label.
 */
function readStringProp(properties: unknown, keys: readonly string[]): string | null {
  if (typeof properties !== "object" || properties === null || Array.isArray(properties)) {
    return null;
  }
  const record = properties as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
    // Numeric ids are valid labels too (e.g. { lessonId: 42 }).
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return null;
}

/** Label for a lesson event: lessonId/slug/id from properties, else "(unknown lesson)". */
function lessonLabel(row: ContentEventRow): string {
  return (
    readStringProp(row.properties, [
      "lessonId",
      "lesson_id",
      "lessonSlug",
      "lesson_slug",
      "slug",
      "id",
      "path",
    ]) ?? "(unknown lesson)"
  );
}

/** Label for a search event: the searched term from properties, else "(no term)". */
function searchLabel(row: ContentEventRow): string {
  const term = readStringProp(row.properties, [
    "term",
    "query",
    "q",
    "searchTerm",
    "search_term",
    "word",
  ]);
  return term !== null ? term.toLowerCase() : "(no term)";
}

/** Label for a quiz event: quiz/lesson identity if present, else the event name. */
function quizLabel(row: ContentEventRow): string {
  return (
    readStringProp(row.properties, ["quizId", "quiz_id", "lessonId", "lesson_id", "slug", "id"]) ??
    row.name
  );
}

/** Card wrapper matching the admin surface style, DLS tokens only. */
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

/**
 * Content Insights admin page (Server Component).
 *
 * Fetches a bounded 10,000-event window and aggregates it in memory —
 * cheap at today's scale, and the limit keeps it safe as events grow.
 */
export default async function AdminContentPage(): Promise<ReactElement> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("analytics_events")
    .select("name, properties, timestamp")
    .order("timestamp", { ascending: false })
    .limit(10000);

  if (error) {
    console.error("[admin/content] analytics_events query failed:", error);
  }

  const rows: ContentEventRow[] = (data ?? []).filter(
    (row): row is ContentEventRow => typeof row.name === "string"
  );

  const lessonRows = rows.filter((row) => isLessonEvent(row.name));
  const searchRows = rows.filter((row) => isSearchEvent(row.name));
  const quizRows = rows.filter((row) => isQuizEvent(row.name));

  const lessonCounts = countBy(lessonRows, lessonLabel);
  const searchCounts = countBy(searchRows, searchLabel);
  const quizCounts = countBy(quizRows, quizLabel);

  const hasAnyContentEvents = lessonRows.length > 0 || searchRows.length > 0 || quizRows.length > 0;

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Content Insights</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          What content is working — from the last {rows.length.toLocaleString("en-US")} opted-in
          events.
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
