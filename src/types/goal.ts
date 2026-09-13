export type GoalType = "daily" | "weekly" | "phase" | "career" | "custom";
export type GoalUnit = "minutes" | "lessons" | "hours" | "xp";

export interface Goal {
  id: string;
  phaseId?: string;
  roleId?: string;
  type: GoalType;
  unit: GoalUnit;
  target: number;
  current: number;
  startedAt: number;
  deadline: number | null;
  achievedAt: number | null;
  label: string;
}
