"use client";

import { useEffect, useState } from "react";
import { subscribeToPresence } from "@/lib/supabase/queries/presence";

interface StudyingNowProps {
  /** Current phase the user is studying, used for presence tracking. */
  currentPhaseId?: string | null;
}

/**
 * Small pill showing "X studying now" with a green dot.
 * Uses Supabase Realtime presence. Gracefully hides when:
 * - No connection is available
 * - Zero users are online
 * - Supabase is not configured
 */
export function StudyingNow({
  currentPhaseId = null,
}: StudyingNowProps): React.ReactElement | null {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = subscribeToPresence(currentPhaseId ?? null, (state) => {
      setCount(state.onlineCount);
    });

    return unsubscribe;
  }, [currentPhaseId]);

  if (count === 0) {
    return null;
  }

  return (
    <div className="dura-glass inline-flex items-center gap-2 rounded-full px-3 py-1.5">
      {/* Animated green dot */}
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span className="text-sm text-[var(--color-text-secondary)]">{count} studying now</span>
    </div>
  );
}
