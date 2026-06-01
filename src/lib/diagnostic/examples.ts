import type { MCQQuestion } from "./types";

/**
 * Canonical reference questions. Three are enough to show the system end-to-
 * end: one elementary (Phase 0), one mid-curriculum (Phase 2), one production-
 * adjacent (Phase 4). Each uses a distinct misconception from the catalog so
 * authors can see how the schema cashes out in practice.
 */

export const ARRAY_INDEXING: MCQQuestion = {
  kind: "mcq",
  id: "phase-0-arrays-indexing-01",
  difficulty: "intro",
  prompt: "Given const arr = ['a', 'b', 'c'], which expression evaluates to the last element 'c'?",
  correct: {
    text: "arr[arr.length - 1]",
    explanation: "In a 0-indexed language the last valid index is one less than the length.",
  },
  distractors: [
    { text: "arr[arr.length]", misconception: "off-by-one-indexing" },
    { text: "arr.last()", misconception: "list-vs-array-confusion" },
    { text: "arr.pop()", misconception: "list-vs-array-confusion" },
  ],
  workedSolution: {
    steps: [
      "JavaScript arrays are 0-indexed: arr[0] is 'a', arr[1] is 'b', arr[2] is 'c'.",
      "arr.length is 3 — one past the last valid index.",
      "So the last element lives at arr[arr.length - 1] = arr[2] = 'c'.",
    ],
  },
  confidenceCheck: true,
  tags: ["arrays", "indexing", "javascript"],
};

export const STRING_LENGTH_EMOJI: MCQQuestion = {
  kind: "mcq",
  id: "phase-2-string-length-emoji-01",
  difficulty: "core",
  prompt: 'In JavaScript, what does "🚀".length return?',
  correct: {
    text: "2",
    explanation:
      "JavaScript stores strings as UTF-16 code units. A rocket emoji is a surrogate pair → two code units → length 2.",
  },
  distractors: [
    { text: "1", misconception: "string-length-vs-codepoint" },
    { text: "4", misconception: "string-length-vs-codepoint" },
    {
      text: "Error — emojis are not valid in strings",
      misconception: "string-length-vs-codepoint",
    },
  ],
  workedSolution: {
    steps: [
      "JavaScript stores strings as UTF-16 code units (.length returns the unit count).",
      "Most Basic Multilingual Plane characters (ASCII, most CJK) fit in one code unit.",
      "Characters above U+FFFF — most emoji, some CJK extensions — are stored as a surrogate pair: two code units.",
      "So '🚀'.length === 2. Use Array.from(s).length or [...s].length if you want code-point count.",
    ],
  },
  confidenceCheck: true,
  tags: ["strings", "unicode", "javascript"],
};

export const N_PLUS_ONE_LOOP: MCQQuestion = {
  kind: "mcq",
  id: "phase-4-n-plus-one-loop-01",
  difficulty: "core",
  prompt:
    "An ORM query renders a list of users with their posts. The handler runs `users = User.all(); for (u of users) print(u.posts)`. With 200 users (each with 5 posts) and 20 ms per DB round-trip, what's the wall-clock latency?",
  correct: {
    text: "~4 seconds — one query per user iteration on top of the initial fetch",
    explanation:
      "u.posts looks like a property access but issues a database query. 1 (users) + 200 (per-user posts) = 201 round-trips × 20 ms ≈ 4 s.",
  },
  distractors: [
    {
      text: "~40 ms — the ORM joins automatically",
      misconception: "n-plus-one-disguised-as-property",
    },
    {
      text: "~20 ms — only the User.all() call hits the DB",
      misconception: "n-plus-one-disguised-as-property",
    },
    {
      text: "~100 ms — the ORM caches the posts lookup after the first call",
      misconception: "n-plus-one-disguised-as-property",
    },
  ],
  workedSolution: {
    steps: [
      "User.all() issues one query and returns 200 user rows.",
      "u.posts is a relation accessor: it issues a fresh query per call.",
      "The loop calls u.posts 200 times → 200 extra round-trips.",
      "Total: 1 + 200 = 201 round-trips × 20 ms = 4.02 s.",
      "Fix: prefetch the relation (User.all().includes(:posts) / .with('posts')) — 2 queries total.",
    ],
  },
  confidenceCheck: true,
  tags: ["database", "performance", "orm"],
};

