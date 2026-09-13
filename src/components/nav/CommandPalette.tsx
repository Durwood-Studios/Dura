"use client";

import { useFocusTrap } from "@/hooks/useFocusTrap";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { useUIStore } from "@/stores/ui";
import { PHASES } from "@/content/phases";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  label: string;
  href: string;
  category: string;
}

/** Static navigation results. */
const NAV_RESULTS: SearchResult[] = [
  { id: "nav-dashboard", label: "Dashboard", href: "/dashboard", category: "Pages" },
  { id: "nav-paths", label: "Learning Paths", href: "/paths", category: "Pages" },
  { id: "nav-review", label: "Flashcard Review", href: "/review", category: "Pages" },
  { id: "nav-dictionary", label: "Dictionary", href: "/dictionary", category: "Pages" },
  { id: "nav-sandbox", label: "Code Sandbox", href: "/sandbox", category: "Pages" },
  { id: "nav-goals", label: "Goals", href: "/goals", category: "Pages" },
  { id: "nav-stats", label: "Stats", href: "/stats", category: "Pages" },
  { id: "nav-howto", label: "How-To Guides", href: "/howto", category: "Pages" },
  { id: "nav-tutorials", label: "Project Tutorials", href: "/tutorials", category: "Pages" },
  { id: "nav-settings", label: "Settings", href: "/settings", category: "Pages" },
  { id: "nav-verify", label: "Verify Certificates", href: "/verify", category: "Pages" },
  { id: "nav-teach", label: "Teacher Dashboard", href: "/teach", category: "Pages" },
];

/** Phase results. */
const PHASE_RESULTS: SearchResult[] = PHASES.map((p) => ({
  id: `phase-${p.id}`,
  label: p.title,
  href: `/paths/${p.id}`,
  category: "Phases",
}));

/** Module results. */
const MODULE_RESULTS: SearchResult[] = PHASES.flatMap((p) =>
  p.modules.map((m) => ({
    id: `mod-${m.id}`,
    label: `${m.title} (Phase ${p.id})`,
    href: `/paths/${p.id}/${m.id}`,
    category: "Modules",
  }))
);

const ALL_STATIC: SearchResult[] = [...NAV_RESULTS, ...PHASE_RESULTS, ...MODULE_RESULTS];

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

export function CommandPalette(): React.ReactElement | null {
  const open = useUIStore((s) => s.commandPaletteOpen);
  const toggle = useUIStore((s) => s.toggleCommandPalette);
  const [query, setQuery] = useState("");
  const [termResults, setTermResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open);
  const router = useRouter();

  // Filter static results
  const staticResults =
    query.length === 0
      ? NAV_RESULTS.slice(0, 6)
      : ALL_STATIC.filter((r) => normalize(r.label).includes(normalize(query)));

  const allResults = [...staticResults, ...termResults];

  // Fetch dictionary terms when query changes
  useEffect(() => {
    if (query.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/terms?q=${encodeURIComponent(query)}&limit=5`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const json = await res.json();
        const terms: SearchResult[] = json.data.terms.map((t: { slug: string; term: string }) => ({
          id: `term-${t.slug}`,
          label: t.term,
          href: `/dictionary/${t.slug}`,
          category: "Dictionary",
        }));
        setTermResults(terms);
      } catch {
        // Aborted or failed — ignore
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const [previousOpen, setPreviousOpen] = useState(open);
  const [previousQuery, setPreviousQuery] = useState(query);
  const [previousResultCount, setPreviousResultCount] = useState(termResults.length);
  if (open !== previousOpen) {
    setPreviousOpen(open);
    if (open) {
      setQuery("");
      setTermResults([]);
      setActiveIndex(0);
    }
  }
  if (query !== previousQuery || termResults.length !== previousResultCount) {
    setPreviousQuery(query);
    setPreviousResultCount(termResults.length);
    setActiveIndex(0);
    if (query.length < 2 && termResults.length > 0) setTermResults([]);
  }
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [open]);

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle]);

  const close = useCallback(() => {
    useUIStore.getState().toggleCommandPalette();
  }, []);

  const navigate = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, allResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && allResults[activeIndex]) {
      navigate(allResults[activeIndex].href);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-[min(15dvh,4rem)]">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />

      {/* Panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-label="Search"
        aria-modal="true"
        className="relative flex max-h-[calc(100dvh-5rem)] w-full max-w-lg min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-2xl"
        onKeyDown={handleKeyDown}
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
          <Search className="h-5 w-5 text-[var(--color-text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search pages, phases, dictionary"
            placeholder="Search pages, phases, dictionary…"
            className="min-w-0 flex-1 bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
          />
          <kbd className="rounded border border-[var(--color-border)] px-1.5 py-0.5 font-mono text-xs text-[var(--color-text-muted)]">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <ul className="max-h-80 min-h-0 overflow-y-auto py-2">
          {allResults.length === 0 && query.length > 0 && (
            <li className="px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
              No results for &ldquo;{query}&rdquo;
            </li>
          )}
          {allResults.map((result, i) => (
            <li key={result.id}>
              <button
                type="button"
                onClick={() => navigate(result.href)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition",
                  i === activeIndex
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-neutral-700 hover:bg-neutral-50"
                )}
              >
                <span className="flex-1">{result.label}</span>
                <span className="text-xs text-[var(--color-text-muted)]">{result.category}</span>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-300" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
