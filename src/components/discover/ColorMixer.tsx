"use client";

import { useCallback, useMemo, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";

interface Challenge {
  name: string;
  r: number;
  g: number;
  b: number;
  tolerance: number;
}

const CHALLENGES: Challenge[] = [
  { name: "Red", r: 255, g: 0, b: 0, tolerance: 50 },
  { name: "Green", r: 0, g: 200, b: 0, tolerance: 50 },
  { name: "Purple", r: 150, g: 0, b: 200, tolerance: 60 },
  { name: "Orange", r: 255, g: 150, b: 0, tolerance: 60 },
];

const MATCHES_NEEDED = 2;

/** Check if the current color is close enough to the target. */
function isColorMatch(r: number, g: number, b: number, target: Challenge): boolean {
  const dr = Math.abs(r - target.r);
  const dg = Math.abs(g - target.g);
  const db = Math.abs(b - target.b);
  return dr <= target.tolerance && dg <= target.tolerance && db <= target.tolerance;
}

/** A color mixing activity with RGB sliders for early elementary learners. */
export function ColorMixer(): React.ReactElement {
  const [red, setRed] = useState(128);
  const [green, setGreen] = useState(128);
  const [blue, setBlue] = useState(128);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const challenge = CHALLENGES[challengeIndex];
  const mixedColor = useMemo(() => `rgb(${red}, ${green}, ${blue})`, [red, green, blue]);

  const checkMatch = useCallback(
    (r: number, g: number, b: number): void => {
      if (showMatch || isComplete) return;
      if (!challenge) return;

      if (isColorMatch(r, g, b, challenge)) {
        setShowMatch(true);
        const newCount = matchCount + 1;
        setMatchCount(newCount);

        if (newCount >= MATCHES_NEEDED) {
          setTimeout(() => {
            setIsComplete(true);
            markActivityComplete("color-mixer");
          }, 1200);
        } else {
          setTimeout(() => {
            setShowMatch(false);
            // Move to next challenge
            setChallengeIndex((prev) => (prev + 1) % CHALLENGES.length);
            setRed(128);
            setGreen(128);
            setBlue(128);
          }, 1200);
        }
      }
    },
    [challenge, matchCount, showMatch, isComplete]
  );

  const handleRedChange = useCallback(
    (value: number): void => {
      setRed(value);
      checkMatch(value, green, blue);
    },
    [green, blue, checkMatch]
  );

  const handleGreenChange = useCallback(
    (value: number): void => {
      setGreen(value);
      checkMatch(red, value, blue);
    },
    [red, blue, checkMatch]
  );

  const handleBlueChange = useCallback(
    (value: number): void => {
      setBlue(value);
      checkMatch(red, green, value);
    },
    [red, green, checkMatch]
  );

  const handleReset = useCallback((): void => {
    setRed(128);
    setGreen(128);
    setBlue(128);
    setChallengeIndex(0);
    setMatchCount(0);
    setShowMatch(false);
    setIsComplete(false);
  }, []);

  if (isComplete) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <p className="text-3xl font-bold text-[var(--color-text-primary)]">Color master!</p>
        <div className="flex gap-1 text-3xl">
          {["🎨", "🌈", "🎨"].map((emoji, i) => (
            <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 120}ms` }}>
              {emoji}
            </span>
          ))}
        </div>
        <button
          onClick={handleReset}
          className="mt-4 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Challenge prompt */}
      {challenge && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg text-[var(--color-text-secondary)]">Try to make:</p>
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full border-2 border-[var(--color-border)]"
              style={{
                backgroundColor: `rgb(${challenge.r}, ${challenge.g}, ${challenge.b})`,
              }}
            />
            <span className="text-2xl font-bold text-[var(--color-text-primary)]">
              {challenge.name}
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">
            {matchCount} of {MATCHES_NEEDED} matched
          </p>
        </div>
      )}

      {/* Match celebration */}
      {showMatch && (
        <p className="animate-in text-xl font-bold text-emerald-400 duration-300 fade-in">
          That&apos;s {challenge?.name}!
        </p>
      )}

      {/* Color preview circle */}
      <div
        className="h-40 w-40 rounded-full border-4 border-[var(--color-border)] shadow-lg transition-colors duration-150 sm:h-48 sm:w-48"
        style={{ backgroundColor: mixedColor }}
      />

      {/* RGB values */}
      <p className="font-mono text-sm text-[var(--color-text-muted)]">
        R: {red} &nbsp; G: {green} &nbsp; B: {blue}
      </p>

      {/* Sliders */}
      <div className="flex w-full max-w-sm flex-col gap-6">
        {/* Red slider */}
        <div className="flex flex-col gap-2">
          <label htmlFor="red-slider" className="text-sm font-medium" style={{ color: "#ef4444" }}>
            Red
          </label>
          <input
            id="red-slider"
            type="range"
            min={0}
            max={255}
            value={red}
            onChange={(e) => handleRedChange(Number(e.target.value))}
            className="color-mixer-slider h-3 w-full cursor-pointer appearance-none rounded-full"
            style={
              {
                background: `linear-gradient(to right, #000, #ef4444)`,
                "--thumb-color": "#ef4444",
              } as React.CSSProperties
            }
          />
        </div>

        {/* Green slider */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="green-slider"
            className="text-sm font-medium"
            style={{ color: "#22c55e" }}
          >
            Green
          </label>
          <input
            id="green-slider"
            type="range"
            min={0}
            max={255}
            value={green}
            onChange={(e) => handleGreenChange(Number(e.target.value))}
            className="color-mixer-slider h-3 w-full cursor-pointer appearance-none rounded-full"
            style={
              {
                background: `linear-gradient(to right, #000, #22c55e)`,
                "--thumb-color": "#22c55e",
              } as React.CSSProperties
            }
          />
        </div>

        {/* Blue slider */}
        <div className="flex flex-col gap-2">
          <label htmlFor="blue-slider" className="text-sm font-medium" style={{ color: "#3b82f6" }}>
            Blue
          </label>
          <input
            id="blue-slider"
            type="range"
            min={0}
            max={255}
            value={blue}
            onChange={(e) => handleBlueChange(Number(e.target.value))}
            className="color-mixer-slider h-3 w-full cursor-pointer appearance-none rounded-full"
            style={
              {
                background: `linear-gradient(to right, #000, #3b82f6)`,
                "--thumb-color": "#3b82f6",
              } as React.CSSProperties
            }
          />
        </div>
      </div>

      {/* Slider thumb styling */}
      <style>{`
        .color-mixer-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--thumb-color, #fff);
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          cursor: pointer;
        }
        .color-mixer-slider::-moz-range-thumb {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--thumb-color, #fff);
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default ColorMixer;
