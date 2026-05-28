import Link from "next/link";
import { Sparkles, KeyRound, ShieldCheck } from "lucide-react";

/**
 * Generative-AI transparency disclosure (EU AI Act Art. 13 + 14).
 *
 * Sibling to AITransparencyDisclosure.tsx, which covers FSRS (an
 * algorithmic-decision system). This component covers the *generative*
 * AI surfaces — AI Tutor and Code Review — which are a categorically
 * different data-flow concern (learner content leaves the device to a
 * third-party model).
 *
 * Mounted on /how-it-works and (optionally) in Settings → AI Features.
 * Copy below is intentionally plain-language per Art. 13's "in a clear
 * and comprehensible manner" requirement. Do not paraphrase without
 * legal review — the wording maps to the standard's transparency
 * taxonomy and the same review-required convention as
 * AITransparencyDisclosure applies.
 */
export function GenerativeAIDisclosure(): React.ReactElement {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
      <header className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-[var(--color-accent)]" aria-hidden />
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
          Generative AI — what you opt into
        </h2>
        <span className="ml-auto rounded-full bg-[var(--color-bg-subtle)] px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-[var(--color-text-muted)] uppercase">
          Optional · BYOK
        </span>
      </header>

      <p className="mb-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        DURA has two AI-backed surfaces — <strong>Ask Claude about this lesson</strong> (a tutor
        embedded in the lesson reader) and <strong>Code review</strong> (paste code, get structured
        feedback). Both are <strong>off by default</strong> and <strong>supplementary</strong>. The
        418-lesson curriculum, the sandboxes, FSRS, the dictionary, and certificates stay 100% free
        without them.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card icon={<Sparkles className="h-4 w-4" aria-hidden />} title="What gets sent">
          Your question (or the code you paste) + the current lesson&rsquo;s title, concept tags,
          and body. Never your name, email, progress, FSRS state, or any other lesson.
        </Card>
        <Card
          icon={<KeyRound className="h-4 w-4" aria-hidden />}
          title="BYOK — your key, your bill"
        >
          You bring your own Anthropic API key, stored only in your browser. Each question costs
          roughly 1–3 cents on Anthropic&rsquo;s metered API. Durwood Studios never sees or pays for
          these requests.
        </Card>
        <Card icon={<ShieldCheck className="h-4 w-4" aria-hidden />} title="Where it goes">
          Directly from your browser to <code>api.anthropic.com</code>. No Durwood server is in the
          path. Anthropic does not train on API calls by default — see their{" "}
          <a
            className="text-[var(--color-accent)] underline"
            href="https://www.anthropic.com/legal/privacy"
            target="_blank"
            rel="noreferrer noopener"
          >
            privacy policy
          </a>
          .
        </Card>
      </div>

      <p className="mt-4 text-xs text-[var(--color-text-muted)]">
        Turn it on (or off) anytime in{" "}
        <Link href="/settings" className="text-[var(--color-accent)] underline">
          Settings → AI Features
        </Link>
        . Revoking consent also deletes your stored key.
      </p>
    </section>
  );
}

function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4">
      <div className="mb-2 flex items-center gap-2 text-[var(--color-accent)]">
        {icon}
        <h3 className="text-xs font-semibold tracking-wider text-[var(--color-text-primary)] uppercase">
          {title}
        </h3>
      </div>
      <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">{children}</p>
    </div>
  );
}
