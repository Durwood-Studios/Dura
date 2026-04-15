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
  "06-algorithm-visualizer.mdx",
  "07-markdown-notes.mdx",
  "08-finance-tracker.mdx",
  "09-task-board.mdx",
  "10-chat-app.mdx",
  "11-auth-system.mdx",
  "12-docker-deploy.mdx",
  "13-test-suite.mdx",
  "14-ci-cd-pipeline.mdx",
  "15-accessible-components.mdx",
  "16-data-dashboard.mdx",
  "17-ai-agent.mdx",
  "18-mcp-server-tutorial.mdx",
  "19-url-shortener.mdx",
  "20-tiny-compiler.mdx",
  "21-first-website.mdx",
  "22-form-wizard.mdx",
  "23-ecommerce-checkout.mdx",
  "24-graphql-api.mdx",
  "25-browser-game.mdx",
  "26-fine-tuning.mdx",
  "27-key-value-store.mdx",
  "28-http-server.mdx",
  "29-job-tracker.mdx",
  "30-npm-package.mdx",
  "31-monitoring-dashboard.mdx",
  "32-embeddings-search.mdx",
  "33-rate-limiter.mdx",
  "34-design-system.mdx",
  "35-multiplayer-game.mdx",
  "36-ai-code-reviewer.mdx",
  "37-cron-scheduler.mdx",
  "38-rbac-system.mdx",
  "39-static-site-gen.mdx",
  "40-migration-tool.mdx",
  "41-secrets-manager.mdx",
  "42-sprint-tracker.mdx",
  "43-load-balancer.mdx",
  "44-pwa-push.mdx",
  "45-etl-pipeline.mdx",
  "46-resume-builder.mdx",
  "47-streaming-processor.mdx",
  "48-feature-flags.mdx",
  "49-incident-timeline.mdx",
  "50-cli-dashboard.mdx",
  "51-blog-engine.mdx",
  "52-webscraper.mdx",
  "53-api-gateway.mdx",
  "54-image-optimizer.mdx",
  "55-task-queue.mdx",
  "56-markdown-editor.mdx",
  "57-oauth-provider.mdx",
  "58-dependency-graph.mdx",
  "59-email-service.mdx",
  "60-log-aggregator.mdx",
  "61-notification-system.mdx",
  "62-file-uploader.mdx",
  "63-search-engine.mdx",
  "64-state-machine.mdx",
  "65-cms-headless.mdx",
  "66-diff-tool.mdx",
  "67-analytics-dashboard.mdx",
  "68-plugin-system.mdx",
  "69-regex-tester.mdx",
  "70-color-palette.mdx",
  "71-chat-bot-framework.mdx",
  "72-api-testing-framework.mdx",
  "73-code-formatter.mdx",
  "74-link-shortener-cli.mdx",
  "75-json-schema-validator.mdx",
  "76-kanban-api.mdx",
  "77-screenshot-service.mdx",
  "78-git-hooks-toolkit.mdx",
  "79-pdf-generator.mdx",
  "80-mock-api-server.mdx",
  "81-type-checker.mdx",
  "82-event-sourcing.mdx",
  "83-a-b-testing.mdx",
  "84-documentation-site.mdx",
  "85-webhook-relay.mdx",
  "86-autocomplete.mdx",
  "87-orm-from-scratch.mdx",
  "88-url-health-checker.mdx",
  "89-data-faker.mdx",
  "90-saas-starter.mdx",
  "91-password-manager.mdx",
  "92-kanban-mobile.mdx",
  "93-git-visualizer.mdx",
  "94-chaos-engineering.mdx",
  "95-css-framework.mdx",
  "96-code-playground.mdx",
  "97-inventory-system.mdx",
  "98-time-tracker.mdx",
  "99-kubernetes-deployer.mdx",
  "100-capstone-platform.mdx",
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
          <span className="text-sm text-[var(--color-text-muted)]">
            {tutorial.meta.estimatedMinutes} min · {tutorial.meta.steps} steps
          </span>
        </div>
        <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">
          {tutorial.meta.title}
        </h1>
        <p className="mt-2 text-[var(--color-text-secondary)]">{tutorial.meta.description}</p>
      </div>

      <article>{tutorial.content}</article>
    </div>
  );
}
