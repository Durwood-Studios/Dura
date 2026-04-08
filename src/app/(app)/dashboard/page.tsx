import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — DURA" };

export default function DashboardPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-neutral-600">Your learning at a glance.</p>
    </main>
  );
}
