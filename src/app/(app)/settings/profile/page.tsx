import type { Metadata } from "next";
import Link from "next/link";
import { ProfileClient } from "@/components/settings/ProfileClient";

export const metadata: Metadata = { title: "Profile — DURA" };

export default function ProfileSettingsPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/settings"
        className="mb-6 inline-block text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
      >
        ← Settings
      </Link>
      <h1 className="mb-1 text-3xl font-semibold text-[var(--color-text-primary)]">Profile</h1>
      <p className="mb-8 text-[var(--color-text-secondary)]">Your name, avatar, and public bio.</p>
      <ProfileClient />
    </main>
  );
}
