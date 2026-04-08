import { Fragment } from "react";
import { VocabTooltip } from "@/components/lesson/VocabTooltip";
import { getTerm } from "@/lib/dictionary";

interface VocabHighlighterProps {
  text: string;
  terms: string[];
}

interface Match {
  start: number;
  end: number;
  slug: string;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Wraps the first occurrence of each provided vocabulary slug in a
 * <VocabTooltip>. Case-insensitive, word-boundary matching, no nested
 * wrapping. Operates on plain text — code blocks and headings are
 * already excluded by virtue of not being passed in.
 */
export function VocabHighlighter({ text, terms }: VocabHighlighterProps): React.ReactElement {
  const matches: Match[] = [];

  for (const slug of terms) {
    const term = getTerm(slug);
    if (!term) continue;
    const candidates = [term.term, ...term.aliases];
    for (const candidate of candidates) {
      const pattern = new RegExp(`\\b${escapeRegex(candidate)}\\b`, "i");
      const found = pattern.exec(text);
      if (!found) continue;
      const start = found.index;
      const end = start + found[0].length;
      const overlaps = matches.some((m) => start < m.end && end > m.start);
      if (overlaps) continue;
      matches.push({ start, end, slug });
      break;
    }
  }

  matches.sort((a, b) => a.start - b.start);

  if (matches.length === 0) {
    return <>{text}</>;
  }

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  matches.forEach((match, i) => {
    if (match.start > cursor) {
      nodes.push(<Fragment key={`t-${i}`}>{text.slice(cursor, match.start)}</Fragment>);
    }
    nodes.push(
      <VocabTooltip key={`v-${i}`} slug={match.slug}>
        {text.slice(match.start, match.end)}
      </VocabTooltip>
    );
    cursor = match.end;
  });
  if (cursor < text.length) {
    nodes.push(<Fragment key="tail">{text.slice(cursor)}</Fragment>);
  }

  return <>{nodes}</>;
}
