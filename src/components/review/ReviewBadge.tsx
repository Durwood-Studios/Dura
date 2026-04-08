"use client";

import { useEffect, useState } from "react";
import { getDueCards } from "@/lib/db/flashcards";
import { cn } from "@/lib/utils";

interface ReviewBadgeProps {
  className?: string;
}

/**
 * Small client-side badge that fetches due flashcard count and renders
 * a pill if > 0. Used in nav components and dashboard cards.
 */
export function ReviewBadge({ className }: ReviewBadgeProps): React.ReactElement | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const due = await getDueCards();
      if (!cancelled) setCount(due.length);
    };
    void load();
    const id = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!count || count <= 0) return null;

  return (
    <span
      aria-label={`${count} cards due for review`}
      className={cn(
        "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-semibold text-white",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
