"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "dura-aiken-weather";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CachedWeather {
  text: string;
  timestamp: number;
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
          if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
            setWeather(parsed.text);
            return;
          }
        }

        const res = await fetch("https://wttr.in/Aiken,SC?format=%t+%C", {
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return;

        const text = (await res.text()).trim().replace(/^\+/, "");
        if (!text || text.includes("Unknown")) return;

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
    <div className="mt-1.5 text-center text-[10px] text-[#A3A3A3] sm:text-left dark:text-[#6b6b75]">
      Aiken, SC{time ? ` · ${time}` : ""}
      {weather ? ` · ${weather}` : ""}
      {" · 202+ commits of care"}
    </div>
  );
}
