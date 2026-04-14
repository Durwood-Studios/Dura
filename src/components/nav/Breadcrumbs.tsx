"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

/** Generate a human-readable label for a URL segment. */
function toLabel(segment: string, index: number, segments: string[]): string {
  // Inside /paths routes, improve labels
  if (segments[0] === "paths") {
    // /paths/[phaseId] — show "Phase N"
    if (index === 1 && /^\d+$/.test(segment)) return `Phase ${segment}`;
    // /paths/[phaseId]/[moduleId] — show "Module N-M"
    if (index === 2 && /^\d+-\d+/.test(segment)) return `Module ${segment}`;
    // /paths/[phaseId]/[moduleId]/[lessonId] — show "Lesson NN"
    if (index === 3 && /^\d+$/.test(segment)) return `Lesson ${segment}`;
  }

  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Breadcrumbs(): React.ReactElement | null {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => ({
    label: toLabel(seg, i, segments),
    href: "/" + segments.slice(0, i + 1).join("/"),
  }));

  return (
    <nav aria-label="Breadcrumb" className="px-6 py-3 text-sm text-[var(--color-text-secondary)]">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link href="/dashboard" className="hover:text-[var(--color-text-primary)]">
            Home
          </Link>
        </li>
        {crumbs.map((crumb, i) => (
          <li key={crumb.href} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-[var(--color-text-muted)]" aria-hidden />
            {i === crumbs.length - 1 ? (
              <span className="text-[var(--color-text-primary)]">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-[var(--color-text-primary)]">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
