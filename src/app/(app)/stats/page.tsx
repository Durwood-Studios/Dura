import type { Metadata } from "next";

export const metadata: Metadata = { title: "Stats — DURA" };

export default function StatsPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Stats</h1>
      <p className="mt-2 text-neutral-600">XP, streaks, and time invested.</p>
    </main>
  );
}
