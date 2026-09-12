import { useEffect, useState } from "react";

/** Keep a clock in subscribed state; pausing freezes elapsed-time displays at completion. */
export function useCurrentTime(isRunning: boolean = true, intervalMs: number = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval((): void => setNow(Date.now()), intervalMs);
    return (): void => clearInterval(timer);
  }, [isRunning, intervalMs]);
  return now;
}
