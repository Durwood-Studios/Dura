"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Repeat,
  BookMarked,
  Code2,
  Target,
  BarChart3,
  ShieldCheck,
  Settings,
  GraduationCap,
  Lightbulb,
  Wrench,
  Compass,
  Signpost,
  Sparkles,
  Swords,
  Zap,
  Flame,
} from "lucide-react";
import { ReviewBadge } from "@/components/review/ReviewBadge";
import { cn } from "@/lib/utils";
import { levelProgress } from "@/lib/xp";
import { getTotalXP } from "@/lib/db/xp";
import { getCurrentStreak } from "@/lib/streak-manager";
import { isStreakAlive } from "@/lib/streak";

/** Navigation groups organised by journey stage */
const NAV_GROUPS = [
  {
    label: "Get Started",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/assess", label: "Skill Assessment", icon: Compass },
      { href: "/tracks", label: "Career Tracks", icon: Signpost },
    ],
  },
  {
    label: "Learn",
    items: [
      { href: "/paths", label: "Curriculum", icon: BookOpen },
      { href: "/howto", label: "How-To Guides", icon: Lightbulb },
      { href: "/tutorials", label: "Tutorials", icon: Wrench },
      { href: "/discover", label: "Discovery Center", icon: Sparkles },
    ],
  },
  {
    label: "Practice",
    items: [
      { href: "/review", label: "Flashcards", icon: Repeat },
      { href: "/challenge", label: "Challenge", icon: Swords },
      { href: "/sandbox", label: "Code Sandbox", icon: Code2 },
    ],
  },
  {
    label: "Progress",
    items: [
      { href: "/stats", label: "Statistics", icon: BarChart3 },
      { href: "/goals", label: "Goals", icon: Target },
      { href: "/verify", label: "Certificates", icon: ShieldCheck },
    ],
  },
  {
    label: "",
    items: [
      { href: "/dictionary", label: "Dictionary", icon: BookMarked },
      { href: "/teach", label: "Teacher Tools", icon: GraduationCap },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
] as const;

interface SidebarStats {
  level: number;
  xpPercent: number;
  streakDays: number;
  streakAlive: boolean;
}

export function Sidebar(): React.ReactElement {
  const pathname = usePathname();
  const [stats, setStats] = useState<SidebarStats | null>(null);

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const totalXp = await getTotalXP();
        const lp = levelProgress(totalXp);
        const streak = await getCurrentStreak();
        setStats({
          level: lp.level,
          xpPercent: lp.percent,
          streakDays: streak.current,
          streakAlive: isStreakAlive(streak),
        });
      } catch (error) {
        console.error("[sidebar] stats load failed", error);
      }
    }
    void load();
  }, []);

  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-primary)] lg:flex">
      {/* ── Logo ───────────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4">
        <Link href="/" className="group inline-flex items-center gap-2 no-underline">
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
            DURA
          </span>
        </Link>
      </div>

      <div className="dura-divider mx-4" />

      {/* ── Navigation groups ──────────────────────────────────────── */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pt-3 pb-2">
        {NAV_GROUPS.map((group, groupIdx) => (
          <div key={group.label}>
            {groupIdx > 0 && <div className="dura-divider mx-2 my-2.5" />}
            {group.label && (
              <span className="mb-1 block px-3 pt-1 text-[10px] font-semibold tracking-widest text-[var(--color-text-muted)] uppercase">
                {group.label}
              </span>
            )}
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "group/item relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    active
                      ? "dura-glow-emerald bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
                  )}
                >
                  {/* Active left accent bar */}
                  <span
                    className={cn(
                      "absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-emerald-500 transition-all duration-200",
                      active
                        ? "scale-y-100 opacity-100"
                        : "scale-y-0 opacity-0 group-hover/item:scale-y-75 group-hover/item:opacity-40"
                    )}
                  />
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      active
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-[var(--color-text-muted)] group-hover/item:text-[var(--color-text-secondary)]"
                    )}
                    aria-hidden
                  />
                  <span className="flex-1">{label}</span>
                  {href === "/review" && <ReviewBadge />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Bottom stats card ──────────────────────────────────────── */}
      {stats && (
        <div className="mx-3 mt-auto mb-3">
          <div className="dura-glass rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Zap className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                    Level {stats.level}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    {stats.xpPercent}% to next
                  </p>
                </div>
              </div>
              {stats.streakDays > 0 && (
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                    stats.streakAlive
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]"
                  )}
                >
                  <Flame className="h-3 w-3" />
                  {stats.streakDays}
                </div>
              )}
            </div>
            {/* XP progress bar */}
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
              <div
                className="dura-progress h-full transition-all duration-500"
                style={{ width: `${stats.xpPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
