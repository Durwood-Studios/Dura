import type { Metadata } from "next";

export const metadata: Metadata = { title: "Teach — DURA" };

export default function TeachPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Teacher Dashboard</h1>
      <p className="mt-2 text-neutral-600">Curriculum, classes, and exports.</p>
    </main>
  );
}
