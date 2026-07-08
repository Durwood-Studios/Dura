"use client";

import { useEffect, useRef } from "react";
import { useProgressStore } from "@/stores/progress";
import { usePreferencesStore } from "@/stores/preferences";
import { throttle } from "@/lib/utils";

interface ScrollTrackerProps {
  lessonId: string;
  phaseId: string;
  moduleId: string;
}

const TICK_MS = 1000;

/**
 * Mounts at the top of a lesson page. Starts the lesson in the progress
 * store, listens to window scroll for scroll percent, and ticks elapsed
 * time once per second.
 */
export function ScrollTracker({
  lessonId,
  phaseId,
  moduleId,
}: ScrollTrackerProps): React.ReactElement | null {
  const start = useProgressStore((s) => s.start);
  const setScroll = useProgressStore((s) => s.setScroll);
  const tick = useProgressStore((s) => s.tick);
  const studyMode = usePreferencesStore((s) => s.prefs.studyMode);
  const startedFor = useRef<string | null>(null);

  useEffect(() => {
    if (startedFor.current === lessonId) return;
    startedFor.current = lessonId;
    void start(lessonId, phaseId, moduleId);
  }, [lessonId, phaseId, moduleId, start]);

  useEffect(() => {
    // In bite mode the page barely scrolls (short segments), so window
    // scroll is not a reading signal — the unscrollable-page shortcut
    // below would mark "read" instantly. BiteMode reports segment-based
    // progress instead.
    if (studyMode === "bite") return;

    const onScroll = throttle(() => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) {
        setScroll(100);
        return;
      }
      const percent = Math.min(100, Math.round((window.scrollY / max) * 100));
      setScroll(percent);
    }, 200);

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [setScroll, studyMode]);

  useEffect(() => {
    let last = Date.now();
    const interval = setInterval(() => {
      if (document.visibilityState !== "visible") {
        last = Date.now();
        return;
      }
      const now = Date.now();
      tick(now - last);
      last = now;
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [tick]);

  return null;
}
