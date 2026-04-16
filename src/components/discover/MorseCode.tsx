"use client";

import { useCallback, useRef, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";

const MORSE_MAP: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
};

const REFERENCE_ROWS = [
  Object.entries(MORSE_MAP).slice(0, 13),
  Object.entries(MORSE_MAP).slice(13, 26),
  Object.entries(MORSE_MAP).slice(26, 36),
];

/** Converts a plain-text string to its Morse code representation. */
function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split("")
    .map((ch) => {
      if (ch === " ") return "/";
      return MORSE_MAP[ch] ?? "";
    })
    .filter(Boolean)
    .join(" ");
}

/**
 * Morse Code Machine — translate text to Morse and hear it as beeps.
 *
 * Uses the Web Audio API to produce dot/dash tones without any external
 * dependencies or audio files.
 */
export function MorseCode(): React.ReactElement {
  const [text, setText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const abortRef = useRef(false);

  const morse = textToMorse(text);

  const handleChange = useCallback(
    (value: string): void => {
      if (value.length <= 50) {
        setText(value);
        if (!hasInteracted && value.length >= 3) {
          setHasInteracted(true);
          markActivityComplete("morse-code");
        }
      }
    },
    [hasInteracted]
  );

  const playMorse = useCallback(async (): Promise<void> => {
    if (!morse || isPlaying) return;
    setIsPlaying(true);
    abortRef.current = false;

    const DOT_MS = 80;
    const DASH_MS = DOT_MS * 3;
    const SYMBOL_GAP = DOT_MS;
    const LETTER_GAP = DOT_MS * 3;
    const WORD_GAP = DOT_MS * 7;
    const FREQ = 600;

    try {
      const ctx = new AudioContext();

      const playTone = (durationMs: number): Promise<void> =>
        new Promise((resolve) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = FREQ;
          osc.type = "sine";
          gain.gain.value = 0.4;
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + durationMs / 1000);
          setTimeout(resolve, durationMs + SYMBOL_GAP);
        });

      const sleep = (ms: number): Promise<void> =>
        new Promise((resolve) => setTimeout(resolve, ms));

      const symbols = morse.split("");

      for (const sym of symbols) {
        if (abortRef.current) break;
        if (sym === ".") {
          await playTone(DOT_MS);
        } else if (sym === "-") {
          await playTone(DASH_MS);
        } else if (sym === " ") {
          await sleep(LETTER_GAP);
        } else if (sym === "/") {
          await sleep(WORD_GAP);
        }
      }

      await ctx.close();
    } catch {
      // AudioContext may not be available in all environments
    }

    setIsPlaying(false);
  }, [morse, isPlaying]);

  const stopPlaying = useCallback((): void => {
    abortRef.current = true;
  }, []);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-8 py-8">
      <h2 className="text-center text-2xl font-semibold text-[var(--color-text-primary)]">
        Morse Code Machine
      </h2>
      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Type a message and hear it in Morse code
      </p>

      {/* Text input */}
      <div className="w-full">
        <input
          type="text"
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Type your message..."
          maxLength={50}
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-5 py-4 text-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] transition-colors outline-none focus:border-[var(--color-accent-emerald)]"
        />
        <p className="mt-1.5 text-right text-xs text-[var(--color-text-muted)]">{text.length}/50</p>
      </div>

      {/* Morse output */}
      <div className="min-h-[56px] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-5 py-4 backdrop-blur-xl">
        <p className="font-[family-name:var(--font-mono)] text-xl tracking-[0.3em] break-all text-[var(--color-accent-emerald)]">
          {morse || <span className="text-[var(--color-text-muted)]">· · · − − − · · ·</span>}
        </p>
      </div>

      {/* Play / Stop button */}
      <button
        type="button"
        onClick={isPlaying ? stopPlaying : playMorse}
        disabled={!morse}
        className="rounded-xl bg-[var(--color-accent-emerald)] px-8 py-3.5 text-lg font-semibold text-black transition-opacity disabled:opacity-30"
      >
        {isPlaying ? "Stop" : "Play"}
      </button>

      {/* Reference chart */}
      <details className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] backdrop-blur-xl">
        <summary className="cursor-pointer px-5 py-3.5 text-sm font-semibold text-[var(--color-text-secondary)]">
          Morse Code Reference
        </summary>
        <div className="flex flex-col gap-3 px-5 pt-2 pb-5">
          {REFERENCE_ROWS.map((row, ri) => (
            <div key={ri} className="flex flex-wrap gap-x-4 gap-y-1.5">
              {row.map(([char, code]) => (
                <span key={char} className="flex items-center gap-1.5 text-sm">
                  <span className="w-4 text-center font-semibold text-[var(--color-text-primary)]">
                    {char}
                  </span>
                  <span className="font-[family-name:var(--font-mono)] tracking-wider text-[var(--color-text-muted)]">
                    {code}
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </details>

      {/* What you just learned */}
      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 backdrop-blur-xl">
        <h3 className="mb-2 text-sm font-semibold text-[var(--color-accent-emerald)]">
          What you just learned
        </h3>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Morse code was one of the first ways humans encoded information. A computer&apos;s binary
          (0s and 1s) works the same way — simple signals combined to represent anything.
        </p>
      </div>
    </div>
  );
}
