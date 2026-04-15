"use client";

import { useCallback, useEffect, useState } from "react";
import { SearchBar } from "@/components/dictionary/SearchBar";
import { DifficultyToggle } from "@/components/dictionary/DifficultyToggle";
import { TermCard } from "@/components/dictionary/TermCard";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { DictionaryDifficulty, DictionaryTerm } from "@/types/dictionary";

/** Phase colors for filter chips. */
const PHASE_CHIP_COLORS: Record<string, string> = {
  "0": "#6ee7b7",
  "1": "#93c5fd",
  "2": "#c4b5fd",
  "3": "#fda4af",
  "4": "#fdba74",
  "5": "#f0abfc",
  "6": "#67e8f9",
  "7": "#fcd34d",
  "8": "#a3e635",
  "9": "#f472b6",
};

interface DictionaryClientProps {
  /** Initial batch of terms (first 50, server-rendered). */
  initialTerms: DictionaryTerm[];
  /** Pre-computed category list from the server. */
  categories: string[];
  totalCount: number;
}

/** Phase IDs for the filter bar. */
const PHASE_IDS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function DictionaryClient({
  initialTerms,
  categories,
  totalCount,
}: DictionaryClientProps): React.ReactElement {
  const [query, setQuery] = useState("");
  const [phaseId, setPhaseId] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<DictionaryDifficulty>("intermediate");
  const [terms, setTerms] = useState<DictionaryTerm[]>(initialTerms);
  const [loading, setLoading] = useState(false);

  const fetchTerms = useCallback(async (q: string, phase?: string, cat?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (phase) params.set("phase", phase);
      if (cat) params.set("category", cat);
      params.set("limit", "200");

      const res = await fetch(`/api/v1/terms?${params.toString()}`);
      if (!res.ok) return;
      const json = await res.json();
      // API returns { ok, data: { terms: [...] } } — terms are slim (slug, term, category, phaseIds, definition)
      // We need to map them to DictionaryTerm shape for TermCard
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

  // Fetch on filter change (skip initial render — initialTerms covers that)
  const hasFilters = query || phaseId || category;
  useEffect(() => {
    if (!hasFilters) {
      setTerms(initialTerms);
      return;
    }
    void fetchTerms(query, phaseId, category);
  }, [query, phaseId, category, fetchTerms, hasFilters, initialTerms]);

  useEffect(() => {
    if (query) void track("dictionary_searched", { query, resultCount: terms.length });
  }, [query, terms.length]);

  const resetFilters = () => {
    setQuery("");
    setPhaseId(undefined);
    setCategory(undefined);
  };

  const results = terms;

  return (
    <div className="flex flex-col gap-6">
      <SearchBar value={query} onChange={setQuery} placeholder={`Search ${totalCount} terms…`} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Phase filter chips */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPhaseId(undefined)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition",
              phaseId === undefined
                ? "dura-glow-emerald bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
            )}
          >
            All phases
          </button>
          {PHASE_IDS.map((id) => {
            const color = PHASE_CHIP_COLORS[id];
            const isActive = phaseId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setPhaseId(id)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-medium transition",
                  isActive
                    ? "font-semibold text-white dark:text-[var(--color-bg-primary)]"
                    : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
                )}
                style={
                  isActive ? { background: color, boxShadow: `0 0 12px ${color}40` } : undefined
                }
              >
                Phase {id}
              </button>
            );
          })}
        </div>
        <DifficultyToggle value={difficulty} onChange={setDifficulty} />
      </div>

      {categories.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold tracking-wider text-[var(--color-text-muted)] uppercase">
            Category
          </span>
          <button
            type="button"
            onClick={() => setCategory(undefined)}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-medium transition",
              category === undefined
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
            )}
          >
            all
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-medium transition",
                category === c
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                  : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

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
