import { ownerStorageKey, isOwnerInitialized } from "@/lib/storage/owner";
/**
 * Local push notifications — no server, no database, no network required.
 *
 * Uses the Web Notification API + IndexedDB state to trigger
 * contextual reminders. All logic runs client-side.
 *
 * Reminders are checked while a DURA page is open. A service worker
 * displays supported mobile notifications; it does not schedule wakeups.
 */

import { getAllEncryptedLessonProgress } from "@/lib/idb/encrypted-store";
import { dailyStudyMinutes, localDayKey } from "@/lib/study-time";
import { getDB } from "@/lib/db";
import { getDueCards } from "@/lib/db/flashcards";
import { getPreferences } from "@/lib/db/preferences";
import { isStreakAlive } from "@/lib/streak";

export const NOTIFICATION_PREFERENCE_EVENT = "dura:notification-preference";

const PERMISSION_KEY = "dura-notifications-enabled";
const LAST_STREAK_REMINDER_KEY = "dura-last-streak-reminder";
const LAST_REVIEW_REMINDER_KEY = "dura-last-review-reminder";
const LAST_GOAL_REMINDER_KEY = "dura-last-goal-reminder";

// Don't remind more than once per 4 hours
const REMINDER_COOLDOWN_MS = 4 * 60 * 60 * 1000;

/** Check if we have notification permission. */
export function hasPermission(): boolean {
  if (typeof Notification === "undefined") return false;
  return Notification.permission === "granted";
}

/** Check if notifications are supported in this browser. */
export function isSupported(): boolean {
  return typeof Notification !== "undefined" && "serviceWorker" in navigator;
}

/** Check if the user has opted into DURA notifications. */
export function isEnabled(): boolean {
  if (typeof localStorage === "undefined" || !isOwnerInitialized()) return false;
  try {
    return localStorage.getItem(ownerStorageKey(PERMISSION_KEY)) === "true";
  } catch (error) {
    console.warn("[notifications] Preference unavailable", error);
    return false;
  }
}

/**
 * Request notification permission. Returns true if granted.
 * Only call this in response to a user action (button click).
 */
export async function requestPermission(): Promise<boolean> {
  if (!isSupported()) return false;

  const result = await Notification.requestPermission();
  if (result === "granted") {
    try {
      localStorage.setItem(ownerStorageKey(PERMISSION_KEY), "true");
      window.dispatchEvent(new Event(NOTIFICATION_PREFERENCE_EVENT));
    } catch (error) {
      console.error("[notifications] Could not save consent", error);
      return false;
    }
    return true;
  }
  return false;
}

/** Disable notifications. */
export function disableNotifications(): void {
  try {
    localStorage.setItem(ownerStorageKey(PERMISSION_KEY), "false");
    window.dispatchEvent(new Event(NOTIFICATION_PREFERENCE_EVENT));
  } catch (error) {
    console.error("[notifications] Preference could not be saved", error);
    throw new Error("The reminder preference could not be saved. Please retry.", { cause: error });
  }
}

/** Send a notification if permitted. Returns true if sent. */
async function notify(title: string, body: string, tag: string): Promise<boolean> {
  if (!hasPermission() || !isEnabled()) return false;

  try {
    const options: NotificationOptions = {
      body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      tag, // Prevents duplicate notifications with same tag
      silent: false,
    };
    const registration =
      "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
    if (registration) {
      await registration.showNotification(title, options);
      return true;
    }
    const notification = new Notification(title, options);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (error) {
    console.warn("[notifications] Delivery failed", error);
    return false;
  }
}

/** Check if a reminder cooldown has passed. */
function canRemind(key: string): boolean {
  try {
    const last = localStorage.getItem(ownerStorageKey(key));
    if (!last) return true;
    return Date.now() - parseInt(last, 10) > REMINDER_COOLDOWN_MS;
  } catch {
    return true;
  }
}

/** Mark a reminder as sent. */
function markReminded(key: string): void {
  try {
    localStorage.setItem(ownerStorageKey(key), Date.now().toString());
  } catch {
    // ignore
  }
}

/**
 * Check all notification conditions and fire if appropriate.
 * Call this periodically (e.g., every 5 minutes) when the app is open.
 */
export async function checkAndNotify(): Promise<void> {
  if (!hasPermission() || !isEnabled()) return;

  await checkStreakReminder();
  await checkReviewReminder();
  await checkGoalReminder();
}

/** Remind if streak is at risk (after 6pm, no activity today). */
async function checkStreakReminder(): Promise<void> {
  if (!canRemind(LAST_STREAK_REMINDER_KEY)) return;

  const hour = new Date().getHours();
  if (hour < 18) return; // Only after 6pm

  try {
    const prefs = await getPreferences();
    if (!prefs.showStreak) return; // Respect opt-out

    const streak = prefs.streak;
    if (!streak || streak.current === 0) return;

    const activityToday =
      streak.lastActivityAt !== null &&
      localDayKey(streak.lastActivityAt) === localDayKey(Date.now());

    if (!activityToday && isStreakAlive(streak)) {
      const sent = await notify(
        "Your streak is still going",
        `${streak.current} days of consistent learning. Even 5 minutes keeps it alive.`,
        "streak-reminder"
      );
      if (sent) markReminded(LAST_STREAK_REMINDER_KEY);
    }
  } catch (error) {
    console.warn("[notifications] Streak check failed", error);
  }
}

/** Remind if flashcards are due for review. */
async function checkReviewReminder(): Promise<void> {
  if (!canRemind(LAST_REVIEW_REMINDER_KEY)) return;

  try {
    const due = await getDueCards();
    if (due.length >= 5) {
      const sent = await notify(
        "Flashcards ready for review",
        `${due.length} cards are due. A quick review session strengthens long-term memory.`,
        "review-reminder"
      );
      if (sent) markReminded(LAST_REVIEW_REMINDER_KEY);
    }
  } catch (error) {
    console.warn("[notifications] Reminder check failed", error);
  }
}

/** Remind if daily goal isn't met yet (after 8pm). */
async function checkGoalReminder(): Promise<void> {
  if (!canRemind(LAST_GOAL_REMINDER_KEY)) return;

  const hour = new Date().getHours();
  if (hour < 20) return; // Only after 8pm

  try {
    const prefs = await getPreferences();
    if (prefs.dailyGoalMinutes <= 0) return;

    const db = await getDB();
    const allProgress = await getAllEncryptedLessonProgress(db);
    const todayMinutes = dailyStudyMinutes(allProgress, Date.now());

    if (todayMinutes < prefs.dailyGoalMinutes) {
      const remaining = prefs.dailyGoalMinutes - todayMinutes;
      const sent = await notify(
        "Daily goal update",
        `${remaining} minutes left to hit your ${prefs.dailyGoalMinutes}-minute goal today.`,
        "goal-reminder"
      );
      if (sent) markReminded(LAST_GOAL_REMINDER_KEY);
    }
  } catch (error) {
    console.warn("[notifications] Reminder check failed", error);
  }
}

/**
 * Start periodic notification checks. Call once on app mount.
 * Checks every 5 minutes. Returns a cleanup function.
 */
export function startNotificationScheduler(): () => void {
  if (!isSupported()) return () => {};

  // Initial check after 30 seconds (let the app settle)
  const initialTimeout = setTimeout(() => void checkAndNotify(), 30_000);

  // Then every 5 minutes
  const interval = setInterval(() => void checkAndNotify(), 5 * 60 * 1000);

  return () => {
    clearTimeout(initialTimeout);
    clearInterval(interval);
  };
}
