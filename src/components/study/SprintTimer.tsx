"use client";

import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";
import { useSprintStore } from "@/stores/sprint";
import { usePreferencesStore } from "@/stores/preferences";
import { cn } from "@/lib/utils";

function format(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Small Pomodoro timer pill. Shown in the top bar whenever the user's
 * studyMode is "sprint". Otherwise renders nothing.
 */
export function SprintTimer(): React.ReactElement | null {
  const studyMode = usePreferencesStore((s) => s.prefs.studyMode);
  const phase = useSprintStore((s) => s.phase);
  const endsAt = useSprintStore((s) => s.endsAt);
  const sprintIndex = useSprintStore((s) => s.sprintIndex);
  const totalSprints = useSprintStore((s) => s.totalSprints);
  const start = useSprintStore((s) => s.start);
  const pause = useSprintStore((s) => s.pause);
  const reset = useSprintStore((s) => s.reset);
  const tick = useSprintStore((s) => s.tick);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const current = Date.now();
      setNow(current);
      tick(current);
    }, 1000);
    return () => clearInterval(id);
  }, [tick]);

  if (studyMode !== "sprint") return null;

  const remaining = endsAt ? endsAt - now : 0;
  const active = phase === "working" || phase === "break" || phase === "long-break";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition",
        phase === "working" && "border-emerald-300 bg-emerald-50 text-emerald-800",
        phase === "break" && "border-cyan-300 bg-cyan-50 text-cyan-800",
        phase === "long-break" && "border-amber-300 bg-amber-50 text-amber-800",
        phase === "idle" &&
          "border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]",
        phase === "done" && "border-emerald-400 bg-emerald-50 text-emerald-800"
      )}
    >
      <Timer className="h-3.5 w-3.5" />
      {active ? (
        <>
          <span className="font-mono">{format(remaining)}</span>
          <span className="text-[10px] opacity-75">
            {phase === "working"
              ? `Sprint ${sprintIndex}/${totalSprints}`
              : phase === "break"
                ? "Break"
                : "Long break"}
          </span>
          <button
            type="button"
            onClick={pause}
            aria-label="Pause"
            className="rounded p-0.5 hover:bg-[var(--color-bg-surface)]/40"
          >
            <Pause className="h-3 w-3" />
          </button>
        </>
      ) : phase === "done" ? (
        <>
          <span>Sprint complete</span>
          <button
            type="button"
            onClick={reset}
            aria-label="Reset"
            className="rounded p-0.5 hover:bg-[var(--color-bg-surface)]/40"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </>
      ) : (
        <>
          <button type="button" onClick={start} className="inline-flex items-center gap-1">
            <Play className="h-3 w-3" /> Start sprint
          </button>
        </>
      )}
    </div>
  );
}
