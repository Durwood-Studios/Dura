import { create } from "zustand";
import { getSkillAssessment, putSkillAssessment } from "@/lib/db/skill-assessment";
import type { SkillAssessmentResult, PathId } from "@/types/skill-assessment";

interface AssessmentState {
  result: SkillAssessmentResult | null;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  setResult: (result: SkillAssessmentResult) => Promise<void>;
  setSelectedPath: (path: PathId) => Promise<void>;
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  result: null,
  hydrated: false,

  hydrate: async () => {
    try {
      const stored = await getSkillAssessment();
      set({ result: stored, hydrated: true });
    } catch (error) {
      console.error("[assessment] hydrate failed:", error);
      set({ hydrated: true });
    }
  },

  setResult: async (result) => {
    await putSkillAssessment(result);
    set({ result });
  },

  setSelectedPath: async (path) => {
    const current = get().result;
    if (!current) return;
    const updated = { ...current, selectedPath: path };
    await putSkillAssessment(updated);
    set({ result: updated });
  },
}));
