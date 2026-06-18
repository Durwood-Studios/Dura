"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  LogOut,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ReviewBadge } from "@/components/review/ReviewBadge";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";
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
      { href: "/discover", label: "Discovery Zone", icon: Sparkles },
    ],
  },
  {
    label: "Practice",
    items: [
      { href: "/review", label: "Flashcards", icon: Repeat },
      { href: "/challenge", label: "Challenge", icon: Swords },
      { href: "/dojo", label: "Dojo", icon: Sparkles },
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

interface SidebarUser {
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

export function Sidebar(): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const [stats, setStats] = useState<SidebarStats | null>(null);
  const [user, setUser] = useState<SidebarUser | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

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

  useEffect(() => {
    async function loadUser(): Promise<void> {
      try {
        const supabase = createClient();
        const {
          data: { user: sbUser },
        } = await supabase.auth.getUser();
        if (sbUser) {
          setUser({
            email: sbUser.email ?? "",
            name: (sbUser.user_metadata?.full_name as string | null) ?? null,
            avatarUrl: (sbUser.user_metadata?.avatar_url as string | null) ?? null,
          });
        }
      } catch {
        // Supabase not configured — no user shown
      }
    }
    void loadUser();
  }, []);

  async function handleSignOut(): Promise<void> {
    setIsSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/auth/sign-in");
    } catch (error) {
      console.error("[sidebar] sign-out failed", error);
      setIsSigningOut(false);
    }
  }

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
              <span className="mb-1 block px-3 pt-1 text-xs font-semibold tracking-widest text-[var(--color-text-muted)] uppercase">
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

      {/* ── Feedback ───────────────────────────────────────────────── */}
      <div className="px-3 pb-1">
        <FeedbackButton />
      </div>

      {/* ── Bottom stats card ──────────────────────────────────────── */}
      {/* Min 24px top clearance + a divider so the 20px dura-glow-emerald on
          an active last nav item doesn't bleed into the card. */}
      {stats && (
        <div className="mt-auto border-t border-[var(--color-border)] px-3 pt-6 pb-3">
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
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {stats.xpPercent}% to next
                  </p>
                </div>
              </div>
              {stats.streakDays > 0 && (
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold",
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

      {/* ── User profile + sign-out ────────────────────────────────── */}
      {user && (
        <div className="border-t border-[var(--color-border)] px-3 py-3">
          <div className="flex items-center gap-2">
            {/* Avatar */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-bg-surface)]">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <User className="h-4 w-4 text-[var(--color-text-muted)]" />
              )}
            </div>

            {/* Name / email */}
            <div className="min-w-0 flex-1">
              {user.name && (
                <p className="truncate text-xs font-medium text-[var(--color-text-primary)]">
                  {user.name}
                </p>
              )}
              <p className="truncate text-xs text-[var(--color-text-muted)]">{user.email}</p>
            </div>

            {/* Sign-out button */}
            <button
              type="button"
              onClick={() => void handleSignOut()}
              disabled={isSigningOut}
              aria-label="Sign out"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] disabled:opacity-40"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
