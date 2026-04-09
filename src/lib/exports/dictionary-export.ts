import { DICTIONARY } from "@/content/dictionary";
import { toCSV } from "@/lib/exports/csv";

/**
 * Dictionary as CSV — one row per term, all three difficulty tiers.
 * Safe to paste into Google Sheets, Excel, or a flashcard importer.
 */
export function dictionaryCSV(): string {
  const rows = DICTIONARY.map((t) => ({
    slug: t.slug,
    term: t.term,
    category: t.category,
    aliases: t.aliases,
    phases: t.phaseIds,
    beginner: t.definitions.beginner,
    intermediate: t.definitions.intermediate,
    advanced: t.definitions.advanced,
    see_also: t.seeAlso,
  }));
  return toCSV(rows, [
    "slug",
    "term",
    "category",
    "aliases",
    "phases",
    "beginner",
    "intermediate",
    "advanced",
    "see_also",
  ]);
}

/**
 * Anki-compatible plain-text import. Uses a tab separator (Anki's default)
 * with two fields per line: front<TAB>back. The back carries all three
 * tiers separated by <br> tags so the imported card renders nicely.
 * Save as .txt and import in Anki with tab as the field separator.
 */
export function dictionaryAnki(): string {
  const escape = (s: string) => s.replace(/\t/g, " ").replace(/\r?\n/g, " ").trim();
  return DICTIONARY.map((t) => {
    const back = [
      `<b>Beginner.</b> ${t.definitions.beginner}`,
      `<b>Intermediate.</b> ${t.definitions.intermediate}`,
      `<b>Advanced.</b> ${t.definitions.advanced}`,
    ]
      .map(escape)
      .join("<br><br>");
    return `${escape(t.term)}\t${back}`;
  }).join("\n");
}

/** Full raw dump as JSON. */
export function dictionaryJSON(): unknown {
  return {
    exportedAt: new Date().toISOString(),
    count: DICTIONARY.length,
    terms: DICTIONARY,
  };
}
