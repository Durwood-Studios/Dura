"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDB } from "@/lib/db";
import type { FeedbackCategory, FeedbackEntry } from "@/types/feedback";

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: "general", label: "General" },
  { value: "bug", label: "Bug report" },
  { value: "feature", label: "Feature idea" },
  { value: "content", label: "Content issue" },
];

/** Save to IndexedDB and attempt a Supabase insert (fire-and-forget). */
async function submitFeedback(entry: FeedbackEntry): Promise<void> {
  const db = await getDB();
  await db.put("feedback", entry);

  // Best-effort Supabase insert — does not block or throw on failure.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    fetch(`${url}/rest/v1/feedback`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        message: entry.message,
        category: entry.category,
        page_url: entry.pageUrl,
      }),
    })
      .then(async (res) => {
        if (res.ok) {
          const updated: FeedbackEntry = { ...entry, synced: true };
          const db2 = await getDB();
          await db2.put("feedback", updated);
        }
      })
      .catch((err) => console.error("[feedback] Supabase sync failed:", err));
  }
}

export function FeedbackButton(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>("general");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) textareaRef.current?.focus();
  }, [open]);

  const handleSubmit = async (): Promise<void> => {
    if (!message.trim() || status !== "idle") return;
    setStatus("submitting");
    const entry: FeedbackEntry = {
      id: crypto.randomUUID(),
      message: message.trim(),
      category,
      pageUrl: window.location.pathname,
      createdAt: Date.now(),
      synced: false,
    };
    try {
      await submitFeedback(entry);
      setStatus("done");
      setTimeout(() => {
        setOpen(false);
        setStatus("idle");
        setMessage("");
        setCategory("general");
      }, 1500);
    } catch (err) {
      console.error("[FeedbackButton] submit failed:", err);
      setStatus("idle");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
        aria-label="Send feedback"
      >
        <MessageSquare className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" aria-hidden />
        <span>Feedback</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-title"
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          {/* Panel */}
          <div className="relative w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="feedback-title"
                className="text-sm font-semibold text-[var(--color-text-primary)]"
              >
                Send feedback
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)]"
                aria-label="Close feedback"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Category pills */}
            <div className="mb-3 flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium transition",
                    category === c.value
                      ? "bg-[var(--color-accent)] text-white"
                      : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What's on your mind?"
              maxLength={2000}
              rows={4}
              className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none"
            />
            <p className="mt-1 text-right text-xs text-[var(--color-text-muted)]">
              {message.length}/2000
            </p>

            {/* Submit */}
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={!message.trim() || status !== "idle"}
              className={cn(
                "mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                status === "done"
                  ? "bg-[var(--color-celebration)] text-white"
                  : "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-40"
              )}
            >
              {status === "done" ? (
                <>
                  <Check className="h-4 w-4" />
                  Sent!
                </>
              ) : status === "submitting" ? (
                "Sending…"
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send feedback
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
