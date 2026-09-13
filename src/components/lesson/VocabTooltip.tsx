"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Popover } from "@base-ui/react/popover";
import { Plus, Check } from "lucide-react";
import { getCardByTermSlug, putCard } from "@/lib/db/flashcards";
import { createCard } from "@/lib/fsrs";
import { usePreferencesStore } from "@/stores/preferences";
import { track } from "@/lib/analytics";
import { generateId, cn } from "@/lib/utils";
import type { DictionaryDifficulty, DictionaryTerm } from "@/types/dictionary";

interface VocabTooltipProps {
  slug: string;
  children?: React.ReactNode;
}

const TIERS: { value: DictionaryDifficulty; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

/** Cache fetched terms in memory so repeated opens don't re-fetch. */
const termCache = new Map<string, DictionaryTerm | null>();

async function fetchTerm(slug: string): Promise<DictionaryTerm | null> {
  if (termCache.has(slug)) return termCache.get(slug) ?? null;
  try {
    const res = await fetch(`/api/v1/terms/${encodeURIComponent(slug)}`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      return null;
    }
    const json = await res.json();
    const term = json.data as DictionaryTerm;
    termCache.set(slug, term);
    return term;
  } catch {
    return null;
  }
}

/**
 * Vocabulary tooltip with three-tier definitions, FSRS-aware
 * "add to flashcards", in-deck detection, and see-also links.
 * Term data is fetched lazily from the API on first open.
 */
export function VocabTooltip({ slug, children }: VocabTooltipProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState<DictionaryTerm | null>(null);
  const [inDeck, setInDeck] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const [tier, setTier] = useState<DictionaryDifficulty>("intermediate");
  const [isLoading, setIsLoading] = useState(false);

  const userTier = usePreferencesStore((s) => {
    const v = (s.prefs as unknown as { dictionaryTier?: DictionaryDifficulty }).dictionaryTier;
    return v ?? "intermediate";
  });

  const [previousTier, setPreviousTier] = useState(userTier);
  if (userTier !== previousTier) {
    setPreviousTier(userTier);
    setTier(userTier);
  }

  useEffect(() => {
    if (!open) return;
    let isCurrent = true;
    void fetchTerm(slug).then((value) => {
      if (!isCurrent) return;
      setTerm(value);
      setIsLoading(false);
    });
    void getCardByTermSlug(slug)
      .then((card) => {
        if (isCurrent) setInDeck(!!card);
      })
      .catch((error: unknown) => {
        console.error("[VocabTooltip] Could not inspect the flashcard deck:", error);
      });
    return () => {
      isCurrent = false;
    };
  }, [open, slug]);

  const changeOpen = (next: boolean): void => {
    setOpen(next);
    if (next) {
      setIsLoading(true);
      setTerm(termCache.get(slug) ?? null);
      void track("dictionary_term_viewed", { slug });
    }
  };

  const addToDeck = async () => {
    if (!term) return;
    setSaveError(null);
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
      setSaveError("Could not save this card. Please retry.");
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={changeOpen}>
      <Popover.Trigger
        type="button"
        aria-expanded={open}
        className={cn(
          "inline border-b border-dotted border-emerald-500 text-[var(--color-text-primary)] underline-offset-4 transition hover:text-emerald-700",
          open && "text-emerald-700"
        )}
      >
        {children ?? slug}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          side="bottom"
          align="start"
          sideOffset={8}
          positionMethod="fixed"
          sticky
          collisionPadding={12}
          collisionAvoidance={{ side: "flip", align: "shift" }}
          className="z-50"
        >
          <Popover.Popup
            role="dialog"
            aria-label={`Definition: ${term?.term ?? slug}`}
            className="block max-h-[min(var(--available-height),calc(100dvh-24px))] w-80 max-w-[min(var(--available-width),calc(100vw-24px))] overflow-y-auto overscroll-contain rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 text-left break-words shadow-xl focus:outline-none"
          >
            {!term ? (
              <span className="block text-xs text-[var(--color-text-muted)]">
                {isLoading
                  ? "Loading…"
                  : "Definition unavailable. Close and reopen to retry when connected."}
              </span>
            ) : (
              <>
                <span className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-sm text-[var(--color-text-primary)]">{term.term}</strong>
                  <span className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-0.5">
                    {TIERS.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setTier(t.value)}
                        className={cn(
                          "rounded px-1.5 py-0.5 text-xs font-medium transition",
                          tier === t.value
                            ? "bg-[var(--color-bg-surface)] text-emerald-700 shadow-sm"
                            : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </span>
                </span>
                <span className="mb-3 block text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {term.definitions[tier]}
                </span>
                {term.seeAlso.length > 0 && (
                  <span className="mb-3 block text-xs text-[var(--color-text-muted)]">
                    See also:{" "}
                    {term.seeAlso.map((s, i) => (
                      <span key={s}>
                        <Link
                          href={`/dictionary/${s}`}
                          className="text-emerald-600 hover:underline"
                        >
                          {s}
                        </Link>
                        {i < term.seeAlso.length - 1 && ", "}
                      </span>
                    ))}
                  </span>
                )}
                {saveError && (
                  <span role="alert" className="text-sm text-[var(--color-error)]">
                    {saveError}
                  </span>
                )}
                <span className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void addToDeck()}
                    disabled={inDeck}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold transition",
                      inDeck
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : "border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-emerald-400 hover:text-emerald-700"
                    )}
                  >
                    {inDeck ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                    {inDeck ? "In your deck" : "Add to flashcards"}
                  </button>
                  {justAdded && (
                    <span className="text-xs text-emerald-600">
                      Added &ldquo;{term.term}&rdquo;
                    </span>
                  )}
                  <Link
                    href={`/dictionary/${slug}`}
                    className="ml-auto text-xs font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    View in dictionary →
                  </Link>
                </span>
              </>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
