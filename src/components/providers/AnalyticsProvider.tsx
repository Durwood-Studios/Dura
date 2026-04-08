"use client";

import { useEffect } from "react";
import { startAnalyticsLoop } from "@/lib/analytics";

export function AnalyticsProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  useEffect(() => {
    const stop = startAnalyticsLoop();
    return stop;
  }, []);

  return <>{children}</>;
}
