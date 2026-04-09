import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { listAllLessons, collectStandards } from "@/lib/curriculum";
import { TOTAL_LESSONS } from "@/content/phases";
import { CurriculumBrowser } from "@/components/teacher/CurriculumBrowser";

export const metadata: Metadata = {
  title: "Teach — DURA",
  description:
    "Browse DURA's full curriculum, filter by standards, and export teacher resources. No login required.",
};

export default async function TeachPage(): Promise<React.ReactElement> {
  const [tree, standards] = await Promise.all([listAllLessons(), collectStandards()]);
  const totalAuthored = tree.reduce(
    (sum, node) => sum + node.modules.reduce((m, x) => m + x.lessons.length, 0),
    0
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs tracking-widest text-[var(--color-text-muted)] uppercase">
            Teacher dashboard
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-[var(--color-text-primary)]">
            Curriculum browser
          </h1>
          <p className="mt-2 max-w-[640px] text-sm text-[var(--color-text-secondary)]">
            Browse every phase, module, and lesson in DURA. Filter by standard, search by title,
            drill into a lesson to view frontmatter, and download teacher resources. No login
            required — the whole curriculum is public.
          </p>
        </div>
        <Link
          href="/teach/export"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          <Download className="h-4 w-4" />
          Export resources
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <CurriculumBrowser
        tree={tree}
        standards={standards}
        totalAuthored={totalAuthored}
        totalTarget={TOTAL_LESSONS}
      />
    </main>
  );
}
