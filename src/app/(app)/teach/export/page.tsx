import type { Metadata } from "next";

export const metadata: Metadata = { title: "Export — DURA" };

export default function TeachExportPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Export</h1>
      <p className="mt-2 text-neutral-600">PDFs, workbooks, vocab, quiz banks.</p>
    </main>
  );
}
