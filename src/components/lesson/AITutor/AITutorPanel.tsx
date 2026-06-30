"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import {
  chatStream,
  AIInvalidKeyError,
  AIRateLimitError,
  AIOverloadedError,
} from "@/lib/ai/anthropic-client";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import type { LessonMeta } from "@/types/curriculum";

/**
 * AI Tutor — slide-in chat panel scoped to a single lesson.
 *
 * Lesson context (title, concept tags, learning outcomes, body) is
 * stitched into the system prompt at conversation start. The lesson
 * body is truncated to a token budget; the marker tells Claude when
 * material was trimmed so it can ask the learner about specific
 * sections rather than hallucinate coverage.
 *
 * Privacy invariants this surface honors:
 *   - No conversation content goes to IndexedDB or Supabase.
 *   - No analytics events fire from this panel.
 *   - The panel is mounted unconditionally only after the
 *     AITutorMount gate confirms consent + key.
 */
interface AITutorPanelProps {
  meta: LessonMeta;
  lessonBody: string;
  onClose: () => void;
}

interface Turn {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** True while a streaming reply is mid-flight. */
  streaming?: boolean;
}

/** Rough upper bound for the lesson body chunk we pass to Claude. We
 *  keep it conservative so room remains for the conversation and the
 *  model's own response. ~3-4 chars per token gives ~6k tokens. */
const LESSON_BODY_CHAR_BUDGET = 20_000;

function buildSystemPrompt(meta: LessonMeta, body: string): string {
  const truncated =
    body.length > LESSON_BODY_CHAR_BUDGET
      ? body.slice(0, LESSON_BODY_CHAR_BUDGET) +
        "\n\n[... lesson continues; ask about specific sections ...]"
      : body;
  const standardsLine = meta.standards.cs2023?.length
    ? `Standards: ACM CS2023 ${meta.standards.cs2023.join(", ")}`
    : "";
  const outcomesLine = meta.learningOutcomes?.length
    ? `Learning outcomes:\n  - ${meta.learningOutcomes.join("\n  - ")}`
    : "";
  return `You are a tutor embedded in a DURA lesson page. The learner is studying:

  Lesson: ${meta.title}
  Phase / Module: ${meta.phaseId} / ${meta.moduleId}
  Concept tags: ${meta.vocabulary.join(", ") || "(none)"}
  ${outcomesLine}
  ${standardsLine}

Lesson body (MDX, may be truncated):
"""
${truncated}
"""

Your job:
  - Answer questions about *this specific lesson*.
  - When the learner is wrong, explain *why* in terms of the lesson's
    concepts. Lead them to the answer; don't just hand it over.
  - If asked off-topic (write my essay, what's the weather), redirect
    gently: "I'm scoped to this lesson — try this related concept."
  - Never claim a lesson concept exists outside the body above. If the
    learner asks about something not covered, say so and point them
    toward the dictionary or the next lesson.
  - If a learner asks something dangerous (auth bypass, prod secrets,
    scraping without permission), refuse and explain the harm in terms
    of legal or ethical principle, not just policy.

Output: plain prose. No JSON, no Markdown beyond inline code with
single backticks. Keep responses under 200 words unless the learner
explicitly asks for depth.`;
}

export function AITutorPanel({ meta, lessonBody, onClose }: AITutorPanelProps): React.ReactElement {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Panel is always active while mounted — confine Tab within it (WCAG 2.1 SC 2.1.2).
  useFocusTrap(dialogRef, true);

  // The system prompt is computed once per panel mount — it doesn't
  // change as the conversation grows.
  const systemPromptRef = useRef<string>(buildSystemPrompt(meta, lessonBody));

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [turns]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const send = useCallback(async () => {
    const userText = draft.trim();
    if (!userText || sending) return;
    setError(null);

    const userTurn: Turn = {
      id: `u_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      role: "user",
      content: userText,
    };
    const assistantTurn: Turn = {
      id: `a_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      role: "assistant",
      content: "",
      streaming: true,
    };
    const history = [...turns, userTurn, assistantTurn];
    setTurns(history);
    setDraft("");
    setSending(true);

    const controller = new AbortController();
    abortRef.current = controller;

    // Build the messages payload from prior turns + the new user one.
    // We strip the in-flight assistant placeholder; Claude doesn't
    // need to see its own empty reply.
    const messages = history
      .filter((t) => !(t.role === "assistant" && t.streaming))
      .map((t) => ({ role: t.role, content: t.content }));

    try {
      let buffer = "";
      for await (const delta of chatStream({
        messages,
        system: systemPromptRef.current,
        maxTokens: 800,
        signal: controller.signal,
      })) {
        buffer += delta;
        setTurns((prev) =>
          prev.map((t) =>
            t.id === assistantTurn.id ? { ...t, content: buffer, streaming: true } : t
          )
        );
      }
      setTurns((prev) =>
        prev.map((t) => (t.id === assistantTurn.id ? { ...t, streaming: false } : t))
      );
    } catch (err) {
      if (err instanceof AIInvalidKeyError) {
        setError("Your key didn't work — re-enter it in Settings.");
      } else if (err instanceof AIRateLimitError) {
        setError("Sending too fast. Wait a minute and try again.");
      } else if (err instanceof AIOverloadedError) {
        setError("Anthropic is overloaded — try again in a moment.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
      // Roll the failed assistant placeholder back so the next attempt
      // doesn't include it in the conversation history.
      setTurns((prev) => prev.filter((t) => t.id !== assistantTurn.id));
    } finally {
      setSending(false);
      abortRef.current = null;
    }
  }, [draft, sending, turns]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Ask Claude about this lesson"
      className="fixed inset-0 z-[60] flex items-end justify-end bg-black/40 sm:items-stretch"
    >
      <div
        className="flex h-[85vh] w-full flex-col rounded-t-2xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] shadow-2xl sm:h-screen sm:max-w-md sm:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
          <Sparkles className="h-4 w-4 text-[var(--color-accent)]" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
              Ask Claude
            </p>
            <p className="truncate text-xs text-[var(--color-text-muted)]">{meta.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)]"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto p-4 text-sm leading-relaxed"
        >
          {turns.length === 0 && (
            <p className="text-center text-xs text-[var(--color-text-muted)]">
              Ask anything about this lesson. Claude sees only the title, concepts, and body — never
              your name, account, or other lessons.
            </p>
          )}
          {turns.map((t) => (
            <div
              key={t.id}
              className={
                t.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-[var(--color-accent)] px-3.5 py-2 text-white"
                  : "mr-auto max-w-[85%] rounded-2xl rounded-tl-md bg-[var(--color-bg-surface)] px-3.5 py-2 text-[var(--color-text-primary)]"
              }
            >
              <p className="whitespace-pre-wrap">{t.content || (t.streaming ? "…" : "")}</p>
            </div>
          ))}
          {error && <p className="text-center text-xs text-rose-700 dark:text-rose-400">{error}</p>}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
          className="flex items-end gap-2 border-t border-[var(--color-border)] p-3"
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about this lesson…"
            rows={1}
            maxLength={4000}
            disabled={sending}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            className="min-h-10 flex-1 resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Send className="h-4 w-4" aria-hidden />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
