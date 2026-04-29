# Research Protocol — Gold Standard Reconnaissance

## Search Priority Order

Run searches in this order. Stop when you have sufficient coverage
(3+ established standards OR confirmed standard gap).

```
TIER 1 — Formal Standards Bodies (highest authority)
─────────────────────────────────────────────────────
ISO      International Organization for Standardization
IEEE     Institute of Electrical and Electronics Engineers
NIST     National Institute of Standards and Technology
ANSI     American National Standards Institute
W3C      World Wide Web Consortium (web/internet)
IETF     Internet Engineering Task Force (protocols/networking)
OWASP    Open Web Application Security Project (security)
OMG      Object Management Group (software modeling)
PMI      Project Management Institute
SHRM     Society for Human Resource Management
GAAP     Generally Accepted Accounting Principles
SOC      System and Organization Controls (audit)
HIPAA    Health Insurance Portability (healthcare)
GDPR     General Data Protection Regulation (privacy/EU)
CCPA     California Consumer Privacy Act (privacy/US)

TIER 2 — De Facto Standards (wide adoption, no formal body)
────────────────────────────────────────────────────────────
Semver       Semantic versioning (software releases)
OpenAPI      REST API specification format
12-Factor     Application methodology (Heroku origin)
GitFlow      Branching strategy
Conventional Commits  Commit message format
DORA Metrics  DevOps Research and Assessment (Google)
SPACE        Developer productivity framework (GitHub)
xAPI/Tin Can  eLearning data standard
Dublin Core  Metadata standard
WCAG         Web Content Accessibility Guidelines
Core Web Vitals  Google's performance metrics

TIER 3 — Domain Research (academic + practitioner)
────────────────────────────────────────────────────
Search: "[domain] best practices site:acm.org OR site:arxiv.org"
Search: "[domain] standard 2024 OR 2025"
Search: "[domain] specification RFC OR whitepaper"
Search: "[domain] industry standard [year]"

TIER 4 — Negative Space (what's missing)
──────────────────────────────────────────
Search: "[domain] no standard exists"
Search: "[domain] standardization needed"
Search: "[domain] inconsistent approaches"
```

## Reconnaissance Output Format

For each standard found, capture:

```
STANDARD: [Full name]
BODY: [Issuing organization]
YEAR: [Publication year, or "ongoing" for living standards]
STATUS: [Active / Deprecated / Draft / De facto]
CORE PRINCIPLES:
  - [Principle 1]
  - [Principle 2]
  - [Principle 3]
ADOPTION: [Niche / Regional / Industry-wide / Universal]
KNOWN FAILURES: [What the standard gets wrong or doesn't cover]
IMPLICIT CONSTRAINT: [What assumption limits this standard's ceiling]
```

## Standard Gap Declaration

If reconnaissance confirms no standard exists, output:

```
STANDARD GAP CONFIRMED
Subject: [domain/topic]
Evidence: [searches run, results found, why none qualify as standards]
Adjacent standards: [what partially applies from neighboring domains]
Gap opportunity: [what a novel standard would contribute]
Proceeding to Phase 4 (Creation).
```

Do not spend more than 8 web_search calls on reconnaissance.
If no standards surface in 8 calls, declare the gap and proceed.

## Red Flags (do not cite these as standards)

- Blog posts, even widely shared ones
- Company internal style guides (unless the company IS the standard, e.g., Google's SRE book)
- Stack Overflow answers
- Reddit consensus
- "Everyone does it this way" without a source
- Standards that were formally deprecated without replacement

## Adjacent Domain Mapping

When the target domain has no standards, map to adjacent domains:

```
AI/ML engineering      → software engineering (IEEE) + data science (CRISP-DM)
Learning experience    → instructional design (ADDIE, Gagné) + UX (Nielsen)
Developer tools        → 12-Factor + DORA + Conventional Commits
API design             → OpenAPI + REST constraints (Fielding dissertation)
Privacy/data           → GDPR + CCPA + ISO 27001
Performance            → Core Web Vitals + DORA + SLI/SLO/SLA (Google SRE)
Security               → OWASP + NIST CSF + SOC 2
Accessibility          → WCAG 2.2 + ARIA + UAAG
Content/documentation  → Divio framework + Diataxis + Microsoft Writing Style Guide
```
