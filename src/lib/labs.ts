/** Downloadable projects connect capstone instruction to source, fixtures and evidence. */
export interface PracticalLab {
  id: string;
  title: string;
  description: string;
  requirements: string;
  pathIds: string[];
  lessonHref: string;
}
export const PRACTICAL_LABS: readonly PracticalLab[] = [
  {
    id: "password-vault",
    title: "Password vault teaching lab",
    description:
      "Study authenticated encryption, validated records, stale-writer protection and backup recovery using fictional credentials.",
    requirements:
      "Node 22+ and an interactive terminal; optional OS clipboard utility. This teaching project is not an audited password manager for real credentials.",
    pathIds: ["backend-engineer"],
    lessonHref: "/tutorials/password-manager",
  },
  {
    id: "markdown-notes",
    title: "Markdown Notes",
    description:
      "Build a complete browser notes editor with safe Markdown rendering, draft recovery, import/export and conflicting-tab protection.",
    requirements:
      "Node 22+ and a browser with Web Locks for saving. No runtime dependencies or external account; browser tests use the pinned Playwright development dependency.",
    pathIds: ["frontend-engineer"],
    lessonHref: "/tutorials/markdown-notes",
  },
  {
    id: "rag-chatbot",
    title: "Document Q&A and RAG",
    description:
      "Run document ingestion, retrieval and an extractive browser interface, then inspect the optional provider-backed pipeline.",
    requirements:
      "Node 22+; the offline project has no runtime dependencies. Optional provider requests require your own API key and incur provider charges.",
    pathIds: ["ml-engineer", "agent-engineer"],
    lessonHref: "/tutorials/rag-chatbot",
  },
  {
    id: "mcp-postgres",
    title: "PostgreSQL MCP server",
    description:
      "Exercise bounded, validated tools over real stdio with an offline fixture, then connect fixed parameterized queries to a dedicated database role.",
    requirements:
      "Node 22+ and npm; optional PostgreSQL integration requires a disposable database and the documented lab_reader role.",
    pathIds: ["backend-engineer", "agent-engineer"],
    lessonHref: "/tutorials/mcp-server-tutorial",
  },
  {
    id: "embedded",
    title: "STM32 sensor pipeline",
    description:
      "Compile an ADC/DMA/FreeRTOS pipeline and test its fault policy; use the board checklist for physical acceptance.",
    requirements:
      "C compiler, Python, PlatformIO; STM32F407 Discovery for flashing and timing evidence.",
    pathIds: ["embedded-engineer"],
    lessonHref: "/paths/10/10-8/01",
  },
  {
    id: "uart",
    title: "UART verification",
    description:
      "Run all-byte loopback, reset and framing regressions; compare the procedural and UVM verification paths.",
    requirements:
      "Icarus Verilog for the executed baseline; a full UVM simulator for the UVM path.",
    pathIds: ["hardware-verification-engineer"],
    lessonHref: "/paths/11/11-8/01",
  },
  {
    id: "robotics",
    title: "ROS 2 planned transfer",
    description:
      "Build a simulator-only joint-motion integration and retain planning, controller and risk-review evidence.",
    requirements:
      "Python for local tests; Ubuntu 24.04, ROS 2 Jazzy, MoveIt and URsim for integration acceptance.",
    pathIds: ["robotics-software-engineer"],
    lessonHref: "/paths/13/13-6/01",
  },
  {
    id: "manufacturing",
    title: "CNC telemetry to MES",
    description:
      "Run a synthetic HTTP feed through a real OPC UA server into SQLite, with data-quality and recovery checks.",
    requirements: "Python 3.11+ and the pinned asyncua library; local loopback ports only.",
    pathIds: ["manufacturing-systems-engineer"],
    lessonHref: "/paths/14/14-11/01",
  },
  {
    id: "quant",
    title: "Order-book replay and correctness",
    description:
      "Compare each state transition with a reference, exercise recovery and SPSC handoffs, then measure local latency.",
    requirements: "C++20 compiler and thread support. Uses synthetic input; no exchange account.",
    pathIds: ["quant-hft-engineer", "systems-engineer"],
    lessonHref: "/paths/12/12-8/08",
  },
  {
    id: "mcp-server",
    title: "A complete MCP server",
    description:
      "Run and test tools, resources and prompts over real stdio using the pinned official SDK.",
    requirements: "Node 22+ and npm; no external account or API key.",
    pathIds: ["ml-engineer", "agent-engineer", "backend-engineer"],
    lessonHref: "/howto/mcp-server",
  },
  {
    id: "ai-agent",
    title: "A bounded tool-using agent",
    description:
      "Run a local agent and provider-contract tests, then inspect its tool validation, iteration limits and memory behavior.",
    requirements:
      "Node 22+; optional provider requests require your own account and incur provider charges.",
    pathIds: ["ml-engineer", "agent-engineer"],
    lessonHref: "/tutorials/ai-agent",
  },
];
