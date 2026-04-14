"use client";

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
} from "lucide-react";
import { ReviewBadge } from "@/components/review/ReviewBadge";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/paths", label: "Paths", icon: BookOpen },
  { href: "/review", label: "Review", icon: Repeat },
  { href: "/dictionary", label: "Dictionary", icon: BookMarked },
  { href: "/sandbox", label: "Sandbox", icon: Code2 },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/howto", label: "How-To", icon: Lightbulb },
  { href: "/tutorials", label: "Tutorials", icon: Wrench },
  { href: "/verify", label: "Verify", icon: ShieldCheck },
  { href: "/teach", label: "Teach", icon: GraduationCap },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar(): React.ReactElement {
  const pathname = usePathname();
  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-[#E5E5E5] bg-white px-3 py-4 lg:flex">
      <Link href="/" className="mb-6 px-3 text-xl font-semibold text-neutral-900">
        DURA
      </Link>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-[#F0FDF4] text-emerald-700"
                  : "text-neutral-600 hover:bg-[#F5F5F4] hover:text-neutral-900"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span className="flex-1">{label}</span>
              {href === "/review" && <ReviewBadge />}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
