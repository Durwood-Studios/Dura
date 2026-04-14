export type TutorialType = "howto" | "tutorial";
export type CheckpointStatus = "locked" | "active" | "completed";

export interface TutorialCheckpoint {
  id: string;
  label: string;
  status: CheckpointStatus;
  completedAt: number | null;
}

export interface TutorialProgress {
  id: string;
  slug: string;
  type: TutorialType;
  currentStep: number;
  totalSteps: number;
  checkpoints: TutorialCheckpoint[];
  startedAt: number;
  completedAt: number | null;
  lastActiveAt: number;
}
