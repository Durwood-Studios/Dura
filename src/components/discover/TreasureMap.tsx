"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";
import { cn } from "@/lib/utils";

interface Position {
  row: number;
  col: number;
}

interface Level {
  walls: boolean[][];
  start: Position;
  treasure: Position;
}

const GRID_SIZE = 6;

/** Create a 6x6 grid with walls at the given positions. */
function makeGrid(wallPositions: Position[]): boolean[][] {
  const grid: boolean[][] = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => false)
  );
  for (const pos of wallPositions) {
    grid[pos.row][pos.col] = true;
  }
  return grid;
}

const LEVELS: Level[] = [
  {
    walls: makeGrid([
      { row: 1, col: 1 },
      { row: 2, col: 3 },
      { row: 4, col: 2 },
    ]),
    start: { row: 0, col: 0 },
    treasure: { row: 5, col: 5 },
  },
  {
    walls: makeGrid([
      { row: 0, col: 2 },
      { row: 1, col: 2 },
      { row: 3, col: 1 },
      { row: 3, col: 4 },
      { row: 4, col: 4 },
    ]),
    start: { row: 0, col: 0 },
    treasure: { row: 5, col: 5 },
  },
  {
    walls: makeGrid([
      { row: 0, col: 3 },
      { row: 1, col: 1 },
      { row: 1, col: 3 },
      { row: 2, col: 5 },
      { row: 3, col: 2 },
      { row: 3, col: 3 },
      { row: 4, col: 0 },
      { row: 4, col: 4 },
    ]),
    start: { row: 0, col: 0 },
    treasure: { row: 5, col: 5 },
  },
];

type Direction = "up" | "down" | "left" | "right";

const DIR_LABELS: { dir: Direction; emoji: string; label: string }[] = [
  { dir: "up", emoji: "⬆️", label: "Up" },
  { dir: "down", emoji: "⬇️", label: "Down" },
  { dir: "left", emoji: "⬅️", label: "Left" },
  { dir: "right", emoji: "➡️", label: "Right" },
];

function applyDirection(pos: Position, dir: Direction): Position {
  switch (dir) {
    case "up":
      return { row: pos.row - 1, col: pos.col };
    case "down":
      return { row: pos.row + 1, col: pos.col };
    case "left":
      return { row: pos.row, col: pos.col - 1 };
    case "right":
      return { row: pos.row, col: pos.col + 1 };
  }
}

function isInBounds(pos: Position): boolean {
  return pos.row >= 0 && pos.row < GRID_SIZE && pos.col >= 0 && pos.col < GRID_SIZE;
}

