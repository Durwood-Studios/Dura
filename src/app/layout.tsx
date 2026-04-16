import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import { ThemeProvider, themeBootstrapScript } from "@/components/providers/ThemeProvider";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic", "normal"],
});

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
    "From absolute zero to CTO-ready. 10 phases. 2,850 hours. Standards-backed. Free forever.",
  keywords: ["engineering education", "learn to code", "LMS", "free", "open source", "CTO"],
  authors: [{ name: "Durwood Studios LLC" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DURA",
    title: "DURA — Engineering education, hardened by design",
    description:
      "From absolute zero to CTO-ready. 10 phases. 2,850 hours. Standards-backed. Free forever.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DURA — Engineering education, hardened by design",
    description:
      "From absolute zero to CTO-ready. 10 phases. 2,850 hours. Standards-backed. Free forever.",
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
        <meta name="theme-color" content="#10B981" />
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
                "From absolute zero to CTO-ready. 10 phases. 2,850 hours. Standards-backed. Free forever.",
              publisher: {
                "@type": "Organization",
                name: "Durwood Studios LLC",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${dmSans.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} antialiased`}
      >
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
