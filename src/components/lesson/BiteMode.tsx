"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePreferencesStore } from "@/stores/preferences";
import { useProgressStore } from "@/stores/progress";

interface BiteModeProps {
  children: React.ReactNode;
}

/**
 * Wraps lesson content and splits it at <h2> boundaries into
 * swipeable segments when the user's study mode is "bite".
 * Falls through transparently in standard mode.
 */
export function BiteMode({ children }: BiteModeProps): React.ReactElement {
  const studyMode = usePreferencesStore((s) => s.prefs.studyMode);
  const reducedMotion = usePreferencesStore((s) => s.prefs.reducedMotion);

  if (studyMode !== "bite") {
    return <>{children}</>;
  }

  return <BiteSegmentView reducedMotion={reducedMotion}>{children}</BiteSegmentView>;
}

function BiteSegmentView({
  children,
  reducedMotion,
}: {
  children: React.ReactNode;
  reducedMotion: boolean;
}): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  // Segments are groups of the container's own child nodes — the nodes
  // stay React-managed (live event handlers, live state). Cloning them
  // into innerHTML would strip every handler and leave Quiz/FillBlank/
  // Parsons/Sandbox inert, which made quiz lessons un-completable in
  // bite mode. We only ever toggle display on the real nodes.
  const segmentsRef = useRef<HTMLElement[][]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);

  // Group children at h2 boundaries once the MDX content has mounted.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const raf = requestAnimationFrame(() => {
      const nodes = Array.from(el.children) as HTMLElement[];
      if (nodes.length === 0) return;

      const segs: HTMLElement[][] = [[]];
      for (const node of nodes) {
        if (node.tagName === "H2" && segs[segs.length - 1].length > 0) {
          segs.push([]);
        }
        segs[segs.length - 1].push(node);
      }

      segmentsRef.current = segs;
      setTotal(segs.length);
      setCurrent((c) => Math.min(c, segs.length - 1));
    });
    return () => cancelAnimationFrame(raf);
  }, [children]);

  // Show only the current segment's nodes; restore everything on
  // unmount so a mode switch never leaves hidden content behind.
  useEffect(() => {
    const segs = segmentsRef.current;
    if (segs.length === 0) return;

    for (let i = 0; i < segs.length; i++) {
      for (const node of segs[i]) {
        node.style.display = i === current ? "" : "none";
      }
    }

    const container = containerRef.current;
    if (container && !reducedMotion) {
      container.animate(
        [
          { opacity: 0, transform: "translateX(20px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 250, easing: "ease-out" }
      );
    }

    return () => {
      for (const group of segs) {
        for (const node of group) {
          node.style.display = "";
        }
      }
    };
  }, [current, total, reducedMotion]);

  const canPrev = current > 0;
  const canNext = current < total - 1;

  // Window-scroll is meaningless here (ScrollTracker stands down in bite
  // mode) — report reading progress as segments viewed; the store keeps
  // the running max.
  const setScroll = useProgressStore((s) => s.setScroll);
  useEffect(() => {
    if (total > 0) setScroll(Math.round(((current + 1) / total) * 100));
  }, [current, total, setScroll]);

  const prev = useCallback(() => {
    if (canPrev) setCurrent((c) => c - 1);
  }, [canPrev]);

  const next = useCallback(() => {
    if (canNext) setCurrent((c) => c + 1);
  }, [canNext]);

  // Keyboard navigation — skipped while typing in an interactive
  // (FillBlank inputs, the sandbox editor) so arrows edit text, not pages.
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)))
        return;
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent): void => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent): void => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) next();
      else prev();
    }
  };

  return (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* Progress dots */}
      {total > 0 && (
        <div className="mb-6 flex items-center justify-center gap-1.5">
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to segment ${i + 1}`}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${
                i === current
                  ? "w-6 bg-emerald-500"
                  : i < current
                    ? "w-2 bg-emerald-300"
                    : "w-2 bg-[var(--color-border)]"
              }`}
            />
          ))}
        </div>
      )}

      {/* Live lesson content — segments hidden/shown in place */}
      <div ref={containerRef} className="lesson-prose">
        {children}
      </div>

      {/* Navigation */}
      {total > 0 && (
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={prev}
            disabled={!canPrev}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-subtle)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <span className="text-xs text-[var(--color-text-muted)]">
            {current + 1} / {total}
          </span>

          <button
            type="button"
            onClick={next}
            disabled={!canNext}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-subtle)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
