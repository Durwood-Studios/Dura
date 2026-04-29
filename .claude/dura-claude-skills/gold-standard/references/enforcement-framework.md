# Enforcement Framework — Technical · Legal · Logical

## § Technical Enforcement

### JSON Schema Template (per standard)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://[project].dev/standards/[domain]/v1.0/schema.json",
  "title": "[Domain] Gold Standard — Conformance Schema",
  "description": "Machine-readable requirements for [Domain] standard v1.0",
  "type": "object",
  "required": ["version", "principles_satisfied", "requirements"],
  "properties": {
    "version": {
      "type": "string",
      "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+$",
      "description": "Semver of the standard this artifact conforms to"
    },
    "principles_satisfied": {
      "type": "array",
      "items": { "type": "string", "enum": ["P1", "P2", "P3"] },
      "minItems": 3,
      "description": "All principles must be satisfied; partial conformance is non-conformance"
    },
    "requirements": {
      "type": "object",
      "required": ["R1", "R2"],
      "properties": {
        "R1": { "type": "boolean", "const": true },
        "R2": { "type": "boolean", "const": true }
      }
    }
  }
}
```

Customize: replace P1-P3 and R1-R2 with actual Principle and Requirement IDs
from the forged standard. Each Requirement maps to exactly one boolean — pass
or fail; no partial credit encoded.

### Test Assertion Stubs

**TypeScript / Vitest**

```typescript
import { describe, it, expect } from "vitest";
import { validateConformance } from "./lib/standard-validator";

describe("[Domain] Gold Standard v1.0 — Conformance", () => {
  describe("R1 — [Requirement Name]", () => {
    it("passes when [condition]", () => {
      expect(
        validateConformance({
          /* valid case */
        })
      ).toBe(true);
    });
    it("fails when [violation condition]", () => {
      expect(
        validateConformance({
          /* invalid case */
        })
      ).toBe(false);
    });
  });
  // One describe block per Requirement
});
```

**Python / pytest**

```python
import pytest
from standard_validator import validate_conformance

class TestR1RequirementName:
    def test_passes_when_condition(self):
        assert validate_conformance({...}) is True
    def test_fails_when_violation(self):
        assert validate_conformance({...}) is False
```

**Rust / cargo-test**

```rust
#[cfg(test)]
mod standard_conformance {
    use super::*;
    #[test]
    fn r1_passes_valid_case() { assert!(validate_conformance(&valid_fixture())); }
    #[test]
    fn r1_fails_violation() { assert!(!validate_conformance(&invalid_fixture())); }
}
```

### CI Gate (GitHub Actions)

```yaml
name: Gold Standard Conformance
on: [push, pull_request]
jobs:
  standard-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate schema conformance
        run: npx ajv validate -s standards/[domain]/schema.json -d [artifact-path]
      - name: Run conformance tests
        run: [test runner command]
      - name: Fail on any non-conformance
        if: failure()
        run: |
          echo "::error::Standard conformance gate failed."
          echo "See standards/[domain]/README.md for requirements."
          exit 1
```

PR merge is blocked if this job fails. This is the enforcement mechanism —
without this gate, the standard is advisory; with it, the standard is binding.

### Implementation Checklist Template

Generated per-standard; ordered by dependency (R1 before R2 if R2 depends on R1):

```
[DOMAIN] STANDARD — IMPLEMENTATION CHECKLIST v1.0
───────────────────────────────────────────────────
□ R1 — [Name]: [specific implementation action] → [how to verify]
□ R2 — [Name]: [specific implementation action] → [how to verify]
□ Schema: standards/[domain]/schema.json committed to repo root
□ Tests: standards/[domain]/conformance.test.[ts|py|rs] passing
□ CI: .github/workflows/standard-gate.yml active on main branch
□ ADR: doc/adr/[NNN]-[domain]-standard-adoption.md committed
□ DECISIONS.md: standard adoption documented with rationale
```

---

## § Legal Enforcement

### Regulatory Mapping Table Template

| Principle   | Requirement | Applicable Law/Reg  | Jurisdiction | Mandatory?         | Safe Harbor         |
| ----------- | ----------- | ------------------- | ------------ | ------------------ | ------------------- |
| P1 — [Name] | R1 — [Name] | GDPR Art. 25        | EU/EEA       | Yes — binding      | ISO/IEC 27701 cert  |
| P2 — [Name] | R2 — [Name] | NIST AI RMF Govern  | US Federal   | No — voluntary     | NIST conformance    |
| P3 — [Name] | R3 — [Name] | EU AI Act Annex III | EU           | Yes — if high-risk | Notified body audit |

**How to fill this table:**
For each Principle + Requirement pair, ask:

1. Is there a binding law/regulation that requires this (or something like it)?
2. If yes: which jurisdiction? Is it currently enforceable?
3. Does following this standard's Requirement automatically satisfy the law?
4. Is there a certification/audit that provides safe harbor?

### Compliance Checklist Template

What a conforming implementation must document (not just implement):

```
COMPLIANCE DOCUMENTATION CHECKLIST
────────────────────────────────────
□ Data Protection Impact Assessment (DPIA) — required if GDPR Art. 35 triggers
□ AI system technical documentation — required if EU AI Act Annex III applies
□ Records of processing activities — GDPR Art. 30 (all controllers)
□ Legitimate interest assessment — if LIA basis used
□ Risk management documentation — NIST AI RMF Govern function
□ Incident response plan — SOC 2 CC7 / NIST CSF RS
□ Model card or AI system card — voluntary but increasingly expected
□ Audit trail — who changed what standard-governed artifact, when, why
```

### Liability Gap Analysis Template

```
LIABILITY ANALYSIS — [Domain] Standard v1.0
────────────────────────────────────────────
Legal minimum: [what the law requires at minimum, verbatim or paraphrased]
This standard requires: [what the forged standard adds beyond legal minimum]
Gap: [what this standard mandates that law does not]
Value of the gap: [why the gap is worth closing — risk reduction, user trust, etc.]

