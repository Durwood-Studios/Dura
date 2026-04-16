"use client";

import { useEffect } from "react";
import { startNotificationScheduler, isEnabled, hasPermission } from "@/lib/notifications";

/**
 * Invisible component that starts the notification scheduler
 * when the user has opted in. Mount once in the app layout.
 */
export function NotificationScheduler(): null {
  useEffect(() => {
    if (!isEnabled() || !hasPermission()) return;

    const cleanup = startNotificationScheduler();
    return cleanup;
  }, []);

  return null;
}
