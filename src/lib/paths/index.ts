/**
 * Paths registry — curated learner outcomes that reference PHASES.
 *
 * Single source of truth for the Paths discovery layer. Each Path
 * names an engineering outcome, lists the phases on its spine + any
 * recommended electives, and declares its build status.
 *
 * Adding a new Path here automatically surfaces it on /paths.
 */

import { getPhase, PHASES } from "@/content/phases";
import type { Path, PathArchetype, PathStatus } from "./types";

export const PATHS: readonly Path[] = [
  // ─── Web / Frontend / Backend ──────────────────────────────────────────
  {
    id: "full-stack-engineer",
    slug: "full-stack-engineer",
    title: "Full-Stack Web Engineer",
    tagline: "Ship features end-to-end against modern web infrastructure.",
    description:
      "The canonical web-engineering path. You learn the browser, JavaScript, React, Next.js 15, REST + database design, deployment, and the professional-practice layer (testing, security, code quality) that lets you ship features without supervision.",
    outcome:
      "Ship a production Next.js feature end-to-end against PostgreSQL with auth, tests, and a CI/CD pipeline you wrote yourself.",
    archetype: "Web",
    color: "var(--color-accent)",
    phases: [
      {
        phaseId: "0",
        scope: "spine",
        rationale: "Digital-literacy foundations — terminal, internet, dev environment.",
      },
      {
        phaseId: "1",
        scope: "spine",
        rationale: "Programming fundamentals in JavaScript + Python.",
      },
      {
        phaseId: "2",
        scope: "spine",
        rationale: "Web stack: HTML, CSS, JavaScript, React, Next.js 15.",
      },
      {
        phaseId: "4",
        scope: "spine",
        rationale: "Backend engineering: Node.js, REST, PostgreSQL, Docker, deployment.",
      },
      {
        phaseId: "8",
        scope: "spine",
        rationale: "Testing, CI/CD, architecture, security, code quality.",
      },
      {
        phaseId: "3",
        scope: "elective",
        rationale: "CS fundamentals — strongly recommended for interview readiness.",
      },
    ],
    status: "complete",
  },
  {
    id: "frontend-engineer",
    slug: "frontend-engineer",
    title: "Frontend Engineer",
    tagline: "Build production UIs with React + Next.js 15.",
    description:
      "Focuses on the browser-facing half of the web stack. HTML/CSS depth, JavaScript runtime knowledge, React + Next.js, accessibility, performance, and the professional-practice layer that applies to client-side code.",
    outcome:
      "Ship an accessible, performant, well-tested Next.js 15 app router feature with documented architecture decisions.",
    archetype: "Web",
    color: "var(--color-accent)",
    phases: [
      {
        phaseId: "0",
        scope: "spine",
        rationale: "Digital-literacy foundations.",
      },
      { phaseId: "1", scope: "spine", rationale: "Programming fundamentals." },
      { phaseId: "2", scope: "spine", rationale: "Web development core." },
      {
        phaseId: "8",
        scope: "spine",
        moduleIds: ["8-1", "8-3", "8-5"],
        rationale: "Testing, architecture patterns, code quality — the front-end-relevant subset.",
      },
    ],
    status: "complete",
  },
  {
    id: "backend-engineer",
    slug: "backend-engineer",
    title: "Backend Engineer",
    tagline: "Build the systems behind the screen.",
    description:
      "Server-side focus: REST APIs, PostgreSQL schema and indexes, OS + networking + database internals, distributed-systems awareness. Deep enough to debug production incidents at the systems layer.",
    outcome:
      "Design and ship an API that survives 10× traffic with documented capacity, observability, and incident response.",
    archetype: "Backend",
    color: "var(--color-accent)",
    phases: [
      { phaseId: "0", scope: "spine", rationale: "Digital-literacy foundations." },
      { phaseId: "1", scope: "spine", rationale: "Programming fundamentals." },
      {
        phaseId: "3",
        scope: "spine",
        rationale: "CS fundamentals — data structures + algorithms.",
      },
      { phaseId: "4", scope: "spine", rationale: "Backend engineering core." },
      { phaseId: "5", scope: "spine", rationale: "OS, networking, database internals, cloud." },
      { phaseId: "8", scope: "spine", rationale: "Testing, CI/CD, security, code quality." },
      {
        phaseId: "7",
        scope: "elective",
        moduleIds: ["7-2", "7-4"],
        rationale: "Distributed systems + performance engineering for senior backend work.",
      },
    ],
    status: "complete",
  },

  // ─── AI/ML ──────────────────────────────────────────────────────────────
  {
    id: "ml-engineer",
    slug: "ml-engineer",
    title: "ML / AI Engineer",
    tagline: "Build with foundation models, end to end.",
    description:
      "The applied AI engineering path. Phase 6 covers transformers, RAG, agentic AI, MCP development, fine-tuning, and AI in production — the surface area an AI engineer is hired against in 2026. Phase 3 supplies the CS fundamentals that make systems work; Phase 8 supplies professional practice.",
    outcome:
      "Ship a production agentic AI feature with observability, eval harness, cost controls, and a documented MCP integration.",
    archetype: "AI/ML",
    color: "var(--color-accent)",
    phases: [
      { phaseId: "0", scope: "spine", rationale: "Digital-literacy foundations." },
      { phaseId: "1", scope: "spine", rationale: "Programming fundamentals." },
      { phaseId: "3", scope: "spine", rationale: "CS fundamentals — required for systems work." },
      {
        phaseId: "6",
        scope: "spine",
        rationale: "AI/ML engineering: RAG, agents, MCP, fine-tuning, production.",
      },
      {
        phaseId: "8",
        scope: "spine",
        rationale: "Testing, security (incl. prompt injection), code quality.",
      },
      {
        phaseId: "4",
        scope: "elective",
        rationale: "Backend engineering — strongly recommended; most AI features ship via APIs.",
      },
    ],
    status: "complete",
  },
  {
    id: "agent-engineer",
    slug: "agent-engineer",
    title: "Agentic AI Engineer",
    tagline: "Ship agents that survive prod.",
    description:
      "Narrower-scope path inside the AI/ML space: focuses on agentic AI, MCP development, and the production-agent module. Pairs the Phase 6 agentic content with Phase 8 security (prompt injection at agent depth) and Phase 4 backend (API surfaces agents call).",
    outcome:
      "Build, deploy, and monitor a production agent with workflow-vs-agent decisions, observability, prompt-injection defenses, and cost engineering documented.",
    archetype: "AI/ML",
    color: "var(--color-accent)",
    phases: [
      { phaseId: "0", scope: "spine", rationale: "Digital-literacy foundations." },
      { phaseId: "1", scope: "spine", rationale: "Programming fundamentals." },
      { phaseId: "4", scope: "spine", rationale: "Backend engineering — agents ship as APIs." },
      {
        phaseId: "6",
        scope: "spine",
        moduleIds: ["6-1", "6-3", "6-4", "6-6", "6-7"],
        rationale:
          "AI fundamentals + Agentic AI + MCP development + AI in production + Production Agentic AI.",
      },
      {
        phaseId: "8",
        scope: "spine",
        moduleIds: ["8-1", "8-4"],
        rationale: "Testing + Security (prompt injection, supply chain).",
      },
    ],
    status: "complete",
  },

  // ─── Systems / Advanced ─────────────────────────────────────────────────
  {
    id: "systems-engineer",
    slug: "systems-engineer",
    title: "Systems Engineer",
    tagline: "Understand the machine, debug production at the layer below.",
    description:
      "The path for engineers who need to read kernel source, debug TCP retransmits, or design a storage engine. Phase 5 + Phase 7 are the spine — OS, networking, DB internals, cloud, plus compilers, distributed systems, Rust, and performance engineering.",
    outcome:
      "Diagnose a production incident at the systems layer with evidence, propose a fix at the right layer, and ship it.",
    archetype: "Systems",
    color: "var(--color-accent)",
    phases: [
      { phaseId: "0", scope: "spine", rationale: "Digital-literacy foundations." },
      { phaseId: "1", scope: "spine", rationale: "Programming fundamentals." },
      { phaseId: "3", scope: "spine", rationale: "CS fundamentals — algorithms + complexity." },
      { phaseId: "5", scope: "spine", rationale: "OS, networking, database internals, cloud." },
      {
        phaseId: "7",
        scope: "spine",
        rationale: "Compilers, distributed systems, Rust, performance.",
      },
      { phaseId: "8", scope: "spine", rationale: "Professional practice." },
    ],
    status: "complete",
  },

  // ─── Robotics / Manufacturing (scaffold — Phase R/M skew toward
  // standards literacy rather than code-teaching) ────────────────────────
  {
    id: "robotics-software-engineer",
    slug: "robotics-software-engineer",
    title: "Robotics Software Engineer",
    tagline: "Write ROS 2 code that ships through a safety review.",
    description:
      "Pairs the CS + systems substrate with Phase R's standards literacy (ISO 10218-1:2025, functional safety, collaborative modes, PFL testing) and the ROS 2 + ROS-Industrial lesson. Phase R is currently standards-heavy; the code-teaching depth will deepen as Phase R gains hands-on lesson modules.",
    outcome:
      "Ship a ROS 2 application against URsim with a documented safety case that maps to a R15.06-2025 risk-assessment package.",
    archetype: "Robotics",
    color: "#818cf8",
    phases: [
      { phaseId: "0", scope: "spine", rationale: "Digital-literacy foundations." },
      { phaseId: "1", scope: "spine", rationale: "Programming fundamentals." },
      { phaseId: "3", scope: "spine", rationale: "CS fundamentals." },
      {
        phaseId: "5",
        scope: "spine",
        rationale: "Systems engineering — OS + networking for real-time work.",
      },
      {
        phaseId: "r",
        scope: "spine",
        rationale: "Robotics standards literacy + ROS 2 + ROS-Industrial.",
      },
      { phaseId: "8", scope: "elective", rationale: "Professional practice." },
    ],
    status: "scaffold",
  },
  {
    id: "manufacturing-systems-engineer",
    slug: "manufacturing-systems-engineer",
    title: "Manufacturing Systems Engineer",
    tagline: "Bridge the shop floor and the IT stack.",
    description:
      "For engineers integrating MES, SCADA, OPC UA, MTConnect, and PPAP workflows. Pairs the backend + systems substrate with Phase M's twelve-lesson manufacturing-standards stack. Currently standards-heavy; the M11 MTConnect → OPC UA bridge sandbox is the code-teaching anchor.",
    outcome:
      "Stand up a working MTConnect → OPC UA bridge against a simulated CNC and integrate it into an MES with documented zones and conduits.",
    archetype: "Manufacturing",
    color: "#2dd4bf",
    phases: [
      { phaseId: "0", scope: "spine", rationale: "Digital-literacy foundations." },
      { phaseId: "1", scope: "spine", rationale: "Programming fundamentals." },
      {
        phaseId: "4",
        scope: "spine",
        rationale: "Backend engineering — REST + databases for shop-floor data.",
      },
      { phaseId: "5", scope: "spine", rationale: "Systems engineering — networking + cloud." },
      {
        phaseId: "m",
        scope: "spine",
        rationale: "Manufacturing standards: QMS, GD&T, ISA-95, OPC UA, IEC 62443.",
      },
      { phaseId: "8", scope: "elective", rationale: "Professional practice." },
    ],
    status: "scaffold",
  },

  // ─── Embedded — Phase E exists, lessons being authored ────────────────
  {
    id: "embedded-engineer",
    slug: "embedded-engineer",
    title: "Embedded / Firmware Engineer",
    tagline: "Ship production firmware against ARM Cortex-M.",
    description:
      "C and Rust on bare metal, RTOS fundamentals, MISRA-C:2023 compliant style, driver development for the four canonical buses, and a real-time capstone application. Code-first throughout — Phase E is DURA's flagship code-teaching discipline phase.",
    outcome:
      "Build production firmware against an ARM Cortex-M target with documented register access, RTOS scheduling, DMA-driven peripherals, and a real-time sensor pipeline that compiles, flashes, and runs.",
    archetype: "Embedded",
    color: "#fb923c",
    phases: [
      { phaseId: "0", scope: "spine", rationale: "Digital-literacy foundations." },
      { phaseId: "1", scope: "spine", rationale: "Programming fundamentals." },
      { phaseId: "3", scope: "spine", rationale: "CS fundamentals." },
      {
        phaseId: "5",
        scope: "spine",
        rationale: "Systems engineering — OS internals + networking.",
      },
      {
        phaseId: "7",
        scope: "spine",
        moduleIds: ["7-3", "7-4"],
        rationale: "Rust fundamentals + performance engineering — directly applicable to embedded.",
      },
      {
        phaseId: "e",
        scope: "spine",
        rationale: "Phase E — Embedded / Firmware. Eight code-first lessons on ARM Cortex-M.",
      },
    ],
    status: "scaffold",
  },

  // ─── Hardware Verification ──────────────────────────────────────────────
  {
    id: "hardware-verification-engineer",
    slug: "hardware-verification-engineer",
    title: "Hardware Verification Engineer",
    tagline: "Stand up UVM testbenches for any IP block.",
    description:
      "Pairs the CS + systems substrate with Phase H's eight-lesson SystemVerilog + UVM curriculum. IEEE 1800-2023 and IEEE 1800.2-2020 anchored throughout. The credential of choice for semiconductor DV roles.",
    outcome:
      "Compose a complete UVM testbench for a UART IP block — driver, monitor, sequencer, scoreboard, constrained-random sequences, functional coverage, SVA assertions — with 100% coverage closure documented and hash-anchored via /verify.",
    archetype: "Systems",
    color: "#a78bfa",
    phases: [
      { phaseId: "0", scope: "spine", rationale: "Digital-literacy foundations." },
      { phaseId: "1", scope: "spine", rationale: "Programming fundamentals." },
      { phaseId: "3", scope: "spine", rationale: "CS fundamentals." },
      {
        phaseId: "5",
        scope: "spine",
        rationale: "Systems engineering — OS internals, hardware abstraction.",
      },
      {
        phaseId: "h",
        scope: "spine",
        rationale: "Phase H — SystemVerilog + UVM + SVA + UPF, eight lessons.",
      },
    ],
    status: "complete",
  },

  // ─── Leadership ─────────────────────────────────────────────────────────
  {
    id: "engineering-leader",
    slug: "engineering-leader",
    title: "Engineering Leader / CTO Track",
    tagline: "From IC to engineering org leader.",
    description:
      "Phase 9 (CTO Track) is the spine. Earlier phases supply the IC foundation; the path emphasizes that effective engineering leaders are still credible at the systems layer. Includes the start-up, scale-up, and enterprise tracks within Phase 9.",
    outcome:
      "Lead an engineering team or organization — 1:1s, hiring, architecture at scale, org design, product strategy, business fundamentals — at the appropriate company stage.",
    archetype: "Leadership",
    color: "var(--color-accent)",
    phases: [
      { phaseId: "0", scope: "spine", rationale: "Foundation." },
      { phaseId: "1", scope: "spine", rationale: "Programming fundamentals." },
      { phaseId: "2", scope: "spine", rationale: "Web development." },
      { phaseId: "3", scope: "spine", rationale: "CS fundamentals." },
      { phaseId: "4", scope: "spine", rationale: "Backend engineering." },
      { phaseId: "5", scope: "spine", rationale: "Systems engineering." },
      {
        phaseId: "8",
        scope: "spine",
        rationale: "Professional practice — required for credible leadership.",
      },
      {
        phaseId: "9",
        scope: "spine",
        rationale: "CTO Track: management, architecture, org design, business.",
      },
      {
        phaseId: "6",
        scope: "elective",
        rationale: "AI/ML — increasingly required for CTOs in 2026.",
      },
      {
        phaseId: "7",
        scope: "elective",
        rationale: "Advanced systems — credibility at the deep end.",
      },
    ],
    status: "complete",
  },
] as const;

