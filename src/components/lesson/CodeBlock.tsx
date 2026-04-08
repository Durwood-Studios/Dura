import { codeToHtml } from "shiki";

interface CodeBlockProps {
  children: string;
  language?: string;
  filename?: string;
}

/**
 * Server component. Highlights at render time using Shiki — no runtime
 * highlighter ships to the client.
 */
export async function CodeBlock({
  children,
  language = "text",
  filename,
}: CodeBlockProps): Promise<React.ReactElement> {
  let html: string;
  try {
    html = await codeToHtml(children.trim(), {
      lang: language,
      theme: "github-light",
    });
  } catch (error) {
    console.error("[code] highlight failed", error);
    html = `<pre><code>${escapeHtml(children)}</code></pre>`;
  }

  return (
    <figure className="my-6 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
      {filename && (
        <figcaption className="border-b border-[var(--color-border)] px-4 py-2 font-mono text-xs text-[var(--color-text-secondary)]">
          {filename}
        </figcaption>
      )}
      <div
        className="overflow-x-auto p-4 text-[14px] leading-relaxed [&_pre]:!bg-transparent"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  );
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
