"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  BarChart2,
  Users,
  ShieldAlert,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/users", label: "Users", icon: Users },
];

function AdminNav() {
  const pathname = usePathname();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "local" });
    window.location.href = "/auth/sign-in";
  }

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-white/8 bg-[#0a0a10]">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-4">
        <ShieldAlert className="h-4 w-4 text-red-400" />
        <span className="text-sm font-semibold tracking-wide text-white">DURA Admin</span>
      </div>

      <div className="mx-4 border-t border-white/8" />

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3 pt-3">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-white/8 font-medium text-white"
                  : "text-white/50 hover:bg-white/4 hover:text-white/80"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/8 px-3 py-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-white/40 transition hover:text-white/70"
        >
          ← Back to DURA
        </Link>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-white/40 transition hover:text-red-400"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#07070d] text-white">
      <AdminNav />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
