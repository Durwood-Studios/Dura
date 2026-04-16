"use client";

import { useEffect, useState, useCallback } from "react";
import { Download, X, Monitor, Smartphone } from "lucide-react";

const DISMISSED_KEY = "dura-install-dismissed";
const SHOW_DELAY_MS = 60_000;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "windows" | "macos" | "linux" | "android" | "ios" | "unknown";
type Browser = "chrome" | "edge" | "firefox" | "safari" | "samsung" | "unknown";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  const platform = (navigator.platform || "").toLowerCase();

  if (/ipad|iphone|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  if (/mac/.test(platform)) return "macos";
  if (/win/.test(platform)) return "windows";
  if (/linux/.test(platform)) return "linux";
  return "unknown";
}

function detectBrowser(): Browser {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();

  if (/samsungbrowser/.test(ua)) return "samsung";
  if (/edg\//.test(ua)) return "edge";
  if (/chrome/.test(ua) && !/edg\//.test(ua)) return "chrome";
  if (/firefox/.test(ua)) return "firefox";
  if (/safari/.test(ua) && !/chrome/.test(ua)) return "safari";
  return "unknown";
}

function getInstallInstructions(
  platform: Platform,
  browser: Browser
): { title: string; steps: string[] } {
  // Chrome/Edge on desktop — native prompt available
  if (
    (browser === "chrome" || browser === "edge") &&
    (platform === "windows" || platform === "macos" || platform === "linux")
  ) {
    return {
      title: `Install on ${platform === "macos" ? "Mac" : platform === "windows" ? "Windows" : "Linux"}`,
      steps: [
        "Click the install button below, or",
        `Look for the install icon (⊕) in your ${browser === "edge" ? "Edge" : "Chrome"} address bar`,
        "DURA will open as a standalone app with its own window",
      ],
    };
  }

  // Firefox desktop — no beforeinstallprompt
  if (
    browser === "firefox" &&
    (platform === "windows" || platform === "macos" || platform === "linux")
  ) {
    return {
      title: `Install on ${platform === "macos" ? "Mac" : platform === "windows" ? "Windows" : "Linux"}`,
      steps: [
        "Firefox doesn't support PWA install directly",
        "Open DURA in Chrome or Edge for the best install experience",
        "Or bookmark this page for quick access",
      ],
    };
  }

  // Safari desktop (macOS)
  if (browser === "safari" && platform === "macos") {
    return {
      title: "Install on Mac",
      steps: [
        "In Safari, click File → Add to Dock (macOS Sonoma+)",
        "Or click the Share button → Add to Home Screen",
        "DURA will appear in your Dock as a standalone app",
      ],
    };
  }

  // iOS Safari
  if (platform === "ios") {
    return {
      title: "Install on iPhone/iPad",
      steps: [
        "Tap the Share button (↑) at the bottom of Safari",
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" in the top right',
      ],
    };
  }

  // Android Chrome
  if (platform === "android") {
    return {
      title: "Install on Android",
      steps: [
        "Tap the install button below, or",
        "Tap the three-dot menu (⋮) in Chrome",
        'Select "Install app" or "Add to Home Screen"',
      ],
    };
  }

  return {
    title: "Install DURA",
    steps: [
      "Use your browser's menu to install or add to home screen",
      "DURA will work as a standalone app with offline support",
    ],
  };
}

/**
 * Platform-aware PWA install prompt. Detects OS and browser,
 * provides tailored installation instructions.
 *
 * W3C Web App Manifest spec compliant.
 * Follows Chrome's PWA install criteria:
 * - Served over HTTPS
 * - Has a valid manifest with required fields
 * - Has a registered service worker with a fetch handler
 * - Meets engagement heuristic (user interacted with the domain)
 */
export function InstallPrompt(): React.ReactElement | null {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [browser, setBrowser] = useState<Browser>("unknown");

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && (navigator as unknown as { standalone: boolean }).standalone);
    setIsStandalone(Boolean(standalone));
    if (standalone) return;

    if (localStorage.getItem(DISMISSED_KEY)) return;

    setPlatform(detectPlatform());
    setBrowser(detectBrowser());

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const timer = setTimeout(() => setShow(true), SHOW_DELAY_MS);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (deferredPrompt && !isStandalone && !localStorage.getItem(DISMISSED_KEY)) {
      setShow(true);
    }
  }, [deferredPrompt, isStandalone]);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShow(false);
      }
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShow(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // ignore
    }
  }, []);

  if (!show || isStandalone) return null;

  const instructions = getInstallInstructions(platform, browser);
  const PlatformIcon = platform === "ios" || platform === "android" ? Smartphone : Monitor;

  return (
    <div className="fixed right-4 bottom-20 left-4 z-40 mx-auto max-w-sm lg:right-6 lg:bottom-6 lg:left-auto">
      <div className="dura-card overflow-hidden p-5 shadow-lg">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 rounded-md p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <PlatformIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 pr-4">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              {instructions.title}
            </p>
            <ol className="mt-2 space-y-1">
              {instructions.steps.map((step, i) => (
                <li key={i} className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                  <span className="mr-1.5 font-mono text-[var(--color-text-muted)]">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>

            {deferredPrompt && (
              <button
                type="button"
                onClick={() => void handleInstall()}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600"
              >
                <Download className="h-3.5 w-3.5" />
                Install Now
              </button>
            )}

            <p className="mt-3 text-[10px] text-[var(--color-text-muted)]">
              Works offline. Your data stays on your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
