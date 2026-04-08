import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings — DURA" };

export default function SettingsPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Settings</h1>
      <p className="mt-2 text-neutral-600">Theme, study mode, account.</p>
    </main>
  );
}
