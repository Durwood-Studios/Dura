import type { Metadata } from "next";
import Link from "next/link";
import {
  MessageSquare,
  Database,
  Bot,
  Plug,
  SlidersHorizontal,
  FlaskConical,
  Rocket,
  Activity,
  Scale,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { buildMetadata } from "@/lib/og";

export const metadata: Metadata = buildMetadata({
  title: "AI Engineering Competency Framework",
  description:
    "An open-source competency framework for AI engineering — 9 domains, Dreyfus-modeled skill levels, mapped to ACM CS2023 and SFIA 9.",
  path: "/standards/ai-engineering",
});

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CompetencyArea {
  name: string;
  icon: React.ReactElement;
  knowledgeUnits: string[];
  novice: string;
  expert: string;
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const COMPETENCIES: CompetencyArea[] = [
  {
    name: "Prompt Engineering",
    icon: <MessageSquare className="h-5 w-5" aria-hidden />,
    knowledgeUnits: [
      "Prompt design patterns",
      "Few-shot / zero-shot",
      "Chain-of-thought",
      "System prompts",
      "Evaluation",
      "Safety guardrails",
    ],
    novice: "Writes basic prompts; understands that wording affects output quality.",
    expert:
      "Designs reusable prompt architectures with evaluation harnesses, safety layers, and automated regression testing.",
  },
  {
    name: "RAG Pipelines",
    icon: <Database className="h-5 w-5" aria-hidden />,
    knowledgeUnits: [
      "Document ingestion",
      "Chunking strategies",
      "Embeddings",
      "Vector databases",
      "Retrieval strategies",
      "Reranking",
      "RAGAS evaluation",
    ],
    novice: "Can describe why retrieval augments generation; uses a managed RAG template.",
    expert:
      "Architects production RAG systems with hybrid retrieval, reranking pipelines, and quantitative evaluation via RAGAS or custom metrics.",
  },
  {
    name: "Agentic Systems",
    icon: <Bot className="h-5 w-5" aria-hidden />,
    knowledgeUnits: [
      "Tool use",
      "Planning & reasoning",
      "Multi-agent coordination",
      "State management",
      "Error recovery",
      "Human-in-the-loop",
    ],
    novice:
      "Understands the concept of LLM tool calling; can run a single-tool agent from a framework.",
    expert:
      "Designs multi-agent orchestrations with robust state machines, graceful error recovery, and human-in-the-loop checkpoints.",
  },
  {
    name: "MCP Development",
    icon: <Plug className="h-5 w-5" aria-hidden />,
    knowledgeUnits: [
      "Model Context Protocol spec",
      "Server implementation",
      "Tool design",
      "Resources & prompts",
      "Security model",
      "Transports (stdio, SSE, Streamable HTTP)",
    ],
    novice: "Knows MCP exists and can connect a client to an existing MCP server.",
    expert:
      "Implements production MCP servers with custom tools, resource providers, security boundaries, and multi-transport support.",
  },
  {
    name: "Fine-Tuning",
    icon: <SlidersHorizontal className="h-5 w-5" aria-hidden />,
    knowledgeUnits: [
      "Data preparation",
      "LoRA / QLoRA",
      "Full fine-tuning",
      "Evaluation",
      "Catastrophic forgetting",
      "Deployment",
    ],
    novice:
      "Understands when fine-tuning beats prompting; can run a LoRA notebook on a small dataset.",
    expert:
      "Manages end-to-end fine-tuning pipelines — data curation, hyperparameter sweeps, forgetting mitigation, and safe model deployment.",
  },
  {
    name: "Evaluation & Testing",
    icon: <FlaskConical className="h-5 w-5" aria-hidden />,
    knowledgeUnits: [
      "Benchmarks",
      "A/B testing",
      "Human evaluation",
      "Automated metrics",
      "Red teaming",
      "Bias detection",
    ],
    novice: "Can run a benchmark suite and interpret aggregate scores.",
    expert:
      "Designs multi-dimensional evaluation frameworks combining automated metrics, adversarial red teams, and statistically rigorous human evals.",
  },
  {
    name: "Deployment & Inference",
    icon: <Rocket className="h-5 w-5" aria-hidden />,
    knowledgeUnits: [
      "Model serving",
      "Latency optimization",
      "Batching",
      "Quantization",
      "Edge deployment",
      "Cost management",
    ],
    novice: "Can deploy a model behind an API using a managed service.",
    expert:
      "Operates high-throughput inference infrastructure with quantization, dynamic batching, auto-scaling, and cost optimization across GPU fleets.",
  },
  {
    name: "Monitoring & Observability",
    icon: <Activity className="h-5 w-5" aria-hidden />,
    knowledgeUnits: [
      "Output quality monitoring",
      "Drift detection",
      "Cost tracking",
      "Feedback loops",
      "Alerting",
      "Trace analysis",
    ],
    novice: "Logs model inputs and outputs; checks costs manually.",
    expert:
      "Runs real-time observability platforms with drift detection, quality scoring, cost anomaly alerts, and closed-loop feedback into retraining.",
  },
  {
    name: "Responsible AI",
    icon: <Scale className="h-5 w-5" aria-hidden />,
    knowledgeUnits: [
      "Bias & fairness",
      "Transparency",
      "Safety",
      "Privacy",
      "Regulatory compliance",
      "Societal impact",
    ],
    novice: "Recognizes that AI systems can produce biased or harmful outputs.",
    expert:
      "Embeds fairness audits, transparency documentation, safety testing, and compliance workflows into every stage of the AI lifecycle.",
  },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function CompetencyCard({
  area,
  index,
}: {
  area: CompetencyArea;
  index: number;
}): React.ReactElement {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 backdrop-blur-xl">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#67e8f9]/10 text-[#67e8f9]">
          {area.icon}
        </span>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          <span className="mr-2 font-mono text-sm text-[#67e8f9]">
            {String(index + 1).padStart(2, "0")}
          </span>
          {area.name}
        </h3>
      </div>

      {/* Knowledge Units */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {area.knowledgeUnits.map((unit) => (
          <span
            key={unit}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]"
          >
            {unit}
          </span>
        ))}
      </div>

      {/* Dreyfus Levels */}
      <div className="space-y-2 border-t border-[var(--color-border)] pt-3">
        <div>
          <span className="font-mono text-[11px] font-medium tracking-wider text-[var(--color-text-muted)] uppercase">
            Novice
          </span>
          <p className="mt-0.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {area.novice}
          </p>
        </div>
        <div>
          <span className="font-mono text-[11px] font-medium tracking-wider text-[#67e8f9] uppercase">
            Expert
          </span>
          <p className="mt-0.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {area.expert}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AIEngineeringPage(): React.ReactElement {
  return (
    <main>
      {/* ---- Hero / Intro ---- */}
      <div className="mx-auto max-w-[720px] px-6 py-16">
        <header className="mb-12">
          <p className="font-mono text-xs tracking-widest text-[var(--color-text-muted)] uppercase">
            Competency Framework
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-[var(--color-text-primary)] sm:text-5xl">
            AI Engineering
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-secondary)]">
            An open-source, living reference for what AI engineers need to know — structured as
            competency areas, knowledge units, and Dreyfus skill levels.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
            Why this exists
          </h2>
          <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
            Software engineering has SWEBOK. Computer science has ACM CS2023. AI engineering has
            nothing equivalent — no industry-standard body of knowledge that defines what
            practitioners should know at each career stage.
          </p>
          <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
            DURA publishes this framework as an open-source living reference. It is not a curriculum
            (Phase 6 is the curriculum). It is the competency map that the curriculum is built
            against — so learners, teams, and organizations can see exactly what &ldquo;AI
            engineering proficiency&rdquo; means in concrete, measurable terms.
          </p>
          <p className="leading-[1.9] text-[var(--color-text-primary)]">
            The framework is structured as{" "}
            <strong className="text-[var(--color-text-primary)]">Competency Area</strong> &rarr;{" "}
            <strong className="text-[var(--color-text-primary)]">Knowledge Units</strong> &rarr;{" "}
            <strong className="text-[var(--color-text-primary)]">Skill Levels</strong>, using the
            Dreyfus model of skill acquisition (Novice &rarr; Advanced Beginner &rarr; Competent
            &rarr; Proficient &rarr; Expert). The two anchor levels — Novice and Expert — are shown
            below for scannability.
          </p>
        </section>
      </div>

      {/* ---- Competency Grid (wider) ---- */}
      <div className="mx-auto max-w-5xl px-6 pb-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px grow bg-[var(--color-border)]" />
          <h2 className="shrink-0 font-mono text-xs tracking-widest text-[#67e8f9] uppercase">
            9 Competency Areas
          </h2>
          <div className="h-px grow bg-[var(--color-border)]" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {COMPETENCIES.map((area, i) => (
            <CompetencyCard key={area.name} area={area} index={i} />
          ))}
        </div>
      </div>

      {/* ---- Bottom Sections ---- */}
      <div className="mx-auto max-w-[720px] px-6 py-16">
        {/* Standards Mapping */}
        <section className="mb-12">
          <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
            Standards mapping
          </h2>
          <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
            This framework cross-references established standards where overlap exists:
          </p>
          <div className="space-y-3">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
              <h3 className="mb-1 text-sm font-semibold text-[#67e8f9]">ACM / IEEE CS2023</h3>
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                The CS2023 curriculum guidelines include an Artificial Intelligence knowledge area
                covering search, knowledge representation, machine learning, and ethics. DURA&apos;s
                framework extends these into applied AI engineering competencies — prompt design,
                RAG, agentic systems, deployment — that CS2023 does not yet address.
              </p>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
              <h3 className="mb-1 text-sm font-semibold text-[#67e8f9]">SFIA 9</h3>
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                The Skills Framework for the Information Age (SFIA 9) defines competencies for IT
                professionals across seven levels of responsibility. DURA&apos;s Dreyfus levels map
                roughly to SFIA levels 1-2 (Novice), 3 (Advanced Beginner), 4 (Competent), 5
                (Proficient), and 6-7 (Expert) — providing a bridge for organizations that use SFIA
                for workforce planning.
              </p>
            </div>
          </div>
        </section>

        {/* How to Use */}
        <section className="mb-12">
          <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
            How to use this framework
          </h2>
          <div className="space-y-3">
            <UsageRow
              title="Individual learners"
              description="Self-assess against each competency area to identify gaps. Use the Dreyfus levels to set concrete goals — not 'learn AI' but 'reach Competent in RAG Pipelines.'"
            />
            <UsageRow
              title="Teams"
              description="Map your team's current coverage across all nine areas. Identify single points of failure and plan cross-training or hiring to fill gaps."
            />
            <UsageRow
              title="Educators"
              description="Align course objectives to specific knowledge units. Use the Novice-to-Expert progression to scaffold assignments and assessments."
            />
            <UsageRow
              title="Organizations"
              description="Build job descriptions, promotion criteria, and training budgets against a shared competency model instead of vague 'AI experience' requirements."
            />
          </div>
        </section>

        {/* Contributing */}
        <section className="mb-12">
          <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
            Contributing
          </h2>
          <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
            This is a living document. AI engineering is evolving rapidly, and this framework must
            evolve with it. If you see a gap, an outdated knowledge unit, or a better way to
            describe a skill level — submit a pull request.
          </p>
          <Link
            href="https://github.com/Durwood-Studios/Dura"
            className="inline-flex items-center gap-2 text-[#67e8f9] transition-colors hover:text-[#67e8f9]/80"
          >
            Open on GitHub
            <ExternalLink className="h-4 w-4" aria-hidden />
          </Link>
        </section>

        {/* License */}
        <section className="mb-12">
          <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">License</h2>
          <p className="leading-[1.9] text-[var(--color-text-primary)]">
            This framework is published under the{" "}
            <Link
              href="/open-source"
              className="text-[#67e8f9] underline decoration-[#67e8f9]/30 underline-offset-4 transition-colors hover:text-[#67e8f9]/80"
            >
              GNU Affero General Public License v3
            </Link>
            . You are free to use, modify, and redistribute it — including for commercial purposes —
            as long as derivative works remain open source under the same license.
          </p>
        </section>

        {/* Back link */}
        <div className="border-t border-[var(--color-border)] pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-secondary)]"
          >
            <ArrowRight className="h-4 w-4 rotate-180" aria-hidden />
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline helpers                                                     */
/* ------------------------------------------------------------------ */

function UsageRow({
  title,
  description,
}: {
  title: string;
  description: string;
}): React.ReactElement {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
      <h3 className="mb-1 text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
      <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{description}</p>
    </div>
  );
}
