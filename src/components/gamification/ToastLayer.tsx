"use client";

import { Trophy, Sparkles, Flame } from "lucide-react";
import { useToastsStore } from "@/stores/toasts";
import { cn } from "@/lib/utils";

export function ToastLayer(): React.ReactElement {
  const toasts = useToastsStore((s) => s.toasts);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-20 z-40 flex flex-col gap-2 sm:bottom-6"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "xp-toast pointer-events-none flex items-center gap-2 rounded-full border bg-[var(--color-bg-surface)] px-4 py-2 shadow-lg",
            t.kind === "xp" && "border-emerald-300 text-emerald-700",
            t.kind === "level-up" && "border-amber-300 bg-amber-50 text-amber-800",
            t.kind === "streak" && "border-rose-300 bg-rose-50 text-rose-700"
          )}
        >
          {t.kind === "xp" && <Sparkles className="h-4 w-4" aria-hidden />}
          {t.kind === "level-up" && <Trophy className="h-4 w-4" aria-hidden />}
          {t.kind === "streak" && <Flame className="h-4 w-4" aria-hidden />}
          {t.kind === "xp" && (
            <span className="font-mono text-sm font-semibold">+{t.amount ?? 0} XP</span>
          )}
          {t.kind === "level-up" && (
            <span className="text-sm font-semibold">Level up — {t.message}</span>
          )}
          {t.kind === "streak" && <span className="text-sm font-semibold">{t.message}</span>}
        </div>
      ))}
    </div>
  );
}
