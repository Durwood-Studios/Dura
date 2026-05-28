import type { Metadata } from "next";
import { CodeReviewClient } from "@/components/code-review/CodeReviewClient";

export const metadata: Metadata = { title: "Code review — DURA" };

export default function CodeReviewPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <CodeReviewClient />
    </main>
  );
}
