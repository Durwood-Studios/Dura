"use client";

import { useState, useRef } from "react";
import { MessageSquare, X, Send, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveFeedback } from "@/lib/feedback/delivery";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import type { FeedbackCategory, FeedbackEntry } from "@/types/feedback";

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: "general", label: "General" },
  { value: "bug", label: "Bug report" },
  { value: "feature", label: "Feature idea" },
  { value: "content", label: "Content issue" },
];

/** Collect feedback durably, including when the device is offline. */
export function FeedbackButton(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>("general");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Confine Tab/Shift+Tab within the dialog while it is open (WCAG 2.1 SC 2.1.2).
  useFocusTrap(dialogRef, open);

  const handleSubmit = async (): Promise<void> => {
    if (!message.trim() || status !== "idle") return;
    setStatus("submitting");
    setError(null);
    const entry: FeedbackEntry = {
      id: crypto.randomUUID(),
      message: message.trim(),
      category,
      pageUrl: window.location.pathname,
      createdAt: Date.now(),
      synced: false,
    };
    try {
      await saveFeedback(entry);
      setStatus("done");
    } catch (err) {
      console.error("[FeedbackButton] submit failed:", err);
      setStatus("idle");
      setError("Your feedback could not be saved. Please try again.");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (status === "done") {
            setStatus("idle");
            setMessage("");
            setCategory("general");
          }
          setError(null);
          setOpen(true);
        }}
        className="flex min-h-12 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
        aria-label="Send feedback"
      >
        <MessageSquare className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" aria-hidden />
        <span>Feedback</span>
      </button>

      {open && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
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
          <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 shadow-2xl">
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
                className="min-h-12 min-w-12 rounded-md p-1 text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
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
                  disabled={status !== "idle"}
                  aria-pressed={category === c.value}
                  className={cn(
                    "min-h-12 rounded-full px-2.5 py-1 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2",
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
              aria-label="Feedback message"
              disabled={status !== "idle"}
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

            {error && (
              <p role="alert" className="mt-2 text-sm text-[var(--color-error)]">
                {error}
              </p>
            )}
            {status === "done" && (
              <p role="status" className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Saved on this device. Delivery retries automatically when online and feedback
                service is configured. You can close this window.
              </p>
            )}
            {/* Submit */}
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={!message.trim() || status !== "idle"}
              className={cn(
                "mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2",
                status === "done"
                  ? "bg-[var(--color-celebration)] text-white"
                  : "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-40"
              )}
            >
              {status === "done" ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved
                </>
              ) : status === "submitting" ? (
                "Saving…"
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