/** Treasure Map Pathfinder — navigate a grid to find treasure. */
export function TreasureMap(): React.ReactElement {
  const [levelIndex, setLevelIndex] = useState(0);
  const [commands, setCommands] = useState<Direction[]>([]);
  const [playerPos, setPlayerPos] = useState<Position>(LEVELS[0].start);
  const [isRunning, setIsRunning] = useState(false);
  const [runStep, setRunStep] = useState(-1);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [completed, setCompleted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const level = LEVELS[levelIndex];

  const addCommand = useCallback(
    (dir: Direction): void => {
      if (isRunning) return;
      setCommands((prev) => [...prev, dir]);
      setMessage(null);
      setMessageType(null);
    },
    [isRunning]
  );

  const clearCommands = useCallback((): void => {
    if (isRunning) return;
    setCommands([]);
    setPlayerPos(level.start);
    setMessage(null);
    setMessageType(null);
    setRunStep(-1);
  }, [isRunning, level.start]);

  const go = useCallback((): void => {
    if (commands.length === 0 || isRunning) return;
    setPlayerPos(level.start);
    setIsRunning(true);
    setRunStep(0);
    setMessage(null);
    setMessageType(null);
  }, [commands, isRunning, level.start]);

  // Step through commands during playback
  useEffect(() => {
    if (!isRunning || runStep < 0) return;

    if (runStep >= commands.length) {
      // Ran out of commands without reaching treasure
      setIsRunning(false);
      setRunStep(-1);
      // Check if we're on treasure
      if (playerPos.row === level.treasure.row && playerPos.col === level.treasure.col) {
        setMessage("You found the treasure!");
        setMessageType("success");
        if (levelIndex === LEVELS.length - 1 && !completed) {
          setCompleted(true);
          markActivityComplete("treasure-map");
        }
      } else {
        setMessage("You didn't reach the treasure. Try again!");
        setMessageType("error");
      }
      return;
    }

    timerRef.current = setTimeout(() => {
      const nextPos = applyDirection(playerPos, commands[runStep]);

      if (!isInBounds(nextPos) || level.walls[nextPos.row][nextPos.col]) {
        // Hit a wall or went out of bounds
        setIsRunning(false);
        setRunStep(-1);
        setMessage("Oops! Hit a wall. Try again.");
        setMessageType("error");
        return;
      }

      setPlayerPos(nextPos);

      if (nextPos.row === level.treasure.row && nextPos.col === level.treasure.col) {
        // Reached treasure
        setIsRunning(false);
        setRunStep(-1);
        setMessage("You found the treasure!");
        setMessageType("success");
        if (levelIndex === LEVELS.length - 1 && !completed) {
          setCompleted(true);
          markActivityComplete("treasure-map");
        }
        return;
      }

      setRunStep((s) => s + 1);
    }, 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, runStep, commands, playerPos, level, levelIndex, completed]);

  const nextLevel = useCallback((): void => {
    if (levelIndex < LEVELS.length - 1) {
      const next = levelIndex + 1;
      setLevelIndex(next);
      setCommands([]);
      setPlayerPos(LEVELS[next].start);
      setMessage(null);
      setMessageType(null);
      setRunStep(-1);
    }
  }, [levelIndex]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-8 py-8">
      <h2 className="text-center text-2xl font-semibold text-[var(--color-text-primary)]">
        Treasure Map Pathfinder
      </h2>
      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Guide the explorer to the treasure — Level {levelIndex + 1} of {LEVELS.length}
      </p>

      {/* Grid */}
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
        role="grid"
        aria-label="Treasure map grid"
      >
        {Array.from({ length: GRID_SIZE }, (_, row) =>
          Array.from({ length: GRID_SIZE }, (_, col) => {
            const isPlayer = playerPos.row === row && playerPos.col === col;
            const isTreasure = level.treasure.row === row && level.treasure.col === col;
            const isWall = level.walls[row][col];
            const isStart = level.start.row === row && level.start.col === col;

            return (
              <div
                key={`${row}-${col}`}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-lg text-lg transition-all duration-300 sm:h-14 sm:w-14",
                  isWall
                    ? "bg-[#3a3a4a]"
                    : "border border-[var(--color-border)] bg-[var(--color-bg-surface)]",
                  isPlayer && !isWall && "ring-2 ring-[var(--color-accent-emerald)]"
                )}
                role="gridcell"
                aria-label={
                  isWall
                    ? "Wall"
                    : isPlayer
                      ? "Player"
                      : isTreasure
                        ? "Treasure"
                        : isStart
                          ? "Start"
                          : "Empty"
                }
              >
                {isPlayer && "🧭"}
                {!isPlayer && isTreasure && "💎"}
                {isWall && "🧱"}
                {!isPlayer && !isTreasure && !isWall && isStart && (
                  <span className="text-xs text-[var(--color-text-muted)]">S</span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Direction buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        {DIR_LABELS.map(({ dir, emoji, label }) => (
          <button
            key={dir}
            type="button"
            onClick={() => addCommand(dir)}
            disabled={isRunning}
            className="flex min-h-[48px] items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-5 py-3 text-base font-medium text-[var(--color-text-primary)] transition-transform duration-150 hover:scale-105 hover:bg-[var(--color-bg-surface-hover)] active:scale-95 disabled:opacity-40"
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Command strip */}
      {commands.length > 0 && (
        <div className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <p className="mb-3 text-xs font-medium text-[var(--color-text-muted)]">
            Commands ({commands.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {commands.map((dir, i) => {
              const info = DIR_LABELS.find((d) => d.dir === dir);
              const isActive = isRunning && i === runStep;
              return (
                <div
                  key={i}
                  className={cn(
                    "rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface-hover)] px-3 py-2 text-sm text-[var(--color-text-primary)] transition-all duration-200",
                    isActive && "scale-110 ring-2 ring-[var(--color-accent-emerald)]"
                  )}
                >
                  {info?.emoji} {info?.label}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={go}
          disabled={isRunning || commands.length === 0}
          className="min-h-[48px] rounded-2xl bg-[var(--color-accent-emerald)] px-8 py-3 text-base font-semibold text-white transition-transform duration-150 hover:scale-105 active:scale-95 disabled:opacity-40"
        >
          ▶ Go
        </button>
        <button
          type="button"
          onClick={clearCommands}
          disabled={isRunning}
          className="min-h-[48px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-8 py-3 text-base font-medium text-[var(--color-text-secondary)] transition-transform duration-150 hover:scale-105 active:scale-95 disabled:opacity-40"
        >
          Clear
        </button>
        {messageType === "success" && levelIndex < LEVELS.length - 1 && (
          <button
            type="button"
            onClick={nextLevel}
            className="min-h-[48px] rounded-2xl bg-[#60a5fa] px-8 py-3 text-base font-semibold text-white transition-transform duration-150 hover:scale-105 active:scale-95"
          >
            Next Level →
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          className={cn(
            "w-full rounded-2xl p-4 text-center text-base font-medium",
            messageType === "success"
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          )}
        >
          {message}
        </div>
      )}

      {/* What you just learned */}
      {completed && (
        <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 backdrop-blur-xl">
          <h3 className="mb-2 text-sm font-semibold text-[var(--color-accent-emerald)]">
            What you just learned
          </h3>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            You just gave a computer directions — step by step. Computers can only do exactly what
            you tell them. If the directions are wrong, they go to the wrong place.
          </p>
        </div>
      )}
    </div>
  );
}
