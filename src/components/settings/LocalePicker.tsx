"use client";

import { Globe } from "lucide-react";
import { LOCALES, type LocaleCode } from "@/lib/i18n/languages";
import { useTranslation } from "@/i18n/useTranslation";

/**
 * Locale picker — surfaces every locale the registry knows about,
 * grouped by enabled vs coming-soon. Selecting an enabled locale
 * dispatches the locale-changed event and the rest of the app updates
 * via useTranslation subscribers.
 *
 * The picker is honest about translation status: every non-English
 * locale that's enabled today is machine-translated and labeled as
 * such. Community refinement of those strings is the right path
 * forward and welcome via PR (see ROADMAP §"Global reach + i18n").
 */
export function LocalePicker(): React.ReactElement {
  const { locale, t, setLocale } = useTranslation();

  const enabled = LOCALES.filter((l) => l.enabled);
  const upcoming = LOCALES.filter((l) => !l.enabled);

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="dura-locale-picker"
        className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]"
      >
        <Globe className="h-4 w-4 text-[var(--color-accent)]" aria-hidden />
        {t.locale.name}
      </label>
      <select
        id="dura-locale-picker"
        value={locale}
        onChange={(e) => setLocale(e.target.value as LocaleCode)}
        className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none sm:w-auto"
      >
        <optgroup label={t.locale.name}>
          {enabled.map((l) => (
            <option key={l.code} value={l.code}>
              {l.nativeName} ({l.englishName})
              {l.code !== "en" ? " · " + t.locale.machineTranslatedBadge : ""}
            </option>
          ))}
        </optgroup>
        <optgroup label={t.locale.comingSoon} disabled>
          {upcoming.map((l) => (
            <option key={l.code} value={l.code} disabled>
              {l.nativeName} ({l.englishName})
            </option>
          ))}
        </optgroup>
      </select>
      <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">{t.locale.hint}</p>
    </div>
  );
}
