"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
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
} from "lucide-react";
import { useUIStore } from "@/stores/ui";
import { ReviewBadge } from "@/components/review/ReviewBadge";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/paths", label: "Learn", icon: BookOpen },
  { href: "/review", label: "Review", icon: Repeat },
  { href: "/dictionary", label: "Dict", icon: BookMarked },
  { href: "/stats", label: "Stats", icon: BarChart3 },
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
              "relative flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium",
              active ? "text-emerald-600" : "text-[var(--color-text-secondary)]"
            )}
          >
            {active && <span className="absolute top-1 h-0.5 w-5 rounded-full bg-emerald-500" />}
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
    title: "Learn",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/paths", label: "Curriculum", icon: BookOpen },
      { href: "/tracks", label: "Career Tracks", icon: Signpost },
      { href: "/assess", label: "Skill Assessment", icon: Compass },
    ],
  },
  {
    title: "Practice",
    items: [
      { href: "/review", label: "Flashcards", icon: Repeat },
      { href: "/challenge", label: "Challenge Mode", icon: Swords },
      { href: "/sandbox", label: "Code Sandbox", icon: Code2 },
    ],
  },
  {
    title: "Resources",
    items: [
      { href: "/dictionary", label: "Dictionary", icon: BookMarked },
      { href: "/howto", label: "How-To Guides", icon: Lightbulb },
      { href: "/tutorials", label: "Tutorials", icon: Wrench },
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
      { href: "/teach", label: "Teacher Tools", icon: GraduationCap },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function MobileDrawer(): React.ReactElement | null {
  const pathname = usePathname();
  const open = useUIStore((s) => s.mobileNavOpen);
  const close = useUIStore((s) => s.setMobileNav);

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
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
            className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {DRAWER_SECTIONS.map((section, si) => (
            <div key={section.title || si} className="mb-1">
              {section.title && (
                <p className="mt-4 mb-1 px-3 font-mono text-[10px] tracking-widest text-[var(--color-text-muted)] uppercase">
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
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                      active
                        ? "bg-emerald-500/10 font-medium text-emerald-600 dark:text-emerald-400"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        active ? "text-emerald-500" : "text-[var(--color-text-muted)]"
                      )}
                      aria-hidden
                    />
                    {label}
                    {href === "/review" && (
                      <ReviewBadge className="ml-auto h-5 min-w-[20px] text-[10px]" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-[var(--color-border)] px-5 py-3">
          <p className="text-[10px] text-[var(--color-text-muted)]">
            Free forever. Offline-first. Open source.
          </p>
        </div>
      </div>
    </div>
  );
}
