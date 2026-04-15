"use client";

import { useEffect, useState } from "react";
import { BookOpen, Award, Flame, Trophy } from "lucide-react";
import { fetchActivityFeed } from "@/lib/supabase/queries/activity";

interface ActivityFeedProps {
  userId: string | null;
}

interface ActivityItem {
  id: string;
  eventType: string;
  title: string;
  detail: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  lesson: <BookOpen className="h-4 w-4" />,
  certificate: <Award className="h-4 w-4" />,
  streak: <Flame className="h-4 w-4" />,
  phase: <Trophy className="h-4 w-4" />,
};

const EVENT_COLORS: Record<string, string> = {
  lesson: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  certificate: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  streak: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  phase: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
};

/**
 * Format a timestamp string as a relative time (e.g. "2h ago").
 */
function formatRelative(isoString: string): string {
  const ms = Date.now() - new Date(isoString).getTime();
  if (ms < 0) return "just now";

  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

/**
 * Activity feed showing recent user events as a vertical timeline.
 * Each item displays an icon (based on eventType), title, detail, and relative time.
 * Gracefully handles: no user (hide), no items (empty state), fetch errors (empty state).
 */
export function ActivityFeed({ userId }: ActivityFeedProps): React.ReactElement | null {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    void fetchActivityFeed(userId, 10)
      .then(setItems)
      .finally(() => setIsLoading(false));
  }, [userId]);

  if (!userId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="dura-card p-6">
        <div className="mb-4 h-5 w-32 animate-pulse rounded bg-[var(--color-bg-subtle)]" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-8 w-8 animate-pulse rounded-lg bg-[var(--color-bg-subtle)]" />
              <div className="flex-1">
                <div className="mb-1 h-4 w-40 animate-pulse rounded bg-[var(--color-bg-subtle)]" />
                <div className="h-3 w-24 animate-pulse rounded bg-[var(--color-bg-subtle)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dura-card p-6">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-[var(--color-text-muted)] uppercase">
        Recent Activity
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          Start a lesson to see your activity here.
        </p>
      ) : (
        <div className="relative flex flex-col gap-4 pl-6">
          {/* Timeline line */}
          <div className="absolute top-1 bottom-1 left-[15px] w-px bg-[var(--color-border)]" />

          {items.map((item) => {
            const icon = EVENT_ICONS[item.eventType] ?? <BookOpen className="h-4 w-4" />;
            const colorClass =
              EVENT_COLORS[item.eventType] ??
              "bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]";

            return (
              <div key={item.id} className="relative flex items-start gap-3">
                {/* Timeline dot */}
                <div
                  className={`absolute -left-6 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colorClass}`}
                >
                  {icon}
                </div>
                <div className="ml-5 min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                    {item.title}
                  </p>
                  {item.detail && (
                    <p className="truncate text-xs text-[var(--color-text-secondary)]">
                      {item.detail}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                    {formatRelative(item.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