// ─── Phase 1 · IEEE 754 floating-point ────────────────────────────────────
// Anchored to IEEE 754-2019. Canonical "the 0.1 + 0.2 surprise" question —
// the gateway misconception every working engineer eventually hits in
// production and the cleanest entry point for the IEEE 754 lesson.

export const IEEE_754_DECIMAL: MCQQuestion = {
  kind: "mcq",
  id: "phase-1-ieee754-decimal-sum-01",
  difficulty: "core",
  prompt: "In JavaScript, what does the expression (0.1 + 0.2 === 0.3) evaluate to?",
  correct: {
    text: "false",
    explanation:
      "0.1 and 0.2 cannot be represented exactly in IEEE 754 binary64. Their sum rounds to 0.30000000000000004, which differs from the binary64 representation of 0.3 by exactly one ULP.",
  },
  distractors: [
    { text: "true", misconception: "assumes-decimal-precision" },
    {
      text: "true — the runtime rounds derived values for equality",
      misconception: "float-equality-derived",
    },
    {
      text: "NaN — non-representable decimals produce NaN",
      misconception: "nan-equality-comparison",
    },
  ],
  workedSolution: {
    steps: [
      "IEEE 754 binary64 stores numbers as sign × mantissa × 2^exponent — a binary fraction.",
      "0.1 in binary is 0.0001100110011… (a repeating fraction). It cannot be exact in any finite binary representation.",
      "0.1 + 0.2 yields 0.30000000000000004 in binary64 — the closest representable double to the true sum.",
      "0.3 also rounds to a slightly different binary64 value. The two representations differ by one ULP (unit in the last place).",
      "So === — which compares bit patterns for primitives — returns false. For comparing computed floats, use |a - b| < epsilon, where epsilon is chosen by domain.",
    ],
  },
  confidenceCheck: true,
  tags: ["ieee-754", "floating-point", "javascript", "phase-1"],
};

// ─── Phase 1 · POSIX async-signal-safety ──────────────────────────────────
// Anchored to POSIX.1-2024 (IEEE Std 1003.1-2024). The async-signal-safety
// trap is the single most common deadlock/heap-corruption source in
// signal-using code — a perfect "industry-grade" diagnostic question.

export const POSIX_SIGNAL_SAFETY: MCQQuestion = {
  kind: "mcq",
  id: "phase-1-posix-signal-safety-01",
  difficulty: "stretch",
  prompt:
    "Your C program installs a SIGINT handler that needs to write the message 'caught signal' to standard error before exiting. Per POSIX.1, which of these is the safe way to do it inside the handler?",
  correct: {
    text: 'write(STDERR_FILENO, "caught signal\\n", 14)',
    explanation:
      "write() is on the POSIX async-signal-safe list. The handler can call it without invoking undefined behaviour, even if the main program was inside libc when the signal arrived.",
  },
  distractors: [
    {
      text: 'fprintf(stderr, "caught signal\\n")',
      misconception: "signal-handler-library-calls",
    },
    {
      text: 'char *msg = malloc(64); strcpy(msg, "caught signal\\n"); write(2, msg, 14)',
      misconception: "signal-handler-library-calls",
    },
    {
      text: 'pthread_mutex_lock(&log_mutex); log_message("caught signal\\n"); pthread_mutex_unlock(&log_mutex)',
      misconception: "signal-handler-library-calls",
    },
  ],
  workedSolution: {
    steps: [
      "POSIX.1 defines a specific list of functions guaranteed to be safe inside a signal handler — the async-signal-safe set.",
      "If the main program was interrupted while inside, say, malloc's internal arena, calling malloc again from the handler can corrupt the heap.",
      "fprintf is not on the safe list — it touches stdio buffers and ultimately calls malloc.",
      "malloc is not on the safe list — re-entering the allocator is the canonical deadlock source.",
      "pthread_mutex_lock is not on the safe list — if the main program already holds the mutex, the handler deadlocks the thread.",
      "write() IS on the safe list. It maps to a single syscall, takes no locks, allocates no memory. Use it (with a static or stack-allocated buffer) for signal-handler I/O.",
    ],
  },
  confidenceCheck: true,
  tags: ["posix", "signals", "async-signal-safety", "c", "phase-1"],
};

