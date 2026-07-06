"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  X,
  LayoutDashboard,
  BookOpen,
  Repeat,
  BookMarked,
  BarChart3,
  Compass,
  Code2,
  Target,
  ShieldCheck,
  GraduationCap,
  Settings,
  Lightbulb,
  Wrench,
  Swords,
  Signpost,
  Sparkles,
  LogOut,
  User,
  Zap,
  Flame,
} from "lucide-react";
import { useUIStore } from "@/stores/ui";
import { ReviewBadge } from "@/components/review/ReviewBadge";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";
import { createClient } from "@/lib/supabase/client";
import { getTotalXP } from "@/lib/db/xp";
import { levelProgress } from "@/lib/xp";
import { getCurrentStreak } from "@/lib/streak-manager";
import { isStreakAlive } from "@/lib/streak";
import { cn } from "@/lib/utils";

interface DrawerUser {
  email: string;
  name: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
}

interface DrawerStats {
  level: number;
  xpPercent: number;
  streakDays: number;
  streakAlive: boolean;
}

const TABS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/paths", label: "Learn", icon: BookOpen },
  { href: "/review", label: "Practice", icon: Repeat },
  { href: "/tracks", label: "Tracks", icon: Signpost },
  { href: "/stats", label: "Progress", icon: BarChart3 },
] as const;

export function MobileBottomTabs(): React.ReactElement {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-[var(--color-border)] bg-[var(--color-bg-surface)]/95 backdrop-blur-xl lg:hidden"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        height: "calc(64px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium",
              active ? "text-[var(--color-accent)]" : "text-[var(--color-text-secondary)]"
            )}
          >
            {active && (
              <span className="absolute top-1 h-0.5 w-5 rounded-full bg-[var(--color-accent)]" />
            )}
            <span className="relative">
              <Icon className="h-5 w-5" aria-hidden />
              {href === "/review" && (
                <ReviewBadge className="absolute -top-1 -right-2 h-4 min-w-[16px] text-[9px]" />
              )}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

interface DrawerItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DrawerSection {
  title: string;
  items: DrawerItem[];
}

const DRAWER_SECTIONS: DrawerSection[] = [
  {
    title: "Get Started",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/assess", label: "Skill Assessment", icon: Compass },
      { href: "/tracks", label: "Career Tracks", icon: Signpost },
    ],
  },
  {
    title: "Learn",
    items: [
      { href: "/paths", label: "Curriculum", icon: BookOpen },
      { href: "/howto", label: "How-To Guides", icon: Lightbulb },
      { href: "/tutorials", label: "Tutorials", icon: Wrench },
      { href: "/discover", label: "Discovery Zone", icon: Sparkles },
    ],
  },
  {
    title: "Practice",
    items: [
      { href: "/review", label: "Flashcards", icon: Repeat },
      { href: "/challenge", label: "Challenge", icon: Swords },
      { href: "/dojo", label: "Dojo", icon: Sparkles },
      { href: "/sandbox", label: "Code Sandbox", icon: Code2 },
    ],
  },
  {
    title: "Progress",
    items: [
      { href: "/stats", label: "Statistics", icon: BarChart3 },
      { href: "/goals", label: "Goals", icon: Target },
      { href: "/verify", label: "Certificates", icon: ShieldCheck },
    ],
  },
  {
    title: "",
    items: [
      { href: "/dictionary", label: "Dictionary", icon: BookMarked },
      { href: "/teach", label: "Teacher Tools", icon: GraduationCap },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function MobileDrawer(): React.ReactElement | null {
  const pathname = usePathname();
  const open = useUIStore((s) => s.mobileNavOpen);
  const close = useUIStore((s) => s.setMobileNav);
  const [user, setUser] = useState<DrawerUser | null>(null);
  const [stats, setStats] = useState<DrawerStats | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

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
            // is_admin lives in app_metadata — server-only, cannot be self-modified
            isAdmin: (sbUser.app_metadata?.is_admin as boolean | undefined) === true,
          });
        }
      } catch {
        // Supabase not configured
      }
    }
    async function loadStats(): Promise<void> {
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
      } catch {
        // IDB not ready
      }
    }
    void loadUser();
    void loadStats();
  }, []);

  async function handleSignOut(): Promise<void> {
    setIsSigningOut(true);
    close(false);
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
    } catch {
      // proceed to navigate regardless
    }
    window.location.href = "/auth/sign-in";
  }

  if (!open) return null;

  return (
    <div data-lenis-prevent className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Close navigation"
        onClick={() => close(false)}
        className="absolute inset-0 bg-black/40"
      />
      <div
        className="absolute inset-y-0 left-0 flex w-72 flex-col bg-[var(--color-bg-surface)] shadow-xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <span className="bg-gradient-to-r from-[#10B981] to-[#06B6D4] bg-clip-text text-xl font-semibold text-transparent">
            DURA
          </span>
          <button
            type="button"
            onClick={() => close(false)}
            aria-label="Close"
            className="rounded-lg p-3 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
          {DRAWER_SECTIONS.map((section, si) => (
            <div key={section.title || si} className="mb-1">
              {section.title && (
                <p className="mt-4 mb-1 px-3 font-mono text-xs tracking-widest text-[var(--color-text-muted)] uppercase">
                  {section.title}
                </p>
              )}
              {!section.title && si > 0 && (
                <div className="mx-3 my-3 border-t border-[var(--color-border)]" />
              )}
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => close(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3.5 text-sm transition",
                      active
                        ? "bg-[var(--color-bg-accent)] font-medium text-[var(--color-accent)]"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        active ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)]"
                      )}
                      aria-hidden
                    />
                    {label}
                    {href === "/review" && (
                      <ReviewBadge className="ml-auto h-5 min-w-[20px] text-xs" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* ── Admin (only for accounts with the server-set is_admin claim) ── */}
          {user?.isAdmin && (
            <div className="mb-1">
              <div className="mx-3 my-3 border-t border-[var(--color-border)]" />
              <p className="mt-4 mb-1 px-3 font-mono text-xs tracking-widest text-[var(--color-text-muted)] uppercase">
                Admin
              </p>
              <Link
                href="/admin"
                onClick={() => close(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3.5 text-sm transition",
                  pathname.startsWith("/admin")
                    ? "bg-[var(--color-bg-accent)] font-medium text-[var(--color-accent)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                )}
              >
                <ShieldCheck
                  className={cn(
                    "h-4 w-4 shrink-0",
                    pathname.startsWith("/admin")
                      ? "text-[var(--color-accent)]"
                      : "text-[var(--color-text-muted)]"
                  )}
                  aria-hidden
                />
                Dashboard
              </Link>
            </div>
          )}
        </nav>

        {/* Feedback */}
        <div className="border-t border-[var(--color-border)] px-3 py-2">
          <FeedbackButton />
        </div>

        {/* Stats card — mirrors sidebar; visible here covers mobile < sm where TopBar hides them */}
        {stats && (
          <div className="px-3 pb-2">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3">
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
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-primary)]">
                <div
                  className="dura-progress h-full transition-all duration-500"
                  style={{ width: `${stats.xpPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer — user profile + sign-out */}
        <div className="border-t border-[var(--color-border)] px-4 py-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
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
                  <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                    {user.name}
                  </p>
                )}
                <p className="truncate text-xs text-[var(--color-text-muted)]">{user.email}</p>
              </div>

              {/* Sign-out */}
              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={isSigningOut}
                aria-label="Sign out"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)] disabled:opacity-40"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <p className="text-xs text-[var(--color-text-muted)]">
              Free forever. Offline-first. Open source.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
