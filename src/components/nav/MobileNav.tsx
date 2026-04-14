"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { X, LayoutDashboard, BookOpen, Repeat, BookMarked, BarChart3 } from "lucide-react";
import { useUIStore } from "@/stores/ui";
import { ReviewBadge } from "@/components/review/ReviewBadge";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/paths/0", label: "Learn", icon: BookOpen },
  { href: "/review", label: "Review", icon: Repeat },
  { href: "/dictionary", label: "Dict", icon: BookMarked },
  { href: "/stats", label: "Stats", icon: BarChart3 },
] as const;

export function MobileBottomTabs(): React.ReactElement {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 border-t border-[#E5E5E5] bg-white/95 backdrop-blur-xl lg:hidden">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium",
              active ? "text-emerald-600" : "text-neutral-500"
            )}
          >
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

const DRAWER_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/paths/0", label: "Learn" },
  { href: "/review", label: "Review" },
  { href: "/dictionary", label: "Dictionary" },
  { href: "/sandbox", label: "Sandbox" },
  { href: "/goals", label: "Goals" },
  { href: "/stats", label: "Stats" },
  { href: "/howto", label: "How-To" },
  { href: "/tutorials", label: "Tutorials" },
  { href: "/verify", label: "Verify" },
  { href: "/teach", label: "Teach" },
  { href: "/settings", label: "Settings" },
] as const;

export function MobileDrawer(): React.ReactElement | null {
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
      <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white px-4 py-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xl font-semibold">DURA</span>
          <button
            type="button"
            onClick={() => close(false)}
            aria-label="Close"
            className="rounded-lg p-2 text-neutral-600 hover:bg-[#F5F5F4]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1">
          {DRAWER_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => close(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-[#F5F5F4]"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
