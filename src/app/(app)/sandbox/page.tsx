import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sandbox — DURA" };

export default function SandboxPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Sandbox</h1>
      <p className="mt-2 text-neutral-600">Write, run, share code.</p>
    </main>
  );
}
