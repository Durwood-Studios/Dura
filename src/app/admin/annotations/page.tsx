import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ModerationButtons } from "./ModerationButtons";

export const metadata: Metadata = { title: "Annotation Moderation — DURA Admin" };

/** Matches the columns selected below; profiles join may be null if RLS filters it. */
interface AnnotationRow {
  id: string;
  lesson_id: string;
  annotation_type: "tip" | "gotcha" | "alternative" | "explanation";
  content: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  profiles: { display_name: string | null } | null;
}

const TYPE_LABELS: Record<AnnotationRow["annotation_type"], string> = {
  tip: "Tip",
  gotcha: "Gotcha",
  alternative: "Alternative",
  explanation: "Explanation",
};

const TYPE_BADGE_CLASSES: Record<AnnotationRow["annotation_type"], string> = {
  tip: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  gotcha: "bg-red-500/10 text-red-600 dark:text-red-400",
  alternative: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  explanation: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function AdminAnnotationsPage(): Promise<React.ReactElement> {
  const supabase = await createClient();

  // Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError ?? !user) {
    redirect("/auth/sign-in");
  }

  // Admin gate — app_metadata is server-only, users cannot self-elevate
  const isAdmin = (user.app_metadata?.is_admin as boolean | undefined) === true;
  if (!isAdmin) {
    redirect("/dashboard");
  }

  // Fetch pending annotations with submitter display_name via FK join.
  // The admin_read_annotations policy (staged migration 20260629000005)
  // and admin_read_profiles policy (staged 017-admin-rls) must be applied
  // for this query to return rows. Without them, data will be empty and
  // the UI shows the "no pending" state — graceful degradation.
  const { data: rows, error: fetchError } = await supabase
    .from("annotations")
    .select(
      "id, lesson_id, annotation_type, content, upvotes, downvotes, created_at, profiles!user_id(display_name)"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (fetchError) {
    console.error("[AdminAnnotationsPage] Fetch error:", fetchError.message);
  }

  // Map raw rows — cast to known shape; profiles join may be null if the
  // admin_read_profiles policy is not yet applied.
  const annotations: AnnotationRow[] = (rows ?? []).map((row) => ({
    id: row.id as string,
    lesson_id: row.lesson_id as string,
    annotation_type: row.annotation_type as AnnotationRow["annotation_type"],
    content: row.content as string,
    upvotes: Number(row.upvotes),
    downvotes: Number(row.downvotes),
    created_at: row.created_at as string,
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

      {annotations.length === 0 ? (
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
            {annotations.length} annotation{annotations.length !== 1 ? "s" : ""} awaiting review
          </p>

          {/* Desktop table */}
          <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
            <table className="w-full min-w-[700px] text-sm">
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
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_BADGE_CLASSES[annotation.annotation_type]}`}
                      >
                        {TYPE_LABELS[annotation.annotation_type]}
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
                      {DATE_FORMAT.format(new Date(annotation.created_at))}
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
