import Link from "next/link";
import { Sparkles, ArrowUpRight } from "lucide-react";

/**
 * Lesson → Discovery cross-link callout. Renders inline in MDX as
 * `<TryInDiscovery href="..." label="..." />`.
 *
 * Why: Discovery Zone is DURA's universality asset — twenty interactive
 * activities that need no English fluency beyond UI labels. The
 * Discovery → curriculum direction was wired from the activity registry,
 * but the curriculum → Discovery direction was missing. This component
 * closes that loop on a per-lesson basis. See universality audit
 * (xDocs/active/universality-and-dictionary-audit-2026-05.md §5).
 *
 * Tone is invitational, not prescriptive — the lesson stands alone; the
 * Discovery activity is bonus reinforcement for visual / kinesthetic
 * learners.
 */
interface TryInDiscoveryProps {
  href: string;
  label: string;
  /** Override the default body. Default copy frames it as "see this
   *  concept interactively" — works for most cases. */
  description?: string;
}

const DEFAULT_DESCRIPTION =
  "See this concept play out interactively in the Discovery Zone — no scrolling, just experimenting.";

export function TryInDiscovery({
  href,
  label,
  description = DEFAULT_DESCRIPTION,
}: TryInDiscoveryProps): React.ReactElement {
  return (
    <aside className="my-8 rounded-2xl border border-emerald-200/60 bg-emerald-50/40 p-5 dark:border-emerald-800/40 dark:bg-emerald-950/20">
      <div className="flex items-start gap-3">
        <Sparkles
          className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"
          aria-hidden
        />
        <div className="flex flex-col gap-2">
          <p className="text-sm leading-relaxed text-[var(--color-text-primary)]">{description}</p>
          <Link
            href={href}
            className="inline-flex items-center gap-1 self-start text-sm font-semibold text-emerald-700 underline decoration-emerald-300 underline-offset-4 hover:decoration-emerald-700 dark:text-emerald-300"
          >
            Try {label}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </aside>
  );
}
