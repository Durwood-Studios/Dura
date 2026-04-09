import type { Metadata } from "next";
import { StatsClient } from "@/components/stats/StatsClient";

export const metadata: Metadata = { title: "Stats — DURA" };

export default function StatsPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-1 text-3xl font-semibold">Stats</h1>
      <p className="mb-8 text-[var(--color-text-secondary)]">XP, streaks, and time invested.</p>
      <StatsClient />
    </main>
  );
}
