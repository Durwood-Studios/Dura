import type { Metadata } from "next";
import { SettingsClient } from "@/components/settings/SettingsClient";

export const metadata: Metadata = { title: "Settings — DURA" };

export default function SettingsPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-1 text-3xl font-semibold">Settings</h1>
      <p className="mb-8 text-[var(--color-text-secondary)]">
        Appearance, learning, and your data — all local.
      </p>
      <SettingsClient />
    </main>
  );
}
