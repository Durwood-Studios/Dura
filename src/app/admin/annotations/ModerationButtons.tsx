"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { moderateAnnotation } from "./actions";

interface ModerationButtonsProps {
  annotationId: string;
}

/**
 * Approve / Reject controls for a single pending annotation.
 *
 * Kept as a minimal client component so the parent page can remain a
 * Server Component (no "use client" needed there).
 */
export function ModerationButtons({ annotationId }: ModerationButtonsProps): React.ReactElement {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleModerate(status: "approved" | "rejected"): void {
    setError(null);
    startTransition(async () => {
      const result = await moderateAnnotation(annotationId, status);
      if (result.error) {
        console.error("[ModerationButtons] Moderation failed:", result.error);
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleModerate("approved")}
          aria-label="Approve annotation"
          className="flex h-11 min-w-[88px] items-center justify-center gap-1.5 rounded-lg bg-[var(--color-success)]/10 px-3 text-sm font-medium text-[var(--color-success)] transition hover:bg-[var(--color-success)]/20 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 sm:h-9"
        >
          <Check className="h-3.5 w-3.5" aria-hidden />
          Approve
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleModerate("rejected")}
          aria-label="Reject annotation"
          className="flex h-11 min-w-[76px] items-center justify-center gap-1.5 rounded-lg bg-[var(--color-error)]/10 px-3 text-sm font-medium text-[var(--color-error)] transition hover:bg-[var(--color-error)]/20 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 sm:h-9"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
          Reject
        </button>
      </div>
      {error ? (
        <p role="alert" className="max-w-[240px] text-right text-xs text-[var(--color-error)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