// ─── Phase 2 · RFC 2119 / BCP 14 ──────────────────────────────────────────
// Anchored to RFC 2119 + RFC 8174. The MUST/SHOULD/MAY gradient drives daily
// PR-review disagreements; this question pinpoints the most-missed nuance.

export const RFC_2119_SHOULD: MCQQuestion = {
  kind: "mcq",
  id: "phase-2-rfc2119-should-01",
  difficulty: "core",
  prompt:
    "An IETF spec says: 'Implementations SHOULD reject malformed payloads.' Per RFC 2119 / BCP 14, what is the obligation on a conforming implementation?",
  correct: {
    text: "Reject by default; if you do not reject, you must understand the implications and have a documented reason",
    explanation:
      "RFC 2119 defines SHOULD as: there may exist valid reasons in particular circumstances to ignore this requirement, but the full implications must be understood and weighed before choosing a different course.",
  },
  distractors: [
    {
      text: "Reject malformed payloads — SHOULD is binding identically to MUST",
      misconception: "confuses-rfc2119-vocabulary",
    },
    {
      text: "Implementations may safely ignore the recommendation — SHOULD is optional",
      misconception: "confuses-rfc2119-vocabulary",
    },
    {
      text: "The lowercase 'should' has no normative weight; only RFC 2119 uppercase MUST is binding",
      misconception: "informational-vs-standards-track",
    },
  ],
  workedSolution: {
    steps: [
      "RFC 2119 (and the updating RFC 8174) define the normative vocabulary used across IETF documents.",
      "ALL CAPS keywords (MUST, SHOULD, MAY) carry the normative meaning when used as defined. Lowercase or conventional usage does not.",
      "MUST means absolute requirement. MAY means truly optional. SHOULD sits between: there may be valid reasons to ignore, but those reasons must be weighed and documented.",
      "A spec that uses 'SHOULD reject' is saying: rejection is the default conforming behavior, but you can deviate if you have a documented and understood reason.",
      "The wrong answers either over-strict (treating SHOULD as MUST), over-lax (treating SHOULD as MAY), or wrongly dismiss the keyword entirely.",
    ],
  },
  confidenceCheck: true,
  tags: ["rfc-2119", "bcp-14", "ietf", "phase-2"],
};

// ─── Phase 2 · ECMA TC39 process ──────────────────────────────────────────
// Anchored to the TC39 staging process. Engineers shipping JS features at
// the wrong stage gate is a real production-breakage source.

export const TC39_STAGE_READINESS: MCQQuestion = {
  kind: "mcq",
  id: "phase-2-tc39-stage-readiness-01",
  difficulty: "core",
  prompt:
    "A TC39 proposal you want to use for a production browser app is currently at Stage 2 (Draft). What is the safest characterization of shipping it?",
  correct: {
    text: "Stage 2 means the spec authors agree on the problem and a rough solution, but semantics can still change before Stage 4. Production use requires a transpiler pinning current semantics, plus accepting that the spec may diverge later.",
    explanation:
      "Per the TC39 Process Document, only Stage 4 is a 'Finished' proposal — the only stage where ECMA-262 has accepted the proposal with two spec-compliant implementations and tests.",
  },
  distractors: [
    {
      text: "Stage 2 means the proposal is implementation-ready — safe to use directly in modern engines",
      misconception: "tc39-stage-readiness",
    },
    {
      text: "Stage 2 is part of the most recent ECMAScript yearly edition; it's standardized",
      misconception: "tc39-stage-readiness",
    },
    {
      text: "Once any proposal reaches Stage 4, it ships in all major runtimes simultaneously",
      misconception: "tc39-cross-runtime",
    },
  ],
  workedSolution: {
    steps: [
      "TC39 stages: 0 (Strawperson), 1 (Proposal), 2 (Draft), 3 (Candidate), 4 (Finished).",
      "Stage 2 = the committee has accepted the problem statement and has a rough solution sketched, but the spec text and semantics can still change materially.",
      "Stage 3 = spec text is essentially final; awaiting implementation feedback. Breaking changes still possible but rare.",
      "Stage 4 = at least two spec-compliant implementations exist with test262 coverage, and the ECMA-262 editor has signed off for inclusion in the next yearly edition.",
      "Production use of pre-Stage-4 features is possible via Babel/SWC transpilation, but the transpiled output reflects the proposal at compile time — if the spec changes before Stage 4, your shipped code may not match the eventual standard.",
      "Even Stage 4 doesn't mean universal runtime availability. V8, JavaScriptCore, SpiderMonkey, and runtime targets (Node/Bun/Deno) implement on their own schedules. Always check compat tables before relying on a feature in production.",
    ],
  },
  confidenceCheck: true,
  tags: ["tc39", "ecmascript", "javascript", "phase-2"],
};

