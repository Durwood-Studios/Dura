import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/**
 * P13 — DLS-1.0 §Adoption Friction: flag hardcoded hex colors in Tailwind
 * arbitrary value syntax (e.g. `bg-[#6ee7b7]`) inside className strings.
 *
 * Scope: learning-surface paths only (src/components/, src/app/(app)/).
 * Marketing/splash pages are excluded — they use brand-specific one-off
 * colors that are intentionally outside the DLS token system.
 *
 * Severity: warn (not error) — existing violations are tracked in
 * xDocs/active/motion-2026-q2/anti-pattern-audit.md; new violations
 * in the learning surface are caught before they accumulate.
 */
const hardcodedColorRule = {
  create(context) {
    // Only check files in the DLS-governed surfaces
    const filename = context.getFilename ? context.getFilename() : "";
    const governed = filename.includes("/src/components/") || filename.includes("/src/app/(app)/");
    const excluded =
      filename.includes("/src/components/splash/") ||
      filename.includes("/src/components/discover/") ||
      filename.includes("/src/app/(app)/teach/print/");
    if (!governed || excluded) return {};

    return {
      Literal(node) {
        if (typeof node.value !== "string") return;
        // Match Tailwind arbitrary hex: bg-[#xxx], text-[#xxx], border-[#xxx], etc.
        if (/(?:bg|text|border|ring|fill|stroke)-\[#[0-9a-fA-F]{3,8}/.test(node.value)) {
          context.report({
            node,
            message:
              "DLS-1.0: hardcoded hex color in Tailwind class. Use a --color-* CSS token instead.",
          });
        }
      },
    };
  },
  meta: {
    type: "suggestion",
    docs: { description: "Disallow hardcoded hex colors in Tailwind className strings (DLS-1.0)" },
    schema: [],
  },
};

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "public/sw.js",
      "public/sw.js.map",
    ],
  },
  {
    plugins: { "dura-dls": { rules: { "no-hardcoded-hex": hardcodedColorRule } } },
    rules: {
      "dura-dls/no-hardcoded-hex": "warn",
    },
  },
];

export default eslintConfig;
