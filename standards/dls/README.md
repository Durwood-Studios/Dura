# DLS — DURA Design Language Standard

Versioned design specification for DURA. Unlike its sibling directories
(`aindgs/`, `lflrs/`, `pplas/`), DLS is **prose**, not a machine-enforceable
schema — see `xDocs/decisions/0003-dls-as-standard-not-reference.md` for
the rationale on why it lives here anyway.

## Versions

| Version | File                       | Status | Scope                                         |
| ------- | -------------------------- | ------ | --------------------------------------------- |
| 1.0     | [`dls-1.0.md`](dls-1.0.md) | Active | Visual language, principles, tokens, surfaces |
| 2.0     | [`dls-2.0.md`](dls-2.0.md) | Active | Motion + polish layer (depends on 1.0)        |

## Versioning rules

- A new minor version (1.x → 1.y) supersedes-in-place; the prior version
  is deleted unless its supersession is incomplete.
- A new major version (1.x → 2.0) is **additive** when scoped to a new
  layer (as 2.0 does for motion). The prior major remains active and is
  declared as a dependency.
- Breaking changes within a major version require an ADR.

## Conformance

Like the other standards in this tree, DLS files are CODEOWNERS-protected.
Changes require human review. Removing or weakening any P-numbered
principle in DLS-1.0 requires an ADR in `xDocs/decisions/`.