/** Lookup by stable id. Returns undefined if not registered. */
export function getPath(id: string): Path | undefined {
  return PATHS.find((p) => p.id === id);
}

/** Lookup by URL slug. */
export function getPathBySlug(slug: string): Path | undefined {
  return PATHS.find((p) => p.slug === slug);
}

/** All paths for a given archetype. */
export function getPathsByArchetype(archetype: PathArchetype): readonly Path[] {
  return PATHS.filter((p) => p.archetype === archetype);
}

/** All paths with the given status. */
export function getPathsByStatus(status: PathStatus): readonly Path[] {
  return PATHS.filter((p) => p.status === status);
}

/**
 * Total estimated hours for a path. Sums estimatedHours from each
 * referenced phase (full phase or selected modules) on the spine.
 * Electives are NOT counted — they're recommendations, not the path.
 */
export function estimatedPathHours(path: Path): number {
  let total = 0;
  for (const ref of path.phases) {
    if (ref.scope !== "spine") continue;
    const phase = getPhase(ref.phaseId);
    if (!phase) continue;
    if (ref.moduleIds) {
      for (const moduleId of ref.moduleIds) {
        const mod = phase.modules.find((m) => m.id === moduleId);
        if (mod) total += mod.estimatedHours;
      }
    } else {
      total += phase.estimatedHours;
    }
  }
  return total;
}

/**
 * Number of spine phases on a path. Used in card summaries.
 */
export function spinePhaseCount(path: Path): number {
  return path.phases.filter((p) => p.scope === "spine").length;
}

/**
 * The set of unique phase ids referenced across ALL paths. Used by
 * the standards-watch dashboard and to validate that every PHASES
 * entry is on at least one path (a sanity check that no phase is
 * orphaned from discovery).
 */
export function phasesReferencedByPaths(): readonly string[] {
  const ids = new Set<string>();
  for (const path of PATHS) {
    for (const ref of path.phases) {
      ids.add(ref.phaseId);
    }
  }
  return Array.from(ids);
}

/**
 * The set of PHASES entries that are NOT on any path. A non-empty
 * return is a discoverability gap — those phases exist but no curated
 * outcome surfaces them. CI can fail on this if desired.
 */
export function orphanedPhases(): readonly string[] {
  const referenced = new Set(phasesReferencedByPaths());
  return PHASES.filter((p) => !referenced.has(p.id)).map((p) => p.id);
}
