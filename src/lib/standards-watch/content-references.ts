import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { ALL_QUESTIONS } from "@/content/questions";
import { buildLookupIndex } from "./registry";

export interface CitationReview {
  source: string;
  ownerId: string;
  citedAs: string;
  reason: "untracked-anchor" | "older-revision-mention";
  registryRevision?: string;
}

export interface CitationDocument {
  source: string;
  ownerId: string;
  text: string;
  primaryAnchor?: string;
}

/** Literal mentions request review; historical discussion is not automatically a citation defect. */
export function reviewCitationDocuments(documents: readonly CitationDocument[]): CitationReview[] {
  const index = buildLookupIndex();
  const known = [...index.keys()].sort((a, b) => b.length - a.length);
  const findings: CitationReview[] = [];
  const contains = (text: string, citation: string): boolean => {
    const escaped = citation.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "u").test(text);
  };
  for (const document of documents) {
    const anchor = document.primaryAnchor?.trim();
    if (anchor && !known.some((citation) => contains(anchor, citation))) {
      findings.push({
        source: document.source,
        ownerId: document.ownerId,
        citedAs: anchor,
        reason: "untracked-anchor",
      });
    }
    for (const citation of known) {
      const entry = index.get(citation);
      if (!entry || citation === entry.current || !contains(document.text, citation)) continue;
      findings.push({
        source: document.source,
        ownerId: document.ownerId,
        citedAs: citation,
        reason: "older-revision-mention",
        registryRevision: entry.current,
      });
    }
  }
  return findings;
}

/** Read every authored MDX guide and assessment item, retaining precise review locations. */
export function scanAuthoredCitations(): { documents: number; findings: CitationReview[] } {
  const documents: CitationDocument[] = [];
  for (const group of ["phases", "tutorials", "howto"]) {
    const root = path.join(process.cwd(), "src/content", group);
    for (const name of readdirSync(root, { recursive: true })) {
      if (typeof name !== "string" || !name.endsWith(".mdx")) continue;
      const file = path.join(root, name);
      const raw = readFileSync(file, "utf8");
      const parsed = matter(raw);
      const anchor: unknown = parsed.data.standards?.primaryAnchor;
      documents.push({
        source: path.relative(process.cwd(), file),
        ownerId: String(parsed.data.title ?? name),
        text: raw,
        primaryAnchor: typeof anchor === "string" ? anchor : undefined,
      });
    }
  }
  for (const question of ALL_QUESTIONS) {
    documents.push({
      source: `assessment-bank/phase-${question.phaseId}`,
      ownerId: question.id,
      text: [question.question, ...question.options, question.explanation].join("\n"),
    });
  }
  return { documents: documents.length, findings: reviewCitationDocuments(documents) };
}
