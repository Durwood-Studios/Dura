import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Project Tutorials",
  description:
    "Build real projects from scratch with guided, step-by-step instructions and interactive checkpoints.",
};

const TUTORIALS = [
  {
    slug: "cli-tool",
    title: "Build a CLI Task Manager",
    description:
      "Create a command-line task manager with Node.js — file I/O, argument parsing, and colored output.",
    difficulty: "beginner",
    minutes: 45,
  },
  {
    slug: "rest-api",
    title: "Build a REST API with Next.js",
    description: "Complete CRUD API with validation, error handling, and rate limiting.",
    difficulty: "intermediate",
    minutes: 50,
  },
  {
    slug: "react-dashboard",
    title: "Build a React Dashboard",
    description: "Data dashboard with charts, filters, and responsive layout.",
    difficulty: "intermediate",
    minutes: 50,
  },
  {
    slug: "rag-chatbot",
    title: "Build a RAG Chatbot",
    description: "AI-powered chatbot that answers questions about your documents.",
    difficulty: "advanced",
    minutes: 60,
  },
  {
    slug: "portfolio-site",
    title: "Build a Portfolio Site with Next.js",
    description:
      "Professional portfolio with animations, dark mode, and perfect Lighthouse scores.",
    difficulty: "intermediate",
    minutes: 50,
  },
  {
    slug: "algorithm-visualizer",
    title: "Build an Algorithm Visualizer",
    description: "Web app animating sorting algorithms with speed control and array size input.",
    difficulty: "beginner",
    minutes: 180,
  },
  {
    slug: "markdown-notes",
    title: "Build a Markdown Note-Taking App",
    description: "Browser-based notes with Markdown rendering, localStorage, search, and tags.",
    difficulty: "beginner",
    minutes: 150,
  },
  {
    slug: "finance-tracker",
    title: "Build a Personal Finance Tracker",
    description: "React app tracking income and expenses with categories, charts, and IndexedDB.",
    difficulty: "beginner",
    minutes: 180,
  },
  {
    slug: "task-board",
    title: "Build a Full-Stack Task Board",
    description: "Kanban board with Next.js, drag-and-drop, API routes, and PostgreSQL.",
    difficulty: "intermediate",
    minutes: 240,
  },
  {
    slug: "chat-app",
    title: "Build a Real-Time Chat Application",
    description:
      "WebSocket chat with message history, presence indicators, and typing notifications.",
    difficulty: "intermediate",
    minutes: 210,
  },
  {
    slug: "ci-cd-pipeline",
    title: "Build a GitHub Actions CI/CD Pipeline",
    description: "Lint, typecheck, test, build, deploy to Vercel — with branch protection.",
    difficulty: "intermediate",
    minutes: 150,
  },
  {
    slug: "accessible-components",
    title: "Build an Accessible Component Library",
    description:
      "5 React components with keyboard nav, ARIA, focus trapping, and screen reader support.",
    difficulty: "intermediate",
    minutes: 210,
  },
  {
    slug: "data-dashboard",
    title: "Build a Data Dashboard with SQL and Charts",
    description:
      "PostgreSQL queries with joins, aggregations, and interactive chart visualization.",
    difficulty: "intermediate",
    minutes: 180,
  },
  {
    slug: "ai-agent",
    title: "Build an AI Agent with Tool Use",
    description:
      "AI agent that searches, reads files, and executes code with planning and error recovery.",
    difficulty: "advanced",
    minutes: 240,
  },
  {
    slug: "mcp-server-tutorial",
    title: "Build an MCP Server for a Real Data Source",
    description: "Model Context Protocol server exposing PostgreSQL to AI assistants.",
    difficulty: "advanced",
    minutes: 210,
  },
] as const;

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-rose-100 text-rose-700",
};

export default function TutorialsPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-3xl font-semibold text-[var(--color-text-primary)]">
        Project Tutorials
      </h1>
      <p className="mb-8 text-[var(--color-text-secondary)]">
        Build real projects from scratch with guided, step-by-step instructions and interactive
        checkpoints.
      </p>

      <div className="space-y-4">
        {TUTORIALS.map((tutorial, i) => (
          <Link
            key={tutorial.slug}
            href={`/tutorials/${tutorial.slug}`}
            className="group flex gap-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 transition hover:border-emerald-300 hover:shadow-sm"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-lg font-bold text-emerald-600">
              {i + 1}
            </div>
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_COLORS[tutorial.difficulty]}`}
                >
                  {tutorial.difficulty}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {tutorial.minutes} min
                </span>
              </div>
              <h2 className="mb-1 text-lg font-semibold text-[var(--color-text-primary)] group-hover:text-emerald-700">
                {tutorial.title}
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)]">{tutorial.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
