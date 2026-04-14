import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import matter from "gray-matter";
import { mdxComponents } from "@/components/lesson/MDXComponents";

interface HowToMeta {
  title: string;
  description: string;
  slug: string;
  difficulty: string;
  estimatedMinutes: number;
  steps: number;
  tags: string[];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

const HOWTO_FILES = [
  "01-dev-environment.mdx",
  "02-error-messages.mdx",
  "03-git-basics.mdx",
  "04-debugging.mdx",
  "05-deploying.mdx",
  "06-api-basics.mdx",
  "07-interview-prep.mdx",
  "08-reading-docs.mdx",
  "09-open-source.mdx",
  "10-portfolio.mdx",
];

async function getGuide(
  slug: string
): Promise<{ meta: HowToMeta; content: React.ReactElement } | null> {
  const dir = join(process.cwd(), "src/content/howto");

  try {
    for (const file of HOWTO_FILES) {
      const filePath = join(dir, file);
      if (!existsSync(filePath)) continue;

      const raw = readFileSync(filePath, "utf-8");
      const { data, content: mdxBody } = matter(raw);
      const frontmatter = data as HowToMeta;

      if (frontmatter.slug !== slug) continue;

      const { default: MDXContent } = await evaluate(mdxBody, {
        ...runtime,
        development: false,
      });

      const rendered = <MDXContent components={mdxComponents} />;
      return { meta: frontmatter, content: rendered };
    }
  } catch (error) {
    console.error(`[howto] Failed to load guide "${slug}":`, error);
  }

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) return { title: "Guide Not Found" };
  return { title: guide.meta.title, description: guide.meta.description };
}

export default async function HowToGuidePage({ params }: PageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const guide = await getGuide(slug);

  if (!guide) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            {guide.meta.difficulty}
          </span>
          <span className="text-sm text-[var(--color-text-muted)]">
            {guide.meta.estimatedMinutes} min · {guide.meta.steps} steps
          </span>
        </div>
        <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">
          {guide.meta.title}
        </h1>
        <p className="mt-2 text-[var(--color-text-secondary)]">{guide.meta.description}</p>
      </div>

      <article>{guide.content}</article>
    </div>
  );
}