// ─── Phase 2 · WCAG 2.2 conformance ───────────────────────────────────────
// Anchored to WCAG 2.2 (Oct 2023, updated Dec 2024). The "axe-clean = WCAG
// compliant" misread is the most expensive accessibility misconception in
// the industry — it produces over-confident shipping that gets sued.

export const WCAG_AUTO_TOOLS: MCQQuestion = {
  kind: "mcq",
  id: "phase-2-wcag-automated-tools-01",
  difficulty: "stretch",
  prompt:
    "Your CI runs axe-core against every page and the report shows 100% pass. Per WCAG 2.2, what is a defensible conclusion about the site's AA conformance?",
  correct: {
    text: "An axe-clean run is a necessary but insufficient signal. Automated tools cover roughly 30-40% of WCAG success criteria — keyboard navigation, screen reader narration, alt-text adequacy, and judgment-based criteria still require manual review.",
    explanation:
      "WCAG 2.2 AA requires conformance across all applicable Level A and Level AA success criteria. Many of them — focus order, meaningful sequence, label adequacy, error identification quality — cannot be evaluated mechanically.",
  },
  distractors: [
    {
      text: "100% axe-core pass means the site is WCAG 2.2 AA conformant — CI is sufficient",
      misconception: "wcag-auto-tools-coverage",
    },
    {
      text: "axe-core covers WCAG 2.1 only; the 2.2 success criteria require a separate tool",
      misconception: "wcag-auto-tools-coverage",
    },
    {
      text: "ADA Title II accepts a clean automated scan as compliance evidence in litigation",
      misconception: "wcag-conformance-level",
    },
  ],
  workedSolution: {
    steps: [
      "WCAG 2.2 organizes accessibility requirements as testable success criteria (SC) across four principles: Perceivable, Operable, Understandable, Robust.",
      "Each SC has Level A, AA, or AAA. AA is the level most legal regimes and industry contracts cite as the conformance floor.",
      "Studies and tool vendors broadly converge: automated tools catch ~30-40% of SC violations by validity volume. Deque, Microsoft, and the W3C all publish similar figures.",
      "Automated tools detect: missing alt text, missing form labels, contrast violations, ARIA misuse, heading order. They CANNOT evaluate: whether alt text is meaningful, whether focus order matches reading order, whether the error message helps a real user recover, whether the page is keyboard-navigable end-to-end.",
      "A WCAG AA conformance claim requires: automated scan + manual keyboard walkthrough + screen reader testing + content review for plain-language SC + cognitive review for judgment-based SC. Any single tool's 100% score is one signal among many.",
      "Legal posture: the ADA Title II rule (2024) requires public-sector US sites to meet WCAG 2.1 AA. Private-sector lawsuits often cite WCAG by precedent but no court accepts a CI report as standalone compliance evidence.",
    ],
  },
  confidenceCheck: true,
  tags: ["wcag", "accessibility", "a11y", "phase-2"],
};

// ─── Phase 3 · OWASP Top 10:2025 awareness ────────────────────────────────
// Anchored to OWASP Top 10:2025 (RC1 Nov 2025, final Jan 2026). Catches the
// most expensive security-curriculum mistake: anchoring to the 2021 list
// when the 2025 list has materially different categories.

