"use client";

import { useEffect, useState } from "react";
import { getTotalXP } from "@/lib/db/xp";
import { levelFromXP } from "@/lib/xp";
import { getCurrentStreak } from "@/lib/streak-manager";
import { LevelBadge } from "@/components/gamification/LevelBadge";
import { StreakFlame } from "@/components/gamification/StreakFlame";

/**
 * Compact level + streak indicators for the top bar.
 * Refreshes every 15 seconds so awards made elsewhere show up.
 */
export function TopBarGamification(): React.ReactElement {
  const [level, setLevel] = useState(0);
  const [streakDays, setStreakDays] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [xp, streak] = await Promise.all([getTotalXP(), getCurrentStreak()]);
      if (cancelled) return;
      setLevel(levelFromXP(xp));
      setStreakDays(streak.current);
    };
    void load();
    const id = setInterval(load, 15_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="hidden items-center gap-3 text-xs sm:flex">
      <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
        <StreakFlame days={streakDays} />
        <span className="font-mono">{streakDays}d</span>
      </span>
      <LevelBadge level={level} size="sm" />
    </div>
  );
}
