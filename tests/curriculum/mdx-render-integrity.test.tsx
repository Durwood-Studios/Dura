import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createElement, type ReactNode } from "react";
import * as runtime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { evaluate } from "@mdx-js/mdx";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

interface AuthoredProps {
  children?: ReactNode;
}
function AuthoredBoundary({ children }: AuthoredProps): ReactNode {
  return createElement("div", null, children);
}
const files = ["phases", "tutorials", "howto"].flatMap((group) =>
  readdirSync(`src/content/${group}`, { recursive: true })
    .filter(
      (file): file is string =>
        typeof file === "string" && file.endsWith(".mdx") && !file.includes(" 2.")
    )
    .map((file) => path.join("src/content", group, file))
);

describe("every authored MDX body evaluates during render", () => {
  it("does not hide undefined JSX expressions behind successful compilation", async () => {
    const failures: string[] = [];
    for (const file of files) {
      try {
        const body = matter(readFileSync(file, "utf8")).content;
        const componentNames = [...body.matchAll(/<([A-Z][\w.]*)\b/g)].map((match) => match[1]);
        const components = Object.fromEntries(
          componentNames.map((name) => [name, AuthoredBoundary])
        );
        const evaluated = await evaluate(body, { ...runtime, development: false });
        renderToStaticMarkup(createElement(evaluated.default, { components }));
      } catch (error: unknown) {
        failures.push(`${file}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    expect(failures).toEqual([]);
  }, 60_000);
});
