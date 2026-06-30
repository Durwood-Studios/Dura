import fs from "fs";
import path from "path";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "What's New — DURA" };

interface ChangelogRelease {
  version: string;
  date: string | null;
  categories: Record<string, string[]>;
}

/** Parse a Keep-a-Changelog formatted markdown file into structured releases. */
function parseChangelog(raw: string): ChangelogRelease[] {
  const releases: ChangelogRelease[] = [];
  // Split on version headers — ## [x.x.x] or ## [Unreleased]
  const blocks = raw.split(/\n## /);
  for (const block of blocks.slice(1)) {
    // skip preamble before first ##
    const lines = block.split("\n");
    const header = lines[0]; // e.g. "[0.1.0] - 2026-06-18" or "[Unreleased]"
    const versionMatch = header.match(/\[([^\]]+)\](?:\s*-\s*(.+))?/);
    if (!versionMatch) continue;
    const version = versionMatch[1];
    const date = versionMatch[2]?.trim() ?? null;
    const body = lines.slice(1).join("\n");
    // Parse categories within the block (### Added, ### Changed, ### Fixed, etc.)
    const categories: Record<string, string[]> = {};
    const catBlocks = body.split(/\n### /);
    for (const catBlock of catBlocks.slice(1)) {
      const catLines = catBlock.split("\n");
      const catName = catLines[0].trim();
      const items = catLines
        .slice(1)
        .filter((l) => l.startsWith("- "))
        .map((l) => l.slice(2).trim());
      if (items.length > 0) categories[catName] = items;
    }
    releases.push({ version, date, categories });
  }
  return releases;
}

const CATEGORY_STYLES: Record<string, { badge: string; dot: string }> = {
  Added: {
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  Fixed: {
    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20",
    dot: "bg-blue-500",
  },
  Changed: {
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
    dot: "bg-amber-500",
  },
  Removed: {
    badge: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20",
    dot: "bg-rose-500",
  },
  Deprecated: {
    badge: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20",
    dot: "bg-orange-500",
  },
  Security: {
    badge: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20",
    dot: "bg-purple-500",
  },
};

const DEFAULT_CATEGORY_STYLE = {
  badge:
    "bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]",
  dot: "bg-[var(--color-text-muted)]",
};

function getCategoryStyle(cat: string): { badge: string; dot: string } {
  return CATEGORY_STYLES[cat] ?? DEFAULT_CATEGORY_STYLE;
}

export default function ChangelogPage(): React.ReactElement {
  const raw = fs.readFileSync(path.join(process.cwd(), "CHANGELOG.md"), "utf-8");
  const releases = parseChangelog(raw);

  // Only show Unreleased if it actually has entries
  const visibleReleases = releases.filter(
    (r) => r.version !== "Unreleased" || Object.keys(r.categories).length > 0
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/settings"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)]"
        >
          <span aria-hidden="true">←</span>
          Settings
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--color-text-primary)]">
          What&apos;s New
        </h1>
        <p className="mt-1 text-[var(--color-text-secondary)]">
          A full history of DURA releases and changes.
        </p>
      </div>

      {/* Release cards */}
      <div className="flex flex-col gap-6">
        {visibleReleases.map((release) => (
          <article
            key={release.version}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6"
          >
            {/* Release header */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[var(--color-accent)]/10 px-3 py-1 text-sm font-semibold text-[var(--color-accent)]">
                {release.version === "Unreleased" ? "Unreleased" : `v${release.version}`}
              </span>
              {release.date && (
                <time
                  dateTime={release.date}
                  className="text-sm text-[var(--color-text-secondary)]"
                >
                  {release.date}
                </time>
              )}
            </div>

            {/* Categories */}
            <div className="flex flex-col gap-5">
              {Object.entries(release.categories).map(([cat, items]) => {
                const style = getCategoryStyle(cat);
                return (
                  <div key={cat}>
                    <span
                      className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.badge}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                        aria-hidden="true"
                      />
                      {cat}
                    </span>
                    <ul className="flex flex-col gap-1.5 pl-1">
                      {items.map((item, i) => (
                        <li
                          // Items are static content from CHANGELOG.md — index is stable
                          key={i}
                          className="flex items-start gap-2 text-sm text-[var(--color-text-primary)]"
                        >
                          <span
                            className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--color-text-muted)]"
                            aria-hidden="true"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-[var(--color-text-muted)]">
        Full history on{" "}
        <a
          href="https://github.com/Durwood-studios/Dura/blob/main/CHANGELOG.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-accent)] hover:underline"
        >
          GitHub
        </a>
      </p>
    </main>
  );
}
