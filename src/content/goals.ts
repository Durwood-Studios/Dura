import type { TrackGoal } from "@/types/career-track";

export const GOALS: TrackGoal[] = [
  {
    id: "first-tech-job",
    question: "I want my first tech job",
    description:
      "Build the foundational skills and portfolio projects that get you past resume screens and into interviews.",
    roleIds: ["frontend", "full-stack"],
    icon: "Rocket",
  },
  {
    id: "career-switch",
    question: "I want to switch careers into tech",
    description:
      "Transition from a non-technical background by focusing on the highest-demand, most accessible engineering roles.",
    roleIds: ["full-stack", "qa-testing"],
    icon: "ArrowRightLeft",
  },
  {
    id: "build-startup",
    question: "I want to build my own startup",
    description:
      "Learn the full stack so you can ship a product end-to-end without depending on a co-founder for every layer.",
    roleIds: ["full-stack", "frontend"],
    icon: "Zap",
  },
  {
    id: "specialize-ai",
    question: "I want to specialize in AI",
    description:
      "Learn embeddings, RAG, fine-tuning, and production AI systems. Requires strong programming fundamentals first.",
    roleIds: ["ai-ml"],
    icon: "Brain",
  },
  {
    id: "lead-teams",
    question: "I want to lead engineering teams",
    description:
      "Develop the people skills, technical strategy, and organizational thinking that separate managers from individual contributors.",
    roleIds: ["engineering-manager"],
    icon: "Users",
  },
  {
    id: "cybersecurity",
    question: "I want to work in cybersecurity",
    description:
      "Master threat modeling, penetration testing, and security architecture to protect systems from real-world attacks.",
    roleIds: ["security"],
    icon: "Shield",
  },
  {
    id: "work-with-data",
    question: "I want to work with data",
    description:
      "Build the pipelines, warehouses, and streaming systems that turn raw data into something teams can actually use.",
    roleIds: ["data"],
    icon: "Database",
  },
  {
    id: "reliable-systems",
    question: "I want to make systems reliable at scale",
    description:
      "Learn the infrastructure, observability, and automation practices that keep large-scale systems running smoothly.",
    roleIds: ["sre", "devops"],
    icon: "Activity",
  },
  {
    id: "mid-to-senior",
    question: "I want to go from mid-level to senior",
    description:
      "Bridge the gap between executing tasks and owning systems — system design, mentoring, and technical leadership.",
    roleIds: ["solutions-architect", "engineering-manager"],
    icon: "TrendingUp",
  },
  {
    id: "deep-understanding",
    question: "I want to understand how computers really work",
    description:
      "Go below the abstractions — compilers, operating systems, networking, and distributed systems from first principles.",
    roleIds: ["solutions-architect"],
    icon: "Cpu",
  },
];

/** Look up a goal by its unique ID. */
export function getGoal(id: string): TrackGoal | undefined {
  return GOALS.find((g) => g.id === id);
}
