"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { SearchBar } from "@/components/dictionary/SearchBar";
import { DifficultyToggle } from "@/components/dictionary/DifficultyToggle";
import { TermCard } from "@/components/dictionary/TermCard";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { DictionaryDifficulty, DictionaryTerm } from "@/types/dictionary";

interface DictionaryClientProps {
  /** Initial batch of terms (first 50, server-rendered). */
  initialTerms: DictionaryTerm[];
  /** Pre-computed category list from the server, ordered by term count. */
  categories: string[];
  totalCount: number;
}

/** Display labels for the canonical 12-category taxonomy (post-migration
 *  per xDocs/active/universality-and-dictionary-audit-2026-05.md §3). */
const CATEGORY_LABELS: Record<string, string> = {
  fundamentals: "Fundamentals",
  professional: "Professional",
  ai: "AI & ML",
  web: "Web & frontend",
  systems: "Systems",
  backend: "Backend",
  devops: "DevOps & infra",
  databases: "Databases",
  networking: "Networking",
  quality: "Quality",
  security: "Security",
  languages: "Languages",
};

/** How many category chips show by default on mobile before the "More"
 *  expander kicks in. Desktop shows all (they fit on one row). */
const MOBILE_VISIBLE_CHIPS = 5;

export function DictionaryClient({
  initialTerms,
  categories,
  totalCount,
}: DictionaryClientProps): React.ReactElement {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<DictionaryDifficulty>("intermediate");
  const [terms, setTerms] = useState<DictionaryTerm[]>(initialTerms);
  const [loading, setLoading] = useState(false);
  const [showAllChips, setShowAllChips] = useState(false);

  const fetchTerms = useCallback(async (q: string, cat?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (cat) params.set("category", cat);
      params.set("limit", "200");

      const res = await fetch(`/api/v1/terms?${params.toString()}`);
      if (!res.ok) return;
      const json = await res.json();
      const fetched: DictionaryTerm[] = json.data.terms.map(
        (t: {
          slug: string;
          term: string;
          category: string;
          phaseIds: string[];
          definition: string;
        }) => ({
          slug: t.slug,
          term: t.term,
          category: t.category,
          phaseIds: t.phaseIds,
          definitions: {
            beginner: t.definition,
            intermediate: t.definition,
            advanced: t.definition,
          },
          aliases: [],
          seeAlso: [],
          lessonIds: [],
        })
      );
      setTerms(fetched);
    } catch (error) {
      console.error("[dictionary] fetch failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const hasFilters = query || category;
  useEffect(() => {
    if (!hasFilters) {
      setTerms(initialTerms);
      return;
    }
    void fetchTerms(query, category);
  }, [query, category, fetchTerms, hasFilters, initialTerms]);

  useEffect(() => {
    if (query) void track("dictionary_searched", { query, resultCount: terms.length });
  }, [query, terms.length]);

  const resetFilters = (): void => {
    setQuery("");
    setCategory(undefined);
  };

  const results = terms;
  const hasHiddenChips = categories.length > MOBILE_VISIBLE_CHIPS;
  const visibleCategories = showAllChips ? categories : categories.slice(0, MOBILE_VISIBLE_CHIPS);

  return (
    <div className="flex flex-col gap-6">
      <SearchBar value={query} onChange={setQuery} placeholder={`Search ${totalCount} terms…`} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Category chips — single filter axis. Phase filter dropped per
            xDocs/active/universality-and-dictionary-audit-2026-05.md §3:
            phases are about lesson progression; the dictionary is reference
            material every learner uses regardless of where they are in the
            curriculum. */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCategory(undefined)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition",
              category === undefined
                ? "dura-glow-emerald bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
            )}
          >
            All
          </button>
          {visibleCategories.map((c) => {
            const isActive = category === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-medium transition",
                  isActive
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                )}
              >
                {CATEGORY_LABELS[c] ?? c}
              </button>
            );
          })}
          {hasHiddenChips && (
            <button
              type="button"
              onClick={() => setShowAllChips((v) => !v)}
              aria-expanded={showAllChips}
              className="flex items-center gap-1 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-subtle)] sm:hidden"
            >
              {showAllChips ? "Fewer" : `More (${categories.length - MOBILE_VISIBLE_CHIPS})`}
              <ChevronDown
                className={cn("h-3 w-3 transition-transform", showAllChips && "rotate-180")}
                aria-hidden
              />
            </button>
          )}
          {/* On sm+ render the remaining chips inline instead of behind the expander. */}
          {hasHiddenChips &&
            categories.slice(MOBILE_VISIBLE_CHIPS).map((c) => {
              const isActive = category === c;
              return (
                <button
                  key={`sm-${c}`}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "hidden rounded-full px-3.5 py-1.5 text-xs font-medium transition sm:inline-block",
                    isActive
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                  )}
                >
                  {CATEGORY_LABELS[c] ?? c}
                </button>
              );
            })}
        </div>
        <DifficultyToggle value={difficulty} onChange={setDifficulty} />
      </div>

      {loading && <p className="text-center text-sm text-[var(--color-text-muted)]">Loading…</p>}

      {!loading && results.length === 0 ? (
        <div className="dura-card p-12 text-center">
          <p className="text-[var(--color-text-secondary)]">No terms match your search.</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-3 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-subtle)]"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {results.map((term) => (
            <li key={term.slug}>
              <TermCard term={term} difficulty={difficulty} />
            </li>
          ))}
        </ul>
      )}

      {/* Term count */}
      <p className="text-center text-xs text-[var(--color-text-muted)]">
        Showing <span className="dura-stat-gradient font-semibold">{results.length}</span> of{" "}
        <span className="dura-stat-gradient font-semibold">{totalCount}</span> terms
      </p>
    </div>
  );
}
