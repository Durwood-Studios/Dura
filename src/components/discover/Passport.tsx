"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "dura-discovery-passport";

interface Room {
  slug: string;
  name: string;
  color: string;
  activities: string[];
}

const ROOMS: Room[] = [
  {
    slug: "secret-codes",
    name: "Secret Codes",
    color: "#f472b6",
    activities: ["binary-painter", "morse-code", "pixel-art", "secret-encoder"],
  },
  {
    slug: "robot-chef",
    name: "Robot Chef",
    color: "#fbbf24",
    activities: ["algorithm-kitchen", "robot-dance", "treasure-map"],
  },
  {
    slug: "internet-explorer",
    name: "Internet Explorer",
    color: "#60a5fa",
    activities: ["network-post-office", "dns-phonebook", "website-builder"],
  },
  {
    slug: "pattern-factory",
    name: "Pattern Factory",
    color: "#a78bfa",
    activities: ["pattern-machine", "fractal-tree", "music-beats", "tile-designer"],
  },
  {
    slug: "bug-lab",
    name: "Bug Lab",
    color: "#34d399",
    activities: ["bug-detective", "logic-gates", "story-builder"],
  },
];

const ALL_ACTIVITIES = ROOMS.flatMap((room) =>
  room.activities.map((activity) => ({
    slug: activity,
    color: room.color,
    roomName: room.name,
  }))
);

/** Call this from an activity component when the kid completes it. */
export function markActivityComplete(slug: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const completed: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    if (!completed.includes(slug)) {
      completed.push(slug);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    }
  } catch {
    // localStorage unavailable — silently ignore
  }
}

/** Read completed activities from localStorage. */
function readCompleted(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Passport stamp tracker showing completion across all Discovery Center activities. */
export function Passport(): React.ReactElement {
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    setCompleted(readCompleted());

    // Re-read on storage changes from other tabs
    function handleStorage(e: StorageEvent): void {
      if (e.key === STORAGE_KEY) {
        setCompleted(readCompleted());
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const completedSet = new Set(completed);
  const total = ALL_ACTIVITIES.length;
  const doneCount = ALL_ACTIVITIES.filter((a) => completedSet.has(a.slug)).length;

  const getLabel = useCallback((slug: string): string => {
    return slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }, []);

  return (
    <section className="mt-16 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8">
      <h2 className="mb-2 text-center text-2xl font-bold text-[var(--color-text-primary)]">
        Discovery Passport
      </h2>
      <p className="mb-6 text-center text-sm text-[var(--color-text-muted)]">
        {doneCount} of {total} explored
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        {ALL_ACTIVITIES.map((activity) => {
          const isDone = completedSet.has(activity.slug);
          return (
            <div
              key={activity.slug}
              className="flex flex-col items-center gap-1"
              title={getLabel(activity.slug)}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200"
                style={
                  isDone
                    ? { backgroundColor: activity.color, borderColor: activity.color }
                    : undefined
                }
                {...(!isDone && {
                  className:
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-[var(--color-border)] transition-colors duration-200",
                })}
              >
                {isDone ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M3 8.5L6.5 12L13 4"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Passport;
