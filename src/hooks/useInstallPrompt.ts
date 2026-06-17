"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * One source of truth for PWA installability across the app.
 *
 * Chromium (Chrome/Edge/Android) fires `beforeinstallprompt`; we capture and
 * defer it so any surface — a nav button, a toast — can trigger the native
 * install with a single click via `promptInstall()`. iOS Safari and Firefox
 * expose no install API at all (Apple/Mozilla limitation), so `canInstall`
 * stays false there and callers fall back to the guided `/install` page.
 *
 * The listeners attach once at module level so the event isn't missed if it
 * fires before a particular component mounts. State is published through an
 * external store (SSR-safe: the server snapshot is "not installable").
 */

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export type InstallPlatform = "ios" | "android" | "desktop" | "unknown";

let deferred: BeforeInstallPromptEvent | null = null;
let installed = false;
let version = 0;
let initialized = false;
const listeners = new Set<() => void>();

function emit(): void {
  version += 1;
  for (const l of listeners) l();
}

function init(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  window.addEventListener("beforeinstallprompt", (e) => {
    // Prevent Chrome's mini-infobar; we surface our own one-click button.
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    installed = true;
    emit();
  });
}

function subscribe(cb: () => void): () => void {
  init();
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

const getSnapshot = (): number => version;
const getServerSnapshot = (): number => 0;

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as unknown as { standalone?: boolean }).standalone === true)
  );
}

function detectPlatform(): InstallPlatform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  const plat = (navigator.platform || "").toLowerCase();
  // iPadOS 13+ reports as desktop Mac but has touch — treat as iOS.
  if (/ipad|iphone|ipod/.test(ua) || (/mac/.test(plat) && navigator.maxTouchPoints > 1))
    return "ios";
  if (/android/.test(ua)) return "android";
  if (/win|mac|linux|cros/.test(plat)) return "desktop";
  return "unknown";
}

export interface InstallState {
  /** True on Chromium when a native one-click install is available right now. */
  canInstall: boolean;
  /** True when DURA is already running as an installed app. */
  isStandalone: boolean;
  installed: boolean;
  platform: InstallPlatform;
  /** Triggers the native install dialog. Resolves to the user's choice. */
  promptInstall: () => Promise<"accepted" | "dismissed" | "unavailable">;
}

export function useInstallPrompt(): InstallState {
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const standalone = isStandalone();
  const canInstall = deferred !== null && !standalone && !installed;

  const promptInstall = useCallback(async (): Promise<"accepted" | "dismissed" | "unavailable"> => {
    if (!deferred) return "unavailable";
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      deferred = null;
      emit();
      return choice.outcome;
    } catch {
      return "unavailable";
    }
  }, []);

  return {
    canInstall,
    isStandalone: standalone,
    installed,
    platform: detectPlatform(),
    promptInstall,
  };
}
