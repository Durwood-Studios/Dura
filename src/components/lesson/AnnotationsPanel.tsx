"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Lightbulb,
  AlertTriangle,
  Shuffle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  getAnnotations,
  submitAnnotation,
  voteAnnotation,
} from "@/lib/supabase/queries/annotations";

// ─── Types ──────────────────────────────────────────────────────────────

type AnnotationType = "tip" | "gotcha" | "alternative" | "explanation";

interface Annotation {
  id: string;
  userId: string;
  lessonId: string;
  annotationType: AnnotationType;
  content: string;
  upvotes: number;
  downvotes: number;
  status: string;
  createdAt: string;
}

interface AnnotationsPanelProps {
  lessonId: string;
}

// ─── Constants ──────────────────────────────────────────────────────────

const MAX_CONTENT_LENGTH = 500;

const TYPE_META: Record<
  AnnotationType,
  { label: string; Icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  tip: {
    label: "Tip",
    Icon: Lightbulb,
    color: "text-yellow-400",
  },
  gotcha: {
    label: "Gotcha",
    Icon: AlertTriangle,
    color: "text-orange-400",
  },
  alternative: {
    label: "Alternative",
    Icon: Shuffle,
    color: "text-[var(--color-accent)]",
  },
  explanation: {
    label: "Explanation",
    Icon: BookOpen,
    color: "text-[var(--color-text-secondary)]",
  },
};

const TYPE_OPTIONS: AnnotationType[] = ["tip", "gotcha", "alternative", "explanation"];

// ─── Sub-components ─────────────────────────────────────────────────────

interface AnnotationCardProps {
  annotation: Annotation;
  userId: string | null;
  onVote: (id: string, vote: 1 | -1) => void;
}

function AnnotationCard({ annotation, userId, onVote }: AnnotationCardProps): React.ReactElement {
  const { Icon, label, color } = TYPE_META[annotation.annotationType];

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className={`h-4 w-4 flex-shrink-0 ${color}`} />
        <span className={`text-xs font-medium tracking-wide uppercase ${color}`}>{label}</span>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-[var(--color-text-primary)]">
        {annotation.content}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onVote(annotation.id, 1)}
          disabled={!userId}
          aria-label={`Upvote annotation (${annotation.upvotes})`}
          className="flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-lg px-2 text-xs text-[var(--color-text-secondary)] transition hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          <span>{annotation.upvotes}</span>
        </button>
        <button
          onClick={() => onVote(annotation.id, -1)}
          disabled={!userId}
          aria-label={`Downvote annotation (${annotation.downvotes})`}
          className="flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-lg px-2 text-xs text-[var(--color-text-secondary)] transition hover:text-red-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ThumbsDown className="h-3.5 w-3.5" />
          <span>{annotation.downvotes}</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────

/**
 * Community annotations panel for a lesson.
 * Collapsed by default — a single toggle opens it. Fetches from Supabase
 * on first open; silently hides if Supabase is unavailable. Auth is
 * optional: guests can read, signed-in users can vote and annotate.
 */
