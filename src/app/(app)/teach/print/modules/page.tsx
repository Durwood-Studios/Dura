import type { Metadata } from "next";
import Link from "next/link";
import { listAllLessons } from "@/lib/curriculum";
import { PrintChrome } from "@/components/teacher/PrintChrome";

export const metadata: Metadata = {
  title: "Module workbooks — DURA",
  robots: { index: false, follow: false },
};

export default async function ModuleIndexPage(): Promise<React.ReactElement> {
  const tree = await listAllLessons();

  return (
    <main className="mx-auto max-w-[780px] px-8 py-10 text-[var(--color-text-primary)]">
      <PrintChrome />

      <header className="mb-10 border-b-2 border-neutral-900 pb-4">
        <p className="font-mono text-xs tracking-widest text-[var(--color-text-secondary)] uppercase">
          DURA · Module workbooks
        </p>
        <h1 className="mt-1 text-4xl font-semibold">Print-ready modules</h1>
        <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
          Open any module below to see its full lesson bodies rendered as a continuous document. Use
          your browser&apos;s print dialog (Cmd/Ctrl+P) to save as PDF.
        </p>
      </header>

      {tree.map((node) => (
        <section key={node.phase.id} className="mb-8 break-inside-avoid">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {node.phase.title}
          </h2>
          <ul className="mt-2 flex flex-col gap-1">
            {node.modules.map((modulePair) => {
              const authored = modulePair.lessons.length;
              const disabled = authored === 0;
              return (
                <li key={modulePair.module.id}>
                  {disabled ? (
                    <span className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                      {modulePair.module.title}
                      <span className="font-mono text-[10px]">(not yet authored)</span>
                    </span>
                  ) : (
                    <Link
                      href={`/teach/print/modules/${node.phase.id}/${modulePair.module.id}`}
                      className="inline-flex items-center gap-2 text-sm text-[var(--color-text-primary)] underline decoration-neutral-300 underline-offset-4 hover:decoration-emerald-500"
                      target="_blank"
                    >
                      {modulePair.module.title}
                      <span className="font-mono text-[10px] text-[var(--color-text-secondary)]">
                        · {authored} lessons
                      </span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </main>
  );
}
