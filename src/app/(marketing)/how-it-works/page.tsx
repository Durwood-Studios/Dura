import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How it works — DURA",
  description: "Mastery-gated, standards-backed engineering education.",
};

export default function HowItWorksPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-[700px] px-6 py-16">
      <h1 className="mb-4 text-4xl font-semibold text-neutral-900">How it works</h1>
      <p className="text-lg leading-relaxed text-neutral-700">
        Read. Practice. Verify. Advance only when you prove mastery.
      </p>
    </main>
  );
}
