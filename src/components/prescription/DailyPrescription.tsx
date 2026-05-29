import Link from "next/link";
import type { BlockKind, DailyPlan, SignalQuality } from "@/lib/prescription/types";

interface DailyPrescriptionProps {
  plan: DailyPlan;
}

const BLOCK_DOT: Record<BlockKind, string> = {
  "fresh-start": "var(--color-accent)",
  "fsrs-review": "var(--color-rating-good)",
  lesson: "var(--color-accent)",
  "mastery-gate": "var(--color-accent-emerald)",
  remediation: "var(--color-rating-hard)",
};

const SIGNAL_LABEL: Record<SignalQuality, string> = {
  fresh: "fresh",
  warming: "warming",
  calibrated: "calibrated",
};

const SIGNAL_NOTE: Record<SignalQuality, string> = {
  fresh: "No prior data. The plan is a guess based on phase position only.",
  warming: "Partial signal. The plan adapts to FSRS or the active session — not both yet.",
  calibrated: "Both your FSRS state and your active session inform this plan.",
};

export function DailyPrescription({ plan }: DailyPrescriptionProps): React.ReactElement {
  return (
    <section className="flex flex-col gap-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
      <header className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
            Today · {plan.totalMinutes} min
          </span>
          <span
            className="rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-secondary)",
            }}
            title={SIGNAL_NOTE[plan.signalQuality]}
          >
            signal · {SIGNAL_LABEL[plan.signalQuality]}
          </span>
        </div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{plan.summary}</h2>
      </header>

      <ol className="flex flex-col gap-3">
        {plan.blocks.map((block, i) => (
          <li
            key={`${block.kind}-${i}`}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4"
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: BLOCK_DOT[block.kind] }}
              />
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {block.title}
                  </h3>
                  <span className="font-mono text-xs text-[var(--color-text-muted)]">
                    {block.minutes} min
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">{block.target}</p>
                <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
                  {block.rationale}
                </p>
                <Link
                  href={block.href}
                  className="mt-1 inline-block text-xs font-medium text-[var(--color-accent)] underline underline-offset-2"
                >
                  Start →
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <footer className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3">
        <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
          The plan is computed by a pure function from your local FSRS queue and current phase
          position. Nothing about you is transmitted. {SIGNAL_NOTE[plan.signalQuality]}
        </p>
      </footer>
    </section>
  );
}
