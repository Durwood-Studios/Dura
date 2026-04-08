import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Open Source — DURA",
  description: "AGPLv3 core. Apache 2.0 APIs. Free forever.",
};

export default function OpenSourcePage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-[700px] px-6 py-16">
      <h1 className="mb-4 text-4xl font-semibold text-neutral-900">Open Source</h1>
      <p className="text-lg leading-relaxed text-neutral-700">
        DURA is AGPLv3 licensed. The source is open. The core is free, forever.
      </p>
    </main>
  );
}
