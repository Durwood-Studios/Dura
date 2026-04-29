# Standards

Versioned, CODEOWNERS-protected conformance specifications for DURA. Each subdirectory corresponds to one standard the project commits to. Some standards are machine-enforceable schemas (parsed by the CI standards-gate); others are prose specifications with explicit version trees and review triggers — both share versioning + governance + amendment process. See `xDocs/decisions/0003-dls-as-standard-not-reference.md` for the rationale.

| Directory | Standard                                           | Form         | Phase that filled it           |
| --------- | -------------------------------------------------- | ------------ | ------------------------------ |
| `aindgs/` | AI-Native Dev Governance Standard 1.0              | YAML schema  | Phase 1-D (compliance sprint)  |
| `lflrs/`  | Local-First Learning Record Standard 1.0           | JSON schema  | Phase 2-A (compliance sprint)  |
| `pplas/`  | Privacy-Preserving Learning Analytics Standard 1.0 | YAML catalog | Phase 3-A (compliance sprint)  |
| `dls/`    | DURA Design Language Standard 1.0 + 2.0            | Prose spec   | (motion sprint — implementing) |

Files inside this tree are the contract that the CI standards-gate (compliance sprint Phase 4) enforces for the schema standards. The prose standard (DLS) is enforced by code-review for now; a DLS conformance linter is owed work in a future sprint.

- Schema/YAML files have machine-checkable shapes; new entries must match the schema.
- Prose specifications declare version dependencies, review triggers, and conformance/anti-pattern sections.
- Changes to any file here are CODEOWNERS-protected (see `/CODEOWNERS`).
- Removing or weakening a constraint requires an ADR in `xDocs/decisions/`.
