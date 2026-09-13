import Link from "next/link";
import { getPhase } from "@/content/phases";
import { PRACTICAL_LABS } from "@/lib/labs";
import { getRoleBySlug } from "@/content/roles";
import { estimatedPathHours, spinePhaseCount } from "@/lib/paths";
import type { Path, PathPhaseRef, PathStatus } from "@/lib/paths/types";

/**
 * Path detail page — full reading of a single Path.
 *
 * Server component. Renders the path header (title + outcome +
 * status + hour estimate), the spine sequence (numbered phase
 * references with their rationale), and the elective list.
 *
 * FM-1.0: design tokens only; per-path accent color comes from
 * Path.color.
 */
export function PathDetail({ path }: { path: Path }): React.ReactElement {
  const spine = path.phases.filter((p) => p.scope === "spine");
  const electives = path.phases.filter((p) => p.scope === "elective");
  const hours = estimatedPathHours(path);
  const phaseCount = spinePhaseCount(path);
  const roleLinks = [
    ...path.destinationRoleSlugs.map((slug) => ({ slug, label: "Career-track destination" })),
    ...path.relatedRoleSlugs.map((slug) => ({ slug, label: "Related career — different outcome" })),
  ].flatMap(({ slug, label }) => {
    const role = getRoleBySlug(slug);
    return role ? [{ role, label }] : [];
  });

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-12">
      <Link
        href="/paths"
        className="self-start text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
      >
        ← All paths
      </Link>

      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            aria-hidden
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: path.color }}
          />
          <p className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
            {path.archetype} path
          </p>
          <StatusBadge status={path.status} />
        </div>
        <h1 className="text-4xl font-semibold text-[var(--color-text-primary)]">{path.title}</h1>
        <p className="text-lg text-[var(--color-text-secondary)]">{path.tagline}</p>
        <p className="max-w-3xl text-base leading-relaxed text-[var(--color-text-secondary)]">
          {path.description}
        </p>
      </header>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <h2 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
          What you&apos;ll be able to do
        </h2>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{path.outcome}</p>
      </section>

      <section className="space-y-3 rounded-xl border border-[var(--color-border)] p-5">
        <h2 className="text-lg font-semibold">Practice and portfolio evidence</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Available curriculum means the lessons can be studied. Demonstrating the path outcome also
          requires applied work, review and any stated external tools.
        </p>
        <Link href="/judgment" className="block text-[var(--color-accent)] underline">
          Practice engineering judgment →
        </Link>
        {PRACTICAL_LABS.filter((lab) => lab.pathIds.includes(path.id)).map((lab) => (
          <Link
            key={lab.id}
            href={`/labs/${lab.id}`}
            className="block text-[var(--color-accent)] underline"
          >
            {lab.title} →
          </Link>
        ))}
      </section>

      {roleLinks.map(({ role, label }) => (
        <Link
          key={role.slug}
          href={`/tracks/${role.slug}`}
          className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 transition hover:border-[var(--color-accent)]"
        >
          <div>
            <p className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
              {label}
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)]">
              {role.title} →
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              Junior / mid / senior skill matrix, salary range, market demand.
            </p>
          </div>
        </Link>
      ))}

      <section className="flex flex-col gap-4">
        <header className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-wide text-[var(--color-text-secondary)] uppercase">
            Spine sequence
          </h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            {phaseCount} phases · ~{hours} hours
          </p>
        </header>
        <ol className="flex flex-col gap-3">
          {spine.map((ref, i) => (
            <PhaseRefRow key={ref.phaseId} ref_={ref} index={i + 1} accent={path.color} />
          ))}
        </ol>
      </section>

      {electives.length > 0 && (
        <section className="flex flex-col gap-4">
          <header className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold tracking-wide text-[var(--color-text-secondary)] uppercase">
              Recommended electives
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Not required, but deepen the path.
            </p>
          </header>
          <ul className="flex flex-col gap-3">
            {electives.map((ref) => (
              <PhaseRefRow key={ref.phaseId} ref_={ref} elective accent={path.color} />
            ))}
          </ul>
        </section>
      )}

      {path.status === "preview" && (
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5 text-sm text-[var(--color-text-secondary)]">
          <strong className="text-[var(--color-text-primary)]">Coming soon:</strong> One or more
          phases on this path are still under development. The path is a forward-looking promise —
          use it to plan, but expect the dependency phases to ship over coming releases.
        </section>
      )}
    </main>
  );
}

function PhaseRefRow({
  ref_,
  index,
  elective,
  accent,
}: {
  ref_: PathPhaseRef;
  index?: number;
  elective?: boolean;
  accent: string;
}): React.ReactElement {
  const phase = getPhase(ref_.phaseId);
  // Render with whatever the registry provides; if the phase doesn't
  // exist yet (preview path), show a forward-looking placeholder.
  if (!phase) {
    return (
      <li className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-mono text-xs text-[var(--color-text-muted)]">
            Phase {ref_.phaseId.toUpperCase()}
          </span>
          <span className="rounded-full bg-[var(--color-bg-surface)] px-2 py-0.5 text-[10px] font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
            In development
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{ref_.rationale}</p>
      </li>
    );
  }
  return (
    <li className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex min-w-0 items-baseline gap-3">
          {!elective && index !== undefined && (
            <span aria-hidden className="font-mono text-xs font-medium" style={{ color: accent }}>
              {String(index).padStart(2, "0")}
            </span>
          )}
          <Link
            href={`/paths/${phase.id}`}
            className="text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
          >
            {phase.title}
          </Link>
        </div>
        <p className="font-mono text-xs whitespace-nowrap text-[var(--color-text-muted)]">
          ~{ref_.moduleIds ? scopedHours(phase, ref_.moduleIds) : phase.estimatedHours}h
        </p>
      </div>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{ref_.rationale}</p>
      {ref_.moduleIds && (
        <p className="mt-2 font-mono text-xs text-[var(--color-text-muted)]">
          Modules: {ref_.moduleIds.join(", ")}
        </p>
      )}
    </li>
  );
}

function scopedHours(
  phase: ReturnType<typeof getPhase> & object,
  moduleIds: readonly string[]
): number {
  let total = 0;
  for (const id of moduleIds) {
    const m = phase.modules.find((m) => m.id === id);
    if (m) total += m.estimatedHours;
  }
  return total;
}

function StatusBadge({ status }: { status: PathStatus }): React.ReactElement {
  const config: Record<PathStatus, { label: string; color: string }> = {
    complete: {
      label: "Curriculum available",
      color: "var(--color-accent-emerald)",
    },
    scaffold: {
      label: "In Progress",
      color: "var(--color-text-muted)",
    },
    preview: {
      label: "Preview",
      color: "var(--color-text-muted)",
    },
  };
  const { label, color } = config[status];
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase"
      style={{
        color,
        backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
        borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
        borderWidth: 1,
        borderStyle: "solid",
      }}
    >
      {label}
    </span>
  );
}
