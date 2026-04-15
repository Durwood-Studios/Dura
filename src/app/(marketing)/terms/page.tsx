import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — DURA",
  description:
    "Terms of use for DURA, the free and open-source engineering education platform by Durwood Studios LLC.",
  openGraph: {
    title: "Terms of Service — DURA",
    description: "Terms of use for DURA, the free and open-source engineering education platform.",
  },
};

export default function TermsPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-[700px] px-4 py-16 sm:py-24">
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">Last updated: April 14, 2026</p>
      <p className="mt-6 leading-relaxed text-[var(--color-text-secondary)]">
        DURA is operated by Durwood Studios LLC. By using DURA, you agree to these terms. They are
        short and written in plain language.
      </p>

      <Section title="The platform">
        <p>
          DURA is a free, open-source learning platform for software engineering, AI engineering,
          and technology leadership. The source code is available under the AGPLv3 license at{" "}
          <a
            href="https://github.com/Durwood-Studios/Dura"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent-emerald)] underline underline-offset-2"
          >
            github.com/Durwood-Studios/Dura
          </a>
          .
        </p>
        <p className="mt-3">
          The core platform is free. Permanently. There are no premium tiers, no paywalls, and no
          features locked behind payment. This is a commitment, not a trial period.
        </p>
      </Section>

      <Section title="What DURA provides">
        <p>
          DURA provides educational content, interactive exercises, spaced repetition flashcards,
          code sandboxes, assessments, and verified certificates of completion. All content is
          provided for educational purposes.
        </p>
        <p className="mt-3">
          DURA does not guarantee employment, career outcomes, or professional certification. We
          provide the means for learning. The outcomes depend on you.
        </p>
      </Section>

      <Section title="Accounts">
        <p>
          Account creation is optional. DURA works fully without one. If you create an account, you
          are responsible for keeping your credentials secure.
        </p>
        <p className="mt-3">
          You can delete your account at any time from Settings. Deleting your account removes all
          server-side data associated with it. Local data on your device remains until you clear it
          manually.
        </p>
      </Section>

      <Section title="Your content">
        <p>
          Code you write in DURA&apos;s sandbox editor belongs to you. DURA does not claim ownership
          of anything you create on the platform.
        </p>
        <p className="mt-3">
          If you contribute to DURA&apos;s open-source repository (dictionary terms, bug fixes,
          features), your contributions are licensed under the same terms as the project (AGPLv3 for
          the core, Apache 2.0 for APIs).
        </p>
      </Section>

      <Section title="Certificates">
        <p>
          DURA issues certificates when you complete phase verification tests. These certificates
          attest that you demonstrated mastery of specific topics through DURA&apos;s assessment
          system. They are not professional certifications, academic degrees, or government-issued
          credentials.
        </p>
        <p className="mt-3">
          Certificate language states:{" "}
          <em>&ldquo;Demonstrated mastery of [topics] through verified assessment.&rdquo;</em>{" "}
          Nothing more, nothing less.
        </p>
      </Section>

      <Section title="Voluntary tips">
        <p>
          DURA offers a voluntary tip button powered by Stripe. Tips are exactly that — voluntary
          expressions of support. They do not unlock features, grant premium access, or provide any
          benefit beyond supporting the developer.
        </p>
        <p className="mt-3">
          Tips are non-refundable. Stripe processes the payment. DURA does not store your payment
          information. See{" "}
          <a
            href="https://stripe.com/legal/consumer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent-emerald)] underline underline-offset-2"
          >
            Stripe&apos;s terms
          </a>{" "}
          for payment-specific policies.
        </p>
      </Section>

      <Section title="Acceptable use">
        <p>Use DURA for learning. Do not use it to:</p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <li>Distribute malware or malicious code through the sandbox</li>
          <li>Scrape content in bulk for commercial redistribution</li>
          <li>Misrepresent DURA certificates as professional or academic credentials</li>
          <li>Attempt to compromise the platform or other users&apos; data</li>
        </ul>
        <p className="mt-3">
          The source code is open. You can fork it, self-host it, modify it, and build on it under
          the AGPLv3 license. That is encouraged, not restricted.
        </p>
      </Section>

      <Section title="Availability and warranty">
        <p>
          DURA is provided &ldquo;as is&rdquo; without warranty of any kind. We do our best to keep
          the platform available and accurate, but we do not guarantee uninterrupted access or
          error-free content.
        </p>
        <p className="mt-3">
          Because DURA is a Progressive Web App with offline support, most features continue to work
          without an internet connection after your first visit. Your progress is stored locally and
          is not at risk if our servers go down.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          To the maximum extent permitted by law, Durwood Studios LLC is not liable for any
          indirect, incidental, or consequential damages arising from your use of DURA. Our total
          liability is limited to the amount you have paid us, which for most users is zero.
        </p>
      </Section>

      <Section title="Disputes">
        <p>
          If you have a concern, email us at{" "}
          <a
            href="mailto:legal@dura.dev"
            className="text-[var(--color-accent-emerald)] underline underline-offset-2"
          >
            legal@dura.dev
          </a>{" "}
          first. We will try to resolve it informally. If we cannot, disputes will be resolved
          through binding arbitration under the laws of the State of South Carolina, United States.
        </p>
      </Section>

      <Section title="Changes to these terms">
        <p>
          We may update these terms. If we make material changes, we will notify users via an in-app
          banner before the changes take effect. Continued use after changes constitutes acceptance.
        </p>
      </Section>

      <div className="mt-16 flex gap-6 text-sm">
        <Link
          href="/privacy"
          className="text-[var(--color-accent-emerald)] underline underline-offset-2"
        >
          Privacy Policy
        </Link>
        <Link href="/" className="text-[var(--color-text-muted)] underline underline-offset-2">
          Back to DURA
        </Link>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">{title}</h2>
      <div className="mt-4 space-y-0 leading-relaxed text-[var(--color-text-secondary)]">
        {children}
      </div>
    </section>
  );
}
