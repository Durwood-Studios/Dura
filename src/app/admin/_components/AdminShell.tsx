"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  BarChart2,
  BookOpen,
  Flag,
  Users,
  HardDrive,
  ShieldAlert,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/content", label: "Content", icon: BookOpen },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/admin/annotations", label: "Moderation", icon: Flag },
  { href: "/admin/local", label: "Local", icon: HardDrive },
];

function AdminNav(): React.ReactElement {
  const pathname = usePathname();

  async function handleSignOut(): Promise<void> {
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "local" });
    window.location.href = "/auth/sign-in";
  }

  return (
    <aside
      data-lenis-prevent
      className="flex h-screen w-56 shrink-0 flex-col overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-bg-primary)]"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-4">
        <ShieldAlert className="h-4 w-4 text-[var(--color-error)]" aria-hidden />
        <span className="text-sm font-semibold tracking-wide text-[var(--color-text-primary)]">
          DURA Admin
        </span>
      </div>

      <div className="mx-4 border-t border-[var(--color-border)]" />

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3 pt-3">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none",
                active
                  ? "bg-[var(--color-bg-surface)] font-medium text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)]"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--color-border)] px-3 py-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[var(--color-text-muted)] transition hover:text-[var(--color-text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
        >
          ← Back to DURA
        </Link>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[var(--color-text-muted)] transition hover:text-[var(--color-error)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden />
          Sign out
        </button>
      </div>
    </aside>
  );
}

/**
 * Admin layout shell: token-driven so it follows the site theme (dark
 * canonical, light inversion) instead of the old hardcoded dark palette.
 */
export function AdminShell({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <AdminNav />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