export const OWASP_2025_NEW_CATEGORY: MCQQuestion = {
  kind: "mcq",
  id: "phase-3-owasp-2025-new-category-01",
  difficulty: "core",
  prompt:
    "Which of the following is a NEW top-level category introduced in OWASP Top 10:2025 (RC1, Nov 2025) compared to the 2021 list?",
  correct: {
    text: "Software Supply Chain Failures — spanning CI/CD pipeline integrity, build-environment trust, post-install scripts, registry compromise, dependency confusion",
    explanation:
      "Software Supply Chain Failures was elevated to its own category in 2025 to capture the rise of pipeline-targeted attacks (xz-utils, event-stream, SolarWinds-shaped incidents) that the 2021 list folded into 'Vulnerable and Outdated Components.'",
  },
  distractors: [
    {
      text: "Server-Side Request Forgery (SSRF)",
      misconception: "outdated-owasp-list",
    },
    {
      text: "Injection (SQL, command, LDAP)",
      misconception: "outdated-owasp-list",
    },
    {
      text: "Cryptographic Failures",
      misconception: "outdated-owasp-list",
    },
  ],
  workedSolution: {
    steps: [
      "OWASP Top 10 is revised periodically as the threat landscape and CVE data shift. The 2017 → 2021 revision renamed and re-ranked; the 2021 → 2025 revision introduced new categories.",
      "Top 10:2025 introduced two new top-level categories: Software Supply Chain Failures and Mishandling Exceptional Conditions.",
      "SSRF was a new category in 2021, but the 2025 revision absorbed it into Broken Access Control (A01) — so it's no longer its own top-level item.",
      "Injection has been on the Top 10 since at least 2017 — not new in 2025 (and ranked lower than in 2017 because of widespread ORM adoption shifting the prevalence data).",
      "Cryptographic Failures was renamed from 'Sensitive Data Exposure' in the 2021 revision — present in both 2021 and 2025, not new in 2025.",
      "Picking SSRF, Injection, or Cryptographic Failures here is the 'I learned the 2021 list and never updated' anchoring error. Curriculum must teach the current revision; otherwise students learn the wrong threat model.",
    ],
  },
  confidenceCheck: true,
  tags: ["owasp", "top10", "security", "2025", "phase-3"],
};

// ─── Phase 3 · OWASP Top 10 vs ASVS scope ─────────────────────────────────
// The most common security-team / engineer disconnect: treating the Top 10
// as a verification standard when it's an awareness document.

export const OWASP_VERIFICATION_REQUEST: MCQQuestion = {
  kind: "mcq",
  id: "phase-3-owasp-vs-asvs-01",
  difficulty: "core",
  prompt:
    "Your security team asks you to 'verify the app conforms to the OWASP Top 10.' What's the right pushback?",
  correct: {
    text: "The Top 10 is an awareness document, not a verification standard. Ask whether they want OWASP ASVS L1 (baseline), L2 (most applications), or L3 (high-assurance) — that's the actual verification catalog, 14 control families across 3 levels.",
    explanation:
      "OWASP itself is explicit that the Top 10 is awareness-only. Verification uses ASVS. Conflating them produces test plans that don't map cleanly to either the Top 10's categories or ASVS's requirements.",
  },
  distractors: [
    {
      text: "Run an automated scan against the OWASP ZAP rule set — that's the standard verification",
      misconception: "owasp-top10-as-verification",
    },
    {
      text: "Sign off based on Top 10 awareness training completion by the engineering team",
      misconception: "owasp-top10-as-verification",
    },
    {
      text: "Verification is implicit — if no Top 10 categories appear in pen-test findings, you conform",
      misconception: "owasp-top10-as-verification",
    },
  ],
  workedSolution: {
    steps: [
      "OWASP publishes several flagship projects with different purposes: Top 10 (awareness), ASVS (verification), SAMM (governance maturity), ZAP (a scanning tool).",
      "The Top 10 describes ten broad vulnerability categories with prevalence data — its job is to make engineers and stakeholders aware of what matters. It is explicitly not a checklist.",
      "ASVS is the verification standard: 14 control families (architecture, authentication, session, access control, validation/sanitization/encoding, cryptography, error/logging, data, communication, malicious code, business logic, file/resource, API/web service, configuration), 3 conformance levels, hundreds of testable requirements per level.",
      "An automated tool's clean run is one input to ASVS verification, not the verification itself. Many ASVS requirements (business logic flaws, secret management policy, key rotation) cannot be evaluated by scanners.",
      "When a stakeholder asks 'verify Top 10 conformance,' the productive translation is: 'do you want ASVS L1, L2, or L3, and can we agree on a scope?'",
    ],
  },
  confidenceCheck: true,
  tags: ["owasp", "asvs", "top10", "security", "phase-3"],
};

