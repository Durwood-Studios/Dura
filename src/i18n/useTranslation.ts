"use client";

import { useEffect, useState } from "react";
import {
  getEffectiveLocale,
  getStoredLocale,
  setStoredLocale,
  LOCALE_CHANGED_EVENT,
} from "@/lib/i18n/locale-storage";
import { findLocale, type LocaleCode } from "@/lib/i18n/languages";
import { getStrings, type Strings } from "./strings";

/**
 * useTranslation — subscribe to the active locale + return its strings.
 *
 * SSR posture: returns the English defaults synchronously. On client
 * mount the hook reads localStorage, dispatches a re-render if the
 * stored locale differs, and subscribes to in-tab changes from the
 * locale picker.
 *
 * The html `lang` attribute is updated as a side-effect so screen
 * readers and search engines see the right value. `dir` is set when
 * the locale's writing direction is RTL.
 */
interface TranslationState {
  /** Current locale code. */
  locale: LocaleCode;
  /** Translated strings bundle. */
  t: Strings;
  /** Update the stored preference + dispatch change. */
  setLocale: (next: LocaleCode) => void;
}

export function useTranslation(): TranslationState {
  const [locale, setLocale] = useState<LocaleCode>("en");

  useEffect(() => {
    const refresh = (): void => {
      const next = getStoredLocale() ?? getEffectiveLocale();
      setLocale(next);
      if (typeof document !== "undefined") {
        document.documentElement.lang = next;
        const entry = findLocale(next);
        document.documentElement.dir = entry?.direction ?? "ltr";
      }
    };
    refresh();
    if (typeof window === "undefined") return;
    window.addEventListener(LOCALE_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(LOCALE_CHANGED_EVENT, refresh);
  }, []);

  const apply = (next: LocaleCode): void => {
    const result = setStoredLocale(next);
    if (!result.ok) {
      console.warn("[i18n] couldn't set locale:", result.error);
    }
  };

  return { locale, t: getStrings(locale), setLocale: apply };
}
