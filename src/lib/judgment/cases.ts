import type { JudgmentCase, JudgmentRubric, JudgmentSource } from "./types";

/** Sources define reasoning criteria; none accredits Dura or certifies a learner. */
export const JUDGMENT_SOURCES: readonly JudgmentSource[] = [
  {
    id: "swebok",
    title: "IEEE Computer Society SWEBOK Guide v4",
    url: "https://www.computer.org/education/bodies-of-knowledge/software-engineering",
    scope:
      "Architecture, design, testing, security and engineering economics provide a vocabulary for comparing alternatives and recording evidence. A body of knowledge is not a product certification.",
  },
  {
    id: "abet",
    title: "ABET Engineering Criteria 2026–2027, outcomes 2, 4 and 6",
    url: "https://www.abet.org/accreditation/accreditation-criteria/criteria-for-accrediting-engineering-programs-2026-2027/",
    scope:
      "Design under constraints, professional responsibility and conclusions drawn from experiments inform this rubric. Dura is not an ABET-accredited program.",
  },
  {
    id: "wcag",
    title: "W3C WCAG 2.2",
    url: "https://www.w3.org/TR/WCAG22/",
    scope:
      "Reflow, keyboard operation, focus visibility and status messages supply concrete accessibility acceptance criteria. Passing one case does not establish whole-product conformance.",
  },
  {
    id: "nist-ai",
    title: "NIST AI Risk Management Framework 1.0",
    url: "https://www.nist.gov/itl/ai-risk-management-framework",
    scope:
      "Govern, Map, Measure and Manage organize contextual AI risk work. The framework does not certify a model or prescribe one universal acceptable error rate.",
  },
  {
    id: "acm",
    title: "ACM Code of Ethics and Professional Conduct",
    url: "https://www.acm.org/code-of-ethics",
    scope:
      "Public benefit, avoiding harm, privacy and honest evaluation guide escalation and communication. Applying principles requires context and evidence.",
  },
  {
    id: "ies",
    title: "IES / What Works Clearinghouse: Organizing Instruction and Study",
    url: "https://ies.ed.gov/ncee/wwc/practiceguide/1",
    scope:
      "The 2007 guide rates deep explanatory questions and quizzing to revisit key content as strong evidence, and spacing and worked-example/problem alternation as moderate evidence. This supports the teaching design; Dura-specific effectiveness has not yet been established.",
  },
];

export const JUDGMENT_RUBRICS: readonly JudgmentRubric[] = [
  {
    id: "framing",
    title: "Frame the decision",
    anchors: [
      "No clear decision or affected people.",
      "Names a goal but omits a binding constraint.",
      "States the decision, affected people and measurable constraints.",
      "Also distinguishes requirements from preferences and identifies conflicting stakeholder needs.",
    ],
  },
  {
    id: "evidence",
    title: "Weigh the evidence",
    anchors: [
      "Unsupported assertions.",
      "Lists observations without limits or assumptions.",
      "Connects observations to the decision and marks important uncertainty.",
      "Also checks source quality, counterevidence and what additional information could change the decision.",
    ],
  },
  {
    id: "tradeoffs",
    title: "Compare alternatives",
    anchors: [
      "Only a preferred answer.",
      "Names another option without a meaningful comparison.",
      "Compares at least two viable options against the same constraints.",
      "Also explains lifecycle cost, reversibility and why rejected options could fit a different context.",
    ],
  },
  {
    id: "standards",
    title: "Apply standards with scope",
    anchors: [
      "No relevant source.",
      "Names a standard as authority without applying it.",
      "Explains a relevant principle and the evidence needed to use it here.",
      "Also states scope/version limits and avoids treating a reference as proof of compliance.",
    ],
  },
  {
    id: "validation",
    title: "Make the decision testable",
    anchors: [
      "No check or stopping condition.",
      "Suggests testing without observable acceptance criteria.",
      "Defines a measurable check, failure threshold and response.",
      "Also includes rollback, representative failure cases, ownership and evidence retention.",
    ],
  },
  {
    id: "revision",
    title: "Revise with new evidence",
    anchors: [
      "Ignores the new evidence.",
      "Changes the answer without explaining why.",
      "Explains why new evidence changes or preserves the decision and confidence.",
      "Also identifies the failed assumption, a transferable lesson and what would trigger another revision.",
    ],
  },
];

