/** Render a documented Markdown subset through DOM nodes; raw HTML is always text. */
export function renderMarkdown(text, document_) {
  if (typeof text !== "string" || text.length > 20000)
    throw new Error("Markdown exceeds 20,000 characters");
  const fragment = document_.createDocumentFragment();
  function inline(parent, value) {
    const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
    let cursor = 0;
    for (const match of value.matchAll(pattern)) {
      parent.append(document_.createTextNode(value.slice(cursor, match.index)));
      const token = match[0];
      let node;
      if (token.startsWith("`")) {
        node = document_.createElement("code");
        node.textContent = token.slice(1, -1);
      } else if (token.startsWith("**")) {
        node = document_.createElement("strong");
        node.textContent = token.slice(2, -2);
      } else if (token.startsWith("*")) {
        node = document_.createElement("em");
        node.textContent = token.slice(1, -1);
      } else {
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
        let url;
        try {
          url = new URL(link[2]);
        } catch {
          /* Unsupported destinations remain literal text. */
        }
        if (url && ["http:", "https:"].includes(url.protocol)) {
          node = document_.createElement("a");
          node.href = url.href;
          node.textContent = link[1];
          node.rel = "noopener noreferrer";
        } else node = document_.createTextNode(token);
      }
      parent.append(node);
      cursor = match.index + token.length;
    }
    parent.append(document_.createTextNode(value.slice(cursor)));
  }
  let code = null,
    list = null;
  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith("```")) {
      list = null;
      if (code) code = null;
      else {
        const pre = document_.createElement("pre");
        code = document_.createElement("code");
        pre.append(code);
        fragment.append(pre);
      }
      continue;
    }
    if (code) {
      code.append(document_.createTextNode(`${line}\n`));
      continue;
    }
    if (!line.trim()) {
      list = null;
      continue;
    }
    const item = /^[-*] (.*)$/.exec(line);
    if (item) {
      if (!list) {
        list = document_.createElement("ul");
        fragment.append(list);
      }
      const node = document_.createElement("li");
      inline(node, item[1]);
      list.append(node);
      continue;
    }
    list = null;
    const heading = /^(#{1,3}) (.*)$/.exec(line);
    const node = document_.createElement(
      heading
        ? `h${heading[1].length}`
        : line.startsWith("> ")
          ? "blockquote"
          : line === "---"
            ? "hr"
            : "p"
    );
    inline(
      node,
      heading ? heading[2] : line.startsWith("> ") ? line.slice(2) : line === "---" ? "" : line
    );
    fragment.append(node);
  }
  return fragment;
}
