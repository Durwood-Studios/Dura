"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Check } from "lucide-react";
import { getTerm } from "@/lib/dictionary";
import { getCardByTermSlug, putCard } from "@/lib/db/flashcards";
import { createCard } from "@/lib/fsrs";
import { usePreferencesStore } from "@/stores/preferences";
import { track } from "@/lib/analytics";
import { generateId, cn } from "@/lib/utils";
import type { DictionaryDifficulty } from "@/types/dictionary";

interface VocabTooltipProps {
  slug: string;
  children?: React.ReactNode;
}

const TIERS: { value: DictionaryDifficulty; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

/**
 * Vocabulary tooltip with three-tier definitions, FSRS-aware
 * "add to flashcards", in-deck detection, and see-also links.
 */
export function VocabTooltip({ slug, children }: VocabTooltipProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [inDeck, setInDeck] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [tier, setTier] = useState<DictionaryDifficulty>("intermediate");
  const term = getTerm(slug);

  // Tier preference: map fontSize-style preference if present, otherwise default
  const userTier = usePreferencesStore((s) => {
    const v = (s.prefs as unknown as { dictionaryTier?: DictionaryDifficulty }).dictionaryTier;
    return v ?? "intermediate";
  });

  useEffect(() => {
    setTier(userTier);
  }, [userTier]);

  useEffect(() => {
    if (!open || inDeck) return;
    void getCardByTermSlug(slug).then((card) => {
      if (card) setInDeck(true);
    });
  }, [open, slug, inDeck]);

  if (!term) {
    return <span>{children ?? slug}</span>;
  }

  const toggle = () => {
    setOpen((v) => {
      if (!v) void track("dictionary_term_viewed", { slug });
      return !v;
    });
  };

  const addToDeck = async () => {
    try {
      const existing = await getCardByTermSlug(slug);
      if (existing) {
        setInDeck(true);
        return;
      }
      const card = createCard({
        id: generateId("card"),
        front: term.term,
        back: term.definitions[tier],
        termSlug: slug,
      });
      await putCard(card);
      setInDeck(true);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
      void track("flashcard_rated", { source: "vocab-tooltip", slug });
    } catch (error) {
      console.error("[VocabTooltip] Failed to add to deck:", error);
    }
  };

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className={cn(
          "inline border-b border-dotted border-emerald-500 text-[var(--color-text-primary)] underline-offset-4 transition hover:text-emerald-700",
          open && "text-emerald-700"
        )}
      >
        {children ?? term.term}
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute top-full left-0 z-30 mt-2 block w-80 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 text-left shadow-xl"
        >
          <span className="mb-2 flex items-center justify-between">
            <strong className="text-sm text-[var(--color-text-primary)]">{term.term}</strong>
            <span className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-0.5">
              {TIERS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTier(t.value)}
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-medium transition",
                    tier === t.value
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </span>
          </span>
          <span className="mb-3 block text-xs leading-relaxed text-[var(--color-text-secondary)]">
            {term.definitions[tier]}
          </span>
          {term.seeAlso.length > 0 && (
            <span className="mb-3 block text-[10px] text-[var(--color-text-muted)]">
              See also:{" "}
              {term.seeAlso.map((s, i) => (
                <span key={s}>
                  <Link href={`/dictionary/${s}`} className="text-emerald-600 hover:underline">
                    {s}
                  </Link>
                  {i < term.seeAlso.length - 1 && ", "}
                </span>
              ))}
            </span>
          )}
          <span className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void addToDeck()}
              disabled={inDeck}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition",
                inDeck
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-emerald-400 hover:text-emerald-700"
              )}
            >
              {inDeck ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              {inDeck ? "In your deck" : "Add to flashcards"}
            </button>
            {justAdded && <span className="text-[10px] text-emerald-600">Added “{term.term}”</span>}
            <Link
              href={`/dictionary/${slug}`}
              className="ml-auto text-[11px] font-medium text-emerald-600 hover:text-emerald-700"
            >
              View in dictionary →
            </Link>
          </span>
        </span>
      )}
    </span>
  );
}
