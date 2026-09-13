import { z } from "zod";
import { readFile, realpath } from "node:fs/promises";
import { resolve, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("./fixtures/", import.meta.url));
export function registerLabTools(registry) {
  registry.register({
    name: "calculate",
    description: "Calculate two finite numbers with one arithmetic operator.",
    schema: z
      .object({
        left: z.number().finite(),
        operator: z.enum(["+", "-", "*", "/", "**"]),
        right: z.number().finite(),
      })
      .strict(),
    execute: async ({ left, operator, right }) => {
      const value = {
        "+": () => left + right,
        "-": () => left - right,
        "*": () => left * right,
        "/": () => left / right,
        "**": () => left ** right,
      }[operator]();
      if (!Number.isFinite(value)) throw Error("Result must be finite");
      return value;
    },
  });
  registry.register({
    name: "read_document",
    description: "Read the public welcome.txt lab fixture.",
    schema: z.object({ path: z.literal("welcome.txt") }).strict(),
    execute: async ({ path }) => {
      const base = await realpath(root),
        target = await realpath(resolve(base, path)),
        rel = relative(base, target);
      if (rel.startsWith("..") || isAbsolute(rel))
        throw Error("Document is outside the fixture directory");
      const content = await readFile(target, "utf8");
      if (content.length > 10_000) throw Error("Fixture exceeds limit");
      return content;
    },
  });
}
