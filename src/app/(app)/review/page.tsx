import type { Metadata } from "next";
import { ReviewSession } from "@/components/review/ReviewSession";

export const metadata: Metadata = { title: "Review — DURA" };

export default function ReviewPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-3xl px-6 py-6">
      <ReviewSession />
    </main>
  );
}
