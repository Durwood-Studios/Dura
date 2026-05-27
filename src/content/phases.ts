import type { Module, Phase } from "@/types/curriculum";

function mod(
  phaseId: string,
  order: number,
  slug: string,
  title: string,
  description: string,
  hours: number,
  lessons: number
): Module {
  return {
    id: `${phaseId}-${order}`,
    phaseId,
    slug,
    title,
    description,
    estimatedHours: hours,
    lessonCount: lessons,
    order,
  };
}

export const PHASES: Phase[] = [
  {
    id: "0",
    slug: "digital-literacy",
    title: "Phase 0: Digital Literacy",
    tagline: "The absolute foundations.",
    description:
      "How computers think, your first terminal, how the internet works, and setting up a real dev environment. The vocabulary and mental models every engineer assumes you already have.",
    color: "#6ee7b7",
    estimatedHours: 50,
    moduleCount: 4,
    lessonCount: 16,
    order: 0,
    modules: [
      mod(
        "0",
        1,
        "how-computers-think",
        "How Computers Think",
        "Binary, hardware, files, processes — the model under the surface.",
        12,
        4
      ),
      mod(
        "0",
        2,
        "your-first-terminal",
        "Your First Terminal",
        "Shell, paths, files, pipes — the keyboard interface to your machine.",
        12,
        4
      ),
      mod(
        "0",
        3,
        "how-the-internet-works",
        "How the Internet Works",
        "DNS, HTTP, browsers, the web — what happens when you type a URL.",
        14,
        4
      ),
      mod(
        "0",
        4,
        "your-dev-environment",
        "Your Dev Environment",
        "Editors, git basics, dotfiles, package managers — the workshop you'll spend years in.",
        12,
        4
      ),
    ],
  },
  {
    id: "1",
    slug: "programming-fundamentals",
    title: "Phase 1: Programming Fundamentals",
    tagline: "Think like a programmer.",
    description:
      "Variables, control flow, functions, data structures, debugging. Language-agnostic mental models with hands-on JavaScript and Python.",
    color: "#93c5fd",
    estimatedHours: 225,
    moduleCount: 6,
    lessonCount: 45,
    order: 1,
    modules: [
      mod(
        "1",
        1,
        "variables-and-types",
        "Variables and Types",
        "Memory, primitives, references.",
        35,
        7
      ),
      mod("1", 2, "control-flow", "Control Flow", "Conditionals, loops, branching.", 35, 7),
      mod("1", 3, "functions", "Functions", "Parameters, return values, scope, closures.", 40, 8),
      mod("1", 4, "data-structures", "Data Structures", "Arrays, objects, maps, sets.", 40, 8),
      mod("1", 5, "debugging", "Debugging", "Reading errors, stack traces, breakpoints.", 35, 7),
      mod("1", 6, "first-projects", "First Projects", "Build something real, end to end.", 40, 8),
    ],
  },
  {
    id: "2",
    slug: "web-development",
    title: "Phase 2: Web Development",
    tagline: "Build for the browser.",
    description:
      "HTML, CSS, JavaScript, React, accessibility, deploying. Everything you need to ship a real web app.",
    color: "#c4b5fd",
    estimatedHours: 275,
    moduleCount: 5,
    lessonCount: 50,
    order: 2,
    modules: [
      mod(
        "2",
        1,
        "html-foundations",
        "HTML Foundations",
        "Semantic markup, forms, accessibility.",
        55,
        10
      ),
      mod(
        "2",
        2,
        "css-fundamentals",
        "CSS Fundamentals",
        "Box model, flexbox, grid, responsive design.",
        55,
        10
      ),
      mod(
        "2",
        3,
        "javascript-in-the-browser",
        "JavaScript in the Browser",
        "DOM, events, fetch, async.",
        55,
        10
      ),
      mod("2", 4, "react", "React Fundamentals", "Components, hooks, state, effects.", 60, 10),
      mod("2", 5, "nextjs", "Next.js 15", "App router, server components, data fetching.", 50, 10),
    ],
  },
  {
    id: "3",
    slug: "cs-fundamentals",
    title: "Phase 3: CS Fundamentals",
    tagline: "Think like a computer scientist.",
    description:
      "Data structures, algorithms, complexity, discrete math. The theoretical core that separates senior engineers from juniors.",
    color: "#fda4af",
    estimatedHours: 225,
    moduleCount: 5,
    lessonCount: 40,
    order: 3,
    modules: [
      mod(
        "3",
        1,
        "complexity",
        "Complexity and Big O",
        "Big-O, time and space, amortized analysis.",
        45,
        8
      ),
      mod(
        "3",
        2,
        "arrays-and-strings",
        "Arrays and Strings",
        "Memory layout, two pointers, sliding window, sorting.",
        50,
        8
      ),
      mod(
        "3",
        3,
        "linked-lists-stacks-queues",
        "Linked Lists, Stacks, and Queues",
        "Node-based structures, LIFO, FIFO, monotonic patterns.",
        50,
        8
      ),
      mod(
        "3",
        4,
        "trees-and-graphs",
        "Trees and Graphs",
        "BSTs, traversal, BFS, DFS, shortest paths.",
        40,
        8
      ),
      mod(
        "3",
        5,
        "hash-maps-advanced",
        "Hash Maps and Advanced Patterns",
        "Hashing, recursion, DP, greedy, backtracking.",
        40,
        8
      ),
    ],
  },
  {
    id: "4",
    slug: "backend-engineering",
    title: "Phase 4: Backend Engineering",
    tagline: "Build the systems behind the screen.",
    description:
      "APIs, databases, auth, queues, caching, deployment. The work that keeps applications running for millions of users.",
    color: "#fdba74",
    estimatedHours: 275,
    moduleCount: 5,
    lessonCount: 45,
    order: 4,
    modules: [
      mod(
        "4",
        1,
        "nodejs",
        "Node.js Fundamentals",
        "Runtime, event loop, modules, fs, testing.",
        55,
        9
      ),
      mod(
        "4",
        2,
        "rest-apis-express",
        "REST APIs with Express",
        "Routing, middleware, auth, validation, docs.",
        60,
        9
      ),
      mod(
        "4",
        3,
        "postgresql",
        "PostgreSQL",
        "SQL, joins, schema design, transactions, indexing.",
        55,
        9
      ),
      mod(
        "4",
        4,
        "docker-containers",
        "Docker and Containers",
        "Images, Dockerfile, Compose, networking, security.",
        50,
        9
      ),
      mod(
        "4",
        5,
        "deployment-devops",
        "Deployment and DevOps",
        "CI/CD, PaaS, monitoring, DNS, scaling.",
        55,
        9
      ),
    ],
  },
  {
    id: "5",
    slug: "systems-engineering",
    title: "Phase 5: Systems Engineering",
    tagline: "Understand the machine.",
    description:
      "Operating systems, computer networking, database internals, and cloud infrastructure. The systems-layer fundamentals that explain why production behaves the way it does.",
    color: "#f0abfc",
    estimatedHours: 350,
    moduleCount: 4,
    lessonCount: 35,
    order: 5,
    modules: [
      mod(
        "5",
        1,
        "operating-systems",
        "Operating Systems",
        "Processes, memory, IO, schedulers, syscalls.",
        90,
        9
      ),
      mod(
        "5",
        2,
        "computer-networking",
        "Computer Networking",
        "TCP/IP, TLS, DNS, load balancing, CDNs.",
        85,
        9
      ),
      mod(
        "5",
        3,
        "database-internals",
        "Database Internals",
        "Storage engines, indexes, transactions, replication, query planners.",
        90,
        9
      ),
      mod(
        "5",
        4,
        "cloud-infrastructure",
        "Cloud Infrastructure",
        "Compute, storage, networking, IAM, IaC across the major clouds.",
        85,
        8
      ),
    ],
  },
  {
    id: "6",
    slug: "ai-ml-engineering",
    title: "Phase 6: AI/ML Engineering",
    tagline: "Build with intelligence.",
    description:
      "Applied AI engineering: foundations, RAG pipelines, agentic AI, MCP server development, fine-tuning, AI in production, and the production agentic-AI discipline.",
    color: "#67e8f9",
    estimatedHours: 440,
    moduleCount: 7,
    lessonCount: 62,
    order: 6,
    modules: [
      mod(
        "6",
        1,
        "ai-fundamentals",
        "AI Fundamentals",
        "How modern models work: transformers, tokens, context windows, sampling.",
        70,
        8
      ),
      mod(
        "6",
        2,
        "rag-pipelines",
        "RAG Pipelines",
        "Embeddings, retrieval, chunking, reranking, evaluation.",
        75,
        9
      ),
      mod(
        "6",
        3,
        "agentic-ai",
        "Agentic AI",
        "Tool calling, planning, memory, multi-step reasoning, evaluation harnesses.",
        75,
        9
      ),
      mod(
        "6",
        4,
        "mcp-development",
        "MCP Development",
        "The Model Context Protocol end to end: primitives, transports, OAuth, agentic features, production.",
        90,
        13
      ),
      mod(
        "6",
        5,
        "fine-tuning",
        "Fine-Tuning",
        "When to fine-tune, dataset construction, training loops, eval, deployment.",
        60,
        8
      ),
      mod(
        "6",
        6,
        "ai-in-production",
        "AI in Production",
        "Observability, cost controls, evals, guardrails, model versioning, incident playbooks.",
        50,
        8
      ),
      mod(
        "6",
        7,
        "agent-engineering",
        "Production Agentic AI",
        "Workflow vs agent decisions, observability, cost engineering, prompt injection at agent depth, computer use, voice/realtime, code-writing agents.",
        20,
        7
      ),
    ],
  },
  {
    id: "7",
    slug: "advanced-systems",
    title: "Phase 7: Advanced Systems",
    tagline: "The deep end.",
    description:
      "Compilers and interpreters, distributed systems, Rust fundamentals, performance engineering. Where engineering becomes craft.",
    color: "#fcd34d",
    estimatedHours: 300,
    moduleCount: 4,
    lessonCount: 30,
    order: 7,
    modules: [
      mod(
        "7",
        1,
        "compilers-interpreters",
        "Compilers and Interpreters",
        "Lexing, parsing, IR, codegen, optimization, JITs.",
        90,
        8
      ),
      mod(
        "7",
        2,
        "distributed-systems",
        "Distributed Systems",
        "CAP, consensus, replication, time, failure modes.",
        90,
        8
      ),
      mod(
        "7",
        3,
        "rust-fundamentals",
        "Rust Fundamentals",
        "Ownership, borrowing, lifetimes, async, FFI.",
        80,
        8
      ),
      mod(
        "7",
        4,
        "performance-engineering",
        "Performance Engineering",
        "Profiling, hot paths, allocations, cache lines, microbenchmarks.",
        40,
        6
      ),
    ],
  },
  {
    id: "8",
    slug: "professional-practice",
    title: "Phase 8: Professional Practice",
    tagline: "Engineering as a profession.",
    description:
      "Testing, CI/CD and DevOps, architecture patterns, security, and code quality. The engineering practices that separate code that ships from code that survives.",
    color: "#a3e635",
    estimatedHours: 200,
    moduleCount: 5,
    lessonCount: 35,
    order: 8,
    modules: [
      mod(
        "8",
        1,
        "testing",
        "Testing",
        "Unit, integration, e2e, TDD, property-based, mocking discipline.",
        40,
        7
      ),
      mod(
        "8",
        2,
        "cicd-devops",
        "CI/CD and DevOps",
        "Pipelines, environments, deploys, infrastructure as code, observability.",
        40,
        7
      ),
      mod(
        "8",
        3,
        "architecture-patterns",
        "Architecture Patterns",
        "Layering, hexagonal, event-driven, CQRS, modular monoliths vs microservices.",
        40,
        7
      ),
      mod(
        "8",
        4,
        "security",
        "Security",
        "Threat modeling, OWASP, authn/authz, secrets, supply chain.",
        40,
        7
      ),
      mod(
        "8",
        5,
        "code-quality",
        "Code Quality",
        "Reviews, refactoring, design heuristics, code smells, technical debt management.",
        40,
        7
      ),
    ],
  },
  {
    id: "9",
    slug: "cto-track",
    title: "Phase 9: CTO Track",
    tagline: "Lead the engineering org.",
    description:
      "The transition into engineering management, architecture at scale, org design, product strategy, business fundamentals, and the day-to-day of CTO life from startup through enterprise.",
    color: "#f472b6",
    estimatedHours: 500,
    moduleCount: 8,
    lessonCount: 60,
    order: 9,
    modules: [
      mod(
        "9",
        1,
        "engineering-manager",
        "The Engineering Manager Transition",
        "1:1s, performance reviews, hiring, delegation, the IC-to-manager shift.",
        60,
        8
      ),
      mod(
        "9",
        2,
        "architecture-at-scale",
        "Architecture at Scale",
        "10K to 100M users: scaling reads/writes, regional infra, platform teams.",
        80,
        8
      ),
      mod(
        "9",
        3,
        "org-design",
        "Org Design",
        "Topologies, team boundaries, Conway's law, scaling without breaking.",
        60,
        7
      ),
      mod(
        "9",
        4,
        "product-strategy",
        "Product Strategy",
        "Roadmapping, prioritization, tech-debt economics, sequencing.",
        50,
        7
      ),
      mod(
        "9",
        5,
        "business-fundamentals",
        "Business Fundamentals for CTOs",
        "Unit economics, budgeting, fundraising vocabulary, board reporting.",
        60,
        8
      ),
      mod(
        "9",
        6,
        "startup-cto",
        "The Startup CTO",
        "Founding engineer reality: shipping fast, hiring early, technical debt as a tool.",
        70,
        7
      ),
      mod(
        "9",
        7,
        "scaleup-cto",
        "The Scale-Up CTO",
        "Builder to enabler: platform teams, on-call culture, the second 100 hires.",
        60,
        8
      ),
      mod(
        "9",
        8,
        "enterprise-cto",
        "The Enterprise CTO",
        "Strategy, board engagement, M&A integration, innovation portfolios.",
        60,
        7
      ),
    ],
  },
];

export function getPhase(id: string): Phase | undefined {
  return PHASES.find((p) => p.id === id);
}

export function getModule(phaseId: string, moduleId: string): Module | undefined {
  return getPhase(phaseId)?.modules.find((m) => m.id === moduleId);
}

export const TOTAL_HOURS = PHASES.reduce((sum, p) => sum + p.estimatedHours, 0);
export const TOTAL_MODULES = PHASES.reduce((sum, p) => sum + p.moduleCount, 0);
export const TOTAL_LESSONS = PHASES.reduce((sum, p) => sum + p.lessonCount, 0);

/**
 * Hard-coded counts for use in admin/dashboard stat cards.
 * Update these when content is added; they exist so client components
 * don't need to import the full dictionary/question banks just for .length.
 */
export const CONTENT_COUNTS = {
  /** Total dictionary terms across all batches. */
  dictionaryTerms: 500,
  /** Total assessment questions across all phases. */
  assessmentQuestions: 564,
} as const;
