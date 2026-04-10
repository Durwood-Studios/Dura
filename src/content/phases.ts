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
      "Computers, files, networks, the command line. The vocabulary and mental models every engineer assumes you already have.",
    color: "#6ee7b7",
    estimatedHours: 50,
    moduleCount: 4,
    lessonCount: 16,
    order: 0,
    modules: [
      mod("0", 1, "computer-basics", "Computer Basics", "Hardware, OS, files, processes.", 12, 4),
      mod("0", 2, "the-internet", "The Internet", "DNS, HTTP, browsers, the web.", 12, 4),
      mod("0", 3, "command-line", "The Command Line", "Shell, paths, files, pipes.", 14, 4),
      mod(
        "0",
        4,
        "digital-hygiene",
        "Digital Hygiene",
        "Passwords, backups, security basics.",
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
      mod("3", 1, "complexity", "Complexity", "Big-O, time and space, tradeoffs.", 45, 8),
      mod(
        "3",
        2,
        "data-structures",
        "Data Structures",
        "Lists, trees, hashes, graphs, heaps.",
        50,
        8
      ),
      mod("3", 3, "algorithms", "Algorithms", "Sorting, searching, recursion, DP.", 50, 8),
      mod("3", 4, "discrete-math", "Discrete Math", "Logic, proofs, sets, combinatorics.", 40, 8),
      mod(
        "3",
        5,
        "problem-solving",
        "Problem Solving",
        "Patterns, decomposition, interviews.",
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
      mod("4", 1, "apis", "APIs", "REST, GraphQL, design, versioning.", 55, 9),
      mod("4", 2, "databases", "Databases", "SQL, NoSQL, modeling, queries, indexes.", 60, 9),
      mod(
        "4",
        3,
        "auth-and-security",
        "Auth and Security",
        "Sessions, JWTs, OWASP, secrets.",
        55,
        9
      ),
      mod("4", 4, "queues-and-jobs", "Queues and Jobs", "Async work, retries, idempotency.", 50, 9),
      mod("4", 5, "deployment", "Deployment", "Containers, CI/CD, observability.", 55, 9),
    ],
  },
  {
    id: "5",
    slug: "systems-engineering",
    title: "Phase 5: Systems Engineering",
    tagline: "Architect for scale.",
    description:
      "Distributed systems, networking, performance, reliability. How real systems survive the real world.",
    color: "#f0abfc",
    estimatedHours: 350,
    moduleCount: 4,
    lessonCount: 35,
    order: 5,
    modules: [
      mod(
        "5",
        1,
        "distributed-systems",
        "Distributed Systems",
        "CAP, consensus, replication.",
        90,
        9
      ),
      mod("5", 2, "networking", "Networking", "TCP/IP, TLS, load balancing, CDNs.", 85, 9),
      mod("5", 3, "performance", "Performance", "Profiling, caching, hot paths.", 90, 9),
      mod("5", 4, "reliability", "Reliability", "SLOs, observability, incidents.", 85, 8),
    ],
  },
  {
    id: "6",
    slug: "ai-ml-engineering",
    title: "Phase 6: AI/ML Engineering",
    tagline: "Build with intelligence.",
    description:
      "Math, ML fundamentals, deep learning, LLMs, RAG, agents, evaluation. From the math to the production system.",
    color: "#67e8f9",
    estimatedHours: 400,
    moduleCount: 6,
    lessonCount: 50,
    order: 6,
    modules: [
      mod(
        "6",
        1,
        "math-foundations",
        "Math Foundations",
        "Linear algebra, calculus, stats.",
        70,
        9
      ),
      mod("6", 2, "classical-ml", "Classical ML", "Regression, trees, clustering, eval.", 70, 9),
      mod("6", 3, "deep-learning", "Deep Learning", "Networks, training, transformers.", 70, 9),
      mod("6", 4, "llms", "LLMs", "Prompting, fine-tuning, evaluation.", 60, 8),
      mod(
        "6",
        5,
        "rag-and-tools",
        "RAG and Tool Use",
        "Retrieval, embeddings, tool calling.",
        65,
        8
      ),
      mod("6", 6, "agents", "Agents", "Planning, memory, multi-step reasoning.", 65, 7),
    ],
  },
  {
    id: "7",
    slug: "advanced-systems",
    title: "Phase 7: Advanced Systems",
    tagline: "The deep end.",
    description:
      "Compilers, OS internals, security engineering, advanced architecture. Where engineering becomes craft.",
    color: "#fcd34d",
    estimatedHours: 350,
    moduleCount: 4,
    lessonCount: 30,
    order: 7,
    modules: [
      mod("7", 1, "compilers", "Compilers", "Parsing, IR, codegen, optimization.", 90, 8),
      mod(
        "7",
        2,
        "operating-systems",
        "Operating Systems",
        "Processes, memory, IO, schedulers.",
        90,
        8
      ),
      mod(
        "7",
        3,
        "security-engineering",
        "Security Engineering",
        "Threat modeling, crypto, hardening.",
        85,
        7
      ),
      mod(
        "7",
        4,
        "advanced-architecture",
        "Advanced Architecture",
        "Patterns at scale, tradeoffs.",
        85,
        7
      ),
    ],
  },
  {
    id: "8",
    slug: "professional-practice",
    title: "Phase 8: Professional Practice",
    tagline: "Engineering as a profession.",
    description:
      "Process, testing, code review, communication, ethics. The non-code skills that define senior engineers.",
    color: "#a3e635",
    estimatedHours: 200,
    moduleCount: 5,
    lessonCount: 35,
    order: 8,
    modules: [
      mod(
        "8",
        1,
        "engineering-process",
        "Engineering Process",
        "Agile, planning, estimation.",
        40,
        7
      ),
      mod("8", 2, "testing", "Testing", "Unit, integration, e2e, TDD.", 40, 7),
      mod("8", 3, "code-review", "Code Review", "Reading code, giving feedback.", 40, 7),
      mod("8", 4, "communication", "Communication", "Writing, docs, RFCs, standups.", 40, 7),
      mod("8", 5, "ethics", "Ethics", "Responsibility, privacy, impact.", 40, 7),
    ],
  },
  {
    id: "9",
    slug: "cto-track",
    title: "Phase 9: CTO Track",
    tagline: "Lead the engineering org.",
    description:
      "Management, architecture at scale, org design, product, business, and the day-to-day of CTO life at every company stage.",
    color: "#f472b6",
    estimatedHours: 500,
    moduleCount: 8,
    lessonCount: 60,
    order: 9,
    modules: [
      mod(
        "9",
        1,
        "engineering-manager-transition",
        "The Engineering Manager Transition",
        "1:1s, reviews, hiring.",
        60,
        8
      ),
      mod(
        "9",
        2,
        "technical-architecture-at-scale",
        "Technical Architecture at Scale",
        "10K to 100M users.",
        80,
        8
      ),
      mod(
        "9",
        3,
        "team-building-org-design",
        "Team Building and Org Design",
        "Topologies, scaling teams.",
        60,
        8
      ),
      mod(
        "9",
        4,
        "product-strategy-roadmapping",
        "Product Strategy and Roadmapping",
        "Prioritization, tech debt.",
        50,
        7
      ),
      mod(
        "9",
        5,
        "business-fundamentals",
        "Business Fundamentals for CTOs",
        "Unit economics, budgeting.",
        60,
        7
      ),
      mod("9", 6, "the-startup-cto", "The Startup CTO", "Founding engineer reality.", 70, 8),
      mod("9", 7, "the-scale-up-cto", "The Scale-Up CTO", "Builder to enabler.", 60, 7),
      mod(
        "9",
        8,
        "the-enterprise-cto",
        "The Enterprise CTO",
        "Strategy, board, innovation.",
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
