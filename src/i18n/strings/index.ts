/**
 * Locale → strings dispatcher. Adding a new locale = adding a new
 * STRINGS_<LOCALE> import + entry in the map below + flipping
 * `enabled: true` in src/lib/i18n/languages.ts once the catalog is
 * complete.
 */
import { STRINGS_EN } from "./en";
import { STRINGS_ES_419 } from "./es-419";
import type { LocaleCode } from "@/lib/i18n/languages";
import type { Strings } from "./en";

const STRINGS_BY_LOCALE: Partial<Record<LocaleCode, Strings>> = {
  en: STRINGS_EN,
  "es-419": STRINGS_ES_419,
};

/**
 * Return the strings bundle for a given locale. Falls back to English
 * when the requested locale has no catalog yet — this is the right
 * behavior for partial-translation locales: the learner sees the
 * untranslated string in English rather than a `[missing]` marker.
 */
export function getStrings(locale: LocaleCode): Strings {
  return STRINGS_BY_LOCALE[locale] ?? STRINGS_EN;
}

export type { Strings } from "./en";
