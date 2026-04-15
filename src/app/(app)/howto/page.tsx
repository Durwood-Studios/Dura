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
  {
    slug: "css-responsive",
    title: "How to Write CSS That Actually Works on Every Screen",
    description: "Mobile-first responsive design with media queries, flexbox, and grid.",
    difficulty: "beginner",
    minutes: 20,
  },
  {
    slug: "terminal-advanced",
    title: "How to Use the Terminal Beyond the Basics",
    description: "Pipes, redirects, grep, find, env vars, aliases, and shell scripts.",
    difficulty: "beginner",
    minutes: 20,
  },
  {
    slug: "accessibility",
    title: "How to Make a Website Accessible",
    description: "Semantic HTML, ARIA, keyboard nav, contrast, and screen reader testing.",
    difficulty: "beginner",
    minutes: 25,
  },
  {
    slug: "typescript-thinking",
    title: "How to Think in TypeScript",
    description: "Interfaces, generics, union types, and the mental shift from JavaScript.",
    difficulty: "beginner",
    minutes: 25,
  },
  {
    slug: "sql-first-queries",
    title: "How to Write Your First SQL Queries",
    description: "SELECT, INSERT, JOIN, GROUP BY — thinking in sets instead of loops.",
    difficulty: "beginner",
    minutes: 20,
  },
  {
    slug: "devtools",
    title: "How to Use Browser DevTools Like a Senior Engineer",
    description: "Elements, console, network, performance — the 20% that solves 80%.",
    difficulty: "beginner",
    minutes: 20,
  },
  {
    slug: "json",
    title: "How to Read and Write JSON",
    description: "Structure, parsing, serialization, and common pitfalls.",
    difficulty: "beginner",
    minutes: 15,
  },
  {
    slug: "commit-messages",
    title: "How to Write Meaningful Commit Messages",
    description: "Conventional commits, atomic changes, and writing for your future self.",
    difficulty: "beginner",
    minutes: 15,
  },
  {
    slug: "react-state",
    title: "How to Manage State in React Without Going Insane",
    description: "useState vs useReducer vs context vs Zustand — a decision tree.",
    difficulty: "intermediate",
    minutes: 25,
  },
  {
    slug: "ci-cd",
    title: "How to Build a CI/CD Pipeline from Scratch",
    description: "GitHub Actions for lint, typecheck, test, build, and deploy.",
    difficulty: "intermediate",
    minutes: 30,
  },
  {
    slug: "prompt-engineering",
    title: "How to Prompt Engineer for Real Applications",
    description: "System prompts, few-shot, chain-of-thought, and evaluation.",
    difficulty: "intermediate",
    minutes: 25,
  },
  {
    slug: "error-handling",
    title: "How to Handle Errors Without Swallowing Them",
    description: "Error boundaries, try/catch patterns, custom errors, and logging.",
    difficulty: "intermediate",
    minutes: 20,
  },
  {
    slug: "monitoring",
    title: "How to Set Up Monitoring for Your App",
    description: "Metrics, logs, traces, alerting, and structured logging.",
    difficulty: "intermediate",
    minutes: 25,
  },
  {
    slug: "code-review",
    title: "How to Do Code Review That Actually Helps",
    description: "What to look for, actionable feedback, and review checklists.",
    difficulty: "intermediate",
    minutes: 20,
  },
  {
    slug: "api-design",
    title: "How to Design a REST API That Developers Love",
    description: "URL design, HTTP methods, status codes, pagination, and error responses.",
    difficulty: "intermediate",
    minutes: 25,
  },
  {
    slug: "testing",
    title: "How to Write Tests That Actually Catch Bugs",
    description: "Unit tests, integration tests, TDD, mocking, and the testing pyramid.",
    difficulty: "intermediate",
    minutes: 30,
  },
  {
    slug: "database-schema",
    title: "How to Design a Database Schema",
    description: "Entity relationships, normalization, and turning requirements into tables.",
    difficulty: "intermediate",
    minutes: 25,
  },
  {
    slug: "docker",
    title: "How to Containerize Any Application with Docker",
    description: "Dockerfile anatomy, multi-stage builds, and Docker Compose.",
    difficulty: "intermediate",
    minutes: 25,
  },
  {
    slug: "security",
    title: "How to Secure a Web Application",
    description: "OWASP Top 10 in practice — XSS, CSRF, injection, auth, and headers.",
    difficulty: "intermediate",
    minutes: 30,
  },
  {
    slug: "performance",
    title: "How to Optimize Website Performance",
    description: "Core Web Vitals, lazy loading, code splitting, and caching strategies.",
    difficulty: "intermediate",
    minutes: 25,
  },
  {
    slug: "system-design",
    title: "How to Think About System Design",
    description: "Estimation, requirements, components, and tradeoff analysis.",
    difficulty: "advanced",
    minutes: 30,
  },
  {
    slug: "mcp-server",
    title: "How to Build an MCP Server",
    description: "Model Context Protocol — tool definitions, resources, and security.",
    difficulty: "advanced",
    minutes: 30,
  },
  {
    slug: "ai-evaluation",
    title: "How to Evaluate AI Output at Scale",
    description: "Automated metrics, human evaluation, A/B testing, and RAGAS.",
    difficulty: "advanced",
    minutes: 25,
  },
  {
    slug: "adr",
    title: "How to Write an Architecture Decision Record",
    description: "ADR format, capturing context, and managing a decision log.",
    difficulty: "advanced",
    minutes: 20,
  },
  {
    slug: "postmortem",
    title: "How to Run a Blameless Postmortem",
    description: "Timeline reconstruction, root cause analysis, and the prime directive.",
    difficulty: "advanced",
    minutes: 20,
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
