"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";

/**
 * Pixel Art Grid — paint a 2D array of color indices, with a live view
 * of the underlying memory layout, bit math, and per-pixel metadata.
 *
 * Pedagogical thread: every cell is a (row, col) coordinate that maps
 * to one slot in a fixed-size byte stream. The grid IS the array; the
 * array IS the image. Compression (PNG, JPEG, WebP) is built on top
 * of this same raster substrate.
 */

// 16-color palette. 16 colors → 4 bits per pixel, which keeps the
// bit-math story round (256 pixels × 4 bits = 128 bytes).
const PALETTE: { name: string; hex: string }[] = [
  { name: "White", hex: "#f0f0f0" },
  { name: "Black", hex: "#1a1a2e" },
  { name: "Dark Gray", hex: "#525252" },
  { name: "Light Gray", hex: "#a0a0a8" },
  { name: "Red", hex: "#ef4444" },
  { name: "Orange", hex: "#f97316" },
  { name: "Yellow", hex: "#facc15" },
  { name: "Green", hex: "#22c55e" },
  { name: "Mint", hex: "#6ee7b7" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Purple", hex: "#a855f7" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Brown", hex: "#92400e" },
  { name: "Sand", hex: "#fcd34d" },
  { name: "Lavender", hex: "#c4b5fd" },
];

const PALETTE_BITS = 4; // log2(16)

type GridSize = 8 | 16 | 32;
type Tool = "brush" | "eraser" | "fill";

const GRID_SIZES: GridSize[] = [8, 16, 32];
const DEFAULT_SIZE: GridSize = 16;
const BACKGROUND_INDEX = 0; // index 0 in the palette is the "blank" white

interface Template {
  name: string;
  pattern: string[];
  fg: number; // foreground palette index
  bg?: number; // optional secondary fill index
}

// Templates are 16×16 ascii sprites. They're scaled (nearest neighbor)
// to fit whichever grid size is active. `X` = fg, `o` = bg, `.` = empty.
const TEMPLATES: Template[] = [
  {
    name: "Heart",
    fg: 4, // Red
    pattern: [
      "................",
      "...XX....XX.....",
      "..XXXX..XXXX....",
      ".XXXXXXXXXXXX...",
      ".XXXXXXXXXXXX...",
      ".XXXXXXXXXXXX...",
      "..XXXXXXXXXX....",
      "...XXXXXXXX.....",
      "....XXXXXX......",
      ".....XXXX.......",
      "......XX........",
      "................",
      "................",
      "................",
      "................",
      "................",
    ],
  },
  {
    name: "Smiley",
    fg: 1, // Black outline
    bg: 6, // Yellow fill
    pattern: [
      ".....XXXXXX.....",
      "...XXoooooXXX...",
      "..XooooooooooX..",
      ".XoooooooooooX..",
      "XooXXoooooXXooX.",
      "XooXXoooooXXooX.",
      "XoooooooooooooX.",
      "XoooooooooooooX.",
      "XooXoooooooXooX.",
      "XoooXXXXXXXXooX.",
      "XooooXXXXXooooX.",
      ".XoooooooooooX..",
      "..XooooooooooX..",
      "...XXoooooXXX...",
      ".....XXXXXX.....",
      "................",
    ],
  },
  {
    name: "Invader",
    fg: 7, // Green
    pattern: [
      "................",
      "................",
      "....X......X....",
      ".....X....X.....",
      "....XXXXXXXX....",
      "...XX.XXXX.XX...",
      "..XXXXXXXXXXXX..",
      "..X.XXXXXXXX.X..",
      "..X.X......X.X..",
      ".....XX..XX.....",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
    ],
  },
  {
    name: "Sword",
    fg: 3, // Light gray (blade)
    bg: 13, // Brown (hilt)
    pattern: [
      "...............X",
      "..............XX",
      ".............XX.",
      "............XX..",
      "...........XX...",
      "..........XX....",
      ".........XX.....",
      "........XX......",
      ".......XX.......",
      "......XX........",
      ".....XX.........",
      "....oo..........",
      "...oooo.........",
      "..oo..oo........",
      "..o....o........",
      "................",
    ],
  },
];

/** Creates a fresh size×size grid filled with the background color. */
function emptyGrid(size: GridSize): number[][] {
  return Array.from({ length: size }, () => Array(size).fill(BACKGROUND_INDEX) as number[]);
}

/** Parse a template into a grid at the given size (nearest-neighbor scale). */
function applyTemplate(template: Template, size: GridSize): number[][] {
  const src = template.pattern;
  const srcSize = src.length;
  const out = emptyGrid(size);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const sr = Math.floor((r * srcSize) / size);
      const sc = Math.floor((c * srcSize) / size);
      const ch = src[sr]?.[sc] ?? ".";
      if (ch === "X") {
        out[r][c] = template.fg;
      } else if (ch === "o" && template.bg !== undefined) {
        out[r][c] = template.bg;
      }
    }
  }
  return out;
}

