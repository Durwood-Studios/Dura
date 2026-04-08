export type Theme = "light" | "dark" | "system";
export type StudyMode = "standard" | "bite" | "focus" | "review" | "sprint" | "challenge";
export type FontSize = "sm" | "md" | "lg" | "xl";

export interface Preferences {
  id: "user";
  theme: Theme;
  studyMode: StudyMode;
  fontSize: FontSize;
  reducedMotion: boolean;
  soundEnabled: boolean;
  dailyGoalMinutes: number;
  updatedAt: number;
}

export const DEFAULT_PREFERENCES: Preferences = {
  id: "user",
  theme: "light",
  studyMode: "standard",
  fontSize: "md",
  reducedMotion: false,
  soundEnabled: true,
  dailyGoalMinutes: 20,
  updatedAt: 0,
};
