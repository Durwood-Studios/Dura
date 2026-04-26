# Standards

Machine-enforceable conformance schemas for DURA. Each subdirectory corresponds to one external standard the project commits to.

| Directory | Standard                                           | Phase that fills it     |
| --------- | -------------------------------------------------- | ----------------------- |
| `aindgs/` | AI-Native Dev Governance Standard 1.0              | Phase 1-D (this commit) |
| `lflrs/`  | Local-First Learning Record Standard 1.0           | Phase 2-A               |
| `pplas/`  | Privacy-Preserving Learning Analytics Standard 1.0 | Phase 3-A               |

Files inside this tree are the contract that the CI standards-gate (Phase 4) enforces. Treat them as code, not documentation:

- Schema/YAML files have schemas; new entries must match the schema.
- Changes to any file here are CODEOWNERS-protected (see `/CODEOWNERS`).
- Removing or weakening a constraint requires an ADR in `xDocs/decisions/`.
