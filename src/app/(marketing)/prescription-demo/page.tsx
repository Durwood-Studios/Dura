import type { Metadata } from "next";
import { PrescriptionDemo } from "@/components/prescription/PrescriptionDemo";

export const metadata: Metadata = {
  title: "Daily Prescription Demo · DURA",
  description:
    "The plan a learner sees when they show up — computed by a pure function from local FSRS state and phase position. No profile, no transmission.",
};

export default function PrescriptionDemoPage(): React.ReactElement {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-3">
        <p className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
          Daily prescription · proof of concept
        </p>
        <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">
          The plan that shows up when you do
        </h1>
        <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
          Solo learners burn out on deciding what to study. This page is the answer: a daily
          prescription computed by a pure function from your local FSRS queue, current phase
          position, and the active session — nothing else. Two learners with the same inputs see the
          same plan. The algorithm is the personalization; there is no profile.
        </p>
      </header>

      <PrescriptionDemo />

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <h2 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
          What the engine actually does
        </h2>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-[var(--color-text-secondary)]">
          <li>
            <strong>Pressure-bucket time split.</strong> Review-vs-advance share is a lookup table:
            50+ overdue → 70% review, 20+ → 50/50, 1+ → 30/70, 0 → all advance.
          </li>
          <li>
            <strong>Stale-deck dampening.</strong> If the oldest overdue card is more than a week
            old, review time drops to 80% of the bucket allocation — a gentle on-ramp instead of a
            wall of red.
          </li>
          <li>
            <strong>Mastery-gate priority.</strong> When the current module&apos;s gate is reachable
            today, the second block is gate practice — unlocking the next module is the
            highest-leverage thing on the table.
          </li>
          <li>
            <strong>Adaptive remediation.</strong> Three consecutive &ldquo;again&rdquo; ratings on
            the same topic trigger a remediation plan — focused re-derivation instead of grinding
            more cards.
          </li>
          <li>
            <strong>Honest signal quality.</strong> The plan labels itself{" "}
            <code className="text-xs">fresh</code> / <code className="text-xs">warming</code> /{" "}
            <code className="text-xs">calibrated</code> so the learner knows when the recommendation
            is provisional.
          </li>
        </ul>
        <p className="mt-3 text-xs text-[var(--color-text-muted)]">
          The full policy lives in <code className="text-xs">src/lib/prescription/policy.ts</code> —
          every threshold and weight in one inspectable place. The engine that consumes it is in{" "}
          <code className="text-xs">src/lib/prescription/engine.ts</code>.
        </p>
      </section>
    </main>
  );
}
