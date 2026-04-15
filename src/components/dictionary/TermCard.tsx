"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Check, ArrowRight } from "lucide-react";
import { createCard } from "@/lib/fsrs";
import { getCardByTermSlug, putCard } from "@/lib/db/flashcards";
import { generateId, cn } from "@/lib/utils";
import { track } from "@/lib/analytics";
import type { DictionaryDifficulty, DictionaryTerm } from "@/types/dictionary";

/** Phase colors — avoids importing the full PHASES array into the client bundle. */
const PHASE_COLORS: Record<string, string> = {
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

interface TermCardProps {
  term: DictionaryTerm;
  difficulty: DictionaryDifficulty;
}

export function TermCard({ term, difficulty }: TermCardProps): React.ReactElement {
  const [inDeck, setInDeck] = useState(false);

  useEffect(() => {
    void getCardByTermSlug(term.slug).then((card) => {
      if (card) setInDeck(true);
    });
  }, [term.slug]);

  const addToDeck = async () => {
    const existing = await getCardByTermSlug(term.slug);
    if (existing) {
      setInDeck(true);
      return;
    }
    const card = createCard({
      id: generateId("card"),
      front: term.term,
      back: term.definitions[difficulty],
      termSlug: term.slug,
    });
    await putCard(card);
    setInDeck(true);
    void track("flashcard_rated", { source: "dictionary", slug: term.slug });
  };

  const firstPhase = term.phaseIds[0];
  const phaseColor = firstPhase ? PHASE_COLORS[firstPhase] : undefined;

  return (
    <article className="dura-card flex items-stretch overflow-hidden">
      {/* Category-colored left border */}
      <div
        className="w-1 shrink-0 rounded-l-2xl"
        style={{ background: phaseColor ?? "var(--color-accent-emerald)" }}
      />

      <div className="flex flex-1 flex-col gap-3 p-5">
        <header className="flex items-start justify-between gap-3">
          <Link
            href={`/dictionary/${term.slug}`}
            className="font-mono text-base font-medium text-[var(--color-text-primary)] transition hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            {term.term}
          </Link>
          {firstPhase && (
            <span
              className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
              style={{
                backgroundColor: `${phaseColor ?? "#10b981"}20`,
                color: phaseColor,
              }}
            >
              Phase {firstPhase}
            </span>
          )}
        </header>

        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {term.definitions[difficulty]}
        </p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-[10px] text-[var(--color-text-muted)]">
            {term.lessonIds.length > 0
              ? `Used in ${term.lessonIds.length} lesson${term.lessonIds.length === 1 ? "" : "s"}`
              : term.category}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void addToDeck()}
              disabled={inDeck}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition",
                inDeck
                  ? "dura-glow-emerald border-emerald-400/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-emerald-400/50 hover:bg-emerald-500/5 hover:text-emerald-600 dark:hover:text-emerald-400"
              )}
            >
              {inDeck ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              {inDeck ? "In deck" : "Add"}
            </button>
            <Link
              href={`/dictionary/${term.slug}`}
              className="inline-flex items-center gap-0.5 text-[11px] font-medium text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-400"
            >
              Open
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
