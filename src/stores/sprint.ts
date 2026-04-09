import { create } from "zustand";
import { track } from "@/lib/analytics";

export type SprintPhase = "idle" | "working" | "break" | "long-break" | "done";

const WORK_MS = 25 * 60 * 1000;
const BREAK_MS = 5 * 60 * 1000;
const LONG_BREAK_MS = 15 * 60 * 1000;
const TOTAL_SPRINTS = 4;

interface SprintState {
  phase: SprintPhase;
  endsAt: number | null;
  sprintIndex: number; // 1-based
  totalSprints: number;

  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: (now: number) => void;
}

export const useSprintStore = create<SprintState>((set, get) => ({
  phase: "idle",
  endsAt: null,
  sprintIndex: 1,
  totalSprints: TOTAL_SPRINTS,

  start: () => {
    const state = get();
    if (state.phase === "idle" || state.phase === "done") {
      set({
        phase: "working",
        endsAt: Date.now() + WORK_MS,
        sprintIndex: 1,
      });
      void track("study_mode_changed", { to: "sprint" });
    }
  },

  pause: () => {
    set({ phase: "idle", endsAt: null });
  },

  reset: () => {
    set({ phase: "idle", endsAt: null, sprintIndex: 1 });
  },

  tick: (now) => {
    const state = get();
    if (state.phase === "idle" || state.phase === "done" || !state.endsAt) return;
    if (now < state.endsAt) return;

    if (state.phase === "working") {
      const isLastSprint = state.sprintIndex >= state.totalSprints;
      if (isLastSprint) {
        set({
          phase: "long-break",
          endsAt: now + LONG_BREAK_MS,
        });
      } else {
        set({
          phase: "break",
          endsAt: now + BREAK_MS,
        });
      }
    } else if (state.phase === "break") {
      set({
        phase: "working",
        endsAt: now + WORK_MS,
        sprintIndex: state.sprintIndex + 1,
      });
    } else if (state.phase === "long-break") {
      set({ phase: "done", endsAt: null });
    }
  },
}));
