import type { Metadata } from "next";
import { FreeformSandbox } from "@/components/sandbox/FreeformSandbox";

export const metadata: Metadata = { title: "Sandbox — DURA" };

export default function SandboxPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-1 text-3xl font-semibold">Sandbox</h1>
      <p className="mb-6 text-[var(--color-text-secondary)]">
        Write, run, save. JavaScript, TypeScript, HTML, React.
      </p>
      <FreeformSandbox />
    </main>
  );
}
