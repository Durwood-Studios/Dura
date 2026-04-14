export type DreyfusLevel = "novice" | "advanced-beginner" | "competent" | "proficient" | "expert";

export type PathId =
  | "foundation"
  | "career-switch"
  | "bootcamp-grad"
  | "mid-to-senior"
  | "ai-specialist"
  | "cto-track";

export interface SkillQuestion {
  id: string;
  phaseLevel: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SkillAnswer {
  questionId: string;
  selectedOption: number;
  correct: boolean;
  phaseLevel: number;
}

export interface SkillScore {
  total: number;
  correct: number;
  byBracket: Record<string, { total: number; correct: number }>;
  dreyfusLevel: DreyfusLevel;
}

export interface SkillAssessmentResult {
  id: string;
  completedAt: number;
  answers: SkillAnswer[];
  score: SkillScore;
  recommendedPath: PathId;
  selectedPath: PathId;
}

export interface LearningPath {
  id: PathId;
  name: string;
  description: string;
  targetAudience: string;
  estimatedHours: number;
  phases: string[];
}
