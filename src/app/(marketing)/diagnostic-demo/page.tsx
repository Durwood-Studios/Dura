import type { Metadata } from "next";
import { DiagnosticDemo } from "@/components/diagnostic/DiagnosticDemo";

export const metadata: Metadata = {
  title: "Diagnostic Demo · DURA",
  description:
    "Honest feedback from pure algorithms — no learner data collected. Pick an answer, watch the system diagnose the gap.",
};

export default function DiagnosticDemoPage(): React.ReactElement {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-3">
        <p className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
          Diagnostic engine · proof of concept
        </p>
        <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">
          Honest feedback, no data collection
        </h1>
        <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
          Every wrong-answer choice is tagged with a named misconception. The engine is a pure
          function — same answer always produces the same diagnosis, with no per-learner profile, no
          longitudinal record, and nothing transmitted to a server. The math is the personalization.
        </p>
      </header>

      <DiagnosticDemo />

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <h2 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
          What&apos;s happening under the hood
        </h2>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-[var(--color-text-secondary)]">
          <li>
            <strong>Schema:</strong> every wrong choice carries a misconception id. The catalog
            lives in code at <code className="text-xs">src/lib/diagnostic/misconceptions.ts</code>.
          </li>
          <li>
            <strong>Feedback:</strong> a pure function maps (question, answer) → diagnosis + worked
            solution + FSRS rating. No I/O, no clock, no random.
          </li>
          <li>
            <strong>Calibration:</strong> optional confidence elicitation produces meta-feedback on
            whether the learner&apos;s certainty matched the reality.
          </li>
          <li>
            <strong>FSRS bridge:</strong> the result emits an &ldquo;again&rdquo; /
            &ldquo;hard&rdquo; / &ldquo;good&rdquo; / &ldquo;easy&rdquo; rating that the local
            spaced-repetition scheduler consumes — without ever knowing who the learner is.
          </li>
        </ul>
      </section>
    </main>
  );
}
