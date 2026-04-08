import { create } from "zustand";

type ModalKey = "tip" | "share" | "settings" | "command" | null;

interface UIState {
  sidebarOpen: boolean;
  mobileNavOpen: boolean;
  commandPaletteOpen: boolean;
  modal: ModalKey;

  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
  toggleMobileNav: () => void;
  setMobileNav: (open: boolean) => void;
  toggleCommandPalette: () => void;
  openModal: (key: Exclude<ModalKey, null>) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  mobileNavOpen: false,
  commandPaletteOpen: false,
  modal: null,

  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  setSidebar: (open) => set({ sidebarOpen: open }),
  toggleMobileNav: () => set({ mobileNavOpen: !get().mobileNavOpen }),
  setMobileNav: (open) => set({ mobileNavOpen: open }),
  toggleCommandPalette: () => set({ commandPaletteOpen: !get().commandPaletteOpen }),
  openModal: (key) => set({ modal: key }),
  closeModal: () => set({ modal: null }),
}));
