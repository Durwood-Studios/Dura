"use client";

import { useCallback, useState } from "react";
import { markActivityComplete } from "@/components/discover/Passport";
import { cn } from "@/lib/utils";

interface BlockDef {
  type: "heading" | "paragraph" | "image" | "button" | "list";
  label: string;
  emoji: string;
  tag: string;
  defaultText: string;
  color: string;
}

const BLOCK_DEFS: BlockDef[] = [
  {
    type: "heading",
    label: "Heading",
    emoji: "🔤",
    tag: "<h1>",
    defaultText: "My Awesome Page",
    color: "#60a5fa",
  },
  {
    type: "paragraph",
    label: "Paragraph",
    emoji: "📝",
    tag: "<p>",
    defaultText: "This is a paragraph of text. Click to edit!",
    color: "#a78bfa",
  },
  {
    type: "image",
    label: "Image",
    emoji: "🖼️",
    tag: "<img>",
    defaultText: "A cool picture",
    color: "#34d399",
  },
  {
    type: "button",
    label: "Button",
    emoji: "🔘",
    tag: "<button>",
    defaultText: "Click Me",
    color: "#f472b6",
  },
  {
    type: "list",
    label: "List",
    emoji: "📋",
    tag: "<ul>",
    defaultText: "Item 1, Item 2, Item 3",
    color: "#fbbf24",
  },
];

interface PageBlock {
  id: number;
  type: BlockDef["type"];
  text: string;
}

let nextId = 1;

