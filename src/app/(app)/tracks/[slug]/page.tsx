import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Monitor,
  Server,
  Layers,
  Cloud,
  Brain,
  Shield,
  Database,
  TestTube,
  Activity,
  Smartphone,
  Users,
  Compass,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { buildMetadata } from "@/lib/og";
import { ROLES, getRoleBySlug, getRole } from "@/content/roles";
import { getSkill } from "@/content/skills";
import type { Role } from "@/types/career-track";

const ICON_MAP: Record<string, LucideIcon> = {
  Monitor,
  Server,
  Layers,
  Cloud,
  Brain,
  Shield,
  Database,
  TestTube,
  Activity,
  Smartphone,
  Users,
  Compass,
};

const DEMAND_STYLES: Record<string, { label: string; className: string }> = {
  high: { label: "High Demand", className: "bg-amber-500/10 text-amber-400" },
  "very-high": { label: "Very High Demand", className: "bg-emerald-500/10 text-emerald-400" },
  extreme: { label: "Extreme Demand", className: "bg-rose-500/10 text-rose-400" },
};

const LEVEL_LABELS: Record<string, { label: string; className: string }> = {
  entry: { label: "Entry", className: "bg-emerald-500/10 text-emerald-400" },
  professional: { label: "Professional", className: "bg-blue-500/10 text-blue-400" },
  expert: { label: "Expert", className: "bg-purple-500/10 text-purple-400" },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const role = getRoleBySlug(slug);
  if (!role) return {};
  return buildMetadata({
    title: `${role.title} Track`,
    description: role.tagline,
    path: `/tracks/${role.slug}`,
  });
}

export function generateStaticParams(): { slug: string }[] {
  return ROLES.map((r) => ({ slug: r.slug }));
}

function formatSalary(value: number): string {
  return `$${(value / 1000).toFixed(0)}k`;
}

function resolveSkillNames(ids: string[]): string[] {
  return ids.map((id) => {
    const skill = getSkill(id);
    return skill ? skill.name : id;
  });
}

export default async function RoleDetailPage({ params }: PageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const role = getRoleBySlug(slug);
  if (!role) notFound();

  const Icon = ICON_MAP[role.icon];
  const demand = DEMAND_STYLES[role.demandLevel];

  const leadsToRoles = role.leadsTo
    .map((id) => getRole(id))
    .filter((r): r is Role => r !== undefined);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Hero */}
      <section className="mb-12">
        <Link
          href="/tracks"
          className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-secondary)]"
        >
          <ArrowRight className="h-3.5 w-3.5 rotate-180" aria-hidden="true" />
          All tracks
        </Link>

        <div className="flex items-start gap-5">
          {Icon && (
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${role.color}15` }}
            >
              <Icon className="h-7 w-7" style={{ color: role.color }} aria-hidden="true" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">
              {role.title}
            </h1>
            <p className="mt-1 text-lg text-[var(--color-text-secondary)]">{role.tagline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {demand && (
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${demand.className}`}>
                  {demand.label}
                </span>
              )}
              <span className="text-sm text-[var(--color-text-muted)]">
                {formatSalary(role.salaryRange.low)} – {formatSalary(role.salaryRange.high)}{" "}
                {role.salaryRange.currency} ({role.salaryRange.source}, {role.salaryRange.year})
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="mb-12 max-w-[720px]">
        <h2 className="mb-3 text-xl font-semibold text-[var(--color-text-primary)]">Overview</h2>
        <p className="mb-6 leading-[1.8] text-[var(--color-text-secondary)]">{role.description}</p>
        <p
          className="leading-[1.8] text-[var(--color-text-secondary)] italic"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          &ldquo;{role.dayInTheLife}&rdquo;
        </p>
      </section>

      {/* Skills at each level */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-text-primary)]">
          Skills by level
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {(["junior", "mid", "senior"] as const).map((level) => {
            const skillNames = resolveSkillNames(role.levels[level].required);
            return (
              <div key={level} className="dura-card p-5">
                <h3 className="mb-3 text-sm font-semibold tracking-wider text-[var(--color-text-muted)] uppercase">
                  {level === "mid" ? "Mid-Level" : level.charAt(0).toUpperCase() + level.slice(1)}
                </h3>
                <ul className="space-y-1.5">
                  {skillNames.map((name) => (
                    <li key={name} className="text-sm text-[var(--color-text-secondary)]">
                      {name}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                  {role.levels[level].required.length} required
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Portfolio */}
      {role.portfolio.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-2 text-xl font-semibold text-[var(--color-text-primary)]">
            Portfolio projects
          </h2>
          <p className="mb-4 text-[var(--color-text-secondary)]">
            When you complete this track, you&apos;ll have built:
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {role.portfolio.map((project) => (
              <div key={project.tutorialSlug} className="dura-card p-5">
                <h3 className="font-medium text-[var(--color-text-primary)]">{project.title}</h3>
                <span
                  className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: `${role.color}15`, color: role.color }}
                >
                  {project.skill}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Standards */}
      {role.standards.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-[var(--color-text-primary)]">Standards</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {role.standards.map((standard) => (
              <a
                key={standard.name}
                href={standard.url}
                target="_blank"
                rel="noopener noreferrer"
                className="dura-card flex items-start gap-3 p-5 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-[var(--color-text-primary)]">{standard.name}</h3>
                  <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{standard.body}</p>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    {standard.description}
                  </p>
                </div>
                <ExternalLink
                  className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]"
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {role.certifications.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-[var(--color-text-primary)]">
            Certifications
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {role.certifications.map((cert) => {
              const levelStyle = LEVEL_LABELS[cert.level];
              return (
                <a
                  key={cert.name}
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dura-card flex items-start gap-3 p-5 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-[var(--color-text-primary)]">{cert.name}</h3>
                    <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{cert.issuer}</p>
                    {levelStyle && (
                      <span
                        className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${levelStyle.className}`}
                      >
                        {levelStyle.label}
                      </span>
                    )}
                  </div>
                  <ExternalLink
                    className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]"
                    aria-hidden="true"
                  />
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Next steps */}
      {leadsToRoles.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-2 text-xl font-semibold text-[var(--color-text-primary)]">
            Where this leads
          </h2>
          <p className="mb-4 text-[var(--color-text-secondary)]">
            Roles you can grow into from here.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {leadsToRoles.map((next) => {
              const NextIcon = ICON_MAP[next.icon];
              return (
                <Link
                  key={next.id}
                  href={`/tracks/${next.slug}`}
                  className="dura-card group flex items-center gap-4 p-5 transition-colors"
                  style={{ borderLeft: `4px solid ${next.color}` }}
                >
                  {NextIcon && (
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${next.color}15` }}
                    >
                      <NextIcon
                        className="h-5 w-5"
                        style={{ color: next.color }}
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-[var(--color-text-primary)] transition-colors group-hover:text-emerald-400">
                      {next.title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)]">{next.tagline}</p>
                  </div>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-colors group-hover:text-emerald-400"
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