// ─── Phase 8 · ISO 27001 scope ────────────────────────────────────────────
// Anchored to ISO/IEC 27001:2022. The canonical "is the product secure
// because we have the cert?" customer-conversation question — most-asked
// in B2B sales processes.

export const ISO_27001_SCOPE: MCQQuestion = {
  kind: "mcq",
  id: "phase-8-iso27001-scope-01",
  difficulty: "core",
  prompt:
    "Your company says 'we are ISO 27001 certified.' A prospective customer asks whether the product handling their data is therefore secure. What's the accurate answer?",
  correct: {
    text: "ISO 27001 certifies the organization's Information Security Management System — the processes for managing risk. It does not certify any individual product. Whether the product is secure depends on how the ISMS controls were applied to it, which is documented in the Statement of Applicability.",
    explanation:
      "ISO 27001 is a Management System Standard. The audit evaluates whether the company has a working risk-management process and whether it applies controls per the SoA. Product-level security is implied only to the extent the product is in scope and the relevant controls were chosen.",
  },
  distractors: [
    {
      text: "Yes — ISO 27001 means every product the company ships meets a baseline security standard",
      misconception: "iso27001-as-product-cert",
    },
    {
      text: "It's roughly equivalent to a SOC 2 Type 2 report — same coverage, different name",
      misconception: "iso27001-vs-soc2",
    },
    {
      text: "Yes — ISO 27001 includes mandatory product penetration testing as part of the audit",
      misconception: "iso27001-as-product-cert",
    },
  ],
  workedSolution: {
    steps: [
      "ISO 27001 is a Management System Standard (MSS) — it specifies requirements for an Information Security Management System (ISMS), not for a product.",
      "The certification audit checks: is there a risk-assessment process, is there a Statement of Applicability listing chosen controls, is there management review, are records kept, are non-conformities addressed.",
      "The Statement of Applicability defines the SCOPE — which sites, services, products are inside the ISMS. A product can be out of scope while the company is certified.",
      "ISO 27001 ≠ SOC 2. SOC 2 is an attestation against AICPA Trust Services Criteria, sampling controls during a reporting period. ISO 27001 is a certification against ISO requirements. Different evidence, different audiences, different maintenance cycles.",
      "Product-level pen-testing is not required by ISO 27001. The standard requires technical vulnerability management as a control (Annex A 8.8), but the implementation is up to the ISMS — annual scans, third-party pen-tests, or nothing beyond CVE monitoring can all satisfy that control.",
      "The honest answer to the customer: 'we're certified — let me share our Statement of Applicability and what controls apply to your data path.'",
    ],
  },
  confidenceCheck: true,
  tags: ["iso-27001", "isms", "compliance", "phase-8"],
};

// ─── Phase 8 · IEC 62443 OT security ──────────────────────────────────────
// Anchored to IEC 62443. The most expensive misconception in industrial
// control system security — lifting IT controls onto OT without
// understanding the priority inversion (availability + safety before
// confidentiality).

