import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider, themeBootstrapScript } from "@/components/providers/ThemeProvider";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import "./globals.css";

/**
 * Font wiring per DLS-1.0 §Typography.
 *
 * Geist Sans + Geist Mono replace the prior DM Sans / JetBrains Mono /
 * Instrument Serif trio (motion sprint P0/P1, conflict #2 resolution).
 * The geist package exposes the fonts via next/font/local internally,
 * so subset/weight options aren't passed here — Geist ships every weight
 * and the variable axis. CSS still references them via
 * `var(--font-geist-sans)` / `var(--font-geist-mono)` (the package's own
 * variable names) — globals.css derives `--font-sans` / `--font-mono` /
 * `--font-primary` / `--font-serif` from these.
 */

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://dura.dev")
  ),
  title: {
    default: "DURA — Engineering education, hardened by design",
    template: "%s | DURA",
  },
  description:
    "From absolute zero to engineering leadership. 10 phases. 2,850 hours. Standards-backed. Free forever.",
  keywords: ["engineering education", "learn to code", "LMS", "free", "open source", "CTO"],
  authors: [{ name: "Durwood Studios LLC" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DURA",
    title: "DURA — Engineering education, hardened by design",
    description:
      "From absolute zero to engineering leadership. 10 phases. 2,850 hours. Standards-backed. Free forever.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DURA — Engineering education, hardened by design",
    description:
      "From absolute zero to engineering leadership. 10 phases. 2,850 hours. Standards-backed. Free forever.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* theme-color reflects the app shell, not a brand celebration.
            Per DLS-1.0 hybrid rule: --color-accent (blue) is the canonical
            chrome color; emerald is reserved for learner-positive moments
            (mastery unlock, completion). Neutral surface for the meta. */}
        <meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#08080d" media="(prefers-color-scheme: dark)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DURA" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="DURA" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `console.log('%c\\u{1F44B} Hey, you found the console. You\\'re going to do great in Phase 1.','color:#10b981;font-size:14px;font-weight:bold;padding:8px 0;');console.log('%cDURA is open source: https://github.com/Durwood-Studios/Dura','color:#525252;font-size:12px;');`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "DURA",
              url: "https://dura.dev",
              description:
                "From absolute zero to engineering leadership. 10 phases. 2,850 hours. Standards-backed. Free forever.",
              publisher: {
                "@type": "Organization",
                name: "Durwood Studios LLC",
              },
            }),
          }}
        />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <span
          dangerouslySetInnerHTML={{
            __html:
              "<!-- You're reading the source. That's exactly the kind of curiosity DURA is built for. github.com/Durwood-Studios/Dura -->",
          }}
        />
        <ThemeProvider>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