export const JUDGMENT_CASES: readonly JudgmentCase[] = [
  {
    id: "offline-sync",
    version: 1,
    title: "Keep a learner's work when devices disagree",
    domain: "Systems and data",
    difficulty: "guided",
    estimatedMinutes: 20,
    prerequisites: [
      { title: "Programming foundations", href: "/paths/1" },
      { title: "Architecture decisions", href: "/howto/adr" },
    ],
    brief:
      "A learner completes a lesson on a train. Their other device still has an older record. On reconnect, the cloud copy replaces the completed local copy. You have two days to stop data loss without blocking offline study. A last-write-wins policy means whichever timestamp is larger replaces the other record.",
    constraints: [
      "Offline completion must remain available.",
      "The same person's records may sync; different people's records must never merge.",
      "The repair must handle an older app version reconnecting.",
    ],
    evidence: [
      {
        id: "log",
        label: "Reproduction",
        kind: "observation",
        detail: "A late network acknowledgement overwrites a newer local completion.",
      },
      {
        id: "clock",
        label: "Device clocks",
        kind: "assumption",
        detail:
          "The current design assumes all client clocks are accurate; no clock-drift test exists.",
      },
      {
        id: "undo",
        label: "Delete behavior",
        kind: "constraint",
        detail:
          "A learner can intentionally delete a saved exercise. Completion and deletion therefore cannot share one unconditional merge rule.",
      },
    ],
    options: [
      {
        id: "cloud-wins",
        label: "Always prefer the cloud record",
        feedback:
          "Simple ordering sacrifices valid offline work. Explain how you would preserve it before choosing this policy.",
      },
      {
        id: "timestamp",
        label: "Prefer the newest client timestamp",
        feedback:
          "This can work within a declared clock contract, but clock drift and late acknowledgements remain unresolved here.",
      },
      {
        id: "per-record",
        label: "Use record-specific merge rules and explicit deletion history",
        feedback:
          "This supports monotonic completion and deliberate deletion, but requires versioning, ownership checks and older-client behavior.",
      },
    ],
    standards: [
      {
        sourceId: "swebok",
        application:
          "State consistency requirements, compare merge designs and test failure/recovery behavior.",
      },
      {
        sourceId: "acm",
        application: "Preserve user work and report loss or uncertain recovery honestly.",
      },
    ],
    newEvidence:
      "A deleted sandbox reappears after a month-old device reconnects. Its timestamp is in the future because that device's clock was wrong. The cloud still accepts direct writes from the old client.",
    revisionPrompt:
      "How must the storage boundary, deletion retention and rollout change? Explain what can remain available if the new sync service is unavailable.",
    workedExample: {
      initial:
        "Choose per-record merges. Preserve completion flags monotonically, use a captured revision when acknowledging an upload, and require owner identity before reading local or cloud records. Acknowledge that intentional resets need a different operation.",
      revised:
        "Add durable deletion markers and reject stale direct writes at the server boundary. Keep local editing available while sync reports an outage. Define recovery for devices older than deletion retention, rather than promising indefinite safe merge.",
      why: "The conclusion follows the stated data contract. The extra mechanism is justified by a reproduced resurrection case, not by a general preference for complicated sync.",
    },
    transferPrompt:
      "How would your policy differ for a shared shopping list where checking an item must be reversible?",
    teacherNotes:
      "Accept alternative versioned conflict-resolution designs if they preserve ownership, completion and explicit deletion. Reject clock ordering alone as a complete argument. Ask the learner to trace a late acknowledgement and an old-client write.",
  },
  {
    id: "release-or-delay",
    version: 1,
    title: "Release a fix while the migration is unfinished",
    domain: "Delivery and leadership",
    difficulty: "independent",
    estimatedMinutes: 20,
    prerequisites: [{ title: "CI/CD", href: "/howto/ci-cd" }],
    brief:
      "A release fixes a login bug but also requires a new database function. The browser checks pass, the database job failed, and the preview still starts. A customer demonstration is in an hour. You own the release decision.",
    constraints: [
      "Existing learners must retain access to local work.",
      "No production database changes have been approved for this release.",
      "A rollback must preserve records written during the deployment.",
    ],
    evidence: [
      {
        id: "ci",
        label: "CI result",
        kind: "observation",
        detail:
          "The exact candidate commit's database job failed before its migration test executed.",
      },
      {
        id: "preview",
        label: "Preview result",
        kind: "observation",
        detail:
          "The landing page returns 200; the new account flow has not been exercised against the deployed schema.",
      },
      {
        id: "pressure",
        label: "Deadline",
        kind: "constraint",
        detail: "The demo deadline is real, but it is not evidence that the migration is safe.",
      },
    ],
    options: [
      {
        id: "ship",
        label: "Ship the combined release immediately",
        feedback:
          "Explain how schema compatibility and recovery are established. A working landing page is insufficient evidence.",
      },
      {
        id: "split",
        label: "Separate the compatible login fix and hold the schema-dependent feature",
        feedback:
          "A smaller release can satisfy the deadline if dependencies are truly separated and the new commit is tested.",
      },
      {
        id: "delay",
        label: "Delay the release and demonstrate the existing version",
        feedback:
          "This can be defensible when safe separation cannot be established; communicate the consequence and next evidence checkpoint.",
      },
    ],
    standards: [
      {
        sourceId: "swebok",
        application:
          "Use configuration management, testing and economic tradeoffs to define a reproducible release decision.",
      },
      {
        sourceId: "abet",
        application:
          "Consider stakeholders and uncertainty when making and communicating an engineering decision.",
      },
    ],
    newEvidence:
      "The compatible fix can be isolated, but rebasing changes its commit SHA. The deployment provider automatically deploys main even if CI is still pending.",
    revisionPrompt:
      "Define the exact source identity, checks and deployment condition you now require. What must be re-tested after separating the change?",
    workedExample: {
      initial:
        "Hold the migration-dependent feature. Isolate the login repair only if its behavior does not call the missing function; otherwise use the current release for the demo.",
      revised:
        "Run all required checks on the new SHA and make production deployment wait for that same SHA's trusted release job. Keep a known compatible rollback and disclose the deferred feature.",
      why: "The branch name and a previous green run do not establish that the actual deployed bytes passed the required checks.",
    },
    transferPrompt:
      "A rollback restores code but not schema. What compatibility window would an additive migration need?",
    teacherNotes:
      "Credit a justified delay or a verified split. Do not reward shipping merely because it is faster. Require an explicit migration/rollback data-compatibility argument.",
  },
  {
    id: "accessible-popover",
    version: 1,
    title: "Keep explanations reachable at narrow widths",
    domain: "Frontend and accessibility",
    difficulty: "independent",
    estimatedMinutes: 18,
    prerequisites: [
      { title: "Responsive CSS", href: "/howto/css-responsive" },
      { title: "Accessibility", href: "/howto/accessibility" },
    ],
    brief:
      "A standards explanation opens to the right of its badge and is clipped on a phone. Hiding horizontal overflow removes the scrollbar but still hides the explanation. The text contains links a learner needs to activate.",
    constraints: [
      "All explanation text and actions must remain reachable at 320 CSS pixels.",
      "Keyboard users must open, navigate and dismiss the explanation.",
      "Short landscape viewports must allow internal scrolling when content cannot fit vertically.",
    ],
    evidence: [
      {
        id: "clip",
        label: "Observed clipping",
        kind: "observation",
        detail: "The trigger fits; the fixed-width popup extends beyond the viewport.",
      },
      {
        id: "zoom",
        label: "Zoom gap",
        kind: "assumption",
        detail:
          "The team assumes desktop screenshots cover zoom, but only one window size was tested.",
      },
      {
        id: "links",
        label: "Interactive content",
        kind: "constraint",
        detail:
          "The explanation has two links, so it needs usable focus behavior rather than a hover-only hint.",
      },
    ],
    options: [
      {
        id: "hide",
        label: "Hide overflow on the page",
        feedback: "This can conceal the symptom while leaving text and controls inaccessible.",
      },
      {
        id: "resize",
        label: "Use collision-aware positioning with bounded size and focus management",
        feedback:
          "This addresses placement and interaction; still test scroll, resizing and content length.",
      },
      {
        id: "inline",
        label: "Expand the explanation inline below the badges",
        feedback:
          "Inline disclosure can also satisfy the constraints if the layout and focus/order remain understandable.",
      },
    ],
    standards: [
      {
        sourceId: "wcag",
        application:
          "Use reflow, keyboard, visible focus and name/role/value semantics as observable acceptance criteria. Expanded-state announcement is not automatically a status-message requirement.",
      },
      {
        sourceId: "swebok",
        application:
          "Compare interaction designs against the same constraints instead of choosing a visual patch.",
      },
    ],
    newEvidence:
      "At 200% browser zoom, the popup is taller than the visible area. A screen reader announces the trigger but not whether its content has opened.",
    revisionPrompt:
      "Define the size, scrolling, open-state semantics, focus return and test matrix. Which tests require human assistive-technology review?",
    workedExample: {
      initial:
        "Use a maintained accessible popover with collision detection, viewport width bounds and a semantic expanded state, or choose an inline disclosure if the interaction is simpler.",
      revised:
        "Cap height to the available viewport and allow internal vertical scrolling. Verify keyboard dismissal/focus return, announced state, zoom and long translations. Record the remaining manual screen-reader checks.",
      why: "Geometry tests establish bounds; they do not establish that the explanation is understandable or correctly announced by every assistive technology.",
    },
    transferPrompt:
      "Which content legitimately needs two-dimensional scrolling, and how would you preserve access without hiding it?",
    teacherNotes:
      "Both popover and inline solutions may be strong. Require actual reachable controls, not a no-scrollbar screenshot. Avoid claiming full WCAG conformance from this case.",
  },
  {
    id: "ai-help-or-harm",
    version: 1,
    title: "Decide whether an AI tutor is ready",
    domain: "AI and evaluation",
    difficulty: "independent",
    estimatedMinutes: 22,
    prerequisites: [{ title: "AI evaluation", href: "/howto/ai-evaluation" }],
    brief:
      "An AI tutor answers 92 of 100 sampled programming questions correctly. It sometimes presents unsafe code confidently. The sample was written by the same person who tuned the prompt. You must choose a launch scope and evaluation plan.",
    constraints: [
      "Learners can decline the external AI service.",
      "The tutor must not claim that it graded work it did not run.",
      "A single aggregate score must not hide serious failures.",
    ],
    evidence: [
      {
        id: "score",
        label: "Sample result",
        kind: "observation",
        detail:
          "92/100 correct on a convenience sample; no held-out set or failure severity labels.",
      },
      {
        id: "privacy",
        label: "Data flow",
        kind: "constraint",
        detail:
          "Prompt text may include learner code; only relevant text should be sent with consent.",
      },
      {
        id: "transfer",
        label: "Generalization",
        kind: "assumption",
        detail:
          "The team assumes similar performance for novice mistakes, long conversations and languages absent from the sample.",
      },
    ],
    options: [
      {
        id: "full",
        label: "Launch for every lesson based on the 92% result",
        feedback: "The sample design and failure severity do not justify that scope.",
      },
      {
        id: "bounded",
        label: "Run a bounded opt-in pilot with explicit limits and a held-out evaluation",
        feedback:
          "This can gather relevant evidence if fallback, consent and failure response are specified.",
      },
      {
        id: "hold",
        label: "Hold AI delivery while improving deterministic help",
        feedback:
          "This can be appropriate if material failure modes cannot yet be contained; define the evidence needed to reconsider.",
      },
    ],
    standards: [
      {
        sourceId: "nist-ai",
        application:
          "Map intended use and affected learners, measure representative risks, and define management and review responsibilities.",
      },
      { sourceId: "acm", application: "Protect privacy and communicate known limits honestly." },
    ],
    newEvidence:
      "On a held-out set, novice debugging prompts perform worse than expert prompts. A provider outage also truncates answers mid-sentence, but the UI marks them complete.",
    revisionPrompt:
      "How do evaluation strata, stream completion, fallback and rollout scope change? What would cause you to disable the pilot?",
    workedExample: {
      initial:
        "Choose a bounded opt-in pilot only after a held-out set covers novice misconceptions, privacy cases and unsafe suggestions. Treat severity separately from average correctness.",
      revised:
        "Exclude unsupported uses, detect missing stream completion, expose retry/fallback, and compare novice and expert outcomes independently. Define severity-based stop conditions and a review owner before expanding.",
      why: "A benchmark average is evidence about its sampled tasks, not a universal readiness certificate.",
    },
    transferPrompt:
      "Would an AI that only retrieves approved lesson passages require the same evaluation as one that generates executable code?",
    teacherNotes:
      "Do not impose a universal acceptable error percentage. Credit justified scopes, failure severity and realistic alternatives; require consent and a non-AI route.",
  },
  {
    id: "sensor-silence",
    version: 1,
    title: "A sensor value is plausible but stale",
    domain: "Embedded and manufacturing",
    difficulty: "transfer",
    estimatedMinutes: 22,
    prerequisites: [
      { title: "Embedded drivers", href: "/paths/10/10-5" },
      { title: "OPC UA and MTConnect", href: "/paths/14/14-11" },
    ],
    brief:
      "A synthetic CNC dashboard shows 1200 rpm for ten minutes after its telemetry cable is disconnected. The number remains within the normal range. A team proposes using it in a production-count calculation. This exercise is about telemetry evidence, not machine control.",
    constraints: [
      "Unavailable observations cannot be counted as new production measurements.",
      "A source restart must not merge old and new sequence identities.",
      "The laboratory has no authorization to control equipment or certify a safety function.",
    ],
    evidence: [
      {
        id: "stale",
        label: "Timestamp",
        kind: "observation",
        detail: "The source timestamp has not advanced for ten minutes.",
      },
      {
        id: "value",
        label: "Plausibility",
        kind: "observation",
        detail: "1200rpm is plausible, but plausibility does not establish freshness.",
      },
      {
        id: "buffer",
        label: "Transport",
        kind: "assumption",
        detail: "The current design assumes reconnect means all missed events have been replayed.",
      },
    ],
    options: [
      {
        id: "keep",
        label: "Keep the last value as a good observation",
        feedback:
          "A last-known value may be displayed with its age, but it cannot silently become a fresh measurement.",
      },
      {
        id: "quality",
        label: "Preserve last-known context while marking new data unavailable",
        feedback:
          "Explicit quality and identity support honest display and idempotent ingestion; define the recovery policy.",
      },
      {
        id: "zero",
        label: "Replace the missing observation with zero",
        feedback:
          "Zero is a measured value, not a substitute for unknown. It would create misleading production records.",
      },
    ],
    standards: [
      {
        sourceId: "swebok",
        application: "Define data validity, failure handling and testable recovery requirements.",
      },
      {
        sourceId: "abet",
        application:
          "Draw conclusions from the measurement's actual limits and communicate uncertainty.",
      },
    ],
    newEvidence:
      "The source reconnects with a new instance identifier and sequence 1. The MES deduplicates only by sequence, so it discards new observations that share old sequence numbers.",
    revisionPrompt:
      "Specify an observation identity, freshness rule and recovery test. Explain when a current snapshot cannot reconstruct missing event history.",
    workedExample: {
      initial:
        "Mark the observation unavailable for production counting while showing last-known value and age separately. Validate freshness and quality before ingestion.",
      revised:
        "Use source identity plus instance and sequence for idempotency. Handle a new instance explicitly; for event history detect missing intervals and replay or record the gap. A current snapshot cannot recover every past event.",
      why: "Value, time, quality and identity all belong to the evidence. A plausible number alone is not enough.",
    },
    transferPrompt:
      "Apply the same reasoning to an offline health-status dashboard without making medical or safety decisions from the exercise.",
    teacherNotes:
      "Require distinction between zero, unknown and last-known. Give credit for a declared bounded data contract. Do not treat a telemetry simulation as safety approval.",
  },
  {
    id: "fast-book-wrong-book",
    version: 1,
    title: "Choose correctness evidence before a latency claim",
    domain: "Quant and performance",
    difficulty: "transfer",
    estimatedMinutes: 20,
    prerequisites: [{ title: "Order-book capstone", href: "/paths/12/12-8/08" }],
    brief:
      "A synthetic order-book implementation reports lower median latency after an optimization. Its benchmark only adds orders. During a cancellation replay, the best bid sometimes changes when a non-best price level is removed. You must decide whether to publish the performance improvement.",
    constraints: [
      "Quantities must agree with live order identities after every event.",
      "A detected input gap makes the book untrusted until recovery.",
      "Performance claims must describe the actual measured boundary and workload.",
    ],
    evidence: [
      {
        id: "median",
        label: "Benchmark",
        kind: "observation",
        detail:
          "Median parse+apply time improved on add-only input; tail measurements and reduction events are absent.",
      },
      {
        id: "bug",
        label: "Counterexample",
        kind: "observation",
        detail:
          "Removing a non-best level changes top-of-book despite the best level still containing orders.",
      },
      {
        id: "clock",
        label: "Timing",
        kind: "assumption",
        detail:
          "The report treats local processing time as end-to-end latency without measuring transport.",
      },
    ],
    options: [
      {
        id: "publish",
        label: "Publish the median improvement now",
        feedback:
          "A demonstrated incorrect state transition invalidates the proposed useful-work comparison.",
      },
      {
        id: "repair",
        label: "Repair correctness and compare both versions on the same replay",
        feedback:
          "A reference oracle and mixed workload can establish a meaningful comparison before optimization claims.",
      },
      {
        id: "revert",
        label: "Revert and retain the counterexample as a regression",
        feedback:
          "A safe baseline may be the best current choice; retain evidence and define when optimization can be reconsidered.",
      },
    ],
    standards: [
      {
        sourceId: "swebok",
        application:
          "Specify invariants and verification evidence before comparing implementation performance.",
      },
      { sourceId: "abet", application: "Use appropriate experiments and interpret their limits." },
    ],
    newEvidence:
      "The optimized version matches the reference on the fixed trace, but a malformed message causes a partial update before parsing fails. The process continues publishing best bid/ask.",
    revisionPrompt:
      "What transaction boundary and recovery state are needed? Expand the test plan without claiming that one fixed trace proves all inputs.",
    workedExample: {
      initial:
        "Hold the performance claim. Preserve the cancellation counterexample and compare identity, quantities and best levels against a simple reference after every mixed event.",
      revised:
        "Validate message shape before mutation; invalidate publication on gaps or malformed state-changing input until a known recovery point. Add truncation, unsupported-type, duplicate-ID and over-reduction tests, then repeat measured comparisons.",
      why: "An optimization must preserve the contract; performance evidence has meaning only for correct work within a stated workload and measurement boundary.",
    },
    transferPrompt:
      "How would this reasoning apply to a compiler optimization that passes examples but fails on one valid program?",
    teacherNotes:
      "Credit a verified repair or revert. Require invariant-level comparisons and failure state, not only final checksum or happy-path speed.",
  },
  {
    id: "robotics-escalation",
    version: 1,
    title: "A simulation passes, but the robot cell has changed",
    domain: "Robotics and professional responsibility",
    difficulty: "transfer",
    estimatedMinutes: 25,
    prerequisites: [
      {
        title: "Risk assessment process",
        href: "/paths/13/13-2/01",
      },
      {
        title: "Functional safety evidence",
        href: "/paths/13/13-3/01",
      },
    ],
    brief:
      "A simulated robot transfer completes without collision. Before a demonstration, the real cell receives a heavier tool and a new fixture. A manager asks a software engineer to approve shared-space operation based on the simulation log. You can decide what evidence to retain and who must review the change; this exercise gives no authority to operate equipment.",
    constraints: [
      "No physical motion or safety approval is authorized by this exercise.",
      "The changed tool and fixture must be represented in the applicable assessment and validation scope.",
      "A missed demonstration has a cost, but a deadline is not evidence of acceptable risk.",
    ],
    evidence: [
      {
        id: "sim",
        label: "Simulator run",
        kind: "observation",
        detail:
          "The old model completed three trajectories. No physical stopping, contact or safeguarding measurements were collected.",
      },
      {
        id: "payload",
        label: "Configuration change",
        kind: "observation",
        detail:
          "The proposed tool has greater mass and a different center of gravity; the fixture position also changed.",
      },
      {
        id: "scope",
        label: "Approval scope",
        kind: "assumption",
        detail:
          "The request assumes software test success establishes the safety of the changed integrated application.",
      },
    ],
    options: [
      {
        id: "approve",
        label: "Approve operation using the passing simulation",
        feedback:
          "The evidence covers an old model and cannot establish the changed physical application is safe.",
      },
      {
        id: "escalate",
        label:
          "Hold the changed operation and escalate the configuration to the responsible safety reviewer",
        feedback:
          "Specify the changed assumptions, retained evidence, decision authority and conditions needed for a later review.",
      },
      {
        id: "demo",
        label: "Demonstrate only the recorded simulation while physical review proceeds",
        feedback:
          "A clearly labeled simulation may meet a communication goal without implying approval of the changed cell.",
      },
    ],
    standards: [
      {
        sourceId: "acm",
        application:
          "Avoid misleading assurances, identify limits of competence and escalate potentially harmful changes.",
      },
      {
        sourceId: "abet",
        application:
          "Consider safety and affected people when designing under constraints; interpret experimental evidence within its scope.",
      },
    ],
    newEvidence:
      "The payload was entered in the controller, but nobody documented whether the fixture change creates a trapping point. The previous sign-off refers to the old tool revision.",
    revisionPrompt:
      "Explain why updating a parameter does not close the whole change assessment. Identify the evidence package and responsible decision owner, and distinguish what a software engineer can verify from what remains unresolved.",
    workedExample: {
      initial:
        "Preserve the simulation and its model revision, hold the changed physical operation, and ask the responsible safety reviewer to assess the tool, fixture and operating mode. Offer a recorded simulation labeled with its limits.",
      revised:
        "Add the possible trapping point, old approval scope and new tool identity to the change record. Request application-specific risk assessment and validation under the applicable standards and procedures. Do not invent a safe speed or force threshold, or treat a controller parameter update as approval.",
      why: "The new facts invalidate the assumption that the old configuration and approval cover the proposal. The response preserves useful evidence while keeping technical checks separate from authorization.",
    },
    transferPrompt:
      "An embedded firmware update passes unit tests but changes an actuator timeout. Which parts of this escalation argument transfer, and which require new domain evidence?",
    teacherNotes:
      "Credit a justified hold and scoped simulation demonstration. Require a named responsibility role, configuration identity, missing physical evidence and change review. Do not ask learners to operate equipment, prescribe universal thresholds, or award safety certification.",
  },
  {
    id: "maintenance-cost",
    version: 1,
    title: "A cheap service becomes expensive to keep",
    domain: "Engineering leadership and economics",
    difficulty: "independent",
    estimatedMinutes: 25,
    prerequisites: [
      {
        title: "Technology budgeting",
        href: "/paths/9/9-5/02",
      },
      {
        title: "Longer-term strategy",
        href: "/paths/9/9-8/02",
      },
    ],
    brief:
      "A team must retain a self-hosted reporting service or migrate to a managed service. For a one-year planning exercise, current infrastructure costs $600 per month and maintenance consumes 20 engineer-hours per month. The managed service quote is $1800 per month, with an estimated 80 engineer-hours for migration. Use a loaded planning rate of $100 per engineer-hour. These are scenario inputs, not market prices.",
    constraints: [
      "Customer reports must remain available during the transition.",
      "Exports must preserve customer data in a usable format.",
      "Compare a common one-year horizon and separate cash spend from staff capacity; unspent hours do not automatically become cash savings.",
    ],
    evidence: [
      {
        id: "current",
        label: "Observed maintenance",
        kind: "observation",
        detail:
          "The last three months each recorded 20 hours of patches, incidents and report repair; future workload may differ.",
      },
      {
        id: "quote",
        label: "Vendor quote",
        kind: "constraint",
        detail:
          "The quoted subscription is $1800 per month for the current data volume; migration effort is not included.",
      },
      {
        id: "migration",
        label: "Migration estimate",
        kind: "assumption",
        detail:
          "The team estimates 80 hours but has not tested exports or included managed-service maintenance.",
      },
    ],
    options: [
      {
        id: "stay",
        label: "Retain the current service and fund maintenance",
        feedback:
          "This may preserve reversibility and avoid migration risk; include ongoing staff capacity and operational weaknesses.",
      },
      {
        id: "migrate",
        label: "Migrate immediately because the vendor removes operations",
        feedback:
          "The premise is unverified: integration, vendor incidents, access reviews and export testing still need ownership.",
      },
      {
        id: "pilot",
        label: "Run a bounded migration/export pilot before the investment decision",
        feedback:
          "Define the decision-changing uncertainty, capped effort, comparison horizon and exit criterion so the pilot is not an indefinite delay.",
      },
    ],
    standards: [
      {
        sourceId: "swebok",
        application:
          "Use engineering economics and maintenance considerations to compare lifecycle alternatives and explicit assumptions.",
      },
      {
        sourceId: "abet",
        application:
          "Account for economic constraints and affected stakeholders while interpreting experiment results.",
      },
    ],
    newEvidence:
      "A pilot finds the managed service still needs 8 engineer-hours per month. Export works for tables but loses custom report definitions, requiring an additional estimated 40 hours to reconstruct them. The vendor offers no recovery guarantee for those definitions.",
    revisionPrompt:
      "Recalculate the one-year planning costs, distinguish estimates from observations, and explain how reversibility and support ownership affect the decision. What evidence could still justify the more expensive option?",
    workedExample: {
      initial:
        "Current one-year planning cost is 12 \u00d7 ($600 + 20 \u00d7 $100) = $31,200. The incomplete managed estimate is 12 \u00d7 $1800 + 80 \u00d7 $100 = $29,600. The $1600 apparent advantage omits residual maintenance and exit costs, so fund a bounded export and operations pilot before choosing.",
      revised:
        "Including 8 hours/month adds $9600, and 40 reconstruction hours add $4000: managed first-year planning cost becomes $43,200, versus $31,200 under the current workload assumption. Retaining is reasonable on these inputs, but a documented reliability benefit or growth constraint could outweigh the difference. Record ownership, workload sensitivity and an export acceptance test; do not equate released staff time to realized cash savings.",
      why: "A common horizon exposes omitted work. The choice depends on risk, capacity and reversibility as well as a total; sunk pilot effort should be separated from incremental future costs at the final decision.",
    },
    transferPrompt:
      "Apply the method to buying a hardware verification tool. Which license, training, maintenance and reproducibility costs change, and what remains the same?",
    teacherNotes:
      "Require correct arithmetic, scenario assumptions and explicit time horizon. Credit retention or a justified managed option with additional evidence. Have learners vary maintenance hours and horizon rather than treating one cost number as a universal answer.",
  },
];
