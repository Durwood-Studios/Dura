import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dictionary — DURA" };

export default function DictionaryPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Dictionary</h1>
      <p className="mt-2 text-neutral-600">Verified engineering terms.</p>
    </main>
  );
}
