import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { listAllLessonMeta, collectStandards } from "@/lib/curriculum";
import { ALL_QUESTIONS } from "@/content/questions";
import { DICTIONARY } from "@/content/dictionary";
import { ExportHubClient } from "@/components/teacher/ExportHubClient";

export const metadata: Metadata = {
  title: "Export — DURA",
  description:
    "Download DURA's curriculum, dictionary, quiz bank, and standards map. No login required.",
};

export default async function TeachExportPage(): Promise<React.ReactElement> {
  const [lessons, standards] = await Promise.all([listAllLessonMeta(), collectStandards()]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/teach"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-emerald-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Curriculum browser
      </Link>
      <header className="mb-8">
        <p className="font-mono text-xs tracking-widest text-[var(--color-text-muted)] uppercase">
          Teacher exports
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-[var(--color-text-primary)]">Resources</h1>
        <p className="mt-2 max-w-[640px] text-sm text-[var(--color-text-secondary)]">
          Every DURA resource is free to download, share, and adapt under the AGPLv3 license. No
          account, no paywall, no watermark.
        </p>
      </header>

      <ExportHubClient
        lessons={lessons}
        standards={standards}
        dictionaryCount={DICTIONARY.length}
        questionCount={ALL_QUESTIONS.length}
        authoredLessons={lessons.length}
      />
    </main>
  );
}