export const IEC_62443_PRIORITY: MCQQuestion = {
  kind: "mcq",
  id: "phase-8-iec62443-priority-01",
  difficulty: "stretch",
  prompt:
    "Your team applies the same security controls and audit process to factory PLCs and HVAC controllers that they use for enterprise IT systems. Per IEC 62443, what's the structural problem?",
  correct: {
    text: "IT and OT have a different priority order. In OT, availability and safety come before confidentiality — patching a PLC mid-shift to close a CVE can be more dangerous than the CVE. Controls must be designed around uptime, deterministic timing, decade-long asset lifecycles, and process-safety constraints. Lifting NIST CSF or ISO 27001 controls directly produces an outcome that's worse than doing nothing.",
    explanation:
      "IEC 62443 exists because the standard IT-security stack assumes business-system characteristics (frequent patching tolerance, encrypted everything, short asset lifecycles). OT systems break under those assumptions.",
  },
  distractors: [
    {
      text: "There's no structural problem — IT security controls translate directly to OT",
      misconception: "iec62443-as-it-security",
    },
    {
      text: "IEC 62443 requires the same controls as ISO 27001; the gap is that PLCs lack modern crypto",
      misconception: "iec62443-as-it-security",
    },
    {
      text: "The mistake is just network — zones and conduits are VLANs, and the IT controls themselves are fine",
      misconception: "zones-conduits-overlay",
    },
  ],
  workedSolution: {
    steps: [
      "IT security frameworks (NIST CSF, ISO 27001, CIS Controls) implicitly prioritize CONFIDENTIALITY > INTEGRITY > AVAILABILITY. Sensitive data leaking is the worst case; an outage is recoverable.",
      "OT security inverts this: AVAILABILITY > SAFETY > INTEGRITY > CONFIDENTIALITY. An outage on a refinery, a hospital HVAC, a power-grid SCADA system can cause injury, death, or cascading failure. Disclosure of process data is usually the least-bad outcome.",
      "IEC 62443 is built around that inversion. The zones-and-conduits model is a TRUST boundary model — zones group assets with shared security requirements, conduits are the controlled paths between them. The model drives WHERE controls live.",
      "Security Levels (SL1 = protection against casual / coincidental violation, through SL4 = protection against deliberate violation with extended resources, sophisticated methods, IACS-specific motivation) are graded per zone and per conduit.",
      "Practical consequences: patches go through change-control windows aligned with maintenance shutdowns, not on the IT calendar. Encryption may be unsafe if it adds latency that breaks deterministic control loops. Authentication adds boot-time delay that can be safety-critical.",
      "Lifting IT controls onto OT directly produces outcomes like 'patched PLC firmware caused a six-hour process outage' or 'security tool encrypted memory and broke the safety controller's deterministic loop.' Both are real published incidents.",
    ],
  },
  confidenceCheck: true,
  tags: ["iec-62443", "ot-security", "ics", "industrial", "phase-8"],
};

// ─── Phase 9 · NIST CSF 2.0 Govern function ───────────────────────────────
// Anchored to NIST CSF 2.0 (released Feb 26, 2024). Catches engineers
// referencing the pre-2024 five-function model — the most common version-
// drift error in security-governance discussions.

export const CSF_GOVERN_FUNCTION: MCQQuestion = {
  kind: "mcq",
  id: "phase-9-csf-govern-01",
  difficulty: "core",
  prompt:
    "Your team built a security program around NIST CSF using the five functions: Identify, Protect, Detect, Respond, Recover. Per CSF 2.0 (Feb 2024), what is the structural gap?",
  correct: {
    text: "CSF 2.0 added Govern as a sixth function — explicitly because earlier versions assumed governance happened upstream and most organizations never connected the dots. Govern covers risk-management strategy, roles and responsibilities, policy, oversight, and supply-chain risk. A program built on the five-function model has no defined authority to make security trade-offs.",
    explanation:
      "NIST released CSF 2.0 in February 2024 with Govern as a new top-level function. The five-function model (CSF 1.0 from 2014, CSF 1.1 from 2018) is now superseded.",
  },
  distractors: [
    {
      text: "No gap — CSF 2.0 kept the five-function model and just added subcategories",
      misconception: "csf-govern-missing",
    },
    {
      text: "CSF 2.0 split Protect into Protect and Prevent — six functions but a different split",
      misconception: "csf-govern-missing",
    },
    {
      text: "The gap is that CSF is now a control checklist; you need to map each subcategory to specific NIST 800-53 controls to claim conformance",
      misconception: "csf-as-checklist",
    },
  ],
  workedSolution: {
    steps: [
      "NIST CSF 1.0 (2014) and 1.1 (2018) defined five functions: Identify, Protect, Detect, Respond, Recover.",
      "CSF 2.0 (Feb 2024) added Govern as a sixth function — placed BEFORE Identify in the function ordering because governance shapes everything that follows.",
      "Govern subcategories cover: organizational context, risk-management strategy, roles/responsibilities/authority, policy, oversight, cybersecurity supply-chain risk management.",
      "Empirical reason for the addition: in feedback gathered by NIST during the 2.0 revision, most organizations had implemented Detect / Respond capabilities well but had no clear governance hooking those capabilities into risk-based decisions. Programs could see attacks but had no authority to make trade-offs.",
      "CSF is also explicitly outcome-based, not a control checklist. The artifact is a Profile — Current state vs Target state per subcategory — that drives an improvement plan. Mapping subcategories to 800-53 (or any other catalog) is one way to inform Profile construction, but the conformance claim is about the Profile and the closure plan, not the catalog mapping.",
      "A security program anchored to the five-function model is not 'wrong' but is referencing a superseded version. Updated programs add Govern as the first function and rework the Profile to include governance subcategories.",
    ],
  },
  confidenceCheck: true,
  tags: ["nist-csf", "governance", "security", "phase-9"],
};

