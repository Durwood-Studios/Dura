/**
 * Locale preference — local-only storage, SSR-safe.
 *
 * Stores the learner's choice of UI locale under `dura:i18n:locale`.
 * The value is constrained to enabled locales at read time so that a
 * locale that goes from enabled to disabled (e.g. machine translation
 * pulled while community improvements land) gracefully falls back to
 * the default rather than throwing.
 *
 * Implementation note: this module does NOT load translation strings.
 * That's the job of the next-intl wiring that lands when the first
 * non-English locale ships. Today the module exists so the storage
 * layer is ready and the language picker has a real preference to
 * write to.
 */
import {
  DEFAULT_LOCALE,
  ENABLED_LOCALES,
  findLocale,
  resolveLocale,
  type LocaleCode,
} from "./languages";

const STORAGE_KEY = "dura:i18n:locale";

/** Custom event broadcast on locale change for in-tab subscribers. */
export const LOCALE_CHANGED_EVENT = "dura:locale-changed";

function dispatchLocaleChanged(): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new Event(LOCALE_CHANGED_EVENT));
  } catch {
    // ignore — defensive against environments without dispatchEvent
  }
}

/**
 * Read the stored preference. Returns `null` if the learner has not
 * picked yet (the picker should default to the resolved browser
 * preference in that case via `resolveLocale(navigator.language)`).
 */
export function getStoredLocale(): LocaleCode | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const entry = findLocale(raw);
    if (!entry?.enabled) return null;
    return entry.code;
  } catch {
    return null;
  }
}

/** Effective locale = stored preference, or browser-resolved, or default. */
export function getEffectiveLocale(): LocaleCode {
  const stored = getStoredLocale();
  if (stored) return stored;
  if (typeof navigator !== "undefined") {
    return resolveLocale(navigator.language);
  }
  return DEFAULT_LOCALE;
}

export type SetLocaleResult = { ok: true } | { ok: false; error: string };

export function setStoredLocale(code: LocaleCode): SetLocaleResult {
  const entry = findLocale(code);
  if (!entry) return { ok: false, error: `Unknown locale: ${code}` };
  if (!entry.enabled) {
    return {
      ok: false,
      error: `${entry.englishName} translation isn't ready yet — coming soon.`,
    };
  }
  if (typeof localStorage === "undefined") {
    return { ok: false, error: "Local storage unavailable." };
  }
  try {
    localStorage.setItem(STORAGE_KEY, code);
    dispatchLocaleChanged();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: `Couldn't save the locale: ${(err as Error).message}` };
  }
}

export function clearStoredLocale(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    dispatchLocaleChanged();
  } catch {
    // ignore — defensive
  }
}

export { ENABLED_LOCALES };
