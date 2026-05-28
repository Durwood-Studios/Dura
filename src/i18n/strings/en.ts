/**
 * English-baseline UI strings.
 *
 * This file is the single source of truth for the SHAPE of every
 * translatable surface DURA ships. Adding a new key here is the prompt
 * for translators to add the same key in every locale file under
 * src/i18n/strings/<locale>.ts. The `Strings` type derived from this
 * object enforces parity at the type level.
 *
 * Scope today (the bounded PoC per ROADMAP §"Global reach + i18n"
 * Phase 1): UI labels in Settings, Discovery Zone surfaces, and the
 * locale picker itself. Lesson MDX and dictionary definitions live in
 * locale-keyed sidecar files, not here.
 */

export interface Strings {
  locale: {
    name: string;
    hint: string;
    machineTranslatedBadge: string;
    comingSoon: string;
  };
  discoverZone: {
    title: string;
    tagline: string;
    chooseRoom: string;
  };
  settings: {
    appearance: string;
    accessibility: string;
    learning: string;
    notifications: string;
    data: string;
    privacy: string;
    aiFeatures: string;
    saveProgress: string;
    restoreFromFile: string;
    clearAllData: string;
  };
}

export const STRINGS_EN: Strings = {
  locale: {
    name: "Language",
    hint: "Switch DURA's interface language. Lesson and dictionary translation rolls out phase by phase — see ROADMAP for status.",
    machineTranslatedBadge: "Machine-translated",
    comingSoon: "Coming soon",
  },
  discoverZone: {
    title: "Discovery Zone",
    tagline: "Twenty interactive activities. No reading walls, no account.",
    chooseRoom: "Choose a room",
  },
  settings: {
    appearance: "Appearance",
    accessibility: "Accessibility",
    learning: "Learning",
    notifications: "Notifications",
    data: "Data",
    privacy: "Privacy",
    aiFeatures: "AI features",
    saveProgress: "Save progress to file",
    restoreFromFile: "Restore from file",
    clearAllData: "Clear all data",
  },
};
