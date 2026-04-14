import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import matter from "gray-matter";
import { mdxComponents } from "@/components/lesson/MDXComponents";

interface TutorialMeta {
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

const TUTORIAL_FILES = [
  "01-cli-tool.mdx",
  "02-rest-api.mdx",
  "03-react-dashboard.mdx",
  "04-rag-chatbot.mdx",
  "05-portfolio-site.mdx",
];

async function getTutorial(
  slug: string
): Promise<{ meta: TutorialMeta; content: React.ReactElement } | null> {
  const dir = join(process.cwd(), "src/content/tutorials");

  try {
    for (const file of TUTORIAL_FILES) {
      const filePath = join(dir, file);
      if (!existsSync(filePath)) continue;

      const raw = readFileSync(filePath, "utf-8");
      const { data, content: mdxBody } = matter(raw);
      const frontmatter = data as TutorialMeta;

      if (frontmatter.slug !== slug) continue;

      const { default: MDXContent } = await evaluate(mdxBody, {
        ...runtime,
        development: false,
      });

      const rendered = <MDXContent components={mdxComponents} />;
      return { meta: frontmatter, content: rendered };
    }
  } catch (error) {
    console.error(`[tutorials] Failed to load tutorial "${slug}":`, error);
  }

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tutorial = await getTutorial(slug);
  if (!tutorial) return { title: "Tutorial Not Found" };
  return { title: tutorial.meta.title, description: tutorial.meta.description };
}

export default async function TutorialPage({ params }: PageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const tutorial = await getTutorial(slug);

  if (!tutorial) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            {tutorial.meta.difficulty}
          </span>
          <span className="text-sm text-neutral-400">
            {tutorial.meta.estimatedMinutes} min · {tutorial.meta.steps} steps
          </span>
        </div>
        <h1 className="text-3xl font-semibold text-neutral-900">{tutorial.meta.title}</h1>
        <p className="mt-2 text-neutral-500">{tutorial.meta.description}</p>
      </div>

      <article>{tutorial.content}</article>
    </div>
  );
}
