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
  {
    slug: "auth-system",
    title: "Build an Authentication System from Scratch",
    description: "Email/password auth with JWT, bcrypt, protected routes, and session management.",
    difficulty: "intermediate",
    minutes: 180,
  },
  {
    slug: "docker-deploy",
    title: "Build and Deploy a Dockerized Application",
    description: "Containerize Next.js + PostgreSQL with Docker Compose and deploy to the cloud.",
    difficulty: "intermediate",
    minutes: 180,
  },
  {
    slug: "test-suite",
    title: "Build a Test Suite for an Untested Codebase",
    description: "Unit tests, integration tests, E2E, mocking, and CI integration.",
    difficulty: "intermediate",
    minutes: 180,
  },
  {
    slug: "url-shortener",
    title: "Design and Implement a URL Shortener at Scale",
    description:
      "System design + implementation: hashing, redirects, analytics, and rate limiting.",
    difficulty: "advanced",
    minutes: 240,
  },
  {
    slug: "tiny-compiler",
    title: "Build a Compiler for a Tiny Language",
    description: "Lexer, parser, AST, and interpreter for an expression language in TypeScript.",
    difficulty: "advanced",
    minutes: 240,
  },
  {
    slug: "first-website",
    title: "Build Your First Website from Scratch",
    description: "Responsive landing page using only HTML and CSS — no frameworks.",
    difficulty: "beginner",
    minutes: 120,
  },
  {
    slug: "form-wizard",
    title: "Build a Multi-Step Form Wizard",
    description: "React form with step navigation, Zod validation, and conditional logic.",
    difficulty: "intermediate",
    minutes: 180,
  },
  {
    slug: "ecommerce-checkout",
    title: "Build an E-Commerce Checkout Flow",
    description: "Product pages, cart, Stripe checkout, and order confirmation in Next.js.",
    difficulty: "intermediate",
    minutes: 240,
  },
  {
    slug: "graphql-api",
    title: "Build a GraphQL API",
    description: "Schema-first GraphQL with resolvers, queries, mutations, and error handling.",
    difficulty: "intermediate",
    minutes: 180,
  },
  {
    slug: "browser-game",
    title: "Build a Browser Game",
    description: "Canvas-based Snake game with score, levels, and persistent high scores.",
    difficulty: "beginner",
    minutes: 180,
  },
  {
    slug: "fine-tuning",
    title: "Build a Fine-Tuning Pipeline",
    description: "Prepare data, fine-tune with LoRA, evaluate, compare to base model.",
    difficulty: "advanced",
    minutes: 240,
  },
  {
    slug: "key-value-store",
    title: "Build a Key-Value Store from Scratch",
    description: "In-memory store with TTL, disk persistence, wire protocol, and benchmarks.",
    difficulty: "advanced",
    minutes: 240,
  },
  {
    slug: "http-server",
    title: "Build an HTTP Server from Scratch",
    description: "TCP sockets, HTTP/1.1 parsing, static files, routing — no Express.",
    difficulty: "intermediate",
    minutes: 180,
  },
  {
    slug: "job-tracker",
    title: "Build a Job Application Tracker",
    description: "Kanban-style CRUD app with drag-and-drop and IndexedDB persistence.",
    difficulty: "beginner",
    minutes: 180,
  },
  {
    slug: "npm-package",
    title: "Build and Publish an npm Package",
    description: "TypeScript utility library with tests, docs, and npm publishing.",
    difficulty: "intermediate",
    minutes: 150,
  },
  {
    slug: "monitoring-dashboard",
    title: "Build a Monitoring Dashboard",
    description: "Collect metrics, time-series charts, threshold alerts, auto-refresh.",
    difficulty: "intermediate",
    minutes: 210,
  },
  {
    slug: "embeddings-search",
    title: "Build an Embeddings Search Engine",
    description: "Vectorize documents, cosine similarity search, ranked results UI.",
    difficulty: "advanced",
    minutes: 210,
  },
  {
    slug: "rate-limiter",
    title: "Build a Rate Limiter Service",
    description: "Token bucket + sliding window algorithms with Express middleware.",
    difficulty: "intermediate",
    minutes: 150,
  },
  {
    slug: "design-system",
    title: "Build a Design System",
    description: "Tokens, themed components, variant system, and documentation page.",
    difficulty: "intermediate",
    minutes: 240,
  },
  {
    slug: "multiplayer-game",
    title: "Build a WebSocket Multiplayer Game",
    description: "Real-time shared canvas game with lobbies and server authority.",
    difficulty: "advanced",
    minutes: 240,
  },
  {
    slug: "ai-code-reviewer",
    title: "Build an AI Code Reviewer",
    description: "Parse diffs, LLM analysis, inline review comments with severity.",
    difficulty: "advanced",
    minutes: 210,
  },
  {
    slug: "cron-scheduler",
    title: "Build a Cron Job Scheduler",
    description: "Cron parsing, job execution, retry logic, dead letter queue.",
    difficulty: "intermediate",
    minutes: 180,
  },
  {
    slug: "rbac-system",
    title: "Build an RBAC Authorization System",
    description: "Roles, permissions, resource guards, middleware, and audit log.",
    difficulty: "intermediate",
    minutes: 180,
  },
  {
    slug: "static-site-gen",
    title: "Build a Static Site Generator",
    description: "Markdown to HTML with frontmatter, templates, and dev server.",
    difficulty: "intermediate",
    minutes: 210,
  },
  {
    slug: "migration-tool",
    title: "Build a Database Migration Tool",
    description: "Up/down migrations, version tracking, rollback, and CLI interface.",
    difficulty: "intermediate",
    minutes: 180,
  },
  {
    slug: "secrets-manager",
    title: "Build a Secrets Manager",
    description: "AES-256-GCM encryption, access control, audit log, key rotation.",
    difficulty: "advanced",
    minutes: 210,
  },
  {
    slug: "sprint-tracker",
    title: "Build a Team Sprint Tracker",
    description: "Backlog, Kanban board, velocity chart, burndown, team assignment.",
    difficulty: "intermediate",
    minutes: 210,
  },
  {
    slug: "load-balancer",
    title: "Build a Load Balancer",
    description: "Round-robin, least-connections, health checks, connection draining.",
    difficulty: "advanced",
    minutes: 180,
  },
  {
    slug: "pwa-push",
    title: "Build a PWA with Push Notifications",
    description: "Service worker, cache strategies, Web Push API, install prompt.",
    difficulty: "intermediate",
    minutes: 180,
  },
  {
    slug: "etl-pipeline",
    title: "Build an ETL Pipeline",
    description: "Extract from API, transform with Python, load to PostgreSQL.",
    difficulty: "intermediate",
    minutes: 210,
  },
  {
    slug: "resume-builder",
    title: "Build a Tech Resume Builder",
    description: "Structured input, multiple templates, PDF export, ATS-friendly.",
    difficulty: "beginner",
    minutes: 150,
  },
  {
    slug: "streaming-processor",
    title: "Build a Streaming Data Processor",
    description: "Event ingestion, windowed aggregation, backpressure, output sinks.",
    difficulty: "advanced",
    minutes: 210,
  },
  {
    slug: "feature-flags",
    title: "Build a Feature Flag Service",
    description: "Flag definitions, percentage rollouts, user targeting, client SDK.",
    difficulty: "intermediate",
    minutes: 180,
  },
  {
    slug: "incident-timeline",
    title: "Build an Incident Timeline Tool",
    description: "Event API, timeline visualization, severity, postmortem export.",
    difficulty: "intermediate",
    minutes: 180,
  },
  {
    slug: "cli-dashboard",
    title: "Build a CLI Dashboard",
    description: "Terminal UI with real-time stats, keyboard nav, multiple panels.",
    difficulty: "intermediate",
    minutes: 150,
  },
  {
    slug: "blog-engine",
    title: "Build a Blog Engine with Next.js",
    description: "MDX content, dynamic routes, tag filtering, RSS feed.",
    difficulty: "beginner",
    minutes: 150,
  },
  {
    slug: "webscraper",
    title: "Build a Web Scraper",
    description: "Fetch, parse HTML, handle pagination, rate limiting, export data.",
    difficulty: "intermediate",
    minutes: 150,
  },
  {
    slug: "api-gateway",
    title: "Build an API Gateway",
    description: "Routing, rate limiting, auth, transforms, logging, circuit breaker.",
    difficulty: "advanced",
    minutes: 210,
  },
  {
    slug: "image-optimizer",
    title: "Build an Image Optimization Service",
    description: "Resize, WebP/AVIF conversion, caching, CDN-ready headers.",
    difficulty: "intermediate",
    minutes: 150,
  },
  {
    slug: "task-queue",
    title: "Build a Task Queue with Workers",
    description: "Producer/consumer, retry with backoff, dead letter queue, dashboard.",
    difficulty: "intermediate",
    minutes: 180,
  },
  {
    slug: "markdown-editor",
    title: "Build a Live Markdown Editor",
    description: "Split-pane editor, real-time preview, toolbar, keyboard shortcuts.",
    difficulty: "intermediate",
    minutes: 180,
  },
  {
    slug: "oauth-provider",
    title: "Build an OAuth 2.0 Provider",
    description: "Authorization code flow, PKCE, tokens, scopes, refresh tokens.",
    difficulty: "advanced",
    minutes: 210,
  },
  {
    slug: "dependency-graph",
    title: "Build a Dependency Graph Visualizer",
    description: "Parse package.json, dependency tree, force-directed graph with D3.",
    difficulty: "intermediate",
    minutes: 150,
  },
  {
    slug: "email-service",
    title: "Build a Transactional Email Service",
    description: "Template engine, send queue, delivery tracking, retry logic.",
    difficulty: "intermediate",
    minutes: 180,
  },
  {
    slug: "log-aggregator",
    title: "Build a Log Aggregator",
    description: "HTTP ingestion, structured parsing, full-text search, dashboard.",
    difficulty: "intermediate",
    minutes: 180,
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
