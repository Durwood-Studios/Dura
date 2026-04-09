import { create } from "zustand";
import { generateId } from "@/lib/utils";

export type ToastKind = "xp" | "level-up" | "streak";

export interface Toast {
  id: string;
  kind: ToastKind;
  amount?: number;
  message?: string;
  createdAt: number;
}

interface ToastsState {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id" | "createdAt">) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const useToastsStore = create<ToastsState>((set, get) => ({
  toasts: [],

  push: (toast) => {
    const entry: Toast = {
      ...toast,
      id: generateId("toast"),
      createdAt: Date.now(),
    };
    set({ toasts: [...get().toasts, entry] });
    const ttl = toast.kind === "level-up" ? 3000 : 2200;
    setTimeout(() => get().dismiss(entry.id), ttl);
  },

  dismiss: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  clear: () => set({ toasts: [] }),
}));