export function AnnotationsPanel({ lessonId }: AnnotationsPanelProps): React.ReactElement | null {
  const [isOpen, setIsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState(true);

  // Auth state
  const [userId, setUserId] = useState<string | null>(null);

  // Form state
  const [formType, setFormType] = useState<AnnotationType>("tip");
  const [formContent, setFormContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Resolve auth user once on mount — no re-check needed between votes
  useEffect(() => {
    const client = createClient();
    client.auth
      .getUser()
      .then(({ data }) => {
        setUserId(data.user?.id ?? null);
      })
      .catch(() => {
        // auth unavailable — anonymous browsing is fine
        setUserId(null);
      });
  }, []);

  // Fetch annotations the first time the panel is opened
  const fetchAnnotations = useCallback(async (): Promise<void> => {
    if (hasFetched) return;
    setIsLoading(true);
    try {
      const data = await getAnnotations(lessonId);
      setAnnotations(data);
      setHasFetched(true);
    } catch (err) {
      console.error("[AnnotationsPanel] Failed to load annotations:", err);
      setIsSupabaseAvailable(false);
    } finally {
      setIsLoading(false);
    }
  }, [lessonId, hasFetched]);

  const handleToggle = (): void => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen && !hasFetched) {
      void fetchAnnotations();
    }
  };

  const handleVote = useCallback(
    async (annotationId: string, vote: 1 | -1): Promise<void> => {
      if (!userId) return;

      // Optimistic update
      setAnnotations((prev) =>
        prev.map((a) =>
          a.id === annotationId
            ? {
                ...a,
                upvotes: vote === 1 ? a.upvotes + 1 : a.upvotes,
                downvotes: vote === -1 ? a.downvotes + 1 : a.downvotes,
              }
            : a
        )
      );

      try {
        await voteAnnotation(annotationId, userId, vote);
      } catch (err) {
        console.error("[AnnotationsPanel] Vote failed:", err);
        // Roll back optimistic update on failure
        setAnnotations((prev) =>
          prev.map((a) =>
            a.id === annotationId
              ? {
                  ...a,
                  upvotes: vote === 1 ? a.upvotes - 1 : a.upvotes,
                  downvotes: vote === -1 ? a.downvotes - 1 : a.downvotes,
                }
              : a
          )
        );
      }
    },
    [userId]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      if (!userId || !formContent.trim()) return;

      const content = formContent.trim();
      if (content.length > MAX_CONTENT_LENGTH) {
        setSubmitError(`Keep it under ${MAX_CONTENT_LENGTH} characters.`);
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      // Optimistic annotation (pending review — won't appear from DB until approved)
      const optimisticAnnotation: Annotation = {
        id: `optimistic-${Date.now()}`,
        userId,
        lessonId,
        annotationType: formType,
        content,
        upvotes: 0,
        downvotes: 0,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      try {
        await submitAnnotation(userId, lessonId, formType, content);
        // Add the optimistic entry so the user sees immediate feedback.
        // Real DB record needs approval before appearing on refresh.
        setAnnotations((prev) => [optimisticAnnotation, ...prev]);
        setFormContent("");
        setIsFormOpen(false);
      } catch (err) {
        console.error("[AnnotationsPanel] Submit failed:", err);
        setSubmitError("Couldn't save your annotation. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [userId, lessonId, formType, formContent]
  );

  // Hide entirely if we've confirmed Supabase is unavailable
  if (!isSupabaseAvailable) return null;

  const charsRemaining = MAX_CONTENT_LENGTH - formContent.length;

  return (
    <section
      aria-label="Community annotations"
      className="mt-10 border-t border-[var(--color-border)] pt-8"
    >
      {/* Toggle header */}
      <button
        onClick={handleToggle}
        aria-expanded={isOpen}
        className="flex min-h-[48px] w-full items-center justify-between rounded-lg text-left text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
      >
        <span>Community Notes</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading notes…</span>
            </div>
          )}

          {/* Annotation list */}
          {!isLoading && annotations.length > 0 && (
            <ul className="space-y-3" aria-label="Lesson annotations">
              {annotations.map((annotation) => (
                <li key={annotation.id}>
                  <AnnotationCard annotation={annotation} userId={userId} onVote={handleVote} />
                </li>
              ))}
            </ul>
          )}

          {/* Empty state */}
          {!isLoading && annotations.length === 0 && (
            <p className="text-sm text-[var(--color-text-secondary)]">
              No notes yet. Be the first to leave a tip.
            </p>
          )}

          {/* Add annotation toggle */}
          <div>
            {!isFormOpen ? (
              <button
                onClick={() => setIsFormOpen(true)}
                className="flex min-h-[48px] items-center gap-2 rounded-lg border border-dashed border-[var(--color-border)] px-4 text-sm text-[var(--color-text-secondary)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              >
                <Plus className="h-4 w-4" />
                Add a note
              </button>
            ) : (
              <form
                onSubmit={(e) => {
                  void handleSubmit(e);
                }}
                className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4"
                aria-label="Add annotation form"
              >
                {/* Type selector */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-[var(--color-text-secondary)]">
                    Type
                  </label>
                  <div
                    className="flex flex-wrap gap-2"
                    role="radiogroup"
                    aria-label="Annotation type"
                  >
                    {TYPE_OPTIONS.map((type) => {
                      const { label, Icon, color } = TYPE_META[type];
                      const isSelected = formType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setFormType(type)}
                          className={[
                            "flex min-h-[44px] items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition",
                            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
                            isSelected
                              ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                              : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
                          ].join(" ")}
                        >
                          <Icon className={`h-3.5 w-3.5 ${isSelected ? "" : color}`} />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Content textarea */}
                <div>
                  <label
                    htmlFor="annotation-content"
                    className="mb-2 block text-xs font-medium text-[var(--color-text-secondary)]"
                  >
                    Note
                  </label>
                  <textarea
                    id="annotation-content"
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    maxLength={MAX_CONTENT_LENGTH}
                    rows={3}
                    placeholder="Share what helped you, what surprised you, or an alternative approach…"
                    className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
                    aria-describedby="annotation-char-count"
                  />
                  <p
                    id="annotation-char-count"
                    className={`mt-1 text-right text-xs ${charsRemaining < 50 ? "text-orange-400" : "text-[var(--color-text-secondary)]"}`}
                  >
                    {charsRemaining} remaining
                  </p>
                </div>

                {/* Error */}
                {submitError && (
                  <p role="alert" className="text-xs text-red-400">
                    {submitError}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between gap-3">
                  {!userId ? (
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Sign in to submit an annotation.
                    </p>
                  ) : (
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Notes are reviewed before appearing publicly.
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFormOpen(false);
                        setSubmitError(null);
                      }}
                      className="min-h-[44px] rounded-lg px-3 text-xs text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!userId || isSubmitting || !formContent.trim()}
                      className="flex min-h-[44px] items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-4 text-xs font-medium text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Submit
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
