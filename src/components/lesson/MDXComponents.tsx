import Link from "next/link";
import { CodeBlock } from "@/components/lesson/CodeBlock";
import { Quiz } from "@/components/lesson/Quiz";
import { FillBlank } from "@/components/lesson/FillBlank";
import { ParsonsPanel } from "@/components/lesson/ParsonsPanel";
import { VocabTooltip } from "@/components/lesson/VocabTooltip";
import type { MDXComponents as MDXComponentsType } from "mdx/types";

/**
 * Map of components made available to every MDX file.
 *
 * Interactive lesson components (Quiz, FillBlank, ParsonsPanel,
 * SandboxExercise, VocabTooltip) are added in their own commits.
 */
export const mdxComponents: MDXComponentsType = {
  Quiz: Quiz as unknown as MDXComponentsType[string],
  FillBlank: FillBlank as unknown as MDXComponentsType[string],
  ParsonsPanel: ParsonsPanel as unknown as MDXComponentsType[string],
  VocabTooltip: VocabTooltip as unknown as MDXComponentsType[string],
  h1: ({ children, ...props }) => (
    <h1 className="mt-8 mb-4 text-4xl font-semibold text-[var(--color-text-primary)]" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="mt-10 mb-3 text-2xl font-semibold text-[var(--color-text-primary)]" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="mt-8 mb-2 text-xl font-semibold text-[var(--color-text-primary)]" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="my-4 leading-[1.8] text-[var(--color-text-primary)]" {...props}>
      {children}
    </p>
  ),
  a: ({ href = "#", children, ...props }) => (
    <Link
      href={href}
      className="text-emerald-600 underline decoration-emerald-300 underline-offset-4 hover:decoration-emerald-600"
      {...props}
    >
      {children}
    </Link>
  ),
  ul: ({ children, ...props }) => (
    <ul className="my-4 ml-6 list-disc space-y-2 leading-[1.8]" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="my-4 ml-6 list-decimal space-y-2 leading-[1.8]" {...props}>
      {children}
    </ol>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-6 border-l-4 border-emerald-400 bg-[var(--color-bg-accent)] px-4 py-2 text-[var(--color-text-secondary)] italic"
      {...props}
    >
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-10 border-[var(--color-border)]" />,
  code: ({ children, ...props }) => (
    <code
      className="rounded bg-[var(--color-bg-subtle)] px-1.5 py-0.5 font-mono text-[0.9em] text-[var(--color-text-primary)]"
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ children }) => {
    // MDX wraps fenced code in <pre><code class="language-xxx">.
    // Extract and route through the Shiki-powered CodeBlock.
    if (
      children &&
      typeof children === "object" &&
      "props" in children &&
      children.props &&
      typeof children.props === "object"
    ) {
      const props = children.props as { className?: string; children?: string };
      const className = props.className ?? "";
      const match = /language-(\w+)/.exec(className);
      const language = match?.[1] ?? "text";
      const code = typeof props.children === "string" ? props.children : "";
      return <CodeBlock language={language}>{code}</CodeBlock>;
    }
    return <pre>{children}</pre>;
  },
};
