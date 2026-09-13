import { scanStandards } from "@/lib/standards-watch/scan";
import { scanAuthoredCitations } from "@/lib/standards-watch/content-references";
import { STANDARDS_REGISTRY, REGISTRY_LAST_REVIEWED } from "@/lib/standards-watch/registry";

/**
 * Standards-watch — author-facing view of the current scan report.
 *
 * Server-component render. Shows:
 *  - The clean/dirty status of the typed-registry scan (zero outdated
 *    references is the CI gate; the panel surfaces it to authors before
 *    they hit the gate in PR).
 *  - Upcoming revisions — standards with an in-progress new edition that
 *    will eventually require a curriculum update.
 *  - The full 28-family revision registry, so authors can search for the
 *    canonical current revision of any standard cited in the curriculum.
 *
 * V1 has no client interactivity — per FM-1.0 the Client/Skeleton layers
 * are intentionally omitted.
 */
export function StandardsWatch(): React.ReactElement {
  const report = scanStandards();
  const authored = scanAuthoredCitations();
  const generated = new Date(report.generatedAt).toLocaleString();

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
          Standards-watch · author tooling
        </p>
        <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">
          Are we citing current revisions?
        </h1>
        <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
          Checks structured robotics/manufacturing references and scans every authored lesson, guide
          and assessment item for review candidates. Registry revisions were last reviewed{" "}
          {REGISTRY_LAST_REVIEWED}; this report does not independently verify publisher updates or
          standards conformance.
        </p>
      </header>

      <StatusBar
        clean={report.outdated.length === 0}
        totalReferences={report.totalReferences}
        upcomingCount={report.upcoming.length}
        generatedAt={generated}
      />

      <section className="space-y-3 rounded-xl border border-[var(--color-border)] p-5">
        <h2 className="font-semibold">Authored content review queue</h2>
        <p className="text-sm">
          {authored.documents} documents and questions scanned; {authored.findings.length} review
          candidates. Older-edition mentions may be historical or comparative. Untracked anchors may
          be valid sources whose editions this registry does not maintain. Neither is automatically
          an incorrect lesson.
        </p>
        <details>
          <summary className="cursor-pointer text-sm underline">
            Inspect all candidate locations
          </summary>
          <ul className="mt-3 max-h-[60dvh] space-y-3 overflow-y-auto break-words">
            {authored.findings.map((finding, i) => (
              <li
                key={`${finding.source}-${finding.ownerId}-${i}`}
                className="rounded-lg border border-[var(--color-border)] p-3 text-sm"
              >
                <p className="font-semibold">{finding.citedAs}</p>
                <p>
                  {finding.reason === "untracked-anchor"
                    ? "Edition not tracked"
                    : `Older-edition mention; registry points to ${finding.registryRevision}`}
                </p>
                <p className="mt-1 text-xs [overflow-wrap:anywhere]">
                  {finding.source} · {finding.ownerId}
                </p>
              </li>
            ))}
          </ul>
        </details>
      </section>

      {report.outdated.length > 0 && (
        <section className="rounded-xl border border-[var(--color-rating-again)]/30 bg-[var(--color-rating-again)]/5 p-5">
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
            Outdated references
          </h2>
          <ul className="flex flex-col gap-3">
            {report.outdated.map((ref, i) => (
              <li
                key={`${ref.source}-${ref.ownerId}-${i}`}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3"
              >
                <p className="text-sm text-[var(--color-text-primary)]">
                  <span className="font-mono text-xs text-[var(--color-text-muted)]">
                    {ref.source} · {ref.ownerId}
                  </span>{" "}
                  cites{" "}
                  <code className="rounded bg-[var(--color-bg-subtle)] px-1 py-0.5 text-xs">
                    {ref.citedAs}
                  </code>
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  Current revision: <strong>{ref.currentRevision}</strong> (family: {ref.family})
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.upcoming.length > 0 && (
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
            Upcoming revisions
          </h2>
          <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
            Standards with an in-progress new edition. A revision match does not establish content
            correctness. Confirm publication and applicability before changing a lesson.
          </p>
          <ul className="flex flex-col gap-3">
            {report.upcoming.map((entry, i) => (
              <li
                key={`upcoming-${i}`}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3"
              >
                <p className="text-sm text-[var(--color-text-primary)]">
                  <strong>{entry.currentRevision}</strong> → <strong>{entry.targetRevision}</strong>
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  Estimated effective: {entry.estimatedEffectiveFrom}
                  {entry.note ? ` · ${entry.note}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
          Registry · {STANDARDS_REGISTRY.length} families
        </h2>
        <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
          Maintained revision inventory, subject to its review dates. Add or update entries in
          src/lib/standards-watch/registry.ts when a standards body publishes a new revision; the
          scanner will then flag any lesson still citing the prior revision.
        </p>
        <ul className="flex flex-col divide-y divide-[var(--color-border)]">
          {STANDARDS_REGISTRY.map((entry) => (
            <li
              key={entry.family}
              className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-baseline sm:justify-between"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  {entry.family}
                </span>
                <span className="font-mono text-xs text-[var(--color-text-muted)]">
                  {entry.current}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
                <span>effective {entry.effectiveFrom}</span>
                {entry.inProgress && (
                  <span className="rounded-full border border-[var(--color-rating-hard)]/30 bg-[var(--color-rating-hard)]/10 px-2 py-0.5 text-[10px] text-[var(--color-rating-hard)]">
                    {entry.inProgress.targetRevision} in progress
                  </span>
                )}
                {entry.supersededRevisions.length > 0 && (
                  <span className="text-[10px]">supersedes {entry.supersededRevisions.length}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <footer className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
        <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
          Scope: structured references from the robotics/manufacturing registries; explicit primary
          anchors from all MDX content; known older-edition strings in MDX and scored banks. This
          literal scan cannot identify every free-text citation, decide contractual applicability,
          distinguish all historical uses, or validate a clause. Review the surrounding text and the
          publisher’s current material before editing. Untracked sources are surfaced rather than
          silently counted as current.
        </p>
      </footer>
    </main>
  );
}

function StatusBar({
  clean,
  totalReferences,
  upcomingCount,
  generatedAt,
}: {
  clean: boolean;
  totalReferences: number;
  upcomingCount: number;
  generatedAt: string;
}): React.ReactElement {
  const statusLabel = clean
    ? "No older editions in the typed registry scan"
    : "Typed registry references need review";
  const statusColor = clean ? "var(--color-accent-emerald)" : "var(--color-rating-again)";
  return (
    <section
      className="rounded-xl border p-5"
      style={{
        borderColor: clean
          ? "color-mix(in srgb, var(--color-accent-emerald) 30%, transparent)"
          : "color-mix(in srgb, var(--color-rating-again) 30%, transparent)",
        backgroundColor: clean
          ? "color-mix(in srgb, var(--color-accent-emerald) 5%, transparent)"
          : "color-mix(in srgb, var(--color-rating-again) 5%, transparent)",
      }}
    >
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <p className="text-sm font-semibold" style={{ color: statusColor }}>
          {statusLabel}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          {totalReferences} references scanned · {upcomingCount} upcoming
        </p>
      </div>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">Generated {generatedAt}</p>
    </section>
  );
}
