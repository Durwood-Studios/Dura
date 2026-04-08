import type { Metadata } from "next";

export const metadata: Metadata = { title: "Goals — DURA" };

export default function GoalsPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Goals</h1>
      <p className="mt-2 text-neutral-600">Set targets. Track progress.</p>
    </main>
  );
}
