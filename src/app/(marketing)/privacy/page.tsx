import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — DURA",
  description:
    "How DURA handles your data. Plain language, no legalese. Local learning records, optional sync, and clearly disclosed external services.",
  openGraph: {
    title: "Privacy Policy — DURA",
    description: "How DURA handles your data. Plain language, no legalese.",
  },
};

export default function PrivacyPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-[700px] px-4 py-16 sm:py-24">
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Last updated: September 12, 2026
      </p>
      <p className="mt-6 leading-relaxed text-[var(--color-text-secondary)]">
        DURA is built by Durwood Studios LLC. This policy explains what data we collect, where it
        lives, and what rights you have over it. We wrote it in plain language because you
        shouldn&apos;t need a law degree to understand how your data is handled.
      </p>

      {/* ---- Who we are ---- */}
      <Section title="Who we are">
        <p>
          DURA is an open-source learning platform operated by Durwood Studios LLC. If you have
          questions about this policy, contact us at{" "}
          <a
            href="mailto:privacy@dura.dev"
            className="text-[var(--color-accent-emerald)] underline underline-offset-2"
          >
            privacy@dura.dev
          </a>
          .
        </p>
      </Section>

      {/* ---- What we collect ---- */}
      <Section title="What data is stored">
        <p>
          DURA stores learning data on your device using your browser&apos;s IndexedDB. This
          includes:
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <li>Learning progress — lessons completed, quiz scores, time spent</li>
          <li>Flashcard review history and spaced-repetition scheduling</li>
          <li>Study preferences — theme, font size, study mode, daily goal</li>
          <li>Goals — daily, weekly, phase, and career goals you set</li>
          <li>Skill assessment results and recommended learning path</li>
          <li>
            Behavioral analytics events — lesson starts, quiz completions, streak activity (see
            &ldquo;Analytics&rdquo; below)
          </li>
          <li>Sandbox code you write in the code editor (auto-saved locally)</li>
        </ul>
        <p className="mt-3">
          Learning records are stored locally by default. Account sync, submitted feedback,
          server-scored assessments, optional AI tools, and web sandbox previews have the separate
          network behavior described below. Hosting providers also receive ordinary web requests,
          including your IP address.
        </p>
      </Section>

      {/* ---- What we do NOT collect ---- */}
      <Section title="What we do not collect">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>No advertising cookies. Signed-in sessions use essential authentication cookies.</li>
          <li>No browser fingerprinting</li>
          <li>No third-party tracking scripts</li>
          <li>No advertising identifiers</li>
          <li>
            No names, email addresses, source code, or free-form answers in analytics event
            properties. Synced events are linked to your account ID.
          </li>
        </ul>
        <p className="mt-3">
          We do not sell data. We do not run behavioral advertising. We do not share data with third
          parties for marketing purposes.
        </p>
      </Section>

      {/* ---- Accounts & sync ---- */}
      <Section title="Accounts and cross-device sync">
        <p>
          Creating an account is optional. DURA works fully without one. If you choose to create an
          account:
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <li>
            We collect your email address for authentication. If you sign in with a social provider
            (GitHub, Google), we receive the email associated with that account.
          </li>
          <li>
            Your learning data syncs to our database (hosted on Supabase) so you can access it from
            any device.
          </li>
          <li>
            You can disconnect at any time. Disconnecting stops sync but does not delete your local
            data.
          </li>
          <li>
            Settings provides account deletion on deployments with the deletion database update
            enabled. It requires a sign-in within five minutes and removes uploaded files first,
            then your account and cascading learning records. It also erases this device’s account
            copy while preserving guest records. Other devices, downloaded exports, and previously
            shared copies must be cleared separately. A failed step is shown explicitly; contact the
            site operator if deletion is unavailable.
          </li>
        </ul>
      </Section>

      {/* ---- Analytics ---- */}
      <Section title="Analytics">
        <p>
          Analytics are off until you opt in. Opted-in events help understand which learning
          sequences are useful. Event properties exclude direct identifiers, but synced events are
          linked to your account and must be treated as personal data. Examples: &ldquo;a lesson was
          started,&rdquo; &ldquo;a quiz was passed,&rdquo; &ldquo;a flashcard was reviewed.&rdquo;
        </p>
        <p className="mt-3">
          Events are stored locally in IndexedDB and batch-synced in the background when you&apos;re
          online (if you have an account). They never block the interface. If analytics fail, the
          app keeps working normally.
        </p>
        <p className="mt-3">
          You can export all your analytics data from Settings. You can delete all your data from
          Settings.
        </p>
      </Section>

      {/* ---- Your rights ---- */}
      <Section title="Your rights">
        <p>Regardless of where you live, you have the right to:</p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-[var(--color-text-primary)]">Access your data</strong> &mdash;
            Settings &rarr; Save progress to file downloads a portable learner-record archive for
            the current local learner, including JSON records.
          </li>
          <li>
            <strong className="text-[var(--color-text-primary)]">Delete your data</strong> &mdash;
            Settings &rarr; Clear local data removes DURA’s device records, including guest and
            account copies. Account deletion separately removes your account and its linked live
            database records. Anonymous feedback is not linked to an account and cannot be
            identified from your account ID; include a submission ID when asking the operator about
            a specific message.
          </li>
          <li>
            <strong className="text-[var(--color-text-primary)]">Portability</strong> &mdash; Your
            exported data is standard JSON. Take it wherever you want.
          </li>
          <li>
            <strong className="text-[var(--color-text-primary)]">Withdraw consent</strong> &mdash;
            Sign out to stop syncing. Clear data to remove local storage. Delete your account to
            remove server storage.
          </li>
        </ul>
        <p className="mt-3">
          If a breach affects your information, we will provide notices required by applicable law.
          Hosting providers may retain security logs and backups under their retention policies;
          account deletion does not recall copies already downloaded by recipients.
        </p>
      </Section>

      {/* ---- Young users ---- */}
      <Section title="Users under 13">
        <p>
          DURA does not knowingly collect personal information from anyone under the age of 13.
          Account creation requires an age attestation, not identity verification. If you are under
          13, use local lessons without an account and do not submit personal information in
          feedback or external tools. Network requests still reach the hosting provider.
        </p>
        <p className="mt-3">
          If we learn that we have collected personal information from a user under 13, we will
          delete that data promptly. If you believe a user under 13 has created an account, please
          contact us at{" "}
          <a
            href="mailto:privacy@dura.dev"
            className="text-[var(--color-accent-emerald)] underline underline-offset-2"
          >
            privacy@dura.dev
          </a>
          .
        </p>
      </Section>

      {/* ---- Third-party services ---- */}
      <Section title="Third-party services">
        <p>DURA uses the following third-party services:</p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-[var(--color-text-primary)]">Vercel</strong> — hosting and
            deployment.{" "}
            <a
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent-emerald)] underline underline-offset-2"
            >
              Privacy policy
            </a>
          </li>
          <li>
            <strong className="text-[var(--color-text-primary)]">Supabase</strong> — authentication
            and database for account sync, public certificate lookup, and submitted feedback
            (including guest feedback).{" "}
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent-emerald)] underline underline-offset-2"
            >
              Privacy policy
            </a>
          </li>
          <li>
            <strong className="text-[var(--color-text-primary)]">Stripe</strong> — voluntary tip
            processing only. DURA does not store payment information.{" "}
            <a
              href="https://stripe.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent-emerald)] underline underline-offset-2"
            >
              Privacy policy
            </a>
          </li>
        </ul>
        <p className="mt-3">
          Optional AI Tutor and Code Review send the text and code you submit directly to Anthropic
          using your own API key, after consent. Web sandbox previews load a CodeSandbox-origin
          runtime that receives your sandbox source and may load third-party packages. Runtime
          downloads can also contact package CDNs. Do not include credentials or private data in
          sandbox code. Configured authentication protection may send a hashed request identifier to
          the deployment’s rate-limit service. External links and payment pages have their own
          policies.
        </p>
      </Section>

      {/* ---- Open source ---- */}
      <Section title="Open source transparency">
        <p>
          DURA is open source under the AGPLv3 license. You can read every line of code that handles
          your data at{" "}
          <a
            href="https://github.com/Durwood-Studios/Dura"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent-emerald)] underline underline-offset-2"
          >
            github.com/Durwood-Studios/Dura
          </a>
          . This is the strongest privacy guarantee we can offer — you don&apos;t have to trust our
          words, you can verify our code.
        </p>
      </Section>

      {/* ---- Changes ---- */}
      <Section title="Changes to this policy">
        <p>
          If we make material changes to this policy, we will notify users via an in-app banner
          before the changes take effect. The &ldquo;Last updated&rdquo; date at the top of this
          page reflects the most recent revision.
        </p>
      </Section>

      {/* ---- Footer nav ---- */}
      <div className="mt-16 flex gap-6 text-sm">
        <Link
          href="/terms"
          className="text-[var(--color-accent-emerald)] underline underline-offset-2"
        >
          Terms of Service
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