/** Simple Website Builder — build a webpage by clicking HTML blocks. */
export function WebsiteBuilder(): React.ReactElement {
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [showCode, setShowCode] = useState(false);
  const [completed, setCompleted] = useState(false);

  const addBlock = useCallback(
    (def: BlockDef): void => {
      const block: PageBlock = {
        id: nextId++,
        type: def.type,
        text: def.defaultText,
      };
      setBlocks((prev) => {
        const next = [...prev, block];
        // Mark complete after adding 3+ blocks
        if (next.length >= 3 && !completed) {
          setCompleted(true);
          markActivityComplete("website-builder");
        }
        return next;
      });
    },
    [completed]
  );

  const updateBlockText = useCallback((id: number, text: string): void => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, text } : b)));
  }, []);

  const removeBlock = useCallback((id: number): void => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const clearPage = useCallback((): void => {
    setBlocks([]);
    setShowCode(false);
  }, []);

  const getDef = useCallback(
    (type: BlockDef["type"]): BlockDef => BLOCK_DEFS.find((d) => d.type === type)!,
    []
  );

  /** Generate simplified HTML for the code view. */
  const generateHtml = useCallback((): string => {
    if (blocks.length === 0) return "";

    const lines: string[] = [];
    for (const block of blocks) {
      switch (block.type) {
        case "heading":
          lines.push(`<h1>${block.text}</h1>`);
          break;
        case "paragraph":
          lines.push(`<p>${block.text}</p>`);
          break;
        case "image":
          lines.push(`<img src="photo.jpg" alt="${block.text}" />`);
          break;
        case "button":
          lines.push(`<button>${block.text}</button>`);
          break;
        case "list": {
          const items = block.text.split(",").map((s) => s.trim());
          lines.push("<ul>");
          for (const item of items) {
            lines.push(`  <li>${item}</li>`);
          }
          lines.push("</ul>");
          break;
        }
        default: {
          // Exhaustive check — should never reach here
          block.type satisfies never;
        }
      }
    }
    return lines.join("\n");
  }, [blocks, getDef]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 py-8">
      <h2 className="text-center text-2xl font-semibold text-[var(--color-text-primary)]">
        Website Builder
      </h2>
      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Click blocks to build your webpage. Click text to edit it.
      </p>

      {/* Block palette */}
      <div className="flex flex-wrap justify-center gap-3">
        {BLOCK_DEFS.map((def) => (
          <button
            key={def.type}
            type="button"
            onClick={() => addBlock(def)}
            className="flex min-h-[48px] items-center gap-2 rounded-2xl px-5 py-3 text-base font-medium text-white transition-transform duration-150 hover:scale-105 active:scale-95"
            style={{ backgroundColor: def.color }}
          >
            <span>{def.emoji}</span>
            <span>{def.label}</span>
            <span className="ml-1 font-[family-name:var(--font-mono)] text-xs opacity-70">
              {def.tag}
            </span>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setShowCode((v) => !v)}
          disabled={blocks.length === 0}
          className={cn(
            "min-h-[48px] rounded-2xl px-6 py-3 text-base font-medium transition-transform duration-150 hover:scale-105 active:scale-95 disabled:opacity-40",
            showCode
              ? "bg-[var(--color-accent-emerald)] text-white"
              : "border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]"
          )}
        >
          {showCode ? "View Page" : "View Code"}
        </button>
        <button
          type="button"
          onClick={clearPage}
          disabled={blocks.length === 0}
          className="min-h-[48px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-6 py-3 text-base font-medium text-[var(--color-text-secondary)] transition-transform duration-150 hover:scale-105 active:scale-95 disabled:opacity-40"
        >
          Clear page
        </button>
      </div>

      {/* Page area / Code view */}
      <div className="min-h-[200px] w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        {blocks.length === 0 ? (
          <p className="py-12 text-center text-base text-[var(--color-text-muted)]">
            Your page is empty. Click a block above to start building!
          </p>
        ) : showCode ? (
          <pre className="overflow-x-auto font-[family-name:var(--font-mono)] text-sm leading-relaxed whitespace-pre-wrap text-[var(--color-accent-emerald)]">
            {generateHtml()}
          </pre>
        ) : (
          <div className="flex flex-col gap-4">
            {blocks.map((block) => {
              const def = getDef(block.type);
              return (
                <div key={block.id} className="group relative">
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeBlock(block.id)}
                    className="absolute -top-2 -right-2 hidden h-7 w-7 items-center justify-center rounded-full bg-red-500/80 text-xs text-white group-hover:flex"
                    aria-label={`Remove ${def.label} block`}
                  >
                    ✕
                  </button>

                  {/* Tag label */}
                  <span
                    className="mb-1 inline-block rounded-md px-2 py-0.5 font-[family-name:var(--font-mono)] text-[11px] font-medium text-white"
                    style={{ backgroundColor: def.color }}
                  >
                    {def.tag}
                  </span>

                  {/* Rendered block */}
                  {block.type === "heading" && (
                    <h3
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateBlockText(block.id, e.currentTarget.textContent ?? "")}
                      className="rounded-lg px-2 py-1 text-2xl font-bold text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)]"
                    >
                      {block.text}
                    </h3>
                  )}
                  {block.type === "paragraph" && (
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateBlockText(block.id, e.currentTarget.textContent ?? "")}
                      className="rounded-lg px-2 py-1 text-base leading-relaxed text-[var(--color-text-secondary)] outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)]"
                    >
                      {block.text}
                    </p>
                  )}
                  {block.type === "image" && (
                    <div className="flex h-32 items-center justify-center rounded-xl bg-[var(--color-bg-surface-hover)] text-[var(--color-text-muted)]">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">🖼️</span>
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            updateBlockText(block.id, e.currentTarget.textContent ?? "")
                          }
                          className="rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)]"
                        >
                          {block.text}
                        </span>
                      </div>
                    </div>
                  )}
                  {block.type === "button" && (
                    <div>
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => updateBlockText(block.id, e.currentTarget.textContent ?? "")}
                        className="inline-block rounded-xl bg-[var(--color-accent-emerald)] px-6 py-3 text-base font-semibold text-white outline-none focus:ring-2 focus:ring-white"
                      >
                        {block.text}
                      </span>
                    </div>
                  )}
                  {block.type === "list" && (
                    <ul className="list-disc space-y-1 pl-6">
                      {block.text.split(",").map((item, i) => (
                        <li key={i} className="text-base text-[var(--color-text-secondary)]">
                          {item.trim()}
                        </li>
                      ))}
                      <li className="mt-2 -ml-6 list-none">
                        <input
                          type="text"
                          value={block.text}
                          onChange={(e) => updateBlockText(block.id, e.target.value)}
                          className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-2 py-1 text-xs text-[var(--color-text-muted)] outline-none focus:ring-2 focus:ring-[var(--color-accent-emerald)]"
                          placeholder="Item 1, Item 2, Item 3"
                        />
                      </li>
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* What you just learned */}
      {completed && (
        <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 backdrop-blur-xl">
          <h3 className="mb-2 text-sm font-semibold text-[var(--color-accent-emerald)]">
            What you just learned
          </h3>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            You just built a web page! Every website you visit is made of blocks like these —
            headings, paragraphs, images, and buttons — described in a language called HTML.
          </p>
        </div>
      )}
    </div>
  );
}
