module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Allow AINDGS-recommended commit types alongside the conventional set.
    // - `governance`: changes to CLAUDE.md, CODEOWNERS, standards/, the
    //   provenance/audit contract.
    // - `security`: changes whose primary intent is closing a vulnerability,
    //   tightening RLS, hardening crypto, etc. (distinct from `fix` because
    //   the audit trail wants to surface security commits separately).
    // - `telem`: telemetry plumbing (analytics consent, web vitals).
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "governance",
        "perf",
        "refactor",
        "revert",
        "security",
        "style",
        "telem",
        "test",
      ],
    ],
  },
};
