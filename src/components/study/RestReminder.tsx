"use client";

import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";

const SESSION_START_KEY = "dura-session-start";
const LESSON_COUNT_KEY = "dura-session-lessons";
const DISMISSED_KEY = "dura-rest-dismissed";

const REST_THRESHOLD_MS = 90 * 60 * 1000; // 90 minutes
const LESSON_THRESHOLD = 5;
const CHECK_INTERVAL_MS = 60_000; // check every minute

/**
 * Non-blocking rest reminder banner.
 * Appears after 90+ minutes of continuous study or 5+ lesson completions
 * in the current session. Uses sessionStorage so it resets on tab close.
 */
export function RestReminder(): React.ReactElement | null {
  const [minutesStudied, setMinutesStudied] = useState(0);
  const [shouldShow, setShouldShow] = useState(false);

  const checkConditions = useCallback((): void => {
    if (sessionStorage.getItem(DISMISSED_KEY)) {
      setShouldShow(false);
      return;
    }

    const startStr = sessionStorage.getItem(SESSION_START_KEY);
    if (!startStr) {
      sessionStorage.setItem(SESSION_START_KEY, String(Date.now()));
      return;
    }

    const elapsed = Date.now() - Number(startStr);
    const lessons = Number(sessionStorage.getItem(LESSON_COUNT_KEY) ?? "0");

    setMinutesStudied(Math.round(elapsed / 60_000));
    setShouldShow(elapsed >= REST_THRESHOLD_MS || lessons >= LESSON_THRESHOLD);
  }, []);

  useEffect(() => {
    // Ensure session start is tracked
    if (!sessionStorage.getItem(SESSION_START_KEY)) {
      sessionStorage.setItem(SESSION_START_KEY, String(Date.now()));
    }

    checkConditions();
    const id = setInterval(checkConditions, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [checkConditions]);

  // Listen for lesson completions via custom event
  useEffect(() => {
    const handler = (): void => {
      const current = Number(sessionStorage.getItem(LESSON_COUNT_KEY) ?? "0");
      sessionStorage.setItem(LESSON_COUNT_KEY, String(current + 1));
      checkConditions();
    };
    window.addEventListener("dura:lesson-complete", handler);
    return () => window.removeEventListener("dura:lesson-complete", handler);
  }, [checkConditions]);

  function dismiss(): void {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setShouldShow(false);
  }

  if (!shouldShow) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-between gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-5 py-3"
    >
      <p className="text-sm text-cyan-300/80">
        You&apos;ve been at it for {minutesStudied} minutes. Your brain consolidates knowledge
        during rest.
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 rounded-md p-1 text-cyan-400/60 transition-colors hover:bg-cyan-500/10 hover:text-cyan-300"
        aria-label="Dismiss rest reminder"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Call this when a lesson is completed to increment the session counter.
 * Can be imported and called from lesson completion logic.
 */
export function recordLessonCompletion(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("dura:lesson-complete"));
}
