import Link from "next/link";
import type { Metadata } from "next";
import { PRACTICAL_LABS } from "@/lib/labs";
export const metadata: Metadata = {
  title: "Practical labs · Dura",
  description: "Download source, fixtures and reproducible capstone projects.",
};
/** Practical work with explicit tools and evidence requirements. */
export default function LabsPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">Practical labs</h1>
        <p className="text-[var(--color-text-secondary)]">
          Download a complete project, reproduce its checks, then extend it with evidence you can
          explain. Each guide distinguishes local test results from hardware or simulator work you
          still need to perform.
        </p>
        <Link href="/judgment" className="text-[var(--color-accent)] underline">
          Practice the engineering decisions behind the implementation →
        </Link>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {PRACTICAL_LABS.map((lab) => (
          <article
            key={lab.id}
            className="min-w-0 space-y-3 rounded-xl border border-[var(--color-border)] p-5"
          >
            <h2 className="text-xl font-semibold">
              <Link href={`/labs/${lab.id}`} className="text-[var(--color-accent)] underline">
                {lab.title}
              </Link>
            </h2>
            <p>{lab.description}</p>
            <p className="text-sm text-[var(--color-text-secondary)]">{lab.requirements}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
