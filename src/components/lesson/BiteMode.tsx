"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePreferencesStore } from "@/stores/preferences";

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
  const [segments, setSegments] = useState<HTMLElement[]>([]);
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);

  // Split rendered content at h2 boundaries
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Wait a frame for MDX content to mount
    requestAnimationFrame(() => {
      const nodes = Array.from(el.children) as HTMLElement[];
      if (nodes.length === 0) return;

      const segs: HTMLElement[][] = [[]];
      for (const node of nodes) {
        if (node.tagName === "H2" && segs[segs.length - 1].length > 0) {
          segs.push([]);
        }
        segs[segs.length - 1].push(node);
      }

      // Wrap each segment group in a div
      const wrappers = segs.map((group) => {
        const wrapper = document.createElement("div");
        for (const n of group) wrapper.appendChild(n.cloneNode(true));
        return wrapper;
      });

      setSegments(wrappers);
    });
  }, [children]);

  const total = segments.length;
  const canPrev = current > 0;
  const canNext = current < total - 1;

  const prev = useCallback(() => {
    if (canPrev) setCurrent((c) => c - 1);
  }, [canPrev]);

  const next = useCallback(() => {
    if (canNext) setCurrent((c) => c + 1);
  }, [canNext]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
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

  // Hidden div for content mounting
  if (segments.length === 0) {
    return (
      <div ref={containerRef} className="lesson-prose">
        {children}
      </div>
    );
  }

  const animateProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
        transition: { duration: 0.25, ease: "easeOut" as const },
      };

  return (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* Progress dots */}
      <div className="mb-6 flex items-center justify-center gap-1.5">
        {segments.map((_, i) => (
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

      {/* Segment content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          {...animateProps}
          className="lesson-prose"
          dangerouslySetInnerHTML={{ __html: segments[current].innerHTML }}
        />
      </AnimatePresence>

      {/* Navigation */}
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
    </div>
  );
}
