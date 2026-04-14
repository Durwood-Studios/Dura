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
        <link rel="manifest" href="/manifest.json" />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
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
        <ThemeProvider>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
