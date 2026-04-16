import type { Metadata } from "next";
import { buildMetadata } from "@/lib/og";
import { InstallGuide } from "@/components/pwa/InstallGuide";

export const metadata: Metadata = buildMetadata({
  title: "Install DURA",
  description:
    "Download DURA as an app on Windows, Mac, Linux, iOS, or Android. Free, offline-capable, no app store required.",
  path: "/install",
});

export default function InstallPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-[720px] px-6 py-16">
      <header className="mb-12">
        <p className="font-mono text-xs tracking-widest text-[var(--color-text-muted)] uppercase">
          Install
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-[var(--color-text-primary)] sm:text-5xl">
          Take DURA with you.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-secondary)]">
          DURA is a Progressive Web App. Install it directly from your browser — no app store, no
          download manager, no account required. It works offline, stays up to date automatically,
          and your data never leaves your device.
        </p>
      </header>

      <InstallGuide />

      <section className="mt-16">
        <h2 className="mb-4 text-2xl font-semibold text-[var(--color-text-primary)]">
          What you get
        </h2>
        <ul className="space-y-3 text-[var(--color-text-secondary)]">
          <li className="flex items-start gap-3">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span>
              <strong className="text-[var(--color-text-primary)]">Standalone window.</strong> No
              browser chrome, no tabs, no distractions. Just your learning.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span>
              <strong className="text-[var(--color-text-primary)]">Offline access.</strong> Lessons,
              flashcards, sandbox, and your progress — all available without internet.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span>
              <strong className="text-[var(--color-text-primary)]">Quick launch.</strong> App icon
              in your taskbar, dock, or home screen. One tap to start learning.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span>
              <strong className="text-[var(--color-text-primary)]">Auto-updates.</strong> Always the
              latest version. No manual updates, no app store approval delays.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span>
              <strong className="text-[var(--color-text-primary)]">Local data.</strong> Your
              progress, settings, and flashcards are stored on your device. No account needed.
            </span>
          </li>
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="mb-4 text-2xl font-semibold text-[var(--color-text-primary)]">
          How it works
        </h2>
        <p className="leading-relaxed text-[var(--color-text-secondary)]">
          DURA is built as a{" "}
          <strong className="text-[var(--color-text-primary)]">Progressive Web App (PWA)</strong> —
          a web standard supported by all major browsers and operating systems. PWAs use service
          workers for offline caching, the Web App Manifest for installation metadata, and IndexedDB
          for local data storage. No native code, no app store fees, no platform lock-in.
        </p>
        <p className="mt-3 text-sm text-[var(--color-text-muted)]">
          Standards: W3C Web App Manifest, W3C Service Workers, WHATWG IndexedDB, W3C Web Push API.
        </p>
      </section>
    </main>
  );
}
