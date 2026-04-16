"use client";

import { useEffect, useState, useCallback } from "react";
import { Download, X } from "lucide-react";

const DISMISSED_KEY = "dura-install-dismissed";
const SHOW_DELAY_MS = 60_000; // Show after 1 minute of use

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Custom PWA install prompt. Shows a friendly banner after the user
 * has been using the app for at least 1 minute. Only appears once
 * per device (dismissed state stored in localStorage).
 *
 * On iOS (no beforeinstallprompt), shows manual instructions.
 * On Android/desktop Chrome, shows the native install prompt.
 */
export function InstallPrompt(): React.ReactElement | null {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && (navigator as unknown as { standalone: boolean }).standalone);
    setIsStandalone(Boolean(standalone));
    if (standalone) return;

    // Don't show if dismissed
    if (localStorage.getItem(DISMISSED_KEY)) return;

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
    setIsIOS(ios);

    // Listen for beforeinstallprompt (Chrome, Edge, Samsung Internet)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Show after delay
    const timer = setTimeout(() => {
      if (ios || deferredPrompt) {
        setShow(true);
      }
    }, SHOW_DELAY_MS);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, [deferredPrompt]);

  // Also show when deferred prompt arrives (may be after the delay)
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

  return (
    <div className="fixed right-4 bottom-20 left-4 z-40 mx-auto max-w-md animate-in duration-300 slide-in-from-bottom lg:right-6 lg:bottom-6 lg:left-auto">
      <div className="dura-card overflow-hidden p-4 shadow-lg">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-2 right-2 rounded-md p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Install DURA</p>
            <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
              Add to your home screen for faster access, offline use, and a distraction-free
              learning experience.
            </p>

            {isIOS ? (
              <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                Tap the share button <span className="font-mono">&#x2B06;&#xFE0E;</span> in Safari,
                then &ldquo;Add to Home Screen.&rdquo;
              </p>
            ) : deferredPrompt ? (
              <button
                type="button"
                onClick={() => void handleInstall()}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600"
              >
                <Download className="h-3.5 w-3.5" />
                Install
              </button>
            ) : (
              <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                Use your browser menu to install this app.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