// ─── Phase 9 · GDPR baseline obligations ──────────────────────────────────
// Anchored to GDPR + CCPA/CPRA. Catches the most expensive privacy-compliance
// misconception: treating a cookie banner as a complete privacy program.

export const GDPR_BASELINE: MCQQuestion = {
  kind: "mcq",
  id: "phase-9-gdpr-baseline-01",
  difficulty: "core",
  prompt:
    "Your app collects user emails for account registration and displays a cookie consent banner with a 'Reject All' button. A customer asks whether the app meets the GDPR baseline. What's the accurate answer?",
  correct: {
    text: "A cookie banner is one obligation among many. The GDPR baseline also requires: a lawful basis recorded for the email collection (consent is one of six bases, not the only one), a purpose-limitation statement, a published privacy notice, a Record of Processing Activities where applicable, a DPIA for high-risk processing, breach notification within 72 hours, and mechanisms for data-subject rights (access, erasure, portability, rectification) within 30 days.",
    explanation:
      "GDPR is structurally a comprehensive data-protection framework. The cookie banner addresses one obligation (ePrivacy / consent for non-essential cookies). It does not address lawful basis, RoPA, DPIA, breach notification, or DSR fulfillment.",
  },
  distractors: [
    {
      text: "The cookie banner with a 'Reject All' button is sufficient — that's the core GDPR obligation",
      misconception: "gdpr-as-consent-popup",
    },
    {
      text: "A cookie banner plus a privacy policy URL completes the GDPR baseline",
      misconception: "gdpr-as-consent-popup",
    },
    {
      text: "If users in California are blocked from the app, the app is CCPA-only and the GDPR cookie banner becomes optional",
      misconception: "ccpa-as-gdpr-clone",
    },
  ],
  workedSolution: {
    steps: [
      "GDPR Article 6 lists six lawful bases for processing personal data: consent, contract, legal obligation, vital interests, public task, legitimate interests. Account registration is typically contract — the email is needed to perform the contract with the user — not consent. Picking the wrong lawful basis is a documented finding in audits.",
      "Article 5 imposes data-minimization and purpose-limitation. Collecting the email for account registration cannot be used for unrelated marketing without a new lawful basis.",
      "Article 12-22 grants data-subject rights. The controller must provide a mechanism — typically a request endpoint, a published email address, or an in-app flow — to fulfill access, rectification, erasure, restriction, portability, and objection requests within 30 days (extendable by 60 days for complex requests).",
      "Article 30 requires a Record of Processing Activities for controllers above small-business thresholds. This is an internal document, not published, but auditable.",
      "Article 35 requires a Data Protection Impact Assessment for processing 'likely to result in a high risk' to data subjects — large-scale, sensitive categories, automated decision-making with legal effect.",
      "Article 33 requires breach notification to the supervisory authority within 72 hours of becoming aware of a personal data breach.",
      "The cookie banner addresses ePrivacy Directive consent requirements for non-essential cookies — a separate regime that the banner discharges one obligation under.",
      "Blocking California users does not opt the app out of GDPR; GDPR applies to processing the personal data of anyone in the EU regardless of where the controller is located. Different scope from CCPA, which is California-residency-based.",
    ],
  },
  confidenceCheck: true,
  tags: ["gdpr", "ccpa", "privacy", "compliance", "phase-9"],
};

export const ALL_EXAMPLES = [
  ARRAY_INDEXING,
  STRING_LENGTH_EMOJI,
  N_PLUS_ONE_LOOP,
  IEEE_754_DECIMAL,
  POSIX_SIGNAL_SAFETY,
  RFC_2119_SHOULD,
  TC39_STAGE_READINESS,
  WCAG_AUTO_TOOLS,
  OWASP_2025_NEW_CATEGORY,
  OWASP_VERIFICATION_REQUEST,
  ISO_27001_SCOPE,
  IEC_62443_PRIORITY,
  CSF_GOVERN_FUNCTION,
  GDPR_BASELINE,
] as const;
