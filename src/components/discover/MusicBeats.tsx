"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";

const INSTRUMENTS = ["Kick", "Snare", "Hi-Hat", "Clap"] as const;
const BEATS = 8;

const INSTRUMENT_COLORS: Record<string, string> = {
  Kick: "#f97316",
  Snare: "#a78bfa",
  "Hi-Hat": "#22d3ee",
  Clap: "#f472b6",
};

/** Creates a white-noise AudioBuffer for snare/clap sounds. */
function createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/** Plays a single instrument hit using Web Audio API. */
function playSound(ctx: AudioContext, instrument: string): void {
  const now = ctx.currentTime;

  if (instrument === "Kick") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.15);
  } else if (instrument === "Snare") {
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 0.1);
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 1000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.1);
  } else if (instrument === "Hi-Hat") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = "square";
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.05);
  } else {
    // Clap: filtered noise burst
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 0.08);
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2000;
    filter.Q.value = 1;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.08);
  }
}

type Grid = boolean[][];

function createEmptyGrid(): Grid {
  return INSTRUMENTS.map(() => Array.from({ length: BEATS }, () => false));
}

/** A step-sequencer beat maker using Web Audio API. */
export function MusicBeats(): React.ReactElement {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [bpm, setBpm] = useState(120);
  const [hasCompleted, setHasCompleted] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const beatRef = useRef(-1);
  const gridRef = useRef(grid);

  // Keep gridRef in sync
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  const getAudioCtx = useCallback((): AudioContext => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  const toggleCell = useCallback(
    (row: number, col: number): void => {
      setGrid((prev) => {
        const next = prev.map((r) => [...r]);
        next[row][col] = !next[row][col];
        return next;
      });

      // Mark complete once kid has toggled at least 4 cells
      if (!hasCompleted) {
        const activeCount = grid.flat().filter(Boolean).length;
        if (activeCount >= 3) {
          setHasCompleted(true);
          markActivityComplete("music-beats");
        }
      }
    },
    [grid, hasCompleted]
  );

  const stop = useCallback((): void => {
    setIsPlaying(false);
    setCurrentBeat(-1);
    beatRef.current = -1;
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const play = useCallback((): void => {
    const ctx = getAudioCtx();
    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    beatRef.current = -1;
    setIsPlaying(true);

    const interval = (60 / bpm) * 1000;
    timerRef.current = window.setInterval(() => {
      beatRef.current = (beatRef.current + 1) % BEATS;
      const beat = beatRef.current;
      setCurrentBeat(beat);

      INSTRUMENTS.forEach((inst, row) => {
        if (gridRef.current[row][beat]) {
          playSound(ctx, inst);
        }
      });
    }, interval);
  }, [bpm, getAudioCtx]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, []);

  const randomize = useCallback((): void => {
    setGrid(INSTRUMENTS.map(() => Array.from({ length: BEATS }, () => Math.random() > 0.65)));
  }, []);

  const clear = useCallback((): void => {
    setGrid(createEmptyGrid());
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Step sequencer grid */}
      <div className="flex flex-col gap-2">
        {INSTRUMENTS.map((inst, row) => (
          <div key={inst} className="flex items-center gap-2">
            <span className="w-16 text-right text-base font-medium text-white/80">{inst}</span>
            <div className="flex gap-1.5">
              {Array.from({ length: BEATS }, (_, col) => {
                const isActive = grid[row][col];
                const isCurrent = col === currentBeat && isPlaying;
                return (
                  <button
                    key={col}
                    onClick={() => toggleCell(row, col)}
                    aria-label={`${inst} beat ${col + 1} ${isActive ? "on" : "off"}`}
                    className="size-12 min-h-12 min-w-12 rounded-xl border-2 transition-all hover:scale-105"
                    style={{
                      backgroundColor: isActive
                        ? INSTRUMENT_COLORS[inst]
                        : "rgba(255,255,255,0.06)",
                      borderColor: isCurrent
                        ? "#fff"
                        : isActive
                          ? INSTRUMENT_COLORS[inst]
                          : "rgba(255,255,255,0.1)",
                      opacity: isCurrent && !isActive ? 0.6 : 1,
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex w-full max-w-md flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-lg font-medium text-white/90">BPM: {bpm}</span>
          <input
            type="range"
            min={80}
            max={160}
            value={bpm}
            onChange={(e) => {
              const val = Number(e.target.value);
              setBpm(val);
              if (isPlaying) {
                stop();
                // Restart with new BPM on next tick
                setTimeout(() => play(), 50);
              }
            }}
            className="h-3 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-orange-400"
          />
        </label>

        <div className="flex gap-3">
          <button
            onClick={isPlaying ? stop : play}
            className="min-h-12 flex-1 rounded-xl bg-orange-500 px-6 text-lg font-semibold text-white transition-colors hover:bg-orange-400"
          >
            {isPlaying ? "Stop" : "Play"}
          </button>
          <button
            onClick={randomize}
            className="min-h-12 rounded-xl border border-white/10 bg-white/5 px-5 text-lg font-medium text-white/90 transition-colors hover:bg-white/10"
          >
            Randomize
          </button>
          <button
            onClick={clear}
            className="min-h-12 rounded-xl border border-white/10 bg-white/5 px-5 text-lg font-medium text-white/90 transition-colors hover:bg-white/10"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Learning callout */}
      <div className="w-full max-w-md rounded-2xl border border-orange-400/20 bg-orange-400/5 p-5">
        <p className="text-lg leading-relaxed text-orange-200">
          <strong className="text-orange-300">What you just learned:</strong> You just created a{" "}
          <em>loop</em> &mdash; the beat repeats the same 8 steps over and over. Loops are one of
          the most important ideas in programming. Every song, animation, and game uses them.
        </p>
      </div>
    </div>
  );
}
