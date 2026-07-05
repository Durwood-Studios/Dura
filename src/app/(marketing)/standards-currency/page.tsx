import type { Metadata } from "next";
import Link from "next/link";
import {
  STANDARDS_REGISTRY,
  REGISTRY_LAST_REVIEWED,
  revisionVerifiedDate,
} from "@/lib/standards-watch/registry";

export const metadata: Metadata = {
  title: "Standards currency & disclaimer — DURA",
  description:
    "How DURA keeps its references to third-party industry standards current, the date each standard family was last verified, and the disclaimer that governs their use.",
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function StandardsCurrencyPage(): React.ReactElement {
  const registry = [...STANDARDS_REGISTRY].sort((a, b) => a.family.localeCompare(b.family));

  return (
    <main className="mx-auto max-w-[880px] px-6 py-16">
      <header className="mb-10">
        <p className="mb-2 font-mono text-xs tracking-wide text-[var(--color-text-muted)] uppercase">
          Standards currency
        </p>
        <h1 className="mb-4 text-4xl font-semibold text-[var(--color-text-primary)] sm:text-5xl">
          Standards currency &amp; disclaimer
        </h1>
        <p className="max-w-[640px] text-lg text-[var(--color-text-secondary)]">
          DURA lessons reference real, named third-party standards — ISO, IEC, IEEE, ISA, IETF,
          MISRA, and industry consortia. This page states how current those references are and the
          terms under which you may rely on them.
        </p>
      </header>

      {/* Disclaimer — the governing legal notice */}
      <section
        aria-label="Disclaimer"
        className="mb-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6"
      >
        <h2 className="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">Disclaimer</h2>
        <div className="space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          <p>
            DURA is an educational platform. Its references to third-party standards are provided
            for learning purposes only and are <strong>not</strong> compliance, certification,
            legal, or engineering advice. Standards are the property of, and are published by, their
            respective standards bodies.
          </p>
          <p>
            Standards are revised on the publishers&rsquo; schedules, and editions, clause numbers,
            and requirements change over time. DURA reviews the standards referenced by its
            curriculum on a periodic basis — most recently on{" "}
            <strong className="text-[var(--color-text-primary)]">
              {formatDate(REGISTRY_LAST_REVIEWED)}
            </strong>{" "}
            — but does <strong>not</strong> warrant that every reference reflects the latest
            published revision at the moment you read it.
          </p>
          <p>
            Before relying on any standard for professional, safety-critical, contractual, or
            certification purposes, you must obtain and consult the official, current publication
            from the issuing body or an authorized distributor. DURA and Durwood Studios LLC accept
            no liability for actions taken in reliance on standards information presented here.
          </p>
        </div>
      </section>

      {/* Per-standard currency registry */}
      <section aria-label="Standards registry">
        <h2 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">
          Referenced standards — currency register
        </h2>
        <p className="mb-5 text-sm text-[var(--color-text-secondary)]">
          The revision DURA treats as current for each standard family, the date it became
          effective, and the date DURA last verified it. Entries marked{" "}
          <span className="text-[var(--color-warning)]">revision in progress</span> have a newer
          edition known to be in development.
        </p>

        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] text-left">
                <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">Family</th>
                <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">
                  Current revision
                </th>
                <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">
                  Effective
                </th>
                <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">
                  Last verified
                </th>
              </tr>
            </thead>
            <tbody>
              {registry.map((entry) => (
                <tr
                  key={entry.family}
                  className="border-b border-[var(--color-border)] last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                    {entry.family}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    <span className="font-mono text-xs">{entry.current}</span>
                    {entry.inProgress && (
                      <span className="mt-1 block text-xs text-[var(--color-warning)]">
                        revision in progress: {entry.inProgress.targetRevision} (est.{" "}
                        {entry.inProgress.estimatedEffectiveFrom})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-[var(--color-text-muted)]">
                    {formatDate(entry.effectiveFrom)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-[var(--color-text-muted)]">
                    {formatDate(revisionVerifiedDate(entry))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs text-[var(--color-text-muted)]">
          Authors: the machine-checkable view of outdated and upcoming references lives at{" "}
          <Link
            href="/standards-watch"
            className="text-[var(--color-accent)] underline underline-offset-2 hover:opacity-80"
          >
            /standards-watch
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
