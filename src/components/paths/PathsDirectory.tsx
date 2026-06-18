import Link from "next/link";
import { PATH_ARCHETYPES, type Path, type PathStatus } from "@/lib/paths/types";
import { estimatedPathHours, PATHS, spinePhaseCount } from "@/lib/paths";

/**
 * Paths directory — top-level discovery surface.
 *
 * Server component. Lists every registered Path grouped by archetype
 * (Web, Backend, Systems, AI/ML, Robotics, Manufacturing, Embedded,
 * Leadership). Each card shows the path's tagline, spine phase count,
 * estimated hours, and build status badge.
 *
 * FM-1.0: design tokens only, no inline color values for product
 * chrome; the per-path accent color comes from the Path entry itself.
 */
export function PathsDirectory(): React.ReactElement {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-3">
        <p className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
          Curriculum · Paths
        </p>
        <h1 className="text-4xl font-semibold text-[var(--color-text-primary)]">
          What kind of engineer do you want to be?
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-[var(--color-text-secondary)]">
          A Path is a named outcome — Full-Stack, Backend, ML, Robotics, Embedded — that resolves to
          a sequence of phases. Pick the outcome; the platform sequences the curriculum. Phases
          remain independently navigable; Paths just give you a curated route through them.
        </p>
      </header>

      {PATH_ARCHETYPES.map((archetype) => {
        const paths = PATHS.filter((p) => p.archetype === archetype);
        if (paths.length === 0) return null;
        return (
          <section key={archetype} className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold tracking-wide text-[var(--color-text-secondary)] uppercase">
              {archetype}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {paths.map((path) => (
                <PathCard key={path.id} path={path} />
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}

function PathCard({ path }: { path: Path }): React.ReactElement {
  const hours = estimatedPathHours(path);
  const phaseCount = spinePhaseCount(path);
  return (
    <li>
      <Link
        href={`/paths/p/${path.slug}`}
        className="group block rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 transition hover:border-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: path.color }}
            />
            <h3 className="text-base font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)]">
              {path.title}
            </h3>
          </div>
          <StatusBadge status={path.status} />
        </div>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{path.tagline}</p>
        <div className="mt-4 flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
          <span>
            <strong className="text-[var(--color-text-secondary)]">{phaseCount}</strong> phases
          </span>
          <span>
            <strong className="text-[var(--color-text-secondary)]">~{hours}h</strong> estimated
          </span>
        </div>
      </Link>
    </li>
  );
}

function StatusBadge({ status }: { status: PathStatus }): React.ReactElement {
  const config: Record<PathStatus, { label: string; color: string }> = {
    complete: {
      label: "Complete",
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
      className="rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase"
      style={{
        color,
        backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
        borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
      }}
    >
      {label}
    </span>
  );
}
