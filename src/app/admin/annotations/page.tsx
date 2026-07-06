import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ModerationButtons } from "./ModerationButtons";

export const metadata: Metadata = { title: "Annotation Moderation — DURA Admin" };

type AnnotationType = "tip" | "gotcha" | "alternative" | "explanation";

/** Matches the columns selected below; profiles join may be null if RLS filters it. */
interface AnnotationRow {
  id: string;
  lesson_id: string;
  annotation_type: string;
  content: string;
  upvotes: number;
  downvotes: number;
  created_at: string | null;
  profiles: { display_name: string | null } | null;
}

const TYPE_LABELS: Record<AnnotationType, string> = {
  tip: "Tip",
  gotcha: "Gotcha",
  alternative: "Alternative",
  explanation: "Explanation",
};

const TYPE_BADGE_CLASSES: Record<AnnotationType, string> = {
  tip: "bg-[var(--color-info)]/10 text-[var(--color-info)]",
  gotcha: "bg-[var(--color-error)]/10 text-[var(--color-error)]",
  alternative: "bg-[var(--color-accent-purple)]/10 text-[var(--color-accent-purple)]",
  explanation: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
};

/** Neutral fallback if the DB check constraint ever widens before this UI does. */
const TYPE_BADGE_FALLBACK = "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]";

function isAnnotationType(value: string): value is AnnotationType {
  return value in TYPE_LABELS;
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

/** created_at is timestamptz (ISO string) but nullable — never feed an Invalid Date to format(). */
function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : DATE_FORMAT.format(date);
}

// Bound the moderation queue query — the page is not paginated, so cap the
// working set rather than pulling every pending row at scale.
const QUEUE_LIMIT = 200;

export default async function AdminAnnotationsPage(): Promise<React.ReactElement> {
  const supabase = await createClient();

  // Defense in depth — the admin layout gates too, but re-verify here.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError ?? !user) {
    redirect("/auth/sign-in?next=/admin/annotations");
  }

  // Admin gate — app_metadata is server-only, users cannot self-elevate
  const isAdmin = (user.app_metadata?.is_admin as boolean | undefined) === true;
  if (!isAdmin) {
    redirect("/auth/unauthorized");
  }

  // Fetch pending annotations with submitter display_name via the
  // annotations_user_id_fkey → profiles join. Requires admin_read_annotations
  // and admin_read_profiles RLS policies (both verified live).
  const { data: rows, error: fetchError } = await supabase
    .from("annotations")
    .select(
      "id, lesson_id, annotation_type, content, upvotes, downvotes, created_at, profiles!user_id(display_name)"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(QUEUE_LIMIT);

  if (fetchError) {
    console.error("[AdminAnnotationsPage] Fetch error:", fetchError.message);
  }

  // Map raw rows — cast to known shape; profiles join may be null if the
  // submitter's profile row was deleted.
  const annotations: AnnotationRow[] = (rows ?? []).map((row) => ({
    id: row.id as string,
    lesson_id: row.lesson_id as string,
    annotation_type: row.annotation_type as string,
    content: row.content as string,
    upvotes: Number(row.upvotes ?? 0),
    downvotes: Number(row.downvotes ?? 0),
    created_at: row.created_at as string | null,
    // Supabase infers the FK join result as an array in its generic types,
    // but PostgREST returns a single object for many-to-one relationships.
    // Cast through unknown to bridge the inference gap without generated types.
    profiles: row.profiles as unknown as AnnotationRow["profiles"],
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Annotation Moderation</h1>
        <p className="mt-1 text-[var(--color-text-secondary)]">
          Review community-submitted annotations before they become visible to learners.
        </p>
      </div>

      {fetchError ? (
        <div
          role="alert"
          className="rounded-xl border border-[var(--color-error)]/40 bg-[var(--color-error)]/10 px-6 py-5"
        >
          <p className="font-medium text-[var(--color-error)]">Failed to load annotations</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{fetchError.message}</p>
        </div>
      ) : annotations.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-8 py-16 text-center">
          <p className="text-lg font-medium text-[var(--color-text-primary)]">
            No pending annotations
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            All submissions have been reviewed. Check back after learners submit new notes.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
            {annotations.length === QUEUE_LIMIT
              ? `Showing the oldest ${QUEUE_LIMIT} pending annotations — moderate these to load more`
              : `${annotations.length} annotation${annotations.length !== 1 ? "s" : ""} awaiting review`}
          </p>

          {/* Desktop table */}
          <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]">
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-secondary)]">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-secondary)]">
                    Lesson
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-secondary)]">
                    Submitted by
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-secondary)]">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-secondary)]">
                    Votes
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-secondary)]">
                    Content
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-[var(--color-text-secondary)]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-bg-primary)]">
                {annotations.map((annotation) => (
                  <tr key={annotation.id} className="hover:bg-[var(--color-bg-surface)]/40">
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isAnnotationType(annotation.annotation_type)
                            ? TYPE_BADGE_CLASSES[annotation.annotation_type]
                            : TYPE_BADGE_FALLBACK
                        }`}
                      >
                        {isAnnotationType(annotation.annotation_type)
                          ? TYPE_LABELS[annotation.annotation_type]
                          : annotation.annotation_type}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <code className="rounded bg-[var(--color-bg-surface)] px-1.5 py-0.5 font-mono text-xs text-[var(--color-text-primary)]">
                        {annotation.lesson_id}
                      </code>
                    </td>
                    <td className="px-4 py-4 text-[var(--color-text-secondary)]">
                      {annotation.profiles?.display_name ?? (
                        <span className="text-[var(--color-text-muted)] italic">Anonymous</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-[var(--color-text-muted)]">
                      {formatDate(annotation.created_at)}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs whitespace-nowrap text-[var(--color-text-secondary)]">
                      <span className="text-[var(--color-success)]">▲ {annotation.upvotes}</span>{" "}
                      <span className="text-[var(--color-error)]">▼ {annotation.downvotes}</span>
                    </td>
                    <td className="max-w-xs px-4 py-4">
                      <p className="line-clamp-3 text-[var(--color-text-primary)]">
                        {annotation.content}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end">
                        <ModerationButtons annotationId={annotation.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
