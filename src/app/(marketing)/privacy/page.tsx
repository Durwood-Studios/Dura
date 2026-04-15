import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/og";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How DURA handles your data. Short version: almost everything stays on your device.",
  path: "/privacy",
});

export default function PrivacyPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-[720px] px-6 py-16">
      <header className="mb-12">
        <p className="font-mono text-xs tracking-widest text-[var(--color-text-muted)] uppercase">
          Privacy Policy
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-[var(--color-text-primary)] sm:text-5xl">
          Your data, your device.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-secondary)]">
          DURA is built offline-first. That means your learning data lives on your device by default
          — not on our servers. This policy explains exactly what we collect, what we don&apos;t,
          and what rights you have.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">Who we are</h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          DURA is built and maintained by <strong>Durwood Studios LLC</strong>, a small independent
          studio founded by Dustin Snellings. We make software that respects the people who use it.
          No venture capital. No advertising partnerships. No data brokers.
        </p>
        <p className="leading-[1.9] text-[var(--color-text-primary)]">
          If you have questions about this policy, email{" "}
          <Link
            href="mailto:privacy@dura.dev"
            className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
          >
            privacy@dura.dev
          </Link>
          . A human will respond.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          What data we collect
        </h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          Everything DURA stores is kept locally on your device using IndexedDB — a browser database
          that never leaves your machine unless you explicitly sign in and enable sync. Here&apos;s
          what gets stored:
        </p>
        <ul className="mb-4 ml-6 list-disc space-y-2 leading-[1.9] text-[var(--color-text-primary)]">
          <li>
            <strong>Learning progress</strong> — which lessons you&apos;ve completed, when, and how
            far you scrolled.
          </li>
          <li>
            <strong>Flashcard history</strong> — cards you&apos;ve reviewed, your spaced-repetition
            intervals, and accuracy.
          </li>
          <li>
            <strong>Preferences</strong> — theme, font size, reading speed, and display settings.
          </li>
          <li>
            <strong>Goals</strong> — any learning goals or milestones you set for yourself.
          </li>
          <li>
            <strong>Assessment results</strong> — scores, attempts, and which questions you
            answered.
          </li>
          <li>
            <strong>Analytics events</strong> — behavioral events like &quot;lesson opened&quot; or
            &quot;flashcard reviewed&quot; (see the Analytics section below).
          </li>
          <li>
            <strong>Sandbox code</strong> — any code you write in interactive sandboxes.
          </li>
        </ul>
        <p className="leading-[1.9] text-[var(--color-text-primary)]">
          All of this is yours. You can export it, delete it, or move it at any time.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          What we don&apos;t collect
        </h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          We believe the best privacy policy is one where most of the interesting stuff is in the
          &quot;don&apos;t&quot; column. Here&apos;s what DURA will never do:
        </p>
        <ul className="ml-6 list-disc space-y-2 leading-[1.9] text-[var(--color-text-primary)]">
          <li>
            <strong>No cookies</strong> — we don&apos;t set tracking cookies. Period.
          </li>
          <li>
            <strong>No fingerprinting</strong> — we don&apos;t collect device fingerprints, canvas
            hashes, or hardware identifiers.
          </li>
          <li>
            <strong>No third-party tracking</strong> — no Google Analytics, no Meta Pixel, no
            tracking scripts from anyone.
          </li>
          <li>
            <strong>No behavioral advertising</strong> — we will never show you ads or sell ad
            targeting data.
          </li>
          <li>
            <strong>No data selling</strong> — your data is not a product. We don&apos;t sell it,
            share it, or trade it. Ever.
          </li>
          <li>
            <strong>No PII in analytics</strong> — analytics events contain no names, emails, IP
            addresses, or anything that identifies you personally.
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          Where data is stored
        </h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          <strong>By default:</strong> everything stays on your device. IndexedDB is a
          browser-native database. Your data lives in your browser&apos;s storage, on your machine,
          under your control. We never see it.
        </p>
        <p className="leading-[1.9] text-[var(--color-text-primary)]">
          <strong>When signed in (future):</strong> if you create an account and enable cross-device
          sync, your learning data is replicated to a Supabase PostgreSQL database hosted in the
          United States. This sync is optional, explicit, and off by default. You can disable it at
          any time and your local data remains intact.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          Your rights (GDPR)
        </h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          Regardless of where you live, we extend these rights to every DURA user:
        </p>
        <ul className="ml-6 list-disc space-y-2 leading-[1.9] text-[var(--color-text-primary)]">
          <li>
            <strong>Access</strong> — view all your data anytime via Settings → Export. It&apos;s
            your data; you don&apos;t need to file a request.
          </li>
          <li>
            <strong>Deletion</strong> — wipe everything via Settings → Clear Data. One click. No
            hoops.
          </li>
          <li>
            <strong>Portability</strong> — export your full learning history as a JSON file you can
            take anywhere.
          </li>
          <li>
            <strong>Withdraw consent</strong> — if you&apos;ve enabled sync, sign out and your
            server-side data stops updating. Request full server deletion via email.
          </li>
          <li>
            <strong>Breach notification</strong> — if a data breach ever affects your information,
            we&apos;ll notify you within 72 hours via email and an in-app notice.
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          Children&apos;s privacy (COPPA)
        </h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          DURA does not knowingly collect personal information from children under 13. Since the
          platform works without an account, younger learners can use DURA freely — all data stays
          on their device and we never see it.
        </p>
        <p className="leading-[1.9] text-[var(--color-text-primary)]">
          If account creation is enabled in the future, we will require age verification during
          sign-up. If we discover that an account belongs to someone under 13, we will delete it and
          all associated data immediately. If you believe a child under 13 has created an account,
          contact{" "}
          <Link
            href="mailto:privacy@dura.dev"
            className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
          >
            privacy@dura.dev
          </Link>
          .
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          Third-party services
        </h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          DURA relies on a small number of trusted services. Each has its own privacy policy:
        </p>
        <ul className="ml-6 list-disc space-y-2 leading-[1.9] text-[var(--color-text-primary)]">
          <li>
            <strong>
              <Link
                href="https://vercel.com/legal/privacy-policy"
                className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                Vercel
              </Link>
            </strong>{" "}
            — hosts the DURA website. Processes standard HTTP request data (IP address, user agent)
            for serving pages. We do not use Vercel Analytics or Vercel Speed Insights.
          </li>
          <li>
            <strong>
              <Link
                href="https://supabase.com/privacy"
                className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                Supabase
              </Link>
            </strong>{" "}
            — provides authentication and database sync when you opt in by creating an account. Not
            used unless you sign in.
          </li>
          <li>
            <strong>
              <Link
                href="https://stripe.com/privacy"
                className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                Stripe
              </Link>
            </strong>{" "}
            — processes voluntary tips only. DURA never sees or stores your payment details. Stripe
            handles all card data under PCI DSS compliance.
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">Analytics</h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          DURA uses privacy-first analytics to understand how the platform is used — things like
          which lessons are most popular, where learners get stuck, and which features get ignored.
          This helps us build a better product.
        </p>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          What this means in practice: analytics events contain no personally identifiable
          information. No names, no emails, no IP addresses, no device IDs. Events are behavioral
          only — &quot;a user completed lesson 2-3-04&quot; not &quot;Dustin completed lesson
          2-3-04.&quot;
        </p>
        <p className="leading-[1.9] text-[var(--color-text-primary)]">
          All analytics data stored on your device is visible, exportable, and deletable through
          Settings. You own it.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          Changes to this policy
        </h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          This policy was last updated on <strong>April 14, 2026</strong>.
        </p>
        <p className="leading-[1.9] text-[var(--color-text-primary)]">
          If we make meaningful changes, we&apos;ll notify you via an in-app banner before the
          changes take effect. We won&apos;t bury updates in a changelog nobody reads. The full
          revision history of this policy is available in our{" "}
          <Link
            href="https://github.com/Durwood-Studios/Dura"
            className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            public repository
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
