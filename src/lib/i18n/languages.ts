/**
 * DURA's supported-language registry.
 *
 * The list matches the languages Apple supports on iOS 18, plus a few
 * additional locale variants that have meaningful learner populations
 * (en-IN, es-419, pt-PT). The choice to mirror Apple is deliberate:
 *
 *   1. Apple ships translations for these because the populations are
 *      large enough to justify the engineering. That's a good proxy
 *      for which languages DURA should reach.
 *   2. Learners on iPhone/iPad/Mac will have system fonts that render
 *      these scripts correctly, so DURA's text never falls back to
 *      Roman placeholder glyphs.
 *   3. It's a public, audited list — easy to defend as scope decisions
 *      come up.
 *
 * Status today: `enabled` is true ONLY for "en" (English, US). Every
 * other language is registered but disabled — the locale picker will
 * show them with a "coming soon" affordance. Adding a translation is a
 * matter of flipping `enabled` to true once the locale's strings are
 * complete.
 *
 * Translation strategy lives in ROADMAP.md §"Global reach + i18n".
 * Verification source: Apple's published localization list (iOS 18,
 * 2026 model year). Re-verify when Apple ships a new major version.
 */

export type LocaleCode =
  | "ar"
  | "bg"
  | "ca"
  | "zh-Hans"
  | "zh-Hant"
  | "zh-HK"
  | "hr"
  | "cs"
  | "da"
  | "nl"
  | "en"
  | "en-GB"
  | "en-AU"
  | "en-CA"
  | "en-IN"
  | "fi"
  | "fr"
  | "fr-CA"
  | "de"
  | "el"
  | "he"
  | "hi"
  | "hu"
  | "id"
  | "it"
  | "ja"
  | "kk"
  | "ko"
  | "ms"
  | "nb"
  | "pl"
  | "pt-BR"
  | "pt-PT"
  | "ro"
  | "ru"
  | "sk"
  | "es"
  | "es-MX"
  | "es-419"
  | "sv"
  | "fil"
  | "th"
  | "tr"
  | "uk"
  | "vi";

export interface LocaleEntry {
  /** BCP-47 locale code. */
  code: LocaleCode;
  /** Display name in English (for the picker). */
  englishName: string;
  /** Display name in its own language (for the picker). */
  nativeName: string;
  /** Writing direction. Used to set the `dir` attribute on `<html>`. */
  direction: "ltr" | "rtl";
  /** Is a translation available + production-ready? When false the
   *  picker shows a "coming soon" affordance and selecting it falls
   *  back to English. */
  enabled: boolean;
}