Non-conformance cost (legal): [fine/penalty range if legally required parts violated]
Non-conformance cost (standard-only): [reputational/operational cost; no legal penalty]

Jurisdictions where this matters most: [ranked by enforcement activity]
```

### Jurisdiction Delta Table Template

| Requirement | EU                 | US Federal | California       | UK                   | Canada    |
| ----------- | ------------------ | ---------- | ---------------- | -------------------- | --------- |
| R1 — [Name] | Mandatory (GDPR)   | Voluntary  | Mandatory (CCPA) | Recommended          | Voluntary |
| R2 — [Name] | Mandatory (AI Act) | Voluntary  | Voluntary        | Mandatory (proposed) | Voluntary |

Produce this table only when multiple jurisdictions are in scope.
When in doubt, default to EU (strictest) + US Federal (most influential).

---

## § Logical Enforcement

### Consistency Proof Protocol

For each pair of Principles (P_i, P_j where i ≠ j):

```
CONSISTENCY CHECK: P[i] × P[j]
────────────────────────────────
P[i] states: [one-sentence restatement]
P[j] states: [one-sentence restatement]
Potential conflict: [describe any scenario where following both is impossible]
Resolution: [NONE — no conflict] OR [CONDITIONAL — conflict only when X; resolved by Y]
Verdict: CONSISTENT | CONDITIONALLY CONSISTENT (condition: [X]) | CONFLICT (must resolve)
```

A standard with any CONFLICT verdict is not ready to ship.
A CONDITIONALLY CONSISTENT verdict is acceptable if the condition is named
and handled by a Recommendation or an explicit scope exclusion.

### Completeness Check Protocol

```
COMPLETENESS CHECK
───────────────────
For each Principle P[i]:
  → Requirements that enforce it: [list R-IDs]
  → If no Requirements: P[i] is aspirational, not enforceable — add R or remove P

For each Requirement R[j]:
  → Principle it enforces: [P-ID]
  → If no Principle: R[j] is orphaned — trace it to a Principle or remove it

Result: Every P has ≥1 R. Every R maps to exactly 1 P.
```

### Soundness Check Protocol

```
SOUNDNESS CHECK
────────────────
For each Anti-pattern A[k]:
  → What it looks like: [concrete description]
  → Which Principle prevents it: [P-ID]
  → Which Requirement makes it testable: [R-ID]
  → If no P+R pair: the standard does not actually prevent A[k] —
    either add a Requirement or remove the Anti-pattern claim

Result: Every Anti-pattern is prevented by a named P+R pair.
```

### Coverage Map Protocol

```
COVERAGE MAP
─────────────
Gaps identified in Phase 2 (Lane C):
  GAP-1: [description] → CLOSED by [Principle + Requirement IDs]
  GAP-2: [description] → CLOSED by [Principle + Requirement IDs]
  GAP-3: [description] → DEFERRED (out of scope, see Purpose § exclusions)

Deferred gaps are not failures. An honest scope exclusion is better than
a vague Principle that claims to close a gap it doesn't actually close.
```

---

## § Adoption Friction Analysis

Always produce for any forged standard. Three failure modes max; three mitigations max.

```
ADOPTION FRICTION ANALYSIS
────────────────────────────
FAILURE MODE 1: [specific reason this standard gets ignored]
  Root cause: [why this happens]
  Mitigation built into this standard: [specific design choice that addresses it]
  Residual risk: [what the mitigation doesn't fully solve]

FAILURE MODE 2: [specific reason this standard gets abandoned after adoption]
  Root cause: [why this happens]
  Mitigation: [design choice]
  Residual risk: [remaining exposure]

FAILURE MODE 3: [specific reason this standard gets applied wrongly]
  Root cause: [why this happens]
  Mitigation: [design choice]
  Residual risk: [remaining exposure]
```

Common failure modes to check against:

- Too abstract to implement (vague principles → no test stubs → no enforcement)
- No owner (standard without a named maintainer drifts)
- Tooling gap (standard requires a tool that doesn't exist)
- Compliance theater (teams check the box without changing behavior)
- Version freeze (standard doesn't update when the domain moves)
- Jurisdiction conflict (global team, regional standard — causes paralysis)
