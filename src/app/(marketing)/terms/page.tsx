import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/og";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description:
    "Terms of service for DURA, the free and open-source engineering education platform by Durwood Studios LLC.",
  path: "/terms",
});

export default function TermsPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-[720px] px-6 py-16">
      <header className="mb-12">
        <p className="font-mono text-xs tracking-widest text-[var(--color-text-muted)] uppercase">
          Legal
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-[var(--color-text-primary)]">
          Terms of Service
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-secondary)]">
          Plain language. No legalese traps. You&apos;re here to learn — these terms exist to keep
          the platform fair for everyone.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          1. The Platform
        </h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          DURA is a free, open-source engineering education platform built and maintained by Durwood
          Studios LLC. The entire codebase is licensed under the{" "}
          <Link
            href="https://www.gnu.org/licenses/agpl-3.0.en.html"
            className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            GNU Affero General Public License v3
          </Link>
          .
        </p>
        <p className="leading-[1.9] text-[var(--color-text-primary)]">
          The core platform is free. Permanently. No feature gates. No paywalls. No premium tiers.
          By using DURA, you agree to the terms outlined on this page.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          2. Educational Content
        </h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          All lessons, exercises, dictionary terms, and assessments are provided for educational
          purposes. We work hard to make the content accurate, standards-aligned, and useful — but
          we do not guarantee specific outcomes, employment, or career advancement.
        </p>
        <p className="leading-[1.9] text-[var(--color-text-primary)]">
          We provide the means. The learner provides the will.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          3. User Content
        </h2>
        <p className="leading-[1.9] text-[var(--color-text-primary)]">
          Any code you write in DURA&apos;s sandboxes, editors, or exercises belongs to you. We do
          not claim ownership of your work. Your sandbox code is yours — use it, share it, ship it,
          delete it. We store it only to provide the service and will remove it if you ask.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          4. Certificates
        </h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          DURA certificates represent completion of hardened assessments mapped to recognized
          standards (ACM CS2023, SWEBOK v4, SFIA 9). Each certificate states: &ldquo;Demonstrated
          mastery of [topics] through verified assessment.&rdquo;
        </p>
        <p className="leading-[1.9] text-[var(--color-text-primary)]">
          Certificates are not professional certifications, academic degrees, or government-issued
          credentials. They are verifiable proof that you passed the assessment at the required
          threshold. What employers or institutions make of that is between you and them.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          5. Voluntary Tips
        </h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          DURA offers a voluntary tip option powered by Stripe. Tips are gratitude, not purchases.
          They unlock nothing — every feature is available to every user regardless of whether
          they&apos;ve tipped.
        </p>
        <p className="leading-[1.9] text-[var(--color-text-primary)]">
          Because tips are voluntary contributions and not transactions for goods or services, they
          are non-refundable. If Stripe&apos;s processing encounters an issue, contact us and
          we&apos;ll work it out.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          6. Account &amp; Data
        </h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          Accounts are optional. DURA works offline and without authentication for all core
          features. If you create an account for cross-device sync, you control your data.
        </p>
        <p className="leading-[1.9] text-[var(--color-text-primary)]">
          You can delete your account and all associated data at any time. Deletion is permanent and
          immediate. We do not retain your data after deletion, and we do not sell or share your
          data with third parties. Ever.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          7. Acceptable Use
        </h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          Use DURA to learn. That&apos;s what it&apos;s for. Don&apos;t:
        </p>
        <ul className="mb-4 ml-6 list-disc space-y-2 leading-[1.9] text-[var(--color-text-primary)]">
          <li>Abuse the platform or harass other users.</li>
          <li>
            Attack, probe, or attempt to compromise DURA&apos;s infrastructure, servers, or
            services.
          </li>
          <li>
            Scrape content in bulk to build competing products. The source is open — fork it
            honestly under AGPLv3 if you want to build something similar.
          </li>
          <li>
            Use automated tools to generate fake accounts, inflate progress, or manipulate
            assessments.
          </li>
        </ul>
        <p className="leading-[1.9] text-[var(--color-text-primary)]">
          We reserve the right to suspend accounts that violate these terms.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          8. Limitation of Liability
        </h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          DURA is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of
          any kind, express or implied. We do our best to keep the platform running, the content
          accurate, and the assessments fair — but we cannot guarantee uninterrupted service or
          error-free content.
        </p>
        <p className="leading-[1.9] text-[var(--color-text-primary)]">
          To the maximum extent permitted by law, Durwood Studios LLC shall not be liable for any
          indirect, incidental, special, consequential, or punitive damages arising from your use of
          the platform. Our total liability for any claim shall not exceed the amount you&apos;ve
          paid us — which, for most users, is zero.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          9. Dispute Resolution
        </h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          If something goes wrong, talk to us first. Send an email and we&apos;ll try to resolve it
          informally within 30 days. Most issues can be worked out with a conversation.
        </p>
        <p className="leading-[1.9] text-[var(--color-text-primary)]">
          If informal resolution fails, any dispute shall be resolved through binding arbitration
          conducted in the state of South Carolina, United States, under the rules of the American
          Arbitration Association. You agree to waive any right to a jury trial or to participate in
          a class action.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold text-[var(--color-text-primary)]">
          10. Changes to These Terms
        </h2>
        <p className="mb-4 leading-[1.9] text-[var(--color-text-primary)]">
          We may update these terms as the platform evolves. When we do, we&apos;ll update the date
          below and, for significant changes, notify users through the platform. Continued use after
          changes constitutes acceptance.
        </p>
        <p className="font-mono text-sm text-[var(--color-text-muted)]">
          Last updated: April 14, 2026
        </p>
      </section>

      <footer className="border-t border-[var(--color-border)] pt-8 text-sm text-[var(--color-text-secondary)]">
        <p>
          Questions about these terms?{" "}
          <Link
            href="/about"
            className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
          >
            Learn more about Durwood Studios
          </Link>{" "}
          or reach out directly.
        </p>
      </footer>
    </main>
  );
}
