"use client";

import { useTransition } from "react";
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

  function handleModerate(status: "approved" | "rejected"): void {
    startTransition(async () => {
      const result = await moderateAnnotation(annotationId, status);
      if (result.error) {
        // Non-blocking: log for now; integrate with ToastLayer when wired
        console.error("[ModerationButtons] Moderation failed:", result.error);
      }
    });
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleModerate("approved")}
        aria-label="Approve annotation"
        className="flex h-9 min-w-[88px] items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 text-sm font-medium text-emerald-600 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40 dark:text-emerald-400"
      >
        <Check className="h-3.5 w-3.5" aria-hidden />
        Approve
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleModerate("rejected")}
        aria-label="Reject annotation"
        className="flex h-9 min-w-[76px] items-center justify-center gap-1.5 rounded-lg bg-red-500/10 px-3 text-sm font-medium text-red-600 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40 dark:text-red-400"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
        Reject
      </button>
    </div>
  );
}
