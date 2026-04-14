import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How-To Guides",
  description:
    "Practical, step-by-step guides with interactive checkpoints for developers at every level.",
};

const GUIDES = [
  {
    slug: "dev-environment",
    title: "How to Set Up Your Dev Environment",
    description: "Install and configure everything you need to start coding.",
    difficulty: "beginner",
    minutes: 25,
  },
  {
    slug: "error-messages",
    title: "How to Read Error Messages",
    description: "Turn cryptic stack traces into actionable fixes.",
    difficulty: "beginner",
    minutes: 20,
  },
  {
    slug: "git-basics",
    title: "How to Use Git for Real Projects",
    description: "Commit, branch, merge, and push — the essential workflow.",
    difficulty: "beginner",
    minutes: 30,
  },
  {
    slug: "debugging",
    title: "How to Debug Like a Pro",
    description: "From console.log to breakpoints to rubber duck debugging.",
    difficulty: "intermediate",
    minutes: 25,
  },
  {
    slug: "deploying",
    title: "How to Deploy Your First Project",
    description: "Get your code live on the internet with Vercel.",
    difficulty: "intermediate",
    minutes: 25,
  },
  {
    slug: "api-basics",
    title: "How to Build and Consume APIs",
    description: "REST APIs, fetch, validation, and error handling.",
    difficulty: "intermediate",
    minutes: 30,
  },
  {
    slug: "interview-prep",
    title: "How to Prepare for Technical Interviews",
    description: "Data structures, system design, and behavioral questions.",
    difficulty: "intermediate",
    minutes: 30,
  },
  {
    slug: "reading-docs",
    title: "How to Read Documentation Effectively",
    description: "Find what you need fast and understand it the first time.",
    difficulty: "beginner",
    minutes: 20,
  },
  {
    slug: "open-source",
    title: "How to Contribute to Open Source",
    description: "From finding a project to submitting a PR that gets merged.",
    difficulty: "intermediate",
    minutes: 25,
  },
  {
    slug: "portfolio",
    title: "How to Build a Developer Portfolio",
    description: "Create a portfolio that gets you interviews.",
    difficulty: "intermediate",
    minutes: 25,
  },
] as const;

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-rose-100 text-rose-700",
};

export default function HowToPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-3xl font-semibold text-[var(--color-text-primary)]">
        How-To Guides
      </h1>
      <p className="mb-8 text-[var(--color-text-secondary)]">
        Practical, step-by-step guides with interactive checkpoints. Complete them at your own pace.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {GUIDES.map((guide, i) => (
          <Link
            key={guide.slug}
            href={`/howto/${guide.slug}`}
            className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 transition hover:border-emerald-300 hover:shadow-sm"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--color-text-muted)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_COLORS[guide.difficulty]}`}
              >
                {guide.difficulty}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">{guide.minutes} min</span>
            </div>
            <h2 className="mb-1 text-lg font-semibold text-[var(--color-text-primary)] group-hover:text-emerald-700">
              {guide.title}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">{guide.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
