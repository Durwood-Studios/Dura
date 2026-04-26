"use client";

import { useEffect, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";

type Platform = "windows" | "macos" | "linux" | "android" | "ios" | "unknown";

interface PlatformGuide {
  id: Platform;
  name: string;
  icon: React.ReactNode;
  browsers: {
    name: string;
    steps: string[];
  }[];
}

const GUIDES: PlatformGuide[] = [
  {
    id: "windows",
    name: "Windows",
    icon: <Monitor className="h-5 w-5" />,
    browsers: [
      {
        name: "Chrome",
        steps: [
          "Open dura.vercel.app in Chrome",
          'Click the install icon (⊕) in the address bar, or click ⋮ → "Install DURA"',
          'Click "Install" in the confirmation dialog',
          "DURA opens as a standalone app — find it in your Start Menu",
        ],
      },
      {
        name: "Edge",
        steps: [
          "Open dura.vercel.app in Edge",
          'Click ⋯ → Apps → "Install DURA"',
          'Click "Install" in the confirmation dialog',
          "DURA appears in your Start Menu and can be pinned to the taskbar",
        ],
      },
      {
        name: "Firefox",
        steps: [
          "Firefox does not natively support PWA installation on desktop",
          "For the best experience, open DURA in Chrome or Edge",
          "Or bookmark dura.vercel.app for quick access",
        ],
      },
    ],
  },
  {
    id: "macos",
    name: "macOS",
    icon: <Monitor className="h-5 w-5" />,
    browsers: [
      {
        name: "Chrome",
        steps: [
          "Open dura.vercel.app in Chrome",
          "Click the install icon (⊕) in the address bar",
          'Click "Install" — DURA opens as a standalone app',
          'Find it in Launchpad or spotlight search "DURA"',
        ],
      },
      {
        name: "Safari (macOS Sonoma+)",
        steps: [
          "Open dura.vercel.app in Safari",
          "Click File → Add to Dock",
          "DURA appears in your Dock as a standalone app",
          "Also available via Launchpad",
        ],
      },
      {
        name: "Edge",
        steps: [
          "Open dura.vercel.app in Edge",
          'Click ⋯ → Apps → "Install DURA"',
          "DURA opens in its own window and appears in the Applications folder",
        ],
      },
    ],
  },
  {
    id: "linux",
    name: "Linux",
    icon: <Monitor className="h-5 w-5" />,
    browsers: [
      {
        name: "Chrome / Chromium",
        steps: [
          "Open dura.vercel.app in Chrome or Chromium",
          "Click the install icon (⊕) in the address bar",
          'Click "Install" — DURA opens as a standalone app',
          "Find it in your application menu or launcher",
        ],
      },
      {
        name: "Edge",
        steps: [
          "Open dura.vercel.app in Edge for Linux",
          'Click ⋯ → Apps → "Install DURA"',
          "DURA appears in your application menu",
        ],
      },
      {
        name: "Firefox",
        steps: [
          "Firefox on Linux does not support PWA installation natively",
          "Use Chrome or Chromium for the best install experience",
          "Or bookmark dura.vercel.app for quick access",
        ],
      },
    ],
  },
  {
    id: "ios",
    name: "iPhone / iPad",
    icon: <Smartphone className="h-5 w-5" />,
    browsers: [
      {
        name: "Safari (required)",
        steps: [
          "Open dura.vercel.app in Safari (not Chrome — iOS requires Safari for PWA install)",
          "Tap the Share button (↑) at the bottom of the screen",
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" — DURA appears on your home screen as a native app',
        ],
      },
    ],
  },
  {
    id: "android",
    name: "Android",
    icon: <Smartphone className="h-5 w-5" />,
    browsers: [
      {
        name: "Chrome",
        steps: [
          "Open dura.vercel.app in Chrome",
          'Tap the install banner if it appears, or tap ⋮ → "Install app"',
          'Tap "Install" — DURA appears on your home screen',
          "Opens as a full-screen app with no browser chrome",
        ],
      },
      {
        name: "Samsung Internet",
        steps: [
          "Open dura.vercel.app in Samsung Internet",
          'Tap the menu (☰) → "Add page to" → "Home screen"',
          "DURA appears on your home screen",
        ],
      },
      {
        name: "Firefox",
        steps: [
          "Open dura.vercel.app in Firefox",
          'Tap ⋮ → "Install"',
          "DURA appears on your home screen",
        ],
      },
    ],
  },
];

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  const plat = (navigator.platform || "").toLowerCase();
  if (/ipad|iphone|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  if (/mac/.test(plat)) return "macos";
  if (/win/.test(plat)) return "windows";
  if (/linux/.test(plat)) return "linux";
  return "unknown";
}

export function InstallGuide(): React.ReactElement {
  const [activePlatform, setActivePlatform] = useState<Platform>("windows");

  useEffect(() => {
    const detected = detectPlatform();
    if (detected !== "unknown") setActivePlatform(detected);
  }, []);

  const activeGuide = GUIDES.find((g) => g.id === activePlatform) ?? GUIDES[0];

  return (
    <div>
      {/* Platform tabs */}
      <div className="flex flex-wrap gap-2">
        {GUIDES.map((guide) => (
          <button
            key={guide.id}
            type="button"
            onClick={() => setActivePlatform(guide.id)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              activePlatform === guide.id
                ? "bg-emerald-500 text-white shadow-sm"
                : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)]"
            }`}
          >
            {guide.icon}
            {guide.name}
          </button>
        ))}
      </div>

      {/* Browser instructions */}
      <div className="mt-8 space-y-6">
        {activeGuide.browsers.map((browser) => (
          <div key={browser.name} className="dura-card p-6">
            <h3 className="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">
              {browser.name}
            </h3>
            <ol className="space-y-2">
              {browser.steps.map((step, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm leading-relaxed text-[var(--color-text-secondary)]"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      {/* Requirements note */}
      <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5">
        <h3 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
          Requirements
        </h3>
        <ul className="space-y-1 text-xs text-[var(--color-text-secondary)]">
          <li>Any modern browser (Chrome 73+, Edge 79+, Safari 16.4+, Firefox 113+)</li>
          <li>HTTPS connection (handled automatically)</li>
          <li>~50MB storage for offline caching</li>
          <li>No account required — works immediately after install</li>
        </ul>
      </div>
    </div>
  );
}
