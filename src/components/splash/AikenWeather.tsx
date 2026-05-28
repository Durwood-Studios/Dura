"use client";

import { useEffect, useState } from "react";

// v2: v1 cached wttr.in's full HTML page (browser UA bug); the key bump
// abandons any poisoned v1 entry instead of serving it for up to 30 min.
const STORAGE_KEY = "dura-aiken-weather-v2";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CachedWeather {
  text: string;
  timestamp: number;
}

/** A valid reading is short, plain text — never HTML or an error sentinel. */
function isValidWeather(text: string): boolean {
  return text.length > 0 && text.length <= 60 && !text.includes("<") && !text.includes("Unknown");
}

/** Displays current time and weather for Aiken, SC. Fails silently. */
export function AikenWeather(): React.ReactElement | null {
  const [weather, setWeather] = useState<string | null>(null);
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    setTime(formatter.format(new Date()));

    const interval = setInterval(() => {
      setTime(formatter.format(new Date()));
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchWeather(): Promise<void> {
      try {
        const cached = sessionStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed: CachedWeather = JSON.parse(cached) as CachedWeather;
          // Validate the cached value too — never trust storage blindly.
          if (Date.now() - parsed.timestamp < CACHE_TTL_MS && isValidWeather(parsed.text)) {
            setWeather(parsed.text);
            return;
          }
          sessionStorage.removeItem(STORAGE_KEY);
        }

        // Same-origin proxy — the server fetches wttr.in with a curl UA so we
        // get the compact text form instead of wttr.in's browser HTML page.
        const res = await fetch("/api/v1/weather", {
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return;

        const text = (await res.text()).trim().replace(/^\+/, "");
        // Defense in depth: never render an oversized/HTML payload.
        if (!isValidWeather(text)) return;

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ text, timestamp: Date.now() }));
        setWeather(text);
      } catch {
        // Fail silently
      }
    }

    void fetchWeather();
  }, []);

  if (!time) return null;

  return (
    <div className="mt-1.5 text-center text-xs text-[#A3A3A3] sm:text-left dark:text-[#6b6b75]">
      Aiken, SC{time ? ` · ${time}` : ""}
      {weather ? ` · ${weather}` : ""}
      {" · 202+ commits of care"}
    </div>
  );
}