export const LOCALES: LocaleEntry[] = [
  { code: "ar", englishName: "Arabic", nativeName: "العربية", direction: "rtl", enabled: false },
  {
    code: "bg",
    englishName: "Bulgarian",
    nativeName: "Български",
    direction: "ltr",
    enabled: false,
  },
  { code: "ca", englishName: "Catalan", nativeName: "Català", direction: "ltr", enabled: false },
  {
    code: "zh-Hans",
    englishName: "Chinese (Simplified)",
    nativeName: "简体中文",
    direction: "ltr",
    enabled: false,
  },
  {
    code: "zh-Hant",
    englishName: "Chinese (Traditional)",
    nativeName: "繁體中文",
    direction: "ltr",
    enabled: false,
  },
  {
    code: "zh-HK",
    englishName: "Chinese (Hong Kong)",
    nativeName: "繁體中文(香港)",
    direction: "ltr",
    enabled: false,
  },
  { code: "hr", englishName: "Croatian", nativeName: "Hrvatski", direction: "ltr", enabled: false },
  { code: "cs", englishName: "Czech", nativeName: "Čeština", direction: "ltr", enabled: false },
  { code: "da", englishName: "Danish", nativeName: "Dansk", direction: "ltr", enabled: false },
  { code: "nl", englishName: "Dutch", nativeName: "Nederlands", direction: "ltr", enabled: false },
  {
    code: "en",
    englishName: "English (US)",
    nativeName: "English (US)",
    direction: "ltr",
    enabled: true,
  },
  {
    code: "en-GB",
    englishName: "English (UK)",
    nativeName: "English (UK)",
    direction: "ltr",
    enabled: false,
  },
  {
    code: "en-AU",
    englishName: "English (Australia)",
    nativeName: "English (Australia)",
    direction: "ltr",
    enabled: false,
  },
  {
    code: "en-CA",
    englishName: "English (Canada)",
    nativeName: "English (Canada)",
    direction: "ltr",
    enabled: false,
  },
  {
    code: "en-IN",
    englishName: "English (India)",
    nativeName: "English (India)",
    direction: "ltr",
    enabled: false,
  },
  { code: "fi", englishName: "Finnish", nativeName: "Suomi", direction: "ltr", enabled: false },
  { code: "fr", englishName: "French", nativeName: "Français", direction: "ltr", enabled: false },
  {
    code: "fr-CA",
    englishName: "French (Canada)",
    nativeName: "Français (Canada)",
    direction: "ltr",
    enabled: false,
  },
  { code: "de", englishName: "German", nativeName: "Deutsch", direction: "ltr", enabled: false },
  { code: "el", englishName: "Greek", nativeName: "Ελληνικά", direction: "ltr", enabled: false },
  { code: "he", englishName: "Hebrew", nativeName: "עברית", direction: "rtl", enabled: false },
  { code: "hi", englishName: "Hindi", nativeName: "हिन्दी", direction: "ltr", enabled: false },
  { code: "hu", englishName: "Hungarian", nativeName: "Magyar", direction: "ltr", enabled: false },
  {
    code: "id",
    englishName: "Indonesian",
    nativeName: "Bahasa Indonesia",
    direction: "ltr",
    enabled: false,
  },
  { code: "it", englishName: "Italian", nativeName: "Italiano", direction: "ltr", enabled: false },
  { code: "ja", englishName: "Japanese", nativeName: "日本語", direction: "ltr", enabled: false },
  { code: "kk", englishName: "Kazakh", nativeName: "Қазақ тілі", direction: "ltr", enabled: false },
  { code: "ko", englishName: "Korean", nativeName: "한국어", direction: "ltr", enabled: false },
  {
    code: "ms",
    englishName: "Malay",
    nativeName: "Bahasa Melayu",
    direction: "ltr",
    enabled: false,
  },
  {
    code: "nb",
    englishName: "Norwegian Bokmål",
    nativeName: "Norsk bokmål",
    direction: "ltr",
    enabled: false,
  },
  { code: "pl", englishName: "Polish", nativeName: "Polski", direction: "ltr", enabled: false },
  {
    code: "pt-BR",
    englishName: "Portuguese (Brazil)",
    nativeName: "Português (Brasil)",
    direction: "ltr",
    enabled: false,
  },
  {
    code: "pt-PT",
    englishName: "Portuguese (Portugal)",
    nativeName: "Português (Portugal)",
    direction: "ltr",
    enabled: false,
  },
  { code: "ro", englishName: "Romanian", nativeName: "Română", direction: "ltr", enabled: false },
  { code: "ru", englishName: "Russian", nativeName: "Русский", direction: "ltr", enabled: false },
  { code: "sk", englishName: "Slovak", nativeName: "Slovenčina", direction: "ltr", enabled: false },
  {
    code: "es",
    englishName: "Spanish (Spain)",
    nativeName: "Español (España)",
    direction: "ltr",
    enabled: false,
  },
  {
    code: "es-MX",
    englishName: "Spanish (Mexico)",
    nativeName: "Español (México)",
    direction: "ltr",
    enabled: false,
  },
  {
    code: "es-419",
    englishName: "Spanish (Latin America)",
    nativeName: "Español (Latinoamérica)",
    direction: "ltr",
    // Machine-translated UI catalog with human review on the
    // most-visible surfaces (locale picker copy, Discovery tagline,
    // Settings section titles). Lessons + dictionary stay English
    // for now — phased per ROADMAP §"Global reach + i18n".
    enabled: true,
  },
  { code: "sv", englishName: "Swedish", nativeName: "Svenska", direction: "ltr", enabled: false },
  {
    code: "fil",
    englishName: "Filipino",
    nativeName: "Filipino",
    direction: "ltr",
    enabled: false,
  },
  { code: "th", englishName: "Thai", nativeName: "ไทย", direction: "ltr", enabled: false },
  { code: "tr", englishName: "Turkish", nativeName: "Türkçe", direction: "ltr", enabled: false },
  {
    code: "uk",
    englishName: "Ukrainian",
    nativeName: "Українська",
    direction: "ltr",
    enabled: false,
  },
  {
    code: "vi",
    englishName: "Vietnamese",
    nativeName: "Tiếng Việt",
    direction: "ltr",
    enabled: false,
  },
];

/** Locale codes whose translations are production-ready today. */
export const ENABLED_LOCALES: LocaleCode[] = LOCALES.filter((l) => l.enabled).map((l) => l.code);

export const DEFAULT_LOCALE: LocaleCode = "en";

export function findLocale(code: string): LocaleEntry | undefined {
  return LOCALES.find((l) => l.code === code);
}

/**
 * Resolve the best-fit DURA locale for a browser language preference.
 *
 *   - Exact match wins ("zh-Hant" → "zh-Hant")
 *   - Otherwise, base-language match wins ("zh-TW" → "zh-Hant")
 *   - Otherwise, default
 *
 * Only enabled locales are considered. Disabled locales fall through
 * to the default until their translation lands.
 */
export function resolveLocale(preferred: string | null | undefined): LocaleCode {
  if (!preferred) return DEFAULT_LOCALE;
  const norm = preferred.replace("_", "-");
  const exact = LOCALES.find((l) => l.enabled && l.code.toLowerCase() === norm.toLowerCase());
  if (exact) return exact.code;
  const base = norm.split("-")[0]?.toLowerCase();
  if (!base) return DEFAULT_LOCALE;
  const fallback = LOCALES.find((l) => l.enabled && l.code.toLowerCase().startsWith(base));
  return fallback?.code ?? DEFAULT_LOCALE;
}
