"use client";

import { useEffect, useState } from "react";
import { formatTime } from "@/lib/utils";

interface ReviewProgressProps {
  current: number;
  total: number;
  correct: number;
  wrong: number;
  startedAt: number | null;
}

export function ReviewProgress({
  current,
  total,
  correct,
  wrong,
  startedAt,
}: ReviewProgressProps): React.ReactElement {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const answered = correct + wrong;
  const accuracy = answered === 0 ? 0 : Math.round((correct / answered) * 100);
  const percent = total === 0 ? 0 : Math.round((current / total) * 100);
  const elapsed = startedAt ? now - startedAt : 0;

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
        <span className="font-mono">
          {Math.min(current + 1, total)} / {total}
        </span>
        <span className="flex items-center gap-3">
          <span>{accuracy}% accuracy</span>
          <span aria-hidden>·</span>
          <span className="font-mono">{formatTime(elapsed)}</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
