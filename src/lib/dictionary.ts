import { DICTIONARY, DICTIONARY_BY_SLUG } from "@/content/dictionary";
import type { DictionaryTerm } from "@/types/dictionary";

export interface SearchOptions {
  query?: string;
  phaseId?: string;
  category?: string;
  limit?: number;
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Lightweight subsequence-aware fuzzy match. Returns a score in [0, 1].
 * 0 = no match, 1 = exact. Good enough for a 500-term dictionary without
 * pulling in a fuzzy-search library.
 */
function fuzzyScore(haystack: string, needle: string): number {
  if (!needle) return 1;
  const h = normalize(haystack);
  const n = normalize(needle);
  if (!h) return 0;
  if (h === n) return 1;
  if (h.startsWith(n)) return 0.9;
  if (h.includes(n)) return 0.75;

  // subsequence check
  let hi = 0;
  let matched = 0;
  for (let i = 0; i < n.length; i++) {
    while (hi < h.length && h[hi] !== n[i]) hi++;
    if (hi >= h.length) return 0;
    matched++;
    hi++;
  }
  return matched === n.length ? 0.4 : 0;
}

function scoreTerm(term: DictionaryTerm, query: string): number {
  const candidates = [term.term, ...term.aliases, term.slug];
  let best = 0;
  for (const candidate of candidates) {
    const score = fuzzyScore(candidate, query);
    if (score > best) best = score;
  }
  return best;
}

export function searchTerms(options: SearchOptions = {}): DictionaryTerm[] {
  const { query, phaseId, category, limit = 50 } = options;

  let filtered = DICTIONARY;
  if (phaseId) filtered = filtered.filter((t) => t.phaseIds.includes(phaseId));
  if (category) filtered = filtered.filter((t) => t.category === category);

  if (!query) {
    return filtered.slice(0, limit).sort((a, b) => a.term.localeCompare(b.term));
  }

  const scored = filtered
    .map((term) => ({ term, score: scoreTerm(term, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.term.term.localeCompare(b.term.term))
    .slice(0, limit);

  return scored.map((entry) => entry.term);
}

export function getTerm(slug: string): DictionaryTerm | undefined {
  return DICTIONARY_BY_SLUG.get(slug);
}

export function getTermsByLesson(lessonId: string): DictionaryTerm[] {
  return DICTIONARY.filter((t) => t.lessonIds.includes(lessonId));
}

export function getTermsByPhase(phaseId: string): DictionaryTerm[] {
  return DICTIONARY.filter((t) => t.phaseIds.includes(phaseId));
}

export function getCategories(): string[] {
  return Array.from(new Set(DICTIONARY.map((t) => t.category))).sort();
}
