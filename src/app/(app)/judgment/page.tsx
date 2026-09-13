import type { Metadata } from "next";
import Link from "next/link";
import { JudgmentIndex } from "@/components/judgment/JudgmentIndex";
import { JUDGMENT_CASES } from "@/lib/judgment/cases";

export const metadata: Metadata = {
  title: "Engineering judgment — DURA",
  description:
    "Practice engineering decisions, explain evidence and tradeoffs, then revise under new information.",
};
/** A guided-to-independent sequence of local, ungraded engineering decision practice. */
export default function JudgmentPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold">Engineering judgment</h1>
      <p className="mt-4 max-w-3xl leading-relaxed">
        Make a decision under constraints, explain the evidence and tradeoffs, then revise when new
        information arrives. Begin with the guided case; later cases ask you to transfer the process
        to another domain.
      </p>
      <p className="mt-3 max-w-3xl text-sm text-[var(--color-text-secondary)]">
        Drafts and revisions are saved to this learner’s local encrypted journal and included in
        your progress export. These cases use standards and a published reasoning rubric; they do
        not automatically grade reasoning, award credentials, or establish job readiness. Confidence
        is a self-estimate. A seven-day return is a practice reminder, not a validated optimum.
      </p>
      <nav aria-label="Judgment resources" className="my-6 flex flex-wrap gap-4 text-sm">
        <Link href="/judgment/guide" className="min-h-12 py-3 underline">
          Printable teacher guide and rubric
        </Link>
        <Link href="/settings" className="min-h-12 py-3 underline">
          Export or download for offline use
        </Link>
      </nav>
      <JudgmentIndex cases={JUDGMENT_CASES} />
    </main>
  );
}
