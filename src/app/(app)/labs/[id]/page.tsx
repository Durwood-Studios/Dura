import { readFile } from "node:fs/promises";
import { join } from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { PRACTICAL_LABS } from "@/lib/labs";
import { mdxComponents } from "@/components/lesson/MDXComponents";

export const dynamicParams = false;
export function generateStaticParams(): { id: string }[] {
  return PRACTICAL_LABS.map(({ id }) => ({ id }));
}
/** Compile only allowlisted repository guides; no user-supplied MDX is evaluated. */
export default async function LabPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactElement> {
  const { id } = await params;
  const lab = PRACTICAL_LABS.find((item) => item.id === id);
  if (!lab) notFound();
  const guide = await readFile(join(process.cwd(), "public", "labs", lab.id, "README.md"), "utf8");
  const { default: Content } = await evaluate(guide, { ...runtime, development: false });
  return (
    <main className="mx-auto max-w-3xl min-w-0 space-y-6 px-4 py-8 sm:px-6">
      <Link href="/labs" className="text-[var(--color-accent)] underline">
        ← All practical labs
      </Link>
      <div className="flex flex-wrap gap-3">
        <a
          href={`/labs/${lab.id}.zip`}
          download
          className="inline-flex min-h-12 items-center rounded-lg bg-[var(--color-accent)] px-4 py-2 font-medium text-[var(--color-bg-base)]"
        >
          Download project ZIP
        </a>
        <Link
          href={lab.lessonHref}
          className="inline-flex min-h-12 items-center text-[var(--color-accent)] underline"
        >
          Related lesson →
        </Link>
      </div>
      <p className="text-sm text-[var(--color-text-secondary)]">{lab.requirements}</p>
      <article className="min-w-0 break-words">
        <Content components={mdxComponents} />
      </article>
    </main>
  );
}
