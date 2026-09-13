"use client";

import { useEffect } from "react";
import {
  startNotificationScheduler,
  isEnabled,
  hasPermission,
  NOTIFICATION_PREFERENCE_EVENT,
} from "@/lib/notifications";

/** Keep foreground reminder scheduling synchronized with permission and opt-in. */
export function NotificationScheduler(): null {
  useEffect(() => {
    let stop: (() => void) | undefined;
    const synchronize = (): void => {
      stop?.();
      stop = undefined;
      if (isEnabled() && hasPermission()) stop = startNotificationScheduler();
    };
    synchronize();
    window.addEventListener(NOTIFICATION_PREFERENCE_EVENT, synchronize);
    window.addEventListener("storage", synchronize);
    window.addEventListener("focus", synchronize);
    window.addEventListener("dura:storage-owner-ready", synchronize);
    return (): void => {
      stop?.();
      window.removeEventListener(NOTIFICATION_PREFERENCE_EVENT, synchronize);
      window.removeEventListener("storage", synchronize);
      window.removeEventListener("focus", synchronize);
      window.removeEventListener("dura:storage-owner-ready", synchronize);
    };
  }, []);
  return null;
}
