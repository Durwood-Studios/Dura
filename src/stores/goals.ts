import { create } from "zustand";
import { getAllGoals, putGoal, deleteGoal } from "@/lib/db/goals";
import { track } from "@/lib/analytics";
import type { Goal } from "@/types/goal";

interface GoalsState {
  goals: Goal[];
  loading: boolean;
  hydrated: boolean;

  load: () => Promise<void>;
  add: (goal: Goal) => Promise<void>;
  update: (id: string, patch: Partial<Goal>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  complete: (id: string) => Promise<void>;
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  loading: false,
  hydrated: false,

  load: async () => {
    set({ loading: true });
    const all = await getAllGoals();
    set({ goals: all, loading: false, hydrated: true });
  },

  add: async (goal) => {
    await putGoal(goal);
    void track("goal_set", { type: goal.type, target: goal.target, unit: goal.unit });
    set({ goals: [...get().goals, goal] });
  },

  update: async (id, patch) => {
    const goal = get().goals.find((g) => g.id === id);
    if (!goal) return;
    const next = { ...goal, ...patch };
    await putGoal(next);
    set({ goals: get().goals.map((g) => (g.id === id ? next : g)) });
  },

  remove: async (id) => {
    await deleteGoal(id);
    set({ goals: get().goals.filter((g) => g.id !== id) });
  },

  complete: async (id) => {
    const goal = get().goals.find((g) => g.id === id);
    if (!goal || goal.achievedAt !== null) return;
    const next: Goal = { ...goal, achievedAt: Date.now() };
    await putGoal(next);
    void track("goal_achieved", { type: goal.type, target: goal.target });
    set({ goals: get().goals.map((g) => (g.id === id ? next : g)) });
  },
}));