/** Flood fill from (row, col) — BFS that swaps the contiguous region of `from` to `to`. */
function floodFill(grid: number[][], row: number, col: number, to: number): number[][] {
  const from = grid[row]?.[col];
  if (from === undefined || from === to) return grid;
  const size = grid.length;
  const next = grid.map((r) => [...r]);
  const queue: [number, number][] = [[row, col]];
  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    if (r < 0 || c < 0 || r >= size || c >= size) continue;
    if (next[r][c] !== from) continue;
    next[r][c] = to;
    queue.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
  }
  return next;
}

/** Decompose a hex color string into R, G, B integer components. */
function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

/** Format a byte count as "B" / "KB" / "MB" with one decimal where helpful. */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface InspectedCell {
  row: number;
  col: number;
}

export function PixelArt(): React.ReactElement {
  const [size, setSize] = useState<GridSize>(DEFAULT_SIZE);
  const [grid, setGrid] = useState<number[][]>(() => emptyGrid(DEFAULT_SIZE));
  const [activeColor, setActiveColor] = useState(4); // start on Red
  const [tool, setTool] = useState<Tool>("brush");
  const [inspected, setInspected] = useState<InspectedCell | null>(null);
  const isPaintingRef = useRef(false);
  const paintCountRef = useRef(0);
  const completedRef = useRef(false);

  // Resize: rebuild a fresh canvas at the new dimensions. We don't attempt
  // to rescale existing pixel art — at this scale, intent is destroyed by
  // a 32→8 downsample, and templates are the way to seed new sizes.
  const setGridSize = useCallback((next: GridSize): void => {
    setSize(next);
    setGrid(emptyGrid(next));
    setInspected(null);
  }, []);

  const paintCell = useCallback(
    (row: number, col: number): void => {
      setGrid((prev) => {
        if (row < 0 || col < 0 || row >= prev.length || col >= prev.length) return prev;
        if (tool === "fill") {
          const target = tool === "fill" ? activeColor : BACKGROUND_INDEX;
          return floodFill(prev, row, col, target);
        }
        const target = tool === "eraser" ? BACKGROUND_INDEX : activeColor;
        if (prev[row][col] === target) return prev;
        const next = prev.map((r) => [...r]);
        next[row][col] = target;
        return next;
      });
      paintCountRef.current += 1;
      if (!completedRef.current && paintCountRef.current >= 8) {
        completedRef.current = true;
        markActivityComplete("pixel-art");
      }
    },
    [activeColor, tool]
  );

  // Pointer-driven drag-paint: pointerdown starts a stroke; pointerenter
  // on a cell during a stroke paints it. Works for mouse, touch, and pen
  // via the unified Pointer Events API.
  const handlePointerDown = useCallback(
    (row: number, col: number): void => {
      isPaintingRef.current = true;
      paintCell(row, col);
    },
    [paintCell]
  );

  const handlePointerEnter = useCallback(
    (row: number, col: number): void => {
      setInspected({ row, col });
      if (isPaintingRef.current && tool !== "fill") {
        paintCell(row, col);
      }
    },
    [paintCell, tool]
  );

  useEffect(() => {
    const stop = (): void => {
      isPaintingRef.current = false;
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, []);

  const clearGrid = useCallback((): void => {
    setGrid(emptyGrid(size));
    setInspected(null);
  }, [size]);

  const randomize = useCallback((): void => {
    setGrid(
      Array.from({ length: size }, () =>
        Array.from({ length: size }, () => Math.floor(Math.random() * PALETTE.length))
      )
    );
  }, [size]);

  const loadTemplate = useCallback(
    (template: Template): void => {
      setGrid(applyTemplate(template, size));
      paintCountRef.current = Math.max(paintCountRef.current, 8);
      if (!completedRef.current) {
        completedRef.current = true;
        markActivityComplete("pixel-art");
      }
    },
    [size]
  );

  // Memory math: number of pixels × bits/pixel = total bits.
  // Comparison anchor: a 4032×3024 iPhone photo at 24 bpp (uncompressed RGB).
  const stats = useMemo(() => {
    const pixels = size * size;
    const bits = pixels * PALETTE_BITS;
    const bytes = Math.ceil(bits / 8);
    const photoBytes = 4032 * 3024 * 3;
    const ratio = photoBytes / Math.max(bytes, 1);
    return { pixels, bits, bytes, ratio };
  }, [size]);

  // Linearize the 2D grid to a 1D byte stream — this is exactly what
  // row-major storage looks like in memory. Cap the displayed strip at
  // 128 cells so the layout stays calm on small grids and meaningful
  // on the 32×32 max.
  const byteStream = useMemo(() => {
    const flat = grid.flat();
    if (flat.length <= 128) return flat;
    return flat.slice(0, 128);
  }, [grid]);

  const inspectedInfo = useMemo(() => {
    if (!inspected) return null;
    const colorIdx = grid[inspected.row]?.[inspected.col] ?? BACKGROUND_INDEX;
    const color = PALETTE[colorIdx];
    const [r, g, b] = hexToRgb(color.hex);
    const byteIndex = inspected.row * size + inspected.col;
    return {
      row: inspected.row,
      col: inspected.col,
      byteIndex,
      colorIdx,
      colorName: color.name,
      hex: color.hex,
      rgb: [r, g, b] as [number, number, number],
    };
  }, [inspected, grid, size]);

  // Cell pixel width — scales down as the grid scales up so the canvas
  // stays roughly the same on screen across all three sizes.
  const cellPx = size === 8 ? 36 : size === 16 ? 22 : 12;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 py-8">
      <header className="text-center">
        <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">Pixel Art Grid</h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Paint a 2D array. Watch it become a 1D byte stream. See the math behind every image.
        </p>
      </header>

      {/* Toolbar — size, tool, templates */}
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
            Size
          </span>
          <div className="flex overflow-hidden rounded-lg border border-[var(--color-border)]">
            {GRID_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setGridSize(s)}
                aria-pressed={size === s}
                className="px-3 py-1.5 font-mono text-xs transition-colors"
                style={{
                  backgroundColor: size === s ? "var(--color-accent)" : "var(--color-bg-surface)",
                  color: size === s ? "#ffffff" : "var(--color-text-secondary)",
                }}
              >
                {s}×{s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
            Tool
          </span>
          <div className="flex overflow-hidden rounded-lg border border-[var(--color-border)]">
            {(["brush", "eraser", "fill"] as Tool[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTool(t)}
                aria-pressed={tool === t}
                className="px-3 py-1.5 text-xs capitalize transition-colors"
                style={{
                  backgroundColor: tool === t ? "var(--color-accent)" : "var(--color-bg-surface)",
                  color: tool === t ? "#ffffff" : "var(--color-text-secondary)",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
            Template
          </span>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.name}
                type="button"
                onClick={() => loadTemplate(tpl)}
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface-hover)] px-2.5 py-1 text-xs text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-subtle)]"
              >
                {tpl.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Palette */}
      <div className="flex flex-wrap justify-center gap-2">
        {PALETTE.map((color, i) => (
          <button
            key={color.name}
            type="button"
            onClick={() => {
              setActiveColor(i);
              if (tool === "eraser") setTool("brush");
            }}
            aria-label={`Select ${color.name} (index ${i})`}
            aria-pressed={activeColor === i && tool === "brush"}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-transform"
            style={{
              backgroundColor: color.hex,
              borderColor:
                activeColor === i && tool === "brush" ? "var(--color-accent)" : "transparent",
              transform: activeColor === i && tool === "brush" ? "scale(1.12)" : "scale(1)",
            }}
          >
            <span
              className="font-mono text-[10px] font-semibold"
              style={{
                color: i === 0 || i === 6 || i === 8 || i === 14 ? "#1a1a2e" : "#ffffff",
                mixBlendMode: "normal",
                textShadow: "0 1px 1px rgba(0,0,0,0.15)",
              }}
            >
              {i.toString(16).toUpperCase()}
            </span>
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="flex justify-center">
        <div
          className="grid touch-none rounded-lg border border-[var(--color-border)] bg-[var(--color-border)] p-[2px] select-none"
          style={{
            gridTemplateColumns: `repeat(${size}, ${cellPx}px)`,
            gap: "1px",
          }}
          onPointerLeave={() => setInspected(null)}
        >
          {grid.flatMap((row, ri) =>
            row.map((colorIdx, ci) => (
              <div
                key={`${ri}-${ci}`}
                role="button"
                aria-label={`Row ${ri + 1}, Column ${ci + 1}: ${PALETTE[colorIdx].name}`}
                onPointerDown={(e) => {
                  e.preventDefault();
                  handlePointerDown(ri, ci);
                }}
                onPointerEnter={() => handlePointerEnter(ri, ci)}
                className="cursor-pointer transition-colors duration-75"
                style={{
                  backgroundColor: PALETTE[colorIdx].hex,
                  width: `${cellPx}px`,
                  height: `${cellPx}px`,
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Action row */}
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={clearGrid}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface-hover)]"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={randomize}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface-hover)]"
        >
          Random
        </button>
      </div>

      {/* Inspector + Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Pixel inspector */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <h3 className="mb-3 text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
            Pixel inspector
          </h3>
          {inspectedInfo ? (
            <dl className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-muted)]">Position</dt>
                <dd className="font-mono text-[var(--color-text-primary)]">
                  row {inspectedInfo.row}, col {inspectedInfo.col}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-muted)]">Byte index</dt>
                <dd className="font-mono text-[var(--color-text-primary)]">
                  [{inspectedInfo.byteIndex}] of {stats.pixels}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-muted)]">Color index</dt>
                <dd className="font-mono text-[var(--color-text-primary)]">
                  0x{inspectedInfo.colorIdx.toString(16).toUpperCase()} · {inspectedInfo.colorName}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-muted)]">Hex</dt>
                <dd className="font-mono text-[var(--color-text-primary)]">{inspectedInfo.hex}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-text-muted)]">RGB</dt>
                <dd className="font-mono text-[var(--color-text-primary)]">
                  ({inspectedInfo.rgb[0]}, {inspectedInfo.rgb[1]}, {inspectedInfo.rgb[2]})
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-xs text-[var(--color-text-muted)]">
              Hover a cell to inspect its position, byte index, and color values.
            </p>
          )}
        </div>

        {/* Bit-math stats */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <h3 className="mb-3 text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
            Image as data
          </h3>
          <dl className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">Pixels</dt>
              <dd className="font-mono text-[var(--color-text-primary)]">
                {size} × {size} = {stats.pixels}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">Palette</dt>
              <dd className="font-mono text-[var(--color-text-primary)]">
                16 colors → {PALETTE_BITS} bits/pixel
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">Total</dt>
              <dd className="font-mono text-[var(--color-text-primary)]">
                {stats.bits} bits · {formatBytes(stats.bytes)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">iPhone photo</dt>
              <dd className="font-mono text-[var(--color-text-primary)]">
                ~{formatBytes(4032 * 3024 * 3)} ({Math.round(stats.ratio).toLocaleString()}× bigger)
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Row-major byte stream visualization */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
        <h3 className="mb-1 text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
          Memory layout · row-major
        </h3>
        <p className="mb-3 text-xs text-[var(--color-text-secondary)]">
          The same image, linearized into a 1D byte stream — top row, then second row, then third,
          all stacked end-to-end. This is how the bytes actually sit in memory.
        </p>
        <div
          className="grid gap-px rounded-md border border-[var(--color-border)] bg-[var(--color-border)] p-[1px]"
          style={{
            gridTemplateColumns: `repeat(${Math.min(size * 2, 32)}, minmax(0, 1fr))`,
          }}
          aria-label="Linearized byte stream preview"
        >
          {byteStream.map((colorIdx, i) => (
            <div
              key={i}
              className="aspect-square"
              style={{ backgroundColor: PALETTE[colorIdx].hex }}
            />
          ))}
        </div>
        {grid.flat().length > byteStream.length && (
          <p className="mt-2 text-[10px] text-[var(--color-text-muted)]">
            …and {grid.flat().length - byteStream.length} more bytes follow.
          </p>
        )}
      </div>

      {/* Data view — the actual 2D array */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
        <h3 className="mb-3 text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
          Your image as a 2D array
        </h3>
        <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed text-[var(--color-text-muted)]">
          {"[\n"}
          {grid.map(
            (row, i) =>
              `  [${row.map((v) => v.toString(16).toUpperCase().padStart(1, "0")).join(", ")}]${
                i < grid.length - 1 ? "," : ""
              }\n`
          )}
          {"]"}
        </pre>
      </div>
    </div>
  );
}
