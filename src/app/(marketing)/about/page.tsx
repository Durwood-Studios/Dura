import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — DURA",
  description: "Mission, philosophy, and the story behind DURA.",
};

export default function AboutPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-[700px] px-6 py-16">
      <h1 className="mb-4 text-4xl font-semibold text-neutral-900">About DURA</h1>
      <p className="text-lg leading-relaxed text-neutral-700">
        DURA is an open-source learning platform built by Durwood Studios LLC. Engineering
        education, hardened by design.
      </p>
    </main>
  );
}
