import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Unauthorized — DURA" };

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
        <ShieldAlert className="h-8 w-8 text-red-400" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-[var(--color-text-primary)]">Access Denied</h1>
      <p className="mt-2 max-w-sm text-sm text-[var(--color-text-secondary)]">
        Your account doesn&apos;t have permission to view this page. If you believe this is an
        error, contact the platform owner.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-[var(--color-accent)] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Back to DURA
      </Link>
    </main>
  );
}
