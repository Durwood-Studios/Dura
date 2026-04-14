import { create } from "zustand";
import type { SkillAssessmentResult, PathId } from "@/types/skill-assessment";

interface AssessmentState {
  result: SkillAssessmentResult | null;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  setResult: (result: SkillAssessmentResult) => Promise<void>;
  setSelectedPath: (path: PathId) => Promise<void>;
}

const STORAGE_KEY = "dura-skill-assessment";

function loadFromStorage(): SkillAssessmentResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SkillAssessmentResult;
  } catch {
    return null;
  }
}

function saveToStorage(result: SkillAssessmentResult): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  } catch {
    // Private browsing — ignore
  }
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  result: null,
  hydrated: false,

  hydrate: async () => {
    const stored = loadFromStorage();
    set({ result: stored, hydrated: true });
  },

  setResult: async (result) => {
    saveToStorage(result);
    set({ result });
  },

  setSelectedPath: async (path) => {
    const current = get().result;
    if (!current) return;
    const updated = { ...current, selectedPath: path };
    saveToStorage(updated);
    set({ result: updated });
  },
}));
