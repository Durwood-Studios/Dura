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

  // ─── Phase E — Embedded / Firmware (post-Phase-5, code-teaching) ───────
  // Eight-lesson code-first curriculum for ARM Cortex-M. C and Rust on
  // bare metal, RTOS, drivers, MISRA-C:2023 in practice, and a capstone
  // real-time sensor pipeline on STM32F4. Hash-anchored capstone via /verify.
  {
    id: "e",
    slug: "e-embedded",
    title: "Phase E: Embedded / Firmware",
    tagline: "Ship production firmware against ARM Cortex-M.",
    description:
      "Eight code-teaching lessons from C-literacy to a working real-time sensor pipeline on STM32. C and Rust on bare metal, RTOS fundamentals, drivers for the four canonical buses, MISRA-C:2023 in practice. Code-first — standards appear only where they're load-bearing.",
    color: "#fb923c",
    estimatedHours: 15,
    moduleCount: 8,
    lessonCount: 8,
    order: 12,
    modules: [
      mod(
        "e",
        1,
        "c-toolchain-arm-cortex-m",
        "C Toolchain for ARM Cortex-M",
        "GCC arm-none-eabi, linker scripts, startup code, and the build flow that produces a flashable binary.",
        1.5,
        1
      ),
      mod(
        "e",
        2,
        "bare-metal-c",
        "Bare-Metal C — Registers, Peripherals, the Boot Sequence",
        "Memory-mapped I/O, volatile, the vector table, and the journey from reset vector to main().",
        1.5,
        1
      ),
      mod(
        "e",
        3,
        "interrupts-and-dma",
        "Interrupts and DMA",
        "ISRs without the pitfalls plus DMA-driven peripheral transfers. The hardware-software contract at the interrupt boundary.",
        1.5,
        1
      ),
      mod(
        "e",
        4,
        "rtos-fundamentals",
        "RTOS Fundamentals — Tasks, Queues, Priority Inversion",
        "FreeRTOS / Zephyr as references. Schedulers, queues, mutexes, and the priority-inversion failure mode that bit Mars Pathfinder.",
        2,
        1
      ),
      mod(
        "e",
        5,
        "drivers",
        "Drivers — UART, SPI, I2C, ADC",
        "The four buses every embedded engineer writes against. Polled, interrupt-driven, and DMA-driven implementations with the choice criteria documented.",
        2,
        1
      ),
      mod(
        "e",
        6,
        "rust-cortex-m",
        "Rust on Cortex-M — embedded-hal + RTIC",
        "Rust's embedded-hal trait ecosystem and RTIC's task model. The memory-safety argument made concrete.",
        2,
        1
      ),
      mod(
        "e",
        7,
        "misra-c-2023",
        "MISRA-C:2023 — When Style Is a Safety Requirement",
        "Why specific MISRA rules exist, what bugs they prevent, and how the deviation-policy mechanism works. Practical, not bureaucratic.",
        1.25,
        1
      ),
      mod(
        "e",
        8,
        "capstone",
        "Capstone — A Real-Time Sensor Pipeline",
        "ADC + DMA + RTOS task + UART telemetry on STM32F4. End-to-end firmware that compiles, flashes, and runs. Hash-anchored via /verify.",
        3,
        1
      ),
    ],
  },

  // ─── Phase H — Hardware Verification (post-Phase-5, code-teaching) ─────
  // Eight-lesson SystemVerilog + UVM curriculum. IEEE 1800-2023 + IEEE
  // 1800.2-2020 anchored. Capstone is a complete UVM testbench for a
  // UART IP block, hash-anchored via /verify.
  {
    id: "h",
    slug: "h-hardware-verification",
    title: "Phase H: Hardware Verification",
    tagline: "Stand up a UVM testbench for any IP block.",
    description:
      "Eight code-teaching lessons that move you from SystemVerilog literacy to a complete UVM testbench. IEEE 1800-2023 + IEEE 1800.2-2020 anchored throughout.",
    color: "#a78bfa",
    estimatedHours: 13,
    moduleCount: 8,
    lessonCount: 8,
    order: 13,
    modules: [
      mod(
        "h",
        1,
        "systemverilog-basics",
        "SystemVerilog Basics for Verification",
        "IEEE 1800-2023 in operational terms. Data types beyond Verilog, interfaces, classes.",
        1.5,
        1
      ),
      mod(
        "h",
        2,
        "uvm-testbench-architecture",
        "UVM Testbench Architecture",
        "Driver, Monitor, Sequencer, Agent, Scoreboard, Env, Test. IEEE 1800.2-2020.",
        2,
        1
      ),
      mod(
        "h",
        3,
        "constrained-random-stimulus",
        "Constrained-Random Stimulus",
        "Randomization, constraint blocks, the most productive DV methodology.",
        1.5,
        1
      ),
      mod(
        "h",
        4,
        "functional-coverage",
        "Functional Coverage — Coverpoints, Bins, Cross",
        "Coverage closure: random stimulus + coverage = 'when am I done'.",
        1.5,
        1
      ),
      mod(
        "h",
        5,
        "uvm-sequences",
        "UVM Sequences and Virtual Sequences",
        "Sequence library, layered sequences, virtual sequences coordinating agents.",
        1.5,
        1
      ),
      mod(
        "h",
        6,
        "formal-verification-sva",
        "Formal Verification — SVA Assertions",
        "SystemVerilog Assertions, formal-vs-simulation tradeoffs.",
        1.5,
        1
      ),
      mod(
        "h",
        7,
        "low-power-verification-upf",
        "Low-Power Verification with UPF",
        "IEEE 1801 Unified Power Format, power-aware simulation.",
        1.25,
        1
      ),
      mod(
        "h",
        8,
        "capstone-uart-uvm-tb",
        "Capstone — UVM Testbench for a UART IP Block",
        "Complete UVM TB: driver, monitor, scoreboard, coverage, SVA. /verify-anchored.",
        2.5,
        1
      ),
    ],
  },

  // ─── Phase R — Robotics (post-Phase-5 specialization) ──────────────────
  // Eight-lesson curriculum anchored to ISO 10218:2025, ISO 12100, the
  // functional-safety triad, and ROS-Industrial. Capstone produces a
  // hash-anchored R15.06-2025 risk-assessment package via /verify.
  {
    id: "r",
    slug: "r-robotics",
    title: "Phase R: Robotics",
    tagline: "Build robots that pass real safety reviews.",
    description:
      "Eight lessons anchored to the 2025 unified ISO 10218 family + the functional-safety triad + ROS-Industrial. Capstone hash-anchors a complete R15.06-2025 risk-assessment package as a /verify artifact a hiring manager can audit.",
    color: "#818cf8",
    estimatedHours: 11,
    moduleCount: 8,
    lessonCount: 8,
    order: 10,
    modules: [
      mod(
        "r",
        1,
        "iso-8373-vocabulary",
        "ISO 8373 Vocabulary",
        "The canonical robotics glossary — manipulator, end-effector, pose, workspace, collaborative operation. Every downstream lesson drifts without it.",
        1,
        1
      ),
      mod(
        "r",
        2,
        "iso-12100-risk",
        "ISO 12100 Risk Assessment",
        "The four-step risk-assessment process every machinery-safety standard inherits. Limits, hazards, estimation, evaluation.",
        1,
        1
      ),
      mod(
        "r",
        3,
        "functional-safety",
        "Functional Safety: PL ↔ SIL",
        "IEC 61508 as parent. ISO 13849 (PL a-e) and IEC 62061 (SIL 1-3) derive from it with different architectural choices.",
        1,
        1
      ),
      mod(
        "r",
        4,
        "collaborative-modes",
        "The Four Collaborative Modes",
        "ISO 10218-1:2025 absorbed ISO/TS 15066. The four modes — SMS, HG, SSM, PFL — have distinct sensor, control-system, and risk-assessment implications.",
        1,
        1
      ),
      mod(
        "r",
        5,
        "pfl-testing",
        "PFL Testing: RIA TR R15.806",
        "Application-level safety validation for power-and-force-limiting cobots. PFL-certified robot ≠ PFL-validated application.",
        1,
        1
      ),
      mod(
        "r",
        6,
        "ros-industrial",
        "ROS 2 + ROS-Industrial",
        "Hands-on against URsim following the ROS-Industrial public curriculum. No vendor-issued ROS 2 cert exists — Open Robotics + Apex.Grace are the paths.",
        2,
        1
      ),
      mod(
        "r",
        7,
        "cybersecurity",
        "Robot Cybersecurity: 10218 × 62443",
        "ISO 10218-1:2025 added cybersecurity requirements referencing IEC 62443 plus robot-specific overlay (secure boot, signed firmware, teach-pendant auth).",
        1,
        1
      ),
      mod(
        "r",
        8,
        "capstone",
        "Capstone: R15.06-2025 Risk-Assessment Package",
        "Complete R15.06-2025 package for a simulated cell: 10218-2 hazard identification, 13849 safety-function design, 15066 force/pressure budget. Hash-anchored via /verify.",
        3,
        1
      ),
    ],
  },

  // ─── Phase M — Manufacturing (post-Phase-5 specialization) ──────────────
  // Twelve-lesson curriculum anchored to the manufacturing-standards stack
  // ISO 9001 + AS9100/IATF 16949, Core Tools, GD&T/MBD, ISA-95/88,
  // MTConnect + OPC UA + TSN, IEC 62443, Lean / Six Sigma, RAMI 4.0 / IIRA.
  // Viable for non-CS-degreed learners (prereqs through Phase 5 only).
  {
    id: "m",
    slug: "m-manufacturing",
    title: "Phase M: Manufacturing",
    tagline: "Build a manufacturing engineer hiring managers actually test.",
    description:
      "Twelve lessons anchored to ISO 9001, AS9100, IATF 16949 + Core Tools, ASME Y14.5/Y14.41 GD&T + MBD, ISA-95/88, MTConnect + OPC UA + TSN, IEC 62443, Lean / Six Sigma. Five hash-anchorable /verify artifacts: PPAP package, DMAIC project, GD&T stack-up, OEE computation, MTConnect→OPC UA bridge.",
    color: "#2dd4bf",
    estimatedHours: 16,
    moduleCount: 12,
    lessonCount: 12,
    order: 11,
    modules: [
      mod(
        "m",
        1,
        "iso-9001-baseline",
        "ISO 9001 Baseline",
        "Universal Quality Management System standard. 7 QM principles. ISO 9001 certifies the ISMS process — not individual products.",
        1,
        1
      ),
      mod(
        "m",
        2,
        "as9100-iatf-supersets",
        "Industry Supersets: AS9100 + IATF 16949",
        "Aerospace (AS9100D) and automotive (IATF 16949) extend ISO 9001 with sector-specific requirements.",
        1,
        1
      ),
      mod(
        "m",
        3,
        "iatf-core-tools",
        "IATF Core Tools",
        "Five Core Tools required for IATF 16949 audits: APQP, PPAP, FMEA, MSA, SPC.",
        2,
        1
      ),
      mod(
        "m",
        4,
        "lean-tps",
        "Lean / Toyota Production System",
        "Two pillars: JIT + Jidoka. PDCA underneath. Practitioner tools: 5S, SMED, Kaizen, A3, Andon, Heijunka, Kanban.",
        1,
        1
      ),
      mod(
        "m",
        5,
        "six-sigma-dmaic",
        "Six Sigma DMAIC",
        "Define-Measure-Analyze-Improve-Control. Sequential phases with gate reviews; skipping ahead solves the wrong problem.",
        2,
        1
      ),
      mod(
        "m",
        6,
        "asme-y14-5-gdt",
        "ASME Y14.5 GD&T + Tolerance Stack-Up",
        "GD&T as a MODEL — datum reference frames, Rule #1, MMC/LMC modifiers, virtual conditions. Stack-up output is a /verify artifact.",
        2,
        1
      ),
      mod(
        "m",
        7,
        "asme-y14-41-mbd",
        "ASME Y14.41 Model-Based Definition",
        "Annotated 3D CAD model as authoritative product-definition document. Leverages STEP (ISO 10303-242).",
        1,
        1
      ),
      mod(
        "m",
        8,
        "ipc-a-610-classes",
        "IPC-A-610J Acceptability + Class Framework",
        "Visual workmanship criteria for PCBAs across three classes: 1 (consumer), 2 (commercial), 3 (high-reliability).",
        1,
        1
      ),
      mod(
        "m",
        9,
        "ipc-7711-rework",
        "IPC-7711/7721 Rework",
        "Procedural standard for rework, modification, repair. Inherits the IPC-A-610 three-class framework.",
        1,
        1
      ),
      mod(
        "m",
        10,
        "isa-95-isa-88",
        "ISA-95 Pyramid + ISA-88 Batch",
        "ISA-95 five-level pyramid (L0 process → L4 ERP) as a CONTROL HIERARCHY. ISA-88 adds batch structure.",
        1,
        1
      ),
      mod(
        "m",
        11,
        "mtconnect-opcua-tsn",
        "MTConnect + OPC UA + IEC/IEEE 60802 TSN",
        "Open data plane for industrial automation. Official OPC UA Companion Specification for MTConnect. IEC/IEEE 60802 is the TSN profile for industrial automation.",
        2,
        1
      ),
      mod(
        "m",
        12,
        "iec-62443-rami-iira",
        "IEC 62443 + RAMI 4.0 + IIRA",
        "OT cybersecurity via zones, conduits, SL1-SL4. Plus RAMI 4.0 + IIRA architectural literacy for EU and US supply chains.",
        1,
        1
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
