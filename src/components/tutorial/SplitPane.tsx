"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface SplitPaneProps {
  /** Left panel content (instructions/guide) */
  left: React.ReactNode;
  /** Right panel content (code editor/terminal) */
  right: React.ReactNode;
  /** Initial split percentage for left pane (default 50) */
  defaultSplit?: number;
  /** Minimum width percentage for either pane */
  minWidth?: number;
}

/** Resizable split-pane layout for tutorial guides. */
export function SplitPane({
  left,
  right,
  defaultSplit = 50,
  minWidth = 25,
}: SplitPaneProps): React.ReactElement {
  const [split, setSplit] = useState(defaultSplit);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    function handleMouseMove(e: MouseEvent): void {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplit(Math.max(minWidth, Math.min(100 - minWidth, pct)));
    }

    function handleMouseUp(): void {
      setIsDragging(false);
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, minWidth]);

  return (
    <div
      ref={containerRef}
      className="flex h-full min-h-[500px] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)]"
    >
      {/* Left pane */}
      <div className="overflow-y-auto p-6" style={{ width: `${split}%` }}>
        {left}
      </div>

      {/* Drag handle */}
      <div
        role="separator"
        aria-orientation="vertical"
        tabIndex={0}
        onMouseDown={handleMouseDown}
        className={`flex w-2 cursor-col-resize items-center justify-center border-x border-[var(--color-border)] transition-colors hover:bg-emerald-500/20 ${isDragging ? "bg-emerald-500/30" : "bg-[var(--color-bg-surface)]"}`}
      >
        <div className="h-8 w-0.5 rounded-full bg-[var(--color-text-muted)]" />
      </div>

      {/* Right pane */}
      <div className="overflow-y-auto p-6" style={{ width: `${100 - split}%` }}>
        {right}
      </div>
    </div>
  );
}
