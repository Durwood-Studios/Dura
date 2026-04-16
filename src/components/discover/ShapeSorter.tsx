"use client";

import { useCallback, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";

interface Shape {
  id: string;
  kind: "circle" | "square" | "triangle" | "star" | "heart" | "diamond";
  color: "red" | "blue" | "yellow";
  sorted: boolean;
}

const INITIAL_SHAPES: Shape[] = [
  { id: "s1", kind: "circle", color: "red", sorted: false },
  { id: "s2", kind: "square", color: "blue", sorted: false },
  { id: "s3", kind: "triangle", color: "yellow", sorted: false },
  { id: "s4", kind: "star", color: "red", sorted: false },
  { id: "s5", kind: "heart", color: "blue", sorted: false },
  { id: "s6", kind: "diamond", color: "yellow", sorted: false },
];

const BIN_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  red: { bg: "#fee2e2", border: "#ef4444", label: "Red" },
  blue: { bg: "#dbeafe", border: "#3b82f6", label: "Blue" },
  yellow: { bg: "#fef9c3", border: "#eab308", label: "Yellow" },
};

const COLOR_HEX: Record<string, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  yellow: "#eab308",
};

/** Renders an SVG shape path for the given kind. */
function ShapeSVG({ kind, color }: { kind: Shape["kind"]; color: string }): React.ReactElement {
  const fill = COLOR_HEX[color];
  const size = 56;

  switch (kind) {
    case "circle":
      return (
        <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden="true">
          <circle cx="28" cy="28" r="24" fill={fill} />
        </svg>
      );
    case "square":
      return (
        <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden="true">
          <rect x="6" y="6" width="44" height="44" rx="4" fill={fill} />
        </svg>
      );
    case "triangle":
      return (
        <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden="true">
          <polygon points="28,4 52,50 4,50" fill={fill} />
        </svg>
      );
    case "star":
      return (
        <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden="true">
          <polygon points="28,2 34,20 54,20 38,32 44,50 28,38 12,50 18,32 2,20 22,20" fill={fill} />
        </svg>
      );
    case "heart":
      return (
        <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden="true">
          <path
            d="M28 50 C14 38 2 28 2 18 C2 10 8 4 16 4 C22 4 26 8 28 12 C30 8 34 4 40 4 C48 4 54 10 54 18 C54 28 42 38 28 50Z"
            fill={fill}
          />
        </svg>
      );
    case "diamond":
      return (
        <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden="true">
          <polygon points="28,2 52,28 28,54 4,28" fill={fill} />
        </svg>
      );
  }
}

/** A drag-and-click shape sorting activity for early elementary learners. */
export function ShapeSorter(): React.ReactElement {
  const [shapes, setShapes] = useState<Shape[]>(INITIAL_SHAPES);
  const [selected, setSelected] = useState<string | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const unsorted = shapes.filter((s) => !s.sorted);
  const allSorted = unsorted.length === 0 && shapes.length > 0;

  const handleShapeClick = useCallback(
    (id: string): void => {
      if (isComplete) return;
      setSelected((prev) => (prev === id ? null : id));
      setWrongId(null);
    },
    [isComplete]
  );

  const handleBinClick = useCallback(
    (binColor: string): void => {
      if (!selected || isComplete) return;

      const shape = shapes.find((s) => s.id === selected);
      if (!shape) return;

      if (shape.color === binColor) {
        // Correct - sort the shape
        const updated = shapes.map((s) => (s.id === selected ? { ...s, sorted: true } : s));
        setShapes(updated);
        setSelected(null);
        setWrongId(null);

        // Check if all sorted after this move
        if (updated.filter((s) => !s.sorted).length === 0) {
          setIsComplete(true);
          markActivityComplete("shape-sorter");
        }
      } else {
        // Wrong - bounce back
        setWrongId(selected);
        setSelected(null);
        setTimeout(() => setWrongId(null), 500);
      }
    },
    [selected, shapes, isComplete]
  );

  const handleReset = useCallback((): void => {
    setShapes(INITIAL_SHAPES);
    setSelected(null);
    setWrongId(null);
    setIsComplete(false);
  }, []);

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="text-center text-lg text-[var(--color-text-secondary)]">
        Click a shape, then click the matching color bin.
      </p>

      {/* Completion celebration */}
      {allSorted && (
        <div className="flex animate-in flex-col items-center gap-3 duration-500 fade-in">
          <div className="flex gap-1 text-4xl">
            {["⭐", "🌟", "✨", "🌟", "⭐"].map((star, i) => (
              <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 100}ms` }}>
                {star}
              </span>
            ))}
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            You sorted them all!
          </p>
          <button
            onClick={handleReset}
            className="mt-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
          >
            Play Again
          </button>
        </div>
      )}

      {/* Main layout */}
      {!allSorted && (
        <div className="flex w-full flex-col items-center gap-8 sm:flex-row sm:justify-center sm:gap-12">
          {/* Shapes on the left */}
          <div className="flex flex-wrap justify-center gap-4 sm:flex-col">
            {unsorted.map((shape) => (
              <button
                key={shape.id}
                onClick={() => handleShapeClick(shape.id)}
                aria-label={`${shape.color} ${shape.kind}`}
                className="rounded-xl border-2 p-3 transition-all duration-200"
                style={{
                  borderColor:
                    selected === shape.id ? COLOR_HEX[shape.color] : "var(--color-border)",
                  transform:
                    wrongId === shape.id
                      ? "translateX(-8px)"
                      : selected === shape.id
                        ? "scale(1.1)"
                        : "scale(1)",
                  animation: wrongId === shape.id ? "shake 0.4s ease-in-out" : undefined,
                }}
              >
                <ShapeSVG kind={shape.kind} color={shape.color} />
              </button>
            ))}
          </div>

          {/* Bins on the right */}
          <div className="flex gap-4 sm:flex-col">
            {(["red", "blue", "yellow"] as const).map((binColor) => {
              const bin = BIN_COLORS[binColor];
              const sortedInBin = shapes.filter((s) => s.sorted && s.color === binColor);
              return (
                <button
                  key={binColor}
                  onClick={() => handleBinClick(binColor)}
                  aria-label={`${bin.label} bin`}
                  className="flex min-h-[100px] min-w-[100px] flex-col items-center justify-center gap-2 rounded-2xl border-3 border-dashed p-4 transition-all duration-200 hover:scale-105"
                  style={{
                    borderColor: bin.border,
                    backgroundColor: `${bin.border}15`,
                  }}
                >
                  {/* Sorted shapes inside bin */}
                  <div className="flex flex-wrap justify-center gap-1">
                    {sortedInBin.map((s) => (
                      <div key={s.id} className="scale-50">
                        <ShapeSVG kind={s.kind} color={s.color} />
                      </div>
                    ))}
                  </div>
                  {sortedInBin.length === 0 && (
                    <div className="h-8 w-8 rounded-full" style={{ backgroundColor: bin.border }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}

export default ShapeSorter;
