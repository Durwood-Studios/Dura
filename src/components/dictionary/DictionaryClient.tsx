"use client";

import { useEffect, useMemo, useState } from "react";
import { searchTerms, getCategories } from "@/lib/dictionary";
import { PHASES } from "@/content/phases";
import { SearchBar } from "@/components/dictionary/SearchBar";
import { DifficultyToggle } from "@/components/dictionary/DifficultyToggle";
import { TermCard } from "@/components/dictionary/TermCard";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { DictionaryDifficulty } from "@/types/dictionary";

interface DictionaryClientProps {
  totalCount: number;
}

export function DictionaryClient({ totalCount }: DictionaryClientProps): React.ReactElement {
  const [query, setQuery] = useState("");
  const [phaseId, setPhaseId] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<DictionaryDifficulty>("intermediate");

  const categories = useMemo(() => getCategories(), []);
  const results = useMemo(
    () => searchTerms({ query, phaseId, category, limit: 200 }),
    [query, phaseId, category]
  );

  useEffect(() => {
    if (query) void track("dictionary_searched", { query, resultCount: results.length });
  }, [query, results.length]);

  const resetFilters = () => {
    setQuery("");
    setPhaseId(undefined);
    setCategory(undefined);
  };

  return (
    <div className="flex flex-col gap-6">
      <SearchBar value={query} onChange={setQuery} placeholder={`Search ${totalCount} terms…`} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPhaseId(undefined)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              phaseId === undefined
                ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
            )}
          >
            All phases
          </button>
          {PHASES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPhaseId(p.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition",
                phaseId === p.id
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
              )}
            >
              Phase {p.id}
            </button>
          ))}
        </div>
        <DifficultyToggle value={difficulty} onChange={setDifficulty} />
      </div>

      {categories.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase">Category</span>
          <button
            type="button"
            onClick={() => setCategory(undefined)}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition",
              category === undefined
                ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
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
                "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition",
                category === c
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {results.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-12 text-center">
          <p className="text-[var(--color-text-secondary)]">No terms match your search.</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-3 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
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

      <p className="text-center text-[10px] text-[var(--color-text-muted)]">
        Showing {results.length} of {totalCount} terms
      </p>
    </div>
  );
}
