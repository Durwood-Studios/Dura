import type { StreakState } from "@/lib/streak";
import { INITIAL_STREAK } from "@/lib/streak";

export type Theme = "light" | "dark" | "system";
export type StudyMode = "standard" | "bite" | "focus" | "review" | "sprint" | "challenge";
export type FontSize = "sm" | "md" | "lg" | "xl";

export interface Preferences {
  id: "user";
  theme: Theme;
  studyMode: StudyMode;
  fontSize: FontSize;
  reducedMotion: boolean;
  highContrast: boolean;
  dyslexiaFont: boolean;
  soundEnabled: boolean;
  dailyGoalMinutes: number;
  strictGating: boolean;
  showStreak: boolean;
  streak: StreakState;
  updatedAt: number;
}

export const DEFAULT_PREFERENCES: Preferences = {
  id: "user",
  theme: "light",
  studyMode: "standard",
  fontSize: "md",
  reducedMotion: false,
  highContrast: false,
  dyslexiaFont: false,
  soundEnabled: true,
  dailyGoalMinutes: 20,
  strictGating: false,
  showStreak: true,
  streak: INITIAL_STREAK,
  updatedAt: 0,
};
