import type { Metadata } from "next";
import { GoalsClient } from "@/components/goals/GoalsClient";

export const metadata: Metadata = { title: "Goals — DURA" };

export default function GoalsPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-1 text-3xl font-semibold">Learning Goals</h1>
      <p className="mb-8 text-[var(--color-text-secondary)]">
        Set targets. Track progress. Compound on yourself.
      </p>
      <GoalsClient />
    </main>
  );
}
