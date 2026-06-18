import type { AssessmentQuestion } from "@/types/assessment";

/**
 * Phase M question bank — 72 questions across 12 modules (6 each).
 * Covers ISO 9001, AS9100D/IATF 16949, IATF Core Tools, Lean/TPS, Six Sigma DMAIC,
 * GD&T, MBD, IPC-A-610, IPC-7711/7721, ISA-95/88, MTConnect/OPC UA/TSN,
 * and IEC 62443 / RAMI 4.0 / IIRA.
 */

function q(
  id: string,
  moduleId: string,
  type: AssessmentQuestion["type"],
  question: string,
  options: string[],
  correct: number | number[],
  explanation: string,
  difficulty: AssessmentQuestion["difficulty"],
  tags: string[]
): AssessmentQuestion {
  return {
    id,
    phaseId: "m",
    moduleId,
    type,
    question,
    options,
    correct,
    explanation,
    difficulty,
    tags,
    standards: { bloom: "understand" },
  };
}

export const PHASE_14_QUESTIONS: AssessmentQuestion[] = [
  // ── Module m-1: ISO 9001:2015 ─────────────────────────────────────────────

  q(
    "m-1-q1",
    "m-1",
    "multiple-choice",
    "Which ISO 9001:2015 clause specifically requires organizations to determine the external and internal issues relevant to their purpose and strategic direction?",
    [
      "Clause 4.1 — Understanding the Organization and Its Context",
      "Clause 4.2 — Understanding the Needs and Expectations of Interested Parties",
      "Clause 5.1 — Leadership and Commitment",
      "Clause 6.1 — Actions to Address Risks and Opportunities",
    ],
    0,
    "Clause 4.1 mandates analysis of internal issues (e.g., culture, knowledge, performance) and external issues (e.g., legal, technological, competitive, market factors). This context analysis feeds the risk-based thinking required throughout the QMS.",
    "medium",
    ["iso-9001", "clause-4", "context", "qms"]
  ),

  q(
    "m-1-q2",
    "m-1",
    "multiple-choice",
    "ISO 9001:2015 is built on seven quality management principles. Which principle is CORRECTLY matched to its primary focus?",
    [
      "Evidence-based decision making — decisions based on analysis of data and information",
      "Customer focus — exceeding customer expectations at all costs regardless of risk",
      "Leadership — ensuring every employee has equal authority in quality decisions",
      "Improvement — reactive correction of nonconformities after customer complaints",
    ],
    0,
    "The principle of evidence-based decision making holds that decisions resulting from analysis and evaluation of data are more likely to produce desired results. Customer focus means meeting requirements, not ignoring risk; Leadership means top management sets direction; Improvement covers both reactive and proactive activities.",
    "easy",
    ["iso-9001", "7-principles", "evidence-based-decision-making"]
  ),

  q(
    "m-1-q3",
    "m-1",
    "multiple-choice",
    "Under ISO 9001:2015 Clause 8.3 (Design and Development), what is the primary purpose of design and development REVIEWS?",
    [
      "To evaluate the ability of the design to meet requirements and identify problems",
      "To obtain customer sign-off before proceeding to the next design stage",
      "To satisfy the statutory requirement for third-party engineering approval",
      "To document the design history record required for PPAP submission",
    ],
    0,
    "Clause 8.3.4 states that reviews must evaluate the ability of design and development results to meet requirements and identify any problems. Reviews are internal systematic evaluations at planned stages — not mandated customer approvals or regulatory sign-offs.",
    "medium",
    ["iso-9001", "clause-8", "design-development", "reviews"]
  ),

  q(
    "m-1-q4",
    "m-1",
    "true-false",
    "ISO 9001:2015 requires organizations to maintain a documented Quality Manual as a mandatory document.",
    [
      "False — ISO 9001:2015 does NOT mandate a Quality Manual",
      "True — a Quality Manual is explicitly required by Clause 4.4",
    ],
    0,
    "ISO 9001:2015 eliminated the mandatory Quality Manual requirement that existed in the 2008 version. Organizations must maintain documented information to support process operation and retain documented information as evidence of results, but the specific form of a Quality Manual is not prescribed.",
    "easy",
    ["iso-9001", "documented-information", "quality-manual"]
  ),

  q(
    "m-1-q5",
    "m-1",
    "multiple-select",
    "ISO 9001:2015 Clause 9.1 (Monitoring, Measurement, Analysis and Evaluation) requires organizations to determine which of the following? (Select ALL that apply.)",
    [
      "What needs to be monitored and measured",
      "Methods for monitoring, measurement, analysis, and evaluation to ensure valid results",
      "When monitoring and measuring shall be performed",
      "The specific statistical tools to be used for all measurements",
    ],
    [0, 1, 2],
    "Clause 9.1.1 requires organizations to determine: what to monitor/measure, the methods to ensure valid results, when monitoring/measuring shall be performed, and when results shall be analyzed/evaluated. The standard does not prescribe specific statistical tools — those are left to the organization based on the nature of the data.",
    "hard",
    ["iso-9001", "clause-9", "monitoring", "measurement"]
  ),

  q(
    "m-1-q6",
    "m-1",
    "multiple-choice",
    "An organization receives a supplier-caused nonconforming product after delivery to the customer. Under ISO 9001:2015 Clause 8.7, what is the MINIMUM required response?",
    [
      "Determine and implement action appropriate to the effects or potential effects of the nonconformity",
      "Immediately issue an 8D corrective action report to the supplier",
      "Notify the registrar and suspend the supplier's approved status",
      "Initiate a product recall through the regulatory authority",
    ],
    0,
    "Clause 8.7.1 requires taking action appropriate to the effects or potential effects of the nonconformity when nonconforming output is detected after delivery. The specific corrective action method (8D, etc.) is not mandated by the standard; regulatory notification and recalls may apply in specific industries but are not ISO 9001 universal requirements.",
    "medium",
    ["iso-9001", "clause-8", "nonconforming-output", "corrective-action"]
  ),

  // ── Module m-2: AS9100D + IATF 16949 ─────────────────────────────────────

  q(
    "m-2-q1",
    "m-2",
    "multiple-choice",
    "AS9100D is a superset of ISO 9001:2015 focused on the aviation, space, and defense industry. Which requirement is present in AS9100D but NOT in ISO 9001:2015?",
    [
      "First article inspection (FAI) to verify that production processes, documentation, and tooling are capable of producing conforming parts",
      "Determination of internal and external issues relevant to organizational context",
      "Design and development validation to confirm product meets intended use requirements",
      "Analysis and evaluation of customer satisfaction data",
    ],
    0,
    "First Article Inspection (FAI) per AS9102 is an AS9100D-specific requirement ensuring the first production run article conforms to all drawing and specification requirements. Context analysis, design validation, and customer satisfaction analysis all exist in base ISO 9001:2015.",
    "medium",
    ["as9100d", "aerospace", "first-article-inspection", "fai"]
  ),

  q(
    "m-2-q2",
    "m-2",
    "multiple-choice",
    "IATF 16949:2016 mandates a structured approach to product safety. Which requirement differentiates IATF 16949 from base ISO 9001:2015 regarding product safety?",
    [
      "Organizations must have a documented process for managing product-safety-related products and manufacturing processes",
      "Organizations must appoint a certified safety engineer for all production lines",
      "Government regulatory type-approval must be obtained before any design change",
      "Customer-specific requirements for product safety supersede IATF requirements",
    ],
    0,
    "IATF 16949 Clause 8.3.3.3 requires a documented process for managing product-safety-related design, testing, and manufacturing. This includes identification of safety characteristics, reaction plans, and training. CSRs are important but do not supersede the standard — they supplement it.",
    "medium",
    ["iatf-16949", "automotive", "product-safety", "csr"]
  ),

  q(
    "m-2-q3",
    "m-2",
    "multiple-choice",
    "Under IATF 16949, a 'Special Characteristic' designated by the symbol Δ (triangle) or ◇ (diamond) typically indicates what type of characteristic?",
    [
      "A significant characteristic requiring control plans and operator instructions but below safety/regulatory threshold",
      "A critical characteristic directly affecting vehicle safety or regulatory compliance",
      "An engineering characteristic for internal tracking only with no customer notification required",
      "A warranty-relevant characteristic tied to field failure rate monitoring",
    ],
    0,
    "Symbols vary by customer-specific requirements, but the triangle/diamond designation typically indicates a Significant Characteristic — a product or process characteristic for which reasonably anticipated variation could significantly affect a customer's manufacturing or assembly process but is not safety- or regulatory-critical (which would typically use a different symbol, often a filled diamond or star depending on the OEM's CSR).",
    "hard",
    ["iatf-16949", "special-characteristics", "significant-characteristic", "csr"]
  ),

  q(
    "m-2-q4",
    "m-2",
    "true-false",
    "AS9100D certification automatically satisfies IATF 16949 certification requirements for a supplier serving both aerospace and automotive customers.",
    [
      "False — AS9100D and IATF 16949 are separate certifications with different scopes",
      "True — both are ISO 9001:2015 supersets with equivalent requirements",
    ],
    0,
    "AS9100D and IATF 16949 address different industry sectors with distinct additional requirements. AS9100D adds aerospace-specific clauses (FAI, configuration management, counterfeit parts prevention), while IATF 16949 adds automotive-specific clauses (core tools, CSRs, production part approval). A supplier serving both industries must be certified to each standard separately.",
    "easy",
    ["as9100d", "iatf-16949", "certification", "scope"]
  ),

  q(
    "m-2-q5",
    "m-2",
    "multiple-choice",
    "AS9100D Clause 8.1.4 requires control of operational risk. Which of the following BEST describes the primary intent of this clause?",
    [
      "Identify, assess, and manage risks to achieving conformance to requirements throughout the product realization process",
      "Perform a financial risk analysis before accepting any new customer contract",
      "Require a formal Failure Mode and Effects Analysis for all products regardless of complexity",
      "Mandate insurance coverage for product liability on all delivered hardware",
    ],
    0,
    "Clause 8.1.4 focuses on operational risk — risks to achieving conformance during planning and delivery of products and services. It requires identification and management of risks (e.g., use of key characteristics, design margins, process controls). It does not mandate FMEA universally or address financial or legal risk transfer.",
    "medium",
    ["as9100d", "risk-management", "operational-risk", "clause-8"]
  ),

  q(
    "m-2-q6",
    "m-2",
    "multiple-choice",
    "IATF 16949 requires organizations to have a process for managing 'Customer-Specific Requirements' (CSRs). What is the correct hierarchy when a CSR conflicts with an IATF 16949 requirement?",
    [
      "The CSR takes precedence because IATF 16949 explicitly states the organization shall meet applicable CSRs",
      "IATF 16949 takes precedence because it is an international standard",
      "The organization must escalate the conflict to the IATF oversight body for resolution",
      "The more stringent requirement always takes precedence regardless of source",
    ],
    0,
    "IATF 16949 Clause 1 (Scope) states that the standard includes CSRs as part of conformance. IATF requires organizations to meet all applicable CSRs. In practice, CSRs supplement and may exceed IATF requirements — organizations must identify, review, and comply with all applicable CSRs from their customers.",
    "hard",
    ["iatf-16949", "customer-specific-requirements", "csr", "hierarchy"]
  ),

  // ── Module m-3: IATF Core Tools ───────────────────────────────────────────

  q(
    "m-3-q1",
    "m-3",
    "multiple-choice",
    "In APQP (Advanced Product Quality Planning), which phase is responsible for producing the initial Bill of Materials, process flow diagrams, and preliminary FMEA?",
    [
      "Phase 2 — Product Design and Development",
      "Phase 1 — Plan and Define Program",
      "Phase 3 — Process Design and Development",
      "Phase 4 — Product and Process Validation",
    ],
    0,
    "APQP Phase 2 (Product Design and Development) produces design FMEAs, preliminary BOM, design verification plans, engineering drawings, and special characteristics. Phase 1 defines customer requirements and planning outputs. Phase 3 addresses process design. Phase 4 covers trial runs and PPAP.",
    "medium",
    ["apqp", "core-tools", "phase-2", "fmea"]
  ),

  q(
    "m-3-q2",
    "m-3",
    "multiple-choice",
    "A PPAP submission is required at Level 3. Which of the following BEST describes what a Level 3 submission includes?",
    [
      "Warrant only retained at the supplier with no submission to customer",
      "Warrant plus product samples and complete supporting data submitted to the customer",
      "Warrant plus product samples only, with data retained at the supplier",
      "All elements submitted plus a formal customer source approval visit",
    ],
    1,
    "PPAP Level 1: Warrant only (and designated appearance items). Level 2: Warrant + product samples + limited supporting data. Level 3 (default): Warrant + product samples + complete supporting data submitted to the customer. Level 4: Warrant and other requirements defined by customer. Level 5: Warrant + complete data reviewed at the supplier's manufacturing location.",
    "medium",
    ["ppap", "submission-levels", "level-3", "core-tools"]
  ),

  q(
    "m-3-q3",
    "m-3",
    "multiple-choice",
    "In a Measurement System Analysis (Gage R&R) study, the %GRR result is 23%. According to AIAG MSA guidelines, this result falls into which category?",
    [
      "Acceptable — the measurement system is suitable for the application",
      "Marginal — may be acceptable based on importance of application, cost of measurement device, or cost of repair",
      "Unacceptable — the measurement system must be identified and corrected",
      "Excellent — the measurement system exceeds requirements",
    ],
    1,
    "AIAG MSA 4th Edition thresholds: <10% = acceptable; 10-30% = marginal (may be acceptable depending on application importance, gage cost, and repair cost); >30% = unacceptable, the measurement system needs improvement. At 23%, the result is in the marginal zone and requires engineering judgment.",
    "medium",
    ["msa", "gage-rr", "thresholds", "aiag", "core-tools"]
  ),

  q(
    "m-3-q4",
    "m-3",
    "multiple-choice",
    "In FMEA, the Action Priority (AP) approach introduced in the AIAG-VDA FMEA Handbook (2019) replaced RPN as the primary risk ranking method. What are the three inputs to the Action Priority determination?",
    [
      "Severity (S), Occurrence (O), and Detection (D) rated individually on a 1-10 scale with an AP lookup table",
      "Severity (S), Occurrence (O), and Detectability (D) combined into a product (S x O x D = RPN)",
      "Frequency, Impact, and Controllability rated on a 1-5 scale",
      "Severity only — the AP table prioritizes by severity first regardless of O and D",
    ],
    0,
    "The AIAG-VDA FMEA methodology retained the S, O, and D 1-10 scales but replaced RPN multiplication with an Action Priority lookup table that uses all three ratings. The AP table yields High (H), Medium (M), or Low (L) priority. This corrects the RPN weakness where different S x O x D combinations produce identical RPN scores with very different risk profiles.",
    "hard",
    ["fmea", "action-priority", "aiag-vda", "severity-occurrence-detection"]
  ),

  q(
    "m-3-q5",
    "m-3",
    "multiple-choice",
    "SPC: A process has Cpk = 1.45 and Ppk = 0.95. What does this discrepancy MOST likely indicate?",
    [
      "The process is centered and capable in short-term performance but has excessive between-subgroup variation over time",
      "The measurement system has excessive variation masking the true process performance",
      "The process is capable over time but not within individual subgroups",
      "Cpk and Ppk should always be equal; a discrepancy indicates a calculation error",
    ],
    0,
    "Cpk uses within-subgroup (short-term) variation estimated from the average range or standard deviation, while Ppk uses total (long-term) variation from all data. A high Cpk with a significantly lower Ppk indicates the process performs well within short-term windows but has substantial between-subgroup shifts or drifts over time — a common sign of uncontrolled special causes or process drift.",
    "hard",
    ["spc", "cpk", "ppk", "process-capability", "core-tools"]
  ),

  q(
    "m-3-q6",
    "m-3",
    "multiple-select",
    "The PPAP submission package has 18 elements. Which of the following are REQUIRED elements in a standard PPAP package? (Select ALL that apply.)",
    [
      "Design records (engineering drawings/models)",
      "Part submission warrant (PSW)",
      "Initial process study (SPC results for special characteristics)",
      "Supplier's ISO 9001 certificate of registration",
    ],
    [0, 1, 2],
    "Design records (element 1), PSW (element 18), and initial process study (element 9) are all standard PPAP elements. The supplier's ISO 9001 certificate is NOT one of the 18 PPAP elements, though some customers may require it separately. IATF 16949 certification may be a CSR, but it is not part of the 18 core PPAP elements.",
    "hard",
    ["ppap", "18-elements", "psw", "spc", "core-tools"]
  ),

  // ── Module m-4: Lean/TPS ──────────────────────────────────────────────────

  q(
    "m-4-q1",
    "m-4",
    "multiple-choice",
    "In the Toyota Production System, 'Jidoka' (autonomation) is one of the two pillars of TPS. Which statement BEST describes the Jidoka concept?",
    [
      "Equipment and processes are designed to detect abnormalities and stop automatically, preventing defects from passing to the next process",
      "Operators are empowered to stop the production line at any time without management approval",
      "Machines are automated to run without human operators during night shifts",
      "Processes are synchronized to produce exactly to customer demand with zero buffer inventory",
    ],
    0,
    "Jidoka — often translated as 'automation with a human touch' — means machines stop automatically when a problem occurs and signal humans to investigate. The goal is to separate human work from machine work and prevent defects from propagating. JIT (producing to demand with zero buffer) is the other TPS pillar.",
    "medium",
    ["lean", "tps", "jidoka", "autonomation"]
  ),

  q(
    "m-4-q2",
    "m-4",
    "multiple-choice",
    "A manufacturer wants to reduce changeover time on a stamping press from 4 hours to under 30 minutes. Which Lean tool is specifically designed for this objective?",
    [
      "SMED (Single-Minute Exchange of Die)",
      "5S (Sort, Set in Order, Shine, Standardize, Sustain)",
      "Heijunka (production leveling)",
      "Andon (visual alert system)",
    ],
    0,
    "SMED (Single-Minute Exchange of Die), developed by Shigeo Shingo, is the systematic method for reducing changeover (setup) time by converting internal setup steps (done while machine is stopped) to external steps (done while machine is running) and streamlining the remaining internal steps.",
    "easy",
    ["lean", "smed", "changeover", "setup-reduction"]
  ),

  q(
    "m-4-q3",
    "m-4",
    "multiple-choice",
    "An A3 report in Lean practice is named after the paper size. What is the PRIMARY purpose of constraining a problem-solving report to a single A3 sheet?",
    [
      "To force rigorous thinking and concise communication by limiting the problem solver to only the most essential information",
      "To reduce printing costs and paper waste as part of environmental sustainability",
      "To comply with Toyota's internal documentation standard for supplier submissions",
      "To enable digital scanning and archiving of problem-solving records",
    ],
    0,
    "The A3 format disciplines thinking: the single-page constraint forces the author to deeply understand the problem, current state, root cause, countermeasures, and verification, communicating only the essentials. It is a thinking tool and a communication tool — the paper size is the mechanism for rigor, not the goal.",
    "easy",
    ["lean", "a3", "problem-solving", "tps"]
  ),

  q(
    "m-4-q4",
    "m-4",
    "multiple-choice",
    "In a PDCA (Plan-Do-Check-Act) cycle, what is the correct action when the 'Check' phase reveals the countermeasure did NOT achieve the desired result?",
    [
      "Return to the Plan phase to re-analyze the problem and develop a revised countermeasure",
      "Proceed to the Act phase and standardize the current approach with minor modifications",
      "Escalate to management to authorize a larger resource allocation for the same countermeasure",
      "Document the failure and close the cycle; open a new cycle with a different team",
    ],
    0,
    "PDCA is an iterative learning cycle. When Check reveals the plan did not work, the correct response is to return to Plan — re-examine assumptions, revisit root cause analysis, and develop a better countermeasure. Standardizing a failed approach (Act) or forcing continuation undermines the purpose of the cycle.",
    "medium",
    ["lean", "pdca", "plan-do-check-act", "continuous-improvement"]
  ),

  q(
    "m-4-q5",
    "m-4",
    "multiple-select",
    "The 5S methodology consists of five steps. Which of the following are correct 5S steps? (Select ALL that apply.)",
    [
      "Sort (Seiri) — remove unnecessary items from the workplace",
      "Set in Order (Seiton) — arrange necessary items so they are easy to find and use",
      "Shine (Seiso) — clean the workplace and use cleaning to inspect",
      "Standardize (Seiketsu) — establish standards to maintain the first three S's",
    ],
    [0, 1, 2, 3],
    "All four options are correct 5S steps (Seiri, Seiton, Seiso, Seiketsu). The fifth S is Sustain (Shitsuke) — maintain discipline to follow the established standards. All five are required for a complete 5S implementation.",
    "easy",
    ["lean", "5s", "workplace-organization"]
  ),

  q(
    "m-4-q6",
    "m-4",
    "multiple-choice",
    "Kaizen events (Kaizen Blitz) are focused improvement workshops. What distinguishes a Kaizen event from standard continuous improvement activities?",
    [
      "A Kaizen event is a concentrated, time-boxed team effort (typically 3-5 days) to implement improvements in a specific area with cross-functional participation and immediate implementation",
      "A Kaizen event is a quarterly management review of improvement project status across all value streams",
      "A Kaizen event refers exclusively to technology-enabled automation projects with ROI justification",
      "A Kaizen event is the annual process audit required by IATF 16949 for production processes",
    ],
    0,
    "A Kaizen event (Kaizen Blitz or Rapid Improvement Event) concentrates cross-functional team effort — typically 3-5 days — on a specific problem area with the authority and resources to implement changes immediately. The time constraint and immediate implementation distinguish it from ongoing incremental improvement or project-based approaches.",
    "medium",
    ["lean", "kaizen", "rapid-improvement", "continuous-improvement"]
  ),

  // ── Module m-5: Six Sigma DMAIC ───────────────────────────────────────────

  q(
    "m-5-q1",
    "m-5",
    "multiple-choice",
    "In DMAIC, the Measure phase produces a baseline process sigma level. If a process has a defect rate of 6,210 DPMO (defects per million opportunities), what is the approximate process sigma level?",
    [
      "4 sigma (approximately 6,210 DPMO with 1.5 sigma long-term shift)",
      "3 sigma (approximately 66,807 DPMO)",
      "5 sigma (approximately 233 DPMO)",
      "6 sigma (approximately 3.4 DPMO)",
    ],
    0,
    "Using the standard Six Sigma DPMO-to-sigma conversion table (which incorporates the 1.5 sigma long-term shift): 4 sigma = approximately 6,210 DPMO. 3 sigma = approximately 66,807 DPMO; 5 sigma = approximately 233 DPMO; 6 sigma = approximately 3.4 DPMO. These values assume the standard 1.5 sigma shift between short-term and long-term process performance.",
    "hard",
    ["six-sigma", "dmaic", "dpmo", "sigma-level", "measure"]
  ),

  q(
    "m-5-q2",
    "m-5",
    "multiple-choice",
    "The Analyze phase gate in DMAIC requires which deliverable before the team is authorized to proceed to the Improve phase?",
    [
      "Validated root cause(s) with statistical evidence confirming the relationship between cause and effect",
      "A complete list of all potential causes identified through brainstorming",
      "Management approval of the proposed solution and its implementation budget",
      "An updated control plan reflecting the team's preliminary improvement ideas",
    ],
    0,
    "The Analyze phase gate requires statistical validation of root causes — not just a list of potential causes. Common validation tools include hypothesis tests, regression analysis, designed experiments (DOE screening), or multi-vari analysis. Proceeding to Improve without validated root causes is a common DMAIC failure mode.",
    "medium",
    ["six-sigma", "dmaic", "analyze", "root-cause", "gate"]
  ),

  q(
    "m-5-q3",
    "m-5",
    "multiple-choice",
    "In the Define phase of DMAIC, a Critical-to-Quality (CTQ) tree translates customer needs into measurable requirements. Which step comes FIRST in building a CTQ tree?",
    [
      "Capture the Voice of the Customer (VOC) through surveys, complaints, interviews, or observations",
      "Define the project charter with scope, timeline, and financial benefits",
      "Identify the process inputs (Xs) that drive the output (Y)",
      "Establish the measurement system to collect baseline data",
    ],
    0,
    "The CTQ tree begins with VOC — understanding what the customer values. VOC is then translated into quality drivers (themes) and finally into specific, measurable CTQ characteristics. The project charter typically runs in parallel with VOC collection, but the CTQ tree specifically starts with the customer's voice.",
    "medium",
    ["six-sigma", "dmaic", "define", "ctq", "voc"]
  ),

  q(
    "m-5-q4",
    "m-5",
    "multiple-choice",
    "A Six Sigma Black Belt uses a 2-sample t-test to compare the mean cycle time before and after a process change. The p-value is 0.03. At alpha = 0.05, what is the correct conclusion?",
    [
      "Reject the null hypothesis; there is sufficient statistical evidence that the means are different",
      "Fail to reject the null hypothesis; the difference is not statistically significant",
      "Accept the alternative hypothesis with 97% confidence that the means are equal",
      "The test is inconclusive; a larger sample size is required before any conclusion",
    ],
    0,
    "When p-value (0.03) < alpha (0.05), we reject the null hypothesis (H0: mean1 = mean2). This means there is statistically significant evidence of a difference in means. Note: we 'fail to reject' rather than 'accept' H0 when p > alpha. The confidence level is 95% (1 - alpha), not 97%.",
    "medium",
    ["six-sigma", "hypothesis-testing", "t-test", "p-value", "analyze"]
  ),

  q(
    "m-5-q5",
    "m-5",
    "multiple-choice",
    "During the Control phase of DMAIC, which tool is MOST appropriate for establishing response rules when process monitoring indicates an out-of-control condition?",
    [
      "Control plan with reaction plan — defines who does what when a control chart signals",
      "FMEA update — identifies new failure modes introduced by the improved process",
      "Regression model — predicts the output value when inputs drift out of specification",
      "Measurement System Analysis — verifies the gage can detect the improvements made",
    ],
    0,
    "The control plan includes a reaction plan specifying exactly what actions to take when a monitoring method signals an abnormal condition. This is the primary Control phase tool for sustaining improvements. The FMEA, regression model, and MSA are all useful in DMAIC but serve different purposes and phases.",
    "easy",
    ["six-sigma", "dmaic", "control", "control-plan", "reaction-plan"]
  ),

  q(
    "m-5-q6",
    "m-5",
    "multiple-choice",
    "Design of Experiments (DOE): A 2^3 full factorial design investigates 3 factors at 2 levels each. How many experimental runs are required (excluding replication)?",
    ["8 runs", "6 runs", "9 runs", "12 runs"],
    0,
    "A full factorial design with k factors at 2 levels requires 2^k runs. For k=3: 2^3 = 8 runs. This allows estimation of 3 main effects, 3 two-factor interactions, and 1 three-factor interaction. Each additional replicate multiplies the run count (e.g., 2 replicates = 16 runs).",
    "medium",
    ["six-sigma", "doe", "factorial-design", "improve"]
  ),

  // ── Module m-6: ASME Y14.5 GD&T ──────────────────────────────────────────

  q(
    "m-6-q1",
    "m-6",
    "multiple-choice",
    "On a drawing, a flatness callout is applied to a surface with a tolerance of 0.05 mm. Which statement CORRECTLY describes what this controls?",
    [
      "All points on the surface must lie within two parallel planes 0.05 mm apart; no datum reference is required or permitted",
      "The surface must be parallel to the primary datum within 0.05 mm",
      "The surface must be within 0.05 mm of the true flat profile defined by a datum reference frame",
      "The surface must not deviate more than 0.05 mm from nominal in the Z-axis direction only",
    ],
    0,
    "Flatness is a form control that does not reference any datum. It requires all surface elements to lie within a tolerance zone of two parallel planes separated by the specified value (0.05 mm). Because it is a form control, no datum reference frame is needed or permitted in the feature control frame.",
    "medium",
    ["gdt", "y14.5", "flatness", "form-controls"]
  ),

  q(
    "m-6-q2",
    "m-6",
    "multiple-choice",
    "A True Position callout on a hole feature includes the modifier 'M' (Maximum Material Condition) in the feature control frame. What does the MMC modifier mean in this context?",
    [
      "The position tolerance applies at the MMC of the hole and bonus tolerance is permitted as the feature departs from MMC toward LMC",
      "The position tolerance is fixed at the stated value regardless of the actual size of the hole",
      "The datum features are measured at their maximum material condition boundary",
      "The position is measured to the maximum extent of the hole surface rather than the axis",
    ],
    0,
    "The MMC modifier on a feature of size means the stated tolerance applies when the feature is at its Maximum Material Condition (smallest hole diameter). As the hole departs from MMC toward LMC (gets larger), bonus tolerance equal to the departure amount is added to the stated tolerance. This is the virtual condition and bonus tolerance concept per ASME Y14.5.",
    "hard",
    ["gdt", "y14.5", "true-position", "mmc", "bonus-tolerance"]
  ),

  q(
    "m-6-q3",
    "m-6",
    "multiple-choice",
    "In a datum reference frame (DRF), the 3-2-1 datum establishment principle allocates degrees of freedom (DOF) to primary, secondary, and tertiary datums. How many DOF does the PRIMARY datum constrain?",
    [
      "3 DOF — for a planar primary datum: 1 translation (perpendicular to plane) + 2 rotations (about axes in the plane)",
      "6 DOF — the primary datum fully constrains the part with no need for secondary or tertiary",
      "2 DOF — the primary datum constrains only translational movement along two axes",
      "1 DOF — each datum constrains only one degree of freedom",
    ],
    0,
    "The 3-2-1 rule: a planar primary datum (3 contact points) constrains 3 DOF: 1 translational (perpendicular to the datum plane) and 2 rotational (tilting about the two in-plane axes). The secondary datum (2 points) constrains 2 more DOF. The tertiary datum (1 point) constrains the final 1 DOF. Together they constrain all 6 DOF.",
    "hard",
    ["gdt", "y14.5", "datum-reference-frame", "3-2-1", "degrees-of-freedom"]
  ),

  q(
    "m-6-q4",
    "m-6",
    "multiple-choice",
    "Cylindricity is a GD&T form control. Which statement CORRECTLY describes what cylindricity controls?",
    [
      "The entire cylindrical surface must lie within a tolerance zone bounded by two coaxial cylinders — controlling circularity, straightness, and taper simultaneously",
      "The axis of the cylinder must lie within a cylindrical tolerance zone centered on the datum axis",
      "Each circular cross-section of the cylinder must fall within two concentric circles independently",
      "The cylinder diameter must be within the stated tolerance measured at any single cross-section",
    ],
    0,
    "Cylindricity controls the form of the entire cylinder simultaneously — all surface points must lie between two coaxial cylinders (the tolerance zone). This is more stringent than circularity alone (which controls each cross-section independently) or straightness alone (which controls the axis or each line element). No datum reference is used — it is a pure form control.",
    "medium",
    ["gdt", "y14.5", "cylindricity", "form-controls"]
  ),

  q(
    "m-6-q5",
    "m-6",
    "true-false",
    "Under ASME Y14.5-2018, Rule #1 (Envelope Principle) requires that an individual feature of size must not extend beyond its perfect form boundary at Maximum Material Condition (MMC).",
    [
      "True — Rule #1 requires perfect form at MMC for individual features of size unless overridden",
      "False — Rule #1 only applies to external features of size such as shafts, not to holes",
    ],
    0,
    "Rule #1 (Envelope Principle) in ASME Y14.5 applies to both internal (holes) and external (shafts/pins) features of size. The surface(s) of the feature must not extend beyond the boundary of perfect form at MMC. The rule can be overridden by applying the independency modifier or by applying straightness/flatness to the feature's axis or center plane.",
    "medium",
    ["gdt", "y14.5", "rule-1", "envelope-principle", "mmc"]
  ),

  q(
    "m-6-q6",
    "m-6",
    "multiple-choice",
    "Profile of a Surface with a bilateral tolerance of 0.4 mm and no unequal distribution modifier creates what tolerance zone geometry?",
    [
      "A zone bounded by two surfaces each 0.2 mm offset (inside and outside) from the true profile surface",
      "A zone bounded by two surfaces both offset 0.4 mm outside the true profile surface",
      "A cylindrical zone of diameter 0.4 mm centered on each point of the true profile",
      "A zone bounded by two surfaces both offset 0.4 mm inward from the true profile surface",
    ],
    0,
    "Bilateral profile of a surface without the unequal distribution modifier (U per Y14.5-2018) distributes the tolerance equally on both sides of the true profile. A 0.4 mm bilateral tolerance creates a zone with 0.2 mm on each side of the true profile surface. The U modifier allows specifying unequal bilateral distribution explicitly.",
    "hard",
    ["gdt", "y14.5", "profile-of-surface", "bilateral-tolerance"]
  ),

  // ── Module m-7: ASME Y14.41 MBD ──────────────────────────────────────────

  q(
    "m-7-q1",
    "m-7",
    "multiple-choice",
    "ASME Y14.41 defines the standard for Digital Product Definition Data Practices (Model-Based Definition). What is the PRIMARY intent of MBD as defined by this standard?",
    [
      "To make the 3D CAD model with embedded PMI the authoritative source of product definition, replacing or supplementing traditional 2D engineering drawings",
      "To digitize paper drawings into PDF format for electronic storage and retrieval",
      "To establish requirements for CAD software interoperability between different vendors",
      "To define the format for exchanging bill-of-materials data between ERP and PLM systems",
    ],
    0,
    "ASME Y14.41 establishes requirements for defining products digitally using 3D models with embedded Product and Manufacturing Information (PMI). The 3D annotated model becomes the authoritative definition, enabling downstream users (manufacturing, inspection, procurement) to work directly from the model without 2D drawing derivation.",
    "easy",
    ["mbd", "y14.41", "pmi", "product-definition"]
  ),

  q(
    "m-7-q2",
    "m-7",
    "multiple-choice",
    "In Model-Based Definition, 'PMI' stands for Product and Manufacturing Information. Which of the following is an example of PMI embedded in a 3D model?",
    [
      "GD&T annotations, surface finish callouts, material specifications, and notes directly attached to model geometry",
      "The rendering settings and visual appearance properties of the CAD model",
      "The file metadata including author name, creation date, and version history",
      "The finite element analysis mesh parameters used for structural simulation",
    ],
    0,
    "PMI includes all non-geometric information required to manufacture and inspect the part: GD&T callouts, dimensional tolerances, surface texture symbols, material and process notes, and title block data — all attached semantically to the 3D geometry. Rendering settings, file metadata, and FEA parameters are not PMI.",
    "easy",
    ["mbd", "pmi", "y14.41", "annotations"]
  ),

  q(
    "m-7-q3",
    "m-7",
    "multiple-choice",
    "A company implementing MBD wants to ensure their model annotations can be read by downstream inspection software without re-entry. Which data format is specifically designed for CAD-neutral, semantically rich PMI exchange?",
    [
      "STEP AP242 (ISO 10303-242) — designed for managed model-based 3D engineering with semantic PMI",
      "IGES (Initial Graphics Exchange Specification) — the legacy neutral format for geometric exchange",
      "JT (Jupiter Tessellation) — optimized for visualization and lightweight model viewing",
      "PDF/E — for engineering drawing exchange in Portable Document Format",
    ],
    0,
    "STEP AP242 (Application Protocol 242: Managed Model-Based 3D Engineering) is the current international standard for exchanging complete MBD data with semantic PMI. Unlike IGES (geometry only, limited annotations) or JT (visualization-focused), AP242 preserves the full semantic meaning of PMI so downstream software can interpret GD&T and other annotations without human re-entry.",
    "medium",
    ["mbd", "step-ap242", "pmi", "data-exchange", "interoperability"]
  ),

  q(
    "m-7-q4",
    "m-7",
    "true-false",
    "Under ASME Y14.41, a dataset is considered 'associative' when the PMI annotations are mathematically linked to the model geometry, such that if the geometry changes, the annotations update accordingly.",
    [
      "True — associative PMI maintains a mathematical link to the geometry it annotates",
      "False — Y14.41 does not define associativity; all PMI is considered independent of geometry",
    ],
    0,
    "ASME Y14.41 distinguishes between associative (mathematically linked to geometry) and non-associative (independent of geometry) annotations. Associative PMI is preferred because changes to the geometry trigger updates to the annotations, reducing the risk of annotation-geometry mismatch — a significant quality risk in MBD workflows.",
    "medium",
    ["mbd", "y14.41", "associative-pmi", "geometry-linkage"]
  ),

  q(
    "m-7-q5",
    "m-7",
    "multiple-choice",
    "In an MBD workflow, a 'Model-Based Enterprise' (MBE) extends MBD beyond design. Which downstream function represents the HIGHEST maturity of MBE adoption?",
    [
      "Automated CMM inspection programs generated directly from the 3D model PMI without manual programming",
      "Using the 3D model for visual reference during assembly operations",
      "Storing engineering change notices as PDF attachments linked to the CAD file",
      "Generating 2D detail drawings automatically from the 3D model for shop floor use",
    ],
    0,
    "Automated inspection programming from PMI (CMM or optical measurement) represents high MBE maturity — the model drives the entire manufacturing and inspection process with minimal human intervention. Using the model for visual reference or generating 2D drawings as fallback are lower maturity states; generating 2D drawings defeats the purpose of MBD.",
    "hard",
    ["mbd", "mbe", "inspection", "cmm", "automation"]
  ),

  q(
    "m-7-q6",
    "m-7",
    "multiple-choice",
    "ASME Y14.41 defines two types of datasets: design model datasets and supplemental geometry datasets. What is the purpose of supplemental geometry?",
    [
      "To provide additional geometric constructs that aid in defining, manufacturing, or inspecting the design model but are not part of the manufactured product",
      "To store the CAD model's parametric history tree and feature-based construction sequence",
      "To contain the finite element mesh for structural analysis alongside the nominal geometry",
      "To define the visual rendering materials and texture maps applied to the model for presentation",
    ],
    0,
    "Supplemental geometry in Y14.41 includes geometric elements that support product definition — such as datum targets, theoretical sharp corners for dimensioning, gage geometry, or inspection measurement paths — that are not physical features of the manufactured part but are necessary to fully define how to make or inspect it.",
    "hard",
    ["mbd", "y14.41", "supplemental-geometry", "datum-targets"]
  ),

  // ── Module m-8: IPC-A-610 ─────────────────────────────────────────────────

  q(
    "m-8-q1",
    "m-8",
    "multiple-choice",
    "IPC-A-610 defines three classes of electronic assemblies. A life-support medical device with failure consequences that are critical to the patient would be classified as:",
    [
      "Class 3 — High Performance/Harsh Environment Electronics, requiring the highest level of workmanship and inspection",
      "Class 2 — Dedicated Service Electronics, with extended reliability requirements",
      "Class 1 — General Electronic Products, suitable for commercial applications",
      "Class 4 — Mission Critical, a classification introduced in the 2020 revision for medical devices",
    ],
    0,
    "IPC-A-610 defines three classes: Class 1 (general consumer electronics), Class 2 (dedicated service — industrial, commercial where extended life is required), and Class 3 (high performance/harsh environment — where failure cannot be tolerated, including military, aerospace, and life-critical medical). There is no Class 4 in IPC-A-610.",
    "easy",
    ["ipc-a-610", "class-3", "workmanship", "electronics"]
  ),

  q(
    "m-8-q2",
    "m-8",
    "multiple-choice",
    "IPC-A-610 defines workmanship acceptance criteria for through-hole component solder joints. For a Class 3 through-hole solder joint, what is the minimum acceptable vertical solder fill in the plated through-hole?",
    [
      "75% minimum vertical fill of the board thickness",
      "50% minimum vertical fill of the board thickness",
      "100% fill required — any void is a defect condition for Class 3",
      "25% minimum vertical fill of the board thickness",
    ],
    0,
    "For through-hole solder joints per IPC-A-610 Class 3, the minimum acceptable vertical fill is 75% of the board thickness. Class 1 and 2 require minimum 50% fill. 100% fill is the target/desired condition but not the acceptance threshold for Class 3.",
    "medium",
    ["ipc-a-610", "class-3", "through-hole", "solder-fill", "plated-through-hole"]
  ),

  q(
    "m-8-q3",
    "m-8",
    "multiple-choice",
    "What is the condition called when a surface mount component stands up on one end, with one termination lifted off the pad, during the solder reflow process?",
    [
      "Tombstoning (also called Manhattan effect or drawbridge effect)",
      "Bridging — solder bridging between adjacent pads due to excessive solder volume",
      "Head-in-pillow — a BGA solder joint defect where ball and paste do not fully coalesce",
      "Cold joint — a solder connection with insufficient wetting due to inadequate reflow temperature",
    ],
    0,
    "Tombstoning (standing on end, also called the Manhattan or drawbridge effect) occurs when unequal surface tension forces on the two ends of a chip component during reflow pull one end up. Causes include unequal pad sizes, unequal solder paste volumes, uneven heating, or component placement offset. It is a defect condition addressed in IPC-A-610.",
    "easy",
    ["ipc-a-610", "tombstoning", "smt", "reflow", "defects"]
  ),

  q(
    "m-8-q4",
    "m-8",
    "multiple-choice",
    "IPC-A-610 defines three condition categories for workmanship inspection findings. Which correctly identifies all three categories in order from best to worst?",
    [
      "Target — Acceptable — Defect",
      "Acceptable — Process Indicator — Reject",
      "Compliant — Marginal — Non-compliant",
      "Pass — Conditional Pass — Fail",
    ],
    0,
    "IPC-A-610 uses three condition categories: Target (the desired ideal condition), Acceptable (not the ideal but within the limits of the specification — suitable for use), and Defect (a condition that does not meet requirements and must be reworked, repaired, or dispositioned). Process Indicators are a fourth classification for conditions outside target but not yet defects.",
    "medium",
    ["ipc-a-610", "condition-categories", "target-acceptable-defect"]
  ),

  q(
    "m-8-q5",
    "m-8",
    "true-false",
    "Under IPC-A-610, a 'process indicator' is treated the same as a 'defect' and requires mandatory rework or rejection before the assembly can be accepted.",
    [
      "False — a process indicator does not require rework but should trigger process investigation",
      "True — any condition noted during inspection must be corrected before acceptance",
    ],
    0,
    "IPC-A-610 distinguishes condition categories. Process Indicators are conditions that fall outside of Target but indicate a process that may need attention — they do NOT require rework by themselves but should trigger process investigation to prevent defects. Only Defect conditions require mandatory rework or disposition.",
    "medium",
    ["ipc-a-610", "process-indicator", "defect", "acceptance-criteria"]
  ),

  q(
    "m-8-q6",
    "m-8",
    "multiple-choice",
    "IPC-A-610 requires that acceptance inspections use which document as the primary acceptance criteria reference?",
    [
      "The applicable revision of IPC-A-610 designated in the contract or purchase order, as agreed between customer and supplier",
      "Always the latest published revision of IPC-A-610 regardless of contract language",
      "The manufacturer's internal workmanship standards, which supersede IPC-A-610",
      "The predecessor standard IPC-A-600 for printed board acceptance criteria",
    ],
    0,
    "The applicable revision of IPC-A-610 is defined by contract — the customer and supplier agree on which revision governs the work. Organizations cannot unilaterally apply a newer revision; the contractually specified revision controls. IPC-A-600 covers bare printed boards, not assembled electronics.",
    "medium",
    ["ipc-a-610", "certification", "contract", "revision-control"]
  ),

  // ── Module m-9: IPC-7711/7721 ─────────────────────────────────────────────

  q(
    "m-9-q1",
    "m-9",
    "multiple-choice",
    "IPC-7711/7721 covers rework, modification, and repair of electronic assemblies. What is the DISTINCTION between 'rework' and 'repair' as defined by this standard?",
    [
      "Rework restores an assembly to its original specification; repair deviates from original design but restores functionality and requires customer/engineering disposition",
      "Rework is performed by the original manufacturer; repair is performed by a third party",
      "Rework applies to through-hole components; repair applies to surface mount components",
      "Rework is a temporary fix; repair is a permanent fix approved for production",
    ],
    0,
    "Per IPC-7711/7721: Rework brings the assembly back into conformance with the original specification — it is a standard process correction. Repair restores functionality but results in a product that does not meet the original design specification, requiring engineering authorization and customer disposition. The distinction drives traceability and documentation requirements.",
    "medium",
    ["ipc-7711", "ipc-7721", "rework", "repair", "definitions"]
  ),

  q(
    "m-9-q2",
    "m-9",
    "multiple-choice",
    "When removing a BGA (Ball Grid Array) component using hot air rework, the technician must monitor which parameter MOST critically to avoid board delamination?",
    [
      "Peak temperature at the component and time above liquidus — exceeding the board's decomposition temperature causes delamination",
      "The vacuum pressure of the nozzle extraction tool to ensure clean component removal",
      "The preheating time for the rework station to reach steady-state before starting",
      "The solder paste volume applied to the reballed BGA replacement component",
    ],
    0,
    "Board delamination during BGA rework is primarily caused by excessive temperature or time at temperature exceeding the substrate's decomposition temperature (Td) or glass transition temperature (Tg). IPC-7711/7721 specifies that thermal profiles during rework must stay within the board material's thermal limits — the same concern as original reflow but more acute during rework due to localized heat application.",
    "hard",
    ["ipc-7711", "bga", "rework", "thermal-profile", "delamination"]
  ),

  q(
    "m-9-q3",
    "m-9",
    "multiple-choice",
    "IPC-7711/7721 addresses the removal of chip components. Which technique is PREFERRED for removing 0402 or smaller chip components without damaging adjacent components or pad surfaces?",
    [
      "Dual-tip soldering iron or hot tweezers — simultaneously heating both terminations allows clean lift-off without disturbing adjacent parts",
      "Single iron reflowing one end at a time, then sliding the component off the pad",
      "Hot air nozzle at maximum temperature for fastest removal to minimize heat soak",
      "Chemical solder wicking followed by mechanical prying of the component",
    ],
    0,
    "For small chip components, dual-tip irons or hot tweezers that simultaneously reflow both terminations are the preferred method — they allow controlled lift-off without torquing the component or disturbing adjacent solder joints. Single-iron sequential reflowing risks lifting pads or disturbing adjacent components. High-temperature hot air risks heat damage to surrounding parts.",
    "medium",
    ["ipc-7711", "chip-removal", "rework-technique", "smt"]
  ),

  q(
    "m-9-q4",
    "m-9",
    "multiple-choice",
    "After component removal during rework, the technician prepares the land area by cleaning residual solder. Which tool is MOST appropriate for this step on a Class 3 assembly?",
    [
      "Solder wick (flux-cored copper braid) with a clean soldering iron — removes solder cleanly without mechanical stress on the land pads",
      "Mechanical scraping with a stainless steel tool to ensure all solder residue is removed",
      "Sandpaper or abrasive pad to polish the pad surface before new component placement",
      "Ultrasonic cleaning bath — removes all residue including flux and solder simultaneously",
    ],
    0,
    "Solder wick with a properly temperature-controlled iron is the standard method for solder removal from pads. Mechanical scraping risks pad lifting, copper damage, and surface contamination — it is not acceptable for Class 3. Abrasives damage the surface finish. Ultrasonic cleaning is a board-level process, not a localized pad preparation tool.",
    "medium",
    ["ipc-7711", "land-preparation", "solder-wick", "class-3", "rework"]
  ),

  q(
    "m-9-q5",
    "m-9",
    "true-false",
    "IPC-7711/7721 permits an unlimited number of rework cycles on a Class 3 assembly as long as each individual rework operation meets the standard's workmanship criteria.",
    [
      "False — the standard limits rework cycles and requires engineering disposition for repeated rework on high-reliability assemblies",
      "True — any number of rework cycles is acceptable if each meets acceptance criteria",
    ],
    0,
    "IPC-7711/7721 and IPC-A-610 both recognize that thermal cycling from repeated rework degrades solder joint reliability and board substrate integrity. For Class 3 assemblies, the number of allowable rework cycles at a given location is limited, and excessive rework requires engineering review and disposition. The standard does not permit unlimited cycles.",
    "medium",
    ["ipc-7711", "rework-cycles", "class-3", "reliability"]
  ),

  q(
    "m-9-q6",
    "m-9",
    "multiple-choice",
    "When performing a jumper wire modification per IPC-7711/7721, which statement regarding wire gauge selection is CORRECT?",
    [
      "Wire gauge must be selected based on the current carrying capacity requirement and the available routing space, meeting the electrical requirements of the circuit being modified",
      "Always use the smallest available wire gauge to minimize visual impact on the assembly",
      "Wire gauge must match the gauge of the PCB trace being bypassed",
      "Standard practice is AWG 30 wire-wrap wire for all jumper wire modifications regardless of current",
    ],
    0,
    "IPC-7711/7721 requires that jumper wire modifications use wire gauges appropriate for the current requirements of the modified circuit. Using undersized wire creates a fire or reliability hazard; oversized wire may be physically impractical. The selection is an engineering decision based on the circuit specification — not a default to the smallest or most common gauge.",
    "hard",
    ["ipc-7711", "jumper-wire", "modification", "wire-gauge"]
  ),

  // ── Module m-10: ISA-95 + ISA-88 ─────────────────────────────────────────

  q(
    "m-10-q1",
    "m-10",
    "multiple-choice",
    "According to ISA-95 (IEC 62264), which level of the manufacturing automation hierarchy is responsible for Manufacturing Operations Management (MOM/MES) functions such as work order dispatch, genealogy tracking, and OEE reporting?",
    [
      "Level 3 — Manufacturing Operations Management",
      "Level 2 — Supervisory Control (SCADA/DCS/HMI)",
      "Level 4 — Business Planning and Logistics (ERP)",
      "Level 1 — Basic Control (PLC/field devices)",
    ],
    0,
    "ISA-95 defines 5 levels (0-4): Level 0 (physical process), Level 1 (sensing/manipulating), Level 2 (monitoring/supervising — SCADA/DCS), Level 3 (manufacturing operations management — MES/MOM), Level 4 (business planning — ERP/SCM). Level 3 is where MES functions including scheduling, work order management, genealogy, quality, and OEE reside.",
    "easy",
    ["isa-95", "mes", "mom", "hierarchy", "level-3"]
  ),

  q(
    "m-10-q2",
    "m-10",
    "multiple-choice",
    "ISA-95 Part 2 defines an information model for production scheduling. What does a single 'Production Request' represent within a Production Schedule?",
    [
      "A request to produce a specific quantity of a specific product at a specific location within a defined time window",
      "A purchase order from a customer for a given product family",
      "A machine setup instruction sequence for a specific product changeover",
      "A quality control test plan for a production lot",
    ],
    0,
    "In the ISA-95 Part 2 model, a Production Request is the fundamental work unit in a Production Schedule — it specifies what product, how many, at which work center, and within which time window. It is the MES-layer equivalent of a manufacturing order from the ERP layer.",
    "medium",
    ["isa-95", "production-schedule", "production-request", "information-model"]
  ),

  q(
    "m-10-q3",
    "m-10",
    "multiple-choice",
    "ISA-88 defines a physical model hierarchy for batch process equipment. From top to bottom, what is the correct order of the ISA-88 physical model hierarchy?",
    [
      "Enterprise — Site — Area — Process Cell — Unit — Equipment Module — Control Module",
      "Enterprise — Site — Area — Unit — Process Cell — Equipment Module — Control Module",
      "Plant — Area — Process Cell — Unit — Equipment Module — Control Module — Actuator",
      "Site — Area — Unit — Process Cell — Control Module — Equipment Module — Field Device",
    ],
    0,
    "The ISA-88 physical model hierarchy (top to bottom): Enterprise — Site — Area — Process Cell — Unit — Equipment Module — Control Module. The Process Cell is the key batch-process grouping (e.g., a reaction train); the Unit is where a single batch or process stage occurs; Equipment Modules and Control Modules manage sub-unit automation.",
    "medium",
    ["isa-88", "physical-model", "hierarchy", "batch-process"]
  ),

  q(
    "m-10-q4",
    "m-10",
    "multiple-choice",
    "In ISA-88, the procedural model defines four levels. What is the CORRECT order from highest to lowest level?",
    [
      "Procedure — Unit Procedure — Operation — Phase",
      "Recipe — Process Stage — Process Operation — Process Action",
      "Batch — Campaign — Run — Step",
      "Master Recipe — Control Recipe — Process Segment — Phase",
    ],
    0,
    "The ISA-88 procedural model hierarchy: Procedure (complete batch recipe execution) — Unit Procedure (sequence of operations in a single unit) — Operation (set of actions with a specific purpose) — Phase (lowest level, directly interfaces with process control equipment). This maps to the physical model where Procedures run on Process Cells and Phases run on Equipment/Control Modules.",
    "medium",
    ["isa-88", "procedural-model", "procedure-operation-phase", "batch"]
  ),

  q(
    "m-10-q5",
    "m-10",
    "multiple-choice",
    "ISA-95 defines the boundary between Level 3 (MES/MOM) and Level 4 (ERP) systems using B2MML. What does B2MML provide?",
    [
      "An XML implementation of the ISA-95 data model for standardized information exchange between business and manufacturing systems",
      "A programming interface (API) for direct database integration between SAP and Rockwell systems",
      "A graphical modeling notation for designing ISA-95-compliant system architectures",
      "A real-time communication protocol for passing production data between SCADA and ERP",
    ],
    0,
    "B2MML (Business to Manufacturing Markup Language) is the XML schema implementation of the ISA-95 object and activity models. It provides standardized XML message structures for production schedules, performance results, work definitions, and other ISA-95 data objects — enabling interoperability between MES/MOM and ERP systems from different vendors.",
    "hard",
    ["isa-95", "b2mml", "xml", "integration", "erp-mes"]
  ),

  q(
    "m-10-q6",
    "m-10",
    "multiple-choice",
    "In ISA-88, a 'Control Recipe' is derived from a 'Master Recipe' and adapted for a specific production run. What is the PRIMARY purpose of the Control Recipe?",
    [
      "To provide site-specific, equipment-specific instructions for executing a batch, including scaled quantities and equipment-specific parameters",
      "To serve as the regulatory submission document for FDA batch records in pharmaceutical manufacturing",
      "To define the general manufacturing procedure without equipment-specific details for the R&D department",
      "To document the quality control tests required before the batch can be released to distribution",
    ],
    0,
    "In the ISA-88 recipe hierarchy (General — Site — Master — Control), the Control Recipe is at the bottom and is execution-specific: it translates the Master Recipe into actual equipment instructions with site-specific parameters, actual equipment assignments, and specific quantities for a single production batch. The Master Recipe is site-specific but not equipment-specific; the Control Recipe is both.",
    "hard",
    ["isa-88", "control-recipe", "master-recipe", "batch", "recipe-hierarchy"]
  ),

  // ── Module m-11: MTConnect + OPC UA + TSN ─────────────────────────────────

  q(
    "m-11-q1",
    "m-11",
    "multiple-choice",
    "MTConnect is an open, royalty-free standard for manufacturing equipment data exchange. Which statement CORRECTLY describes the MTConnect architecture?",
    [
      "MTConnect uses a client-server model where an MTConnect Agent serves XML data over HTTP; clients poll the Agent using a RESTful interface",
      "MTConnect requires dedicated hardware gateways on each machine that push data to a central broker using MQTT",
      "MTConnect is a bidirectional protocol that allows both reading machine data and sending commands to the machine controller",
      "MTConnect uses OPC UA as its underlying transport layer with MTConnect-specific information models",
    ],
    0,
    "MTConnect architecture: the Agent is a software server that collects data from the machine (via adapters) and serves it as structured XML documents over HTTP. Clients poll the Agent using standard HTTP GET requests — it is a read-only, pull-based, RESTful protocol. MTConnect does not support write/command and does not use MQTT or OPC UA as its transport.",
    "medium",
    ["mtconnect", "protocol", "architecture", "http", "xml"]
  ),

  q(
    "m-11-q2",
    "m-11",
    "multiple-choice",
    "OPC UA (OPC Unified Architecture) supersedes OPC Classic (OPC DA, OPC HDA, OPC A&E). What is the PRIMARY architectural advantage of OPC UA over OPC Classic?",
    [
      "OPC UA is platform-independent (not Windows/COM/DCOM dependent), supports firewall-friendly TCP and HTTPS transport, and includes a unified information modeling framework",
      "OPC UA is faster than OPC Classic because it uses binary encoding exclusively",
      "OPC UA eliminates the need for network infrastructure by using direct peer-to-peer device communication",
      "OPC UA is backward-compatible with all OPC Classic applications without any conversion layer",
    ],
    0,
    "OPC Classic was built on Microsoft COM/DCOM, making it Windows-only and problematic across firewalls. OPC UA is platform-independent (runs on Linux, embedded systems, cloud), uses TCP binary or HTTPS transport (firewall-friendly), and provides a unified information modeling system that replaces the separate DA/HDA/A&E specifications. OPC UA to Classic backward compatibility requires a COM proxy wrapper.",
    "medium",
    ["opc-ua", "opc-classic", "platform-independence", "information-model"]
  ),

  q(
    "m-11-q3",
    "m-11",
    "multiple-choice",
    "Time-Sensitive Networking (TSN) is a set of IEEE 802.1 standards for Ethernet. What does TSN primarily add to standard Ethernet that makes it suitable for industrial control applications?",
    [
      "Deterministic, bounded latency guarantees through time synchronization (IEEE 802.1AS), traffic shaping, and frame preemption — enabling real-time control traffic alongside standard IT traffic",
      "Higher data throughput (10 Gbps minimum) for large-volume machine vision data streams",
      "Native cybersecurity through built-in encryption and authentication at the Ethernet frame level",
      "Wireless (Wi-Fi 6) support for mobile manufacturing equipment and AGVs",
    ],
    0,
    "TSN addresses standard Ethernet's non-determinism — packets can be delayed indefinitely by traffic congestion. TSN adds: IEEE 802.1AS (time synchronization to sub-microsecond accuracy), IEEE 802.1Qbv (time-aware traffic shaping/gating), IEEE 802.1Qbu (frame preemption), and others. Together these provide bounded, deterministic latency required for real-time control (e.g., motion control, robot synchronization) alongside IT traffic on converged networks.",
    "hard",
    ["tsn", "ieee-802.1", "deterministic", "real-time-ethernet", "industrial"]
  ),

  q(
    "m-11-q4",
    "m-11",
    "multiple-choice",
    "OPC UA supports two primary communication models. Which correctly distinguishes Client-Server from Publish-Subscribe (OPC UA PubSub)?",
    [
      "Client-Server uses session-based, on-demand data exchange; PubSub decouples publishers from subscribers and supports one-to-many distribution over UDP multicast or MQTT broker",
      "Client-Server is used for reading historical data; PubSub is used for real-time alarm and event notifications",
      "Client-Server requires OPC UA security; PubSub operates without authentication for broadcast efficiency",
      "Client-Server uses binary encoding; PubSub uses JSON encoding exclusively",
    ],
    0,
    "OPC UA Client-Server is session-based with persistent connections — clients request data from servers (subscribe to monitored items). OPC UA PubSub (defined in OPC UA Part 14) decouples publishers and subscribers with no direct connection — publishers broadcast to a broker (MQTT) or multicast group (UDP), enabling efficient one-to-many distribution at scale. Both support binary and JSON encoding; both can use security.",
    "hard",
    ["opc-ua", "pubsub", "client-server", "mqtt", "publish-subscribe"]
  ),

  q(
    "m-11-q5",
    "m-11",
    "true-false",
    "MTConnect and OPC UA are competing standards — a manufacturing enterprise must choose one or the other for their shop floor data collection strategy.",
    [
      "False — MTConnect and OPC UA are complementary; OPC UA can transport MTConnect data, and many systems support both",
      "True — the standards are technically incompatible and cannot interoperate",
    ],
    0,
    "MTConnect and OPC UA are complementary, not competing. MTConnect defines a manufacturing-specific semantic data model (tools, axes, programs, alarms) while OPC UA provides a flexible information modeling framework and secure transport. The OPC Foundation and MTConnect Institute have published a companion specification that maps MTConnect data models into OPC UA information models, allowing OPC UA to serve as the transport for MTConnect-modeled data.",
    "medium",
    ["mtconnect", "opc-ua", "interoperability", "companion-specification"]
  ),

  q(
    "m-11-q6",
    "m-11",
    "multiple-choice",
    "OPC UA's 'Information Model' concept enables what capability that raw protocol data exchange does not provide?",
    [
      "Semantic interoperability — equipment from different vendors exposes data with shared meaning, types, and relationships that client applications can understand without prior knowledge of vendor-specific formats",
      "Higher data throughput by eliminating protocol header overhead through model compression",
      "Physical device discovery on the network without manual configuration of IP addresses",
      "Automatic firmware updates to connected devices based on model version definitions",
    ],
    0,
    "OPC UA's information modeling framework allows vendors and standard bodies to define companion specifications (e.g., OPC UA for CNC, for Robotics, for Plastics, for Welding) that expose data with shared semantic meaning. A client application that understands the OPC UA Robotics companion spec can work with any OPC UA-conformant robot from any vendor — without custom integration code. This is semantic interoperability, not just data transfer.",
    "hard",
    ["opc-ua", "information-model", "semantic-interoperability", "companion-spec"]
  ),

  // ── Module m-12: IEC 62443 + RAMI 4.0 + IIRA ─────────────────────────────

  q(
    "m-12-q1",
    "m-12",
    "multiple-choice",
    "IEC 62443 defines Security Levels (SL) for Industrial Automation and Control Systems (IACS). Which description CORRECTLY matches Security Level 2 (SL 2)?",
    [
      "Protection against intentional violation using simple means — an entity with low motivation, generic skills, and limited resources",
      "Protection against unintentional or coincidental violations — the baseline level covering accidental misuse",
      "Protection against intentional violation using sophisticated means with extended resources — state-level threat actors",
      "Protection against attacks by insiders with detailed system knowledge and moderate resources",
    ],
    0,
    "IEC 62443-3-3 defines four Security Levels: SL 1 — protection against casual or coincidental violation; SL 2 — protection against intentional violation using simple means (low motivation, generic skills, limited resources); SL 3 — protection against intentional violation using sophisticated means (moderate resources, IACS-specific skills); SL 4 — protection against state-sponsored actors with extended resources and motivation.",
    "medium",
    ["iec-62443", "security-level", "sl-2", "ot-security", "iacs"]
  ),

  q(
    "m-12-q2",
    "m-12",
    "multiple-choice",
    "IEC 62443 defines roles for three different entities in an IACS security program. Which correctly identifies all three roles?",
    [
      "Product Supplier (builds components), System Integrator (designs and deploys the system), and Asset Owner (operates the system)",
      "Manufacturer, Distributor, and End User",
      "OT Vendor, IT Security Team, and Operations Management",
      "Component Supplier, Network Designer, and Compliance Auditor",
    ],
    0,
    "IEC 62443 explicitly defines three roles with distinct responsibilities: Product Supplier (designs and builds IACS components — hardware, software, firmware), System Integrator (integrates components into a system and deploys it), and Asset Owner (owns and operates the IACS). Each role has specific security obligations in the standard's multi-part structure.",
    "medium",
    ["iec-62443", "roles", "product-supplier", "system-integrator", "asset-owner"]
  ),

  q(
    "m-12-q3",
    "m-12",
    "multiple-choice",
    "The Reference Architecture Model Industrie 4.0 (RAMI 4.0) is a three-dimensional framework. Which correctly identifies the three axes of the RAMI 4.0 model?",
    [
      "Hierarchy Levels (IEC 62264/ISA-95 levels from product to connected world), Life Cycle and Value Stream (IEC 62890), and Architecture Layers (from asset to business layer)",
      "Physical layer, Application layer, and Business layer arranged in a flat matrix",
      "People, Process, and Technology — the three pillars of digital transformation",
      "Design, Production, and Service — the three phases of the product lifecycle",
    ],
    0,
    "RAMI 4.0 (developed by the German Plattform Industrie 4.0) uses three axes: (1) Hierarchy Levels — derived from IEC 62264/ISA-95, extending from individual products up through connected world; (2) Life Cycle and Value Stream — based on IEC 62890, covering development through operations to end of life; (3) Architecture Layers — from Asset (physical/hardware) up through Integration, Communication, Information, Functional, and Business layers.",
    "hard",
    ["rami-4.0", "industry-4.0", "axes", "hierarchy", "architecture-layers"]
  ),

  q(
    "m-12-q4",
    "m-12",
    "multiple-choice",
    "In RAMI 4.0, the 'Administration Shell' (Verwaltungsschale) is a key concept for Industry 4.0 asset management. What does the Administration Shell represent?",
    [
      "The digital representation of an asset — a standardized digital twin interface that makes any physical or logical asset addressable, discoverable, and interoperable in the Industry 4.0 ecosystem",
      "The cybersecurity perimeter that isolates OT networks from IT networks in a manufacturing plant",
      "The enterprise resource planning module that manages asset maintenance schedules and depreciation",
      "The physical enclosure and mounting hardware for industrial control system components",
    ],
    0,
    "The Administration Shell (AAS) is the digital twin concept at the core of RAMI 4.0. It provides a standardized virtual representation of any asset (a machine, a sensor, a product, a process) exposing its properties, capabilities, and data through a standardized interface — making the asset a participant in the Industry 4.0 value network. The AAS structure, metadata format, and API are standardized by IEC 63278.",
    "hard",
    ["rami-4.0", "administration-shell", "digital-twin", "industry-4.0", "aas"]
  ),

  q(
    "m-12-q5",
    "m-12",
    "multiple-choice",
    "The Industrial Internet Reference Architecture (IIRA), published by the Industrial Internet Consortium (IIC), uses viewpoints to address different stakeholder concerns. Which viewpoint addresses business objectives, value, and the roles of participants in the IIoT system?",
    [
      "Business Viewpoint — addresses the identification of stakeholders, business vision, values, and objectives driving the IIoT system",
      "Usage Viewpoint — describes how the system is used and the activities expected from participants",
      "Functional Viewpoint — describes the functional components, structure, interfaces, and interactions",
      "Implementation Viewpoint — addresses technologies and standards to implement functional components",
    ],
    0,
    "The IIRA defines four viewpoints: Business Viewpoint (stakeholders, objectives, value, business model), Usage Viewpoint (system usage, activities, and roles — use cases), Functional Viewpoint (functional components, structure, and interactions), and Implementation Viewpoint (technology and standards). The Business Viewpoint is the highest-level strategic view.",
    "medium",
    ["iira", "iic", "viewpoints", "business-viewpoint", "iiot"]
  ),

  q(
    "m-12-q6",
    "m-12",
    "multiple-choice",
    "IEC 62443 defines the concept of 'zones and conduits' for segmenting IACS security. What is the purpose of a 'conduit' in this model?",
    [
      "A conduit is a logical grouping of communication channels that connects zones and must be secured to protect the assets in both connected zones",
      "A conduit is a physical cable pathway that must be enclosed in metal conduit for EMI protection",
      "A conduit is a firewall rule set that allows unrestricted communication between adjacent security zones",
      "A conduit is a data historian that buffers information flowing between the OT zone and the IT zone",
    ],
    0,
    "In IEC 62443 zone-and-conduit architecture, a zone is a logical grouping of assets with the same security level requirements, and a conduit is the communication path connecting two zones. The conduit must be secured to protect the assets in both zones — typically requiring the conduit to meet the higher of the two connected zones' security requirements. Conduits include all communication channels (wired, wireless, serial, Ethernet) between zones.",
    "hard",
    ["iec-62443", "zones-conduits", "network-segmentation", "ot-security", "iacs"]
  ),
];
