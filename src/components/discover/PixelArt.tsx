"use client";

import { useCallback, useRef, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";

const PALETTE: { name: string; hex: string }[] = [
  { name: "Black", hex: "#1a1a2e" },
  { name: "White", hex: "#f0f0f0" },
  { name: "Red", hex: "#ef4444" },
  { name: "Green", hex: "#22c55e" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Yellow", hex: "#facc15" },
  { name: "Purple", hex: "#a855f7" },
  { name: "Orange", hex: "#f97316" },
];

const GRID_SIZE = 8;

/** Creates a fresh 8x8 grid filled with color index 0 (black). */
function emptyGrid(): number[][] {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0) as number[]);
}

/**
 * Pixel Art Grid — draw on an 8x8 canvas where every pixel is a number.
 *
 * Children select a palette color, click cells to paint, and see the
 * underlying numeric data that represents their image.
 */
export function PixelArt(): React.ReactElement {
  const [grid, setGrid] = useState<number[][]>(emptyGrid);
  const [activeColor, setActiveColor] = useState(0);
  const paintCountRef = useRef(0);
  const completedRef = useRef(false);

  const paint = useCallback(
    (row: number, col: number): void => {
      setGrid((prev) => {
        const next = prev.map((r) => [...r]);
        next[row][col] = activeColor;
        return next;
      });
      paintCountRef.current += 1;
      if (!completedRef.current && paintCountRef.current >= 8) {
        completedRef.current = true;
        markActivityComplete("pixel-art");
      }
    },
    [activeColor]
  );

  const clearGrid = useCallback((): void => {
    setGrid(emptyGrid());
  }, []);

  const fillGrid = useCallback((): void => {
    setGrid(
      Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(activeColor) as number[])
    );
  }, [activeColor]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-8 py-8">
      <h2 className="text-center text-2xl font-semibold text-[var(--color-text-primary)]">
        Pixel Art Grid
      </h2>
      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Pick a color, then tap squares to paint — watch the numbers change below
      </p>

      {/* Palette */}
      <div className="flex flex-wrap justify-center gap-3">
        {PALETTE.map((color, i) => (
          <button
            key={color.name}
            type="button"
            onClick={() => setActiveColor(i)}
            aria-label={`Select ${color.name}`}
            aria-pressed={activeColor === i}
            className="relative h-12 w-12 rounded-xl border-2 transition-transform"
            style={{
              backgroundColor: color.hex,
              borderColor: activeColor === i ? "#10b981" : "transparent",
              transform: activeColor === i ? "scale(1.15)" : "scale(1)",
            }}
          >
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-[var(--color-text-muted)]">
              {i}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <div
        className="mt-2 grid gap-[2px] rounded-xl border border-[var(--color-border)] bg-[var(--color-border)] p-[2px]"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
      >
        {grid.flatMap((row, ri) =>
          row.map((colorIdx, ci) => (
            <button
              key={`${ri}-${ci}`}
              type="button"
              onClick={() => paint(ri, ci)}
              aria-label={`Row ${ri + 1}, Column ${ci + 1}: color ${colorIdx}`}
              className="aspect-square w-10 transition-colors duration-100 sm:w-12"
              style={{ backgroundColor: PALETTE[colorIdx].hex }}
            />
          ))
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={clearGrid}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-6 py-3 text-sm font-semibold text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface-hover)]"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={fillGrid}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-6 py-3 text-sm font-semibold text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface-hover)]"
        >
          Fill
        </button>
      </div>

      {/* Data view */}
      <div className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 backdrop-blur-xl">
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-secondary)]">
          Your image as data
        </h3>
        <pre className="overflow-x-auto font-[family-name:var(--font-mono)] text-xs leading-relaxed text-[var(--color-text-muted)]">
          {"[\n"}
          {grid.map((row, i) => `  [${row.join(", ")}]${i < GRID_SIZE - 1 ? "," : ""}\n`)}
          {"]"}
        </pre>
      </div>

      {/* What you just learned */}
      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 backdrop-blur-xl">
        <h3 className="mb-2 text-sm font-semibold text-[var(--color-accent-emerald)]">
          What you just learned
        </h3>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Every image on your screen is a grid of tiny colored squares called pixels. Each pixel is
          stored as a number. An 8x8 image = 64 numbers. A phone screen has millions.
        </p>
      </div>
    </div>
  );
}
