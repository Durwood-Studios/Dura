import type { LearningPath, PathId } from "@/types/skill-assessment";

export const LEARNING_PATHS: Record<PathId, LearningPath> = {
  foundation: {
    id: "foundation",
    name: "Foundation",
    description: "Complete journey from zero to CTO-ready.",
    targetAudience: "Complete beginner",
    estimatedHours: 2850,
    phases: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  },
  "career-switch": {
    id: "career-switch",
    name: "Career Switch",
    description: "Fast-track into software engineering.",
    targetAudience: "Switching from another field",
    estimatedHours: 1800,
    phases: ["0", "1", "2", "4", "3", "8"],
  },
  "bootcamp-grad": {
    id: "bootcamp-grad",
    name: "Bootcamp Graduate",
    description: "Fill the gaps bootcamps skip.",
    targetAudience: "Have basic web dev skills",
    estimatedHours: 1300,
    phases: ["3", "5", "4", "6", "7", "8"],
  },
  "mid-to-senior": {
    id: "mid-to-senior",
    name: "Mid to Senior",
    description: "Systems depth for the senior push.",
    targetAudience: "Working mid-level engineer",
    estimatedHours: 1300,
    phases: ["5", "3", "6", "7", "8"],
  },
  "ai-specialist": {
    id: "ai-specialist",
    name: "AI Specialist",
    description: "Deep AI/ML engineering track.",
    targetAudience: "Engineer pivoting to AI",
    estimatedHours: 1000,
    phases: ["6", "3", "7", "8"],
  },
  "cto-track": {
    id: "cto-track",
    name: "CTO Track",
    description: "Leadership and architecture at scale.",
    targetAudience: "Senior pushing Staff/CTO",
    estimatedHours: 800,
    phases: ["8", "9"],
  },
};
