"use client";

import { useCallback, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";

const TILE_SIZE = 4;
const MOSAIC_SIZE = 4;

const PALETTE = [
  { name: "White", value: "#f0f0f0" },
  { name: "Coral", value: "#f97316" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Violet", value: "#a78bfa" },
] as const;

type TileGrid = number[][];

function createEmptyTile(): TileGrid {
  return Array.from({ length: TILE_SIZE }, () => Array.from({ length: TILE_SIZE }, () => 0));
}

/** Mirrors a tile grid horizontally. */
function mirrorH(tile: TileGrid): TileGrid {
  return tile.map((row) => [...row].reverse());
}

/** Mirrors a tile grid vertically. */
function mirrorV(tile: TileGrid): TileGrid {
  return [...tile].reverse().map((row) => [...row]);
}

/** Renders a small tile for the mosaic preview. */
function MiniTile({ tile, size }: { tile: TileGrid; size: number }): React.ReactElement {
  const cellSize = size / TILE_SIZE;
  return (
    <div
      className="grid shrink-0"
      style={{
        gridTemplateColumns: `repeat(${TILE_SIZE}, ${cellSize}px)`,
        width: size,
        height: size,
      }}
    >
      {tile.flat().map((colorIdx, i) => (
        <div
          key={i}
          style={{
            width: cellSize,
            height: cellSize,
            backgroundColor: PALETTE[colorIdx].value,
            opacity: colorIdx === 0 ? 0.15 : 1,
          }}
        />
      ))}
    </div>
  );
}

/** Design a single tile and preview it as a repeated mosaic. */
export function TileDesigner(): React.ReactElement {
  const [tile, setTile] = useState<TileGrid>(createEmptyTile);
  const [activeColor, setActiveColor] = useState(1);
  const [isMirrorH, setIsMirrorH] = useState(false);
  const [isMirrorV, setIsMirrorV] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  const handleCellClick = useCallback(
    (row: number, col: number): void => {
      setTile((prev) => {
        const next = prev.map((r) => [...r]);
        next[row][col] = next[row][col] === activeColor ? 0 : activeColor;
        return next;
      });

      if (!hasCompleted) {
        const painted = tile.flat().filter((c) => c !== 0).length;
        if (painted >= 3) {
          setHasCompleted(true);
          markActivityComplete("tile-designer");
        }
      }
    },
    [activeColor, tile, hasCompleted]
  );

  // Build the display tile with mirrors applied
  const displayTile = useCallback((baseTile: TileGrid, mH: boolean, mV: boolean): TileGrid => {
    let result = baseTile;
    if (mH) result = mirrorH(result);
    if (mV) result = mirrorV(result);
    return result;
  }, []);

  // For the mosaic, alternate mirrored versions to create symmetry
  const getMosaicTile = useCallback(
    (mosaicRow: number, mosaicCol: number): TileGrid => {
      const shouldFlipH = isMirrorH && mosaicCol % 2 === 1;
      const shouldFlipV = isMirrorV && mosaicRow % 2 === 1;
      return displayTile(tile, shouldFlipH, shouldFlipV);
    },
    [tile, isMirrorH, isMirrorV, displayTile]
  );

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Color palette */}
      <div className="flex items-center gap-3">
        <span className="text-lg font-medium text-white/90">Color:</span>
        {PALETTE.map((c, i) => {
          if (i === 0) return null; // Skip "empty" color in picker
          return (
            <button
              key={c.name}
              onClick={() => setActiveColor(i)}
              aria-label={c.name}
              className="size-12 min-h-12 min-w-12 rounded-xl border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: c.value,
                borderColor: i === activeColor ? "#fff" : "transparent",
              }}
            />
          );
        })}
      </div>

      {/* Tile editor */}
      <div>
        <p className="mb-2 text-center text-base font-medium text-white/70">Design your tile</p>
        <div
          className="mx-auto grid gap-1 rounded-2xl border border-white/10 bg-white/5 p-3"
          style={{
            gridTemplateColumns: `repeat(${TILE_SIZE}, 1fr)`,
            width: 220,
          }}
        >
          {tile.map((row, r) =>
            row.map((colorIdx, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                aria-label={`Tile cell row ${r + 1} column ${c + 1}`}
                className="aspect-square w-full rounded-lg border border-white/5 transition-transform hover:scale-105"
                style={{
                  backgroundColor: PALETTE[colorIdx].value,
                  opacity: colorIdx === 0 ? 0.15 : 1,
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Mirror toggles */}
      <div className="flex gap-4">
        <button
          onClick={() => setIsMirrorH(!isMirrorH)}
          className={`min-h-12 rounded-xl border px-5 text-lg font-medium transition-colors ${
            isMirrorH
              ? "border-teal-400 bg-teal-400/20 text-teal-300"
              : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
          }`}
        >
          Mirror Horizontal
        </button>
        <button
          onClick={() => setIsMirrorV(!isMirrorV)}
          className={`min-h-12 rounded-xl border px-5 text-lg font-medium transition-colors ${
            isMirrorV
              ? "border-teal-400 bg-teal-400/20 text-teal-300"
              : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
          }`}
        >
          Mirror Vertical
        </button>
      </div>

      {/* Mosaic preview */}
      <div>
        <p className="mb-2 text-center text-base font-medium text-white/70">Your mosaic</p>
        <div
          className="mx-auto grid rounded-2xl border border-white/10 bg-[#0c0c14] p-2"
          style={{
            gridTemplateColumns: `repeat(${MOSAIC_SIZE}, 1fr)`,
            gap: 1,
          }}
        >
          {Array.from({ length: MOSAIC_SIZE }, (_, mr) =>
            Array.from({ length: MOSAIC_SIZE }, (_, mc) => (
              <MiniTile key={`${mr}-${mc}`} tile={getMosaicTile(mr, mc)} size={80} />
            ))
          )}
        </div>
      </div>

      {/* Learning callout */}
      <div className="w-full max-w-md rounded-2xl border border-teal-400/20 bg-teal-400/5 p-5">
        <p className="text-lg leading-relaxed text-teal-200">
          <strong className="text-teal-300">What you just learned:</strong> You designed one small
          piece and the computer repeated it to fill a wall. This is how computers handle big tasks
          &mdash; do something small, then scale it up. Video game worlds, website layouts, and
          factory floors all work this way.
        </p>
      </div>
    </div>
  );
}
