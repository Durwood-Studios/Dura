import type { AssessmentQuestion } from "@/types/assessment";

/**
 * Phase R question bank — 64 questions across 8 modules (8 each).
 * Covers ISO 8373 vocabulary, ISO 12100 risk assessment, PL/SIL functional
 * safety, ISO 10218-1:2025 collaborative modes, PFL/R15.806 validation,
 * ROS 2 ecosystem, IEC 62443 robot cybersecurity, and capstone.
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
    phaseId: "r",
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

export const PHASE_R_QUESTIONS: AssessmentQuestion[] = [
  // ── Module r-1: ISO 8373 Vocabulary ───────────────────────────────────────
  q(
    "r-1-q1",
    "r-1",
    "multiple-choice",
    "According to ISO 8373, what is the formal definition of an 'industrial robot'?",
    [
      "Any powered machine capable of motion that operates in a manufacturing environment.",
      "An automatically controlled, reprogrammable multipurpose manipulator, programmable in three or more axes, which may be either fixed in place or mobile for use in industrial automation applications.",
      "A collaborative robot designed to work alongside humans without safety guarding.",
      "A computer-controlled mechanical arm with at least six degrees of freedom.",
    ],
    1,
    "ISO 8373:2021 §3.13 defines an industrial robot as automatically controlled, reprogrammable, multipurpose, operable in ≥3 axes, fixed or mobile. The key discriminators: reprogrammable (not hard-wired), multipurpose (not single-task), and ≥3 axes.",
    "medium",
    ["iso-8373", "industrial-robot", "definition"]
  ),
  q(
    "r-1-q2",
    "r-1",
    "multiple-choice",
    "In ISO 8373 terminology, what is the distinction between a 'robot system' and a 'robot cell'?",
    [
      "A robot system includes the robot and its end-effector; a robot cell adds the safety guarding.",
      "A robot system comprises the robot, end-effector, and any equipment necessary for the robot to perform its task. A robot cell is the robot system plus the workspace and any associated equipment within a defined physical boundary.",
      "They are synonymous terms used interchangeably in the standard.",
      "A robot cell must have at least two robots; a system can have one.",
    ],
    1,
    "ISO 8373 distinguishes these precisely. System = robot + end-effector + task equipment. Cell = system + the physical space (workspace) and associated equipment bounded for the application. Understanding the scope boundary matters for risk assessment.",
    "medium",
    ["iso-8373", "robot-system", "robot-cell", "terminology"]
  ),
  q(
    "r-1-q3",
    "r-1",
    "multiple-choice",
    "ISO 8373 defines 'payload' in the context of a robot. Which definition is correct?",
    [
      "The total mass of the robot arm including all joints.",
      "The maximum mass, including the end-effector, that the robot can handle at rated conditions of speed and reach without exceeding specified performance criteria.",
      "The electrical power consumption of the robot at maximum speed.",
      "The mass of the workpiece only, excluding the end-effector mass.",
    ],
    1,
    "Payload per ISO 8373 is the total mass the robot can carry at the end-effector mounting flange — this includes the end-effector (gripper, tool) itself plus the workpiece. Exceeding rated payload degrades path accuracy and can cause structural failure.",
    "medium",
    ["iso-8373", "payload", "definition"]
  ),
  q(
    "r-1-q4",
    "r-1",
    "true-false",
    "True or false: ISO 8373 defines a 'collaborative robot' (cobot) as any robot that operates in a shared workspace with humans, regardless of safety function implementation.",
    ["True", "False"],
    1,
    "False. ISO 8373 defines collaborative operation (and by extension a collaborative robot) specifically as a robot designed for direct interaction with a human within a defined collaborative workspace. The mere physical proximity to humans does not make a robot collaborative — specific safety functions (SMS, HG, SSM, PFL per ISO 10218-1) must be implemented.",
    "medium",
    ["iso-8373", "cobot", "collaborative-robot", "definition"]
  ),
  q(
    "r-1-q5",
    "r-1",
    "multiple-choice",
    "What does ISO 8373 mean by 'workspace' versus 'restricted space' versus 'operating space'?",
    [
      "They are synonyms for the volume the robot occupies.",
      "Workspace is the full volume reachable by the robot. Restricted space is a subset of workspace defined by limiting devices. Operating space is the portion of restricted space actually used by the task.",
      "Workspace and operating space are identical; restricted space adds safety barriers.",
      "Restricted space is defined by software limits; operating space is defined by hardware stops.",
    ],
    1,
    "ISO 8373 defines a nested hierarchy: maximum space (all reachable points) → restricted space (hardware/software limits applied) → operating space (task-defined subset of restricted space). This hierarchy is fundamental to applying safeguards correctly.",
    "hard",
    ["iso-8373", "workspace", "restricted-space", "operating-space"]
  ),
  q(
    "r-1-q6",
    "r-1",
    "multiple-choice",
    "In ISO 8373, what is a 'safeguard' and how does it differ from a 'safety function'?",
    [
      "They are the same concept expressed at different levels of abstraction.",
      "A safeguard is a physical measure (guard, barrier, light curtain) that prevents access to hazardous areas. A safety function is a function of the machine that reduces risk to an acceptable level — it may be implemented by safeguards or by control logic.",
      "A safety function is required by law; a safeguard is optional.",
      "Safeguards apply to the robot hardware; safety functions apply to the software controller only.",
    ],
    1,
    "A safeguard is a protective measure implemented by physical means (barriers, interlocks, presence-sensing devices). A safety function is a higher-level concept — the intended risk-reduction behavior — which may be realized by safeguards, safety-rated control systems, or both.",
    "hard",
    ["iso-8373", "safeguard", "safety-function", "terminology"]
  ),
  q(
    "r-1-q7",
    "r-1",
    "multiple-choice",
    "ISO 8373 defines 'end-effector.' Which of the following is NOT typically considered an end-effector under this definition?",
    [
      "A pneumatic gripper attached to the robot flange.",
      "A welding torch mounted at the robot wrist.",
      "The robot's sixth-axis wrist joint itself.",
      "A vacuum suction cup for pick-and-place operations.",
    ],
    2,
    "An end-effector is a device attached to the robot flange designed to interact with the environment (grip, weld, paint, inspect). The wrist joint is an integral part of the robot manipulator structure, not an end-effector. Grippers, torches, and suction cups all qualify.",
    "easy",
    ["iso-8373", "end-effector", "definition"]
  ),
  q(
    "r-1-q8",
    "r-1",
    "multiple-select",
    "Which of the following are explicitly defined terms in ISO 8373? Select all that apply.",
    [
      "Teach mode (a mode in which robot motion is programmed manually)",
      "Automatic mode (a mode in which the robot executes programmed tasks)",
      "Collaborative workspace (the space within the operating space where robot and human may coexist during collaborative operation)",
      "Safety integrity level (SIL) for robot safety functions",
    ],
    [0, 1, 2],
    "ISO 8373 defines teach mode, automatic mode, and collaborative workspace. SIL is defined in IEC 62061 (functional safety for machinery) — ISO 8373 is a vocabulary standard, not a safety requirements standard, so it does not define SIL.",
    "hard",
    ["iso-8373", "teach-mode", "automatic-mode", "collaborative-workspace"]
  ),

  // ── Module r-2: ISO 12100 Risk Assessment ─────────────────────────────────
  q(
    "r-2-q1",
    "r-2",
    "multiple-choice",
    "ISO 12100 defines a four-step iterative risk assessment process. What is the correct order?",
    [
      "Risk evaluation → hazard identification → risk estimation → risk reduction",
      "Hazard identification → risk estimation → risk evaluation → risk reduction",
      "Risk estimation → risk evaluation → hazard identification → risk reduction",
      "Risk reduction → hazard identification → risk estimation → risk evaluation",
    ],
    1,
    "ISO 12100 §5: (1) Determine limits of machinery, (2) Identify hazards, (3) Estimate risk (severity × probability × avoidability), (4) Evaluate risk (acceptable?). If not acceptable, apply risk reduction measures and repeat. The process is iterative, not linear.",
    "medium",
    ["iso-12100", "risk-assessment", "process", "hazard"]
  ),
  q(
    "r-2-q2",
    "r-2",
    "multiple-choice",
    "In ISO 12100's risk estimation, what three parameters determine the magnitude of risk for each hazard?",
    [
      "Frequency, duration, and severity of harm.",
      "Severity of harm, probability of occurrence of harm (combining exposure frequency and probability of hazardous event), and possibility of avoiding or limiting harm.",
      "Probability, detectability, and impact.",
      "Frequency, reversibility, and number of persons exposed.",
    ],
    1,
    "ISO 12100 §5.5 defines risk as a function of: (a) severity of harm (S), (b) probability of occurrence = frequency/duration of exposure (E) × probability of hazardous event (W) × possibility of avoiding (A). These three factors are assessed for each identified hazard situation.",
    "hard",
    ["iso-12100", "risk-estimation", "severity", "probability"]
  ),
  q(
    "r-2-q3",
    "r-2",
    "multiple-choice",
    "ISO 12100 establishes a 'three-step method' for risk reduction. In what order must designers apply these steps?",
    [
      "Safeguarding → inherently safe design → information for use",
      "Inherently safe design measures → safeguarding and protective measures → information for use (warnings, procedures)",
      "Information for use → inherently safe design → safeguarding",
      "Administrative controls → engineering controls → elimination",
    ],
    1,
    "The ISO 12100 hierarchy: Step 1 — inherently safe design (eliminate the hazard). Step 2 — safeguarding (guard, interlock, presence-sensing). Step 3 — information for use (labels, manuals, training). Higher steps take priority; Step 3 alone is insufficient for significant risks.",
    "medium",
    ["iso-12100", "three-step-method", "risk-reduction", "hierarchy"]
  ),
  q(
    "r-2-q4",
    "r-2",
    "true-false",
    "True or false: ISO 12100 requires a risk assessment to be conducted only before the machinery is first placed on the market, not during the design phase.",
    ["True", "False"],
    1,
    "False. ISO 12100 explicitly requires risk assessment to begin in the design phase and be iterative throughout the product lifecycle. Early-phase risk assessment is most cost-effective — design changes to eliminate hazards are cheapest before hardware is built.",
    "easy",
    ["iso-12100", "risk-assessment", "design-phase"]
  ),
  q(
    "r-2-q5",
    "r-2",
    "multiple-choice",
    "When documenting a robot risk assessment under ISO 12100, which hazard type is associated with energy stored in pneumatic actuators?",
    [
      "Electrical hazard",
      "Thermal hazard",
      "Mechanical hazard (pressure / injection hazard)",
      "Radiation hazard",
    ],
    2,
    "ISO 12100 Annex B lists hazard types. Stored pneumatic energy is a mechanical hazard — specifically a pressure/injection hazard. If a pneumatic line fails or is disconnected, the sudden release of compressed air can cause crushing, whipping hose injury, or pressure injection injury.",
    "medium",
    ["iso-12100", "hazard-types", "pneumatic", "mechanical-hazard"]
  ),
  q(
    "r-2-q6",
    "r-2",
    "multiple-choice",
    "What does ISO 12100 mean by 'reasonably foreseeable misuse' and why must it be considered in risk assessment?",
    [
      "Only intentional sabotage needs to be considered in a risk assessment.",
      "Predictable operator behaviors that deviate from intended use — including defeating safeguards, using the machine for purposes not specified by the designer, or errors from lack of concentration. These must be assessed because users routinely exhibit such behaviors.",
      "Misuse that occurs in fewer than 1% of deployments can be excluded from risk assessment.",
      "Only misuse covered by an explicit customer contract must be assessed.",
    ],
    1,
    "ISO 12100 §5.4 explicitly requires considering reasonably foreseeable misuse — predictable human behavior including errors, reflex actions, and deliberate defeat of safeguards. If a safeguard can easily be defeated, the risk assessment must treat the defeated state as a realistic scenario.",
    "medium",
    ["iso-12100", "misuse", "risk-assessment", "human-factors"]
  ),
  q(
    "r-2-q7",
    "r-2",
    "multiple-choice",
    "After applying all risk reduction measures, ISO 12100 defines residual risk as:",
    [
      "The risk that exists after the machinery has been decommissioned.",
      "The risk remaining after all protective measures have been applied — which must be documented and communicated to users in the information for use.",
      "The maximum allowable risk level defined in the C-type standard for the machine category.",
      "The risk that is transferred to the end user's insurer.",
    ],
    1,
    "Residual risk per ISO 12100 is the risk remaining after protective measures are applied. Even with all measures in place, some risk remains. The designer must document residual risks in the instruction handbook (information for use) and specify required user training, PPE, and remaining hazardous conditions.",
    "medium",
    ["iso-12100", "residual-risk", "documentation"]
  ),
  q(
    "r-2-q8",
    "r-2",
    "multiple-choice",
    "ISO 12100 classifies standards as type A, B, or C. For a risk assessment on an industrial welding robot, which type(s) of standard take precedence?",
    [
      "Type A (basic safety concepts) always overrides type B and C.",
      "Type C (machinery-specific, e.g., ISO 10218-1 for industrial robots) takes precedence over type B (generic safeguarding, e.g., ISO 13857) when they conflict; type A (ISO 12100) provides the overarching framework.",
      "Type B standards always override type C since they are more general and widely applicable.",
      "All three types have equal precedence — the designer must average requirements.",
    ],
    1,
    "ISO 12100 §1 establishes the hierarchy: type C (machine-specific) > type B (safeguarding category) > type A (basic concepts). For a welding robot, ISO 10218-1 (type C) provides specific requirements that supersede generic ISO 13857 guard distance tables (type B) where the C standard addresses the same hazard.",
    "hard",
    ["iso-12100", "standard-types", "type-a-b-c", "hierarchy"]
  ),

  // ── Module r-3: PL / SIL Functional Safety ───────────────────────────────
  q(
    "r-3-q1",
    "r-3",
    "multiple-choice",
    "ISO 13849-1 defines Performance Level (PL) using five discrete levels (a through e). Which combination of Category, MTTFd, and DC achieves PL d?",
    [
      "Category 2, MTTFd = low, DC = none",
      "Category 3, MTTFd = high, DC = medium (DC_avg ≥ 60% < 90%)",
      "Category 1, MTTFd = medium, DC = none",
      "Category 4, MTTFd = high, DC = none",
    ],
    1,
    "PL d per ISO 13849-1 Table K.1 is achievable with Category 3, MTTFd = high (>30 years per channel), DC_avg = medium (60–90%). Category 3 means single fault does not lead to loss of safety function. This is the most common PL for collaborative robot safety functions.",
    "hard",
    ["iso-13849", "pl-d", "category-3", "mttfd", "dc"]
  ),
  q(
    "r-3-q2",
    "r-3",
    "multiple-choice",
    "In IEC 62061, what does 'SILCL' (SIL Claim Limit) represent for a subsystem?",
    [
      "The maximum SIL that a subsystem can achieve, based on its architecture and PFH regardless of how many identical channels are added.",
      "The minimum SIL required by the application specification.",
      "The SIL certified by the notified body for a safety device.",
      "The SIL of the entire safety function when multiple subsystems are combined.",
    ],
    0,
    "SILCL is an architectural constraint — the highest SIL a subsystem can contribute to a safety function, regardless of redundancy or diagnostic coverage. Adding redundant channels of a SILCL 2 subsystem cannot achieve SIL 3. This prevents over-claiming safety based on redundancy alone.",
    "hard",
    ["iec-62061", "silcl", "sil", "architecture"]
  ),
  q(
    "r-3-q3",
    "r-3",
    "multiple-choice",
    "What is the key mapping caveat when converting between PL (ISO 13849-1) and SIL (IEC 62061/IEC 61508)?",
    [
      "PL and SIL are perfectly equivalent: PL a = SIL 1, PL b = SIL 2, PL c = SIL 2, PL d = SIL 3, PL e = SIL 3.",
      "PL e maps uniquely to SIL 3; PL d maps to SIL 2 or SIL 3 depending on the PFH value; PL c maps to SIL 1 or SIL 2. The mapping is not 1:1 — PL captures architectural requirements that SIL alone does not.",
      "PL and SIL are mutually exclusive — a system must be assessed under one standard only.",
      "PL is used only for hardware; SIL applies to software, so direct comparison is meaningless.",
    ],
    1,
    "ISO TR 62061 and ISO 13849-1 Table 9 provide a mapping, but it is approximate. PL d corresponds to SIL 2 (PFH 10^-7 to 10^-6) but also includes structural requirements (Category, DC, CCF) that pure PFH-based SIL assessment may not capture. Using both standards for cross-validation is best practice.",
    "hard",
    ["pl", "sil", "iso-13849", "iec-62061", "mapping"]
  ),
  q(
    "r-3-q4",
    "r-3",
    "multiple-choice",
    "In ISO 13849-1, what does 'Diagnostic Coverage (DC)' measure?",
    [
      "The fraction of all component failures detected by the self-test, expressed as a percentage.",
      "The fraction of the dangerous failure rate detected by automatic diagnostic tests — higher DC means more dangerous failures are detected before they lead to loss of the safety function.",
      "The test interval in hours between proof tests of the safety function.",
      "The number of safety-related channels actively diagnosing each other.",
    ],
    1,
    "DC per ISO 13849-1 §3.1.26 = (rate of detected dangerous failures) / (rate of all dangerous failures). DC_avg across all channels is one of the three parameters (with Category and MTTFd) that determine PL. Higher DC (e.g., 99% = 'high') enables higher PL for a given architecture.",
    "medium",
    ["iso-13849", "diagnostic-coverage", "dc", "safety-function"]
  ),
  q(
    "r-3-q5",
    "r-3",
    "true-false",
    "True or false: a Category 4 architecture per ISO 13849-1 requires that a single fault AND a subsequent second fault do not lead to loss of the safety function.",
    ["True", "False"],
    0,
    "Category 4 is the highest structural category: it requires the safety function to be maintained even with a single fault (like Cat 3) AND requires that the accumulation of faults does not lead to loss of the safety function. High DC ensures faults are detected so the system is taken to a safe state before a second fault can accumulate.",
    "medium",
    ["iso-13849", "category-4", "architecture", "fault-tolerance"]
  ),
  q(
    "r-3-q6",
    "r-3",
    "multiple-choice",
    "What does CCF (Common Cause Failure) mean in the context of ISO 13849-1, and how does it affect redundant safety architectures?",
    [
      "CCF is a failure that affects only one channel of a safety system.",
      "CCF is a single event or shared root cause that defeats multiple redundant channels simultaneously — such as both channels using the same component type with a design flaw, or both being damaged by the same environmental event. CCF is estimated using the β-factor method.",
      "CCF is only relevant for software-based safety functions, not hardware.",
      "CCF refers to failures caused by incorrect calibration of the safety function.",
    ],
    1,
    "Redundancy is only effective against independent failures. CCF describes failures that defeat multiple channels simultaneously (same component, same environment, same software bug). ISO 13849-1 Annex F provides measures to reduce CCF (separation, diversity, protection against environment) and a scoring method.",
    "hard",
    ["iso-13849", "ccf", "common-cause-failure", "redundancy"]
  ),
  q(
    "r-3-q7",
    "r-3",
    "multiple-choice",
    "A collaborative robot safety function must achieve PL d. The designer uses a single safety relay with SILCL 2 and MTTFd = high. What is the problem?",
    [
      "There is no problem — SILCL 2 is sufficient for PL d.",
      "A single-channel (Category 1 or 2) architecture cannot achieve PL d regardless of MTTFd, because PL d requires Category 3 or 4 (redundant channels that tolerate a single fault without loss of safety function).",
      "MTTFd = high is too high for PL d — a lower MTTFd device must be used.",
      "The safety relay must be certified specifically under ISO 13849, not IEC 62061.",
    ],
    1,
    "PL d requires Category 3 or 4 architecture. Category 1 and 2 are single-channel designs where one fault can lead to loss of the safety function. No amount of high MTTFd or diagnostic coverage on a single channel achieves PL d — architectural redundancy is a structural requirement, not a probabilistic one.",
    "hard",
    ["iso-13849", "pl-d", "category", "single-channel", "architecture"]
  ),
  q(
    "r-3-q8",
    "r-3",
    "multiple-choice",
    "IEC 62061 defines SIL 3 by a target PFH (Probability of dangerous Failure per Hour) range. What is that range?",
    ["PFH ≥ 10^-5 to < 10^-4", "PFH ≥ 10^-8 to < 10^-7", "PFH ≥ 10^-7 to < 10^-6", "PFH < 10^-8"],
    1,
    "IEC 62061 Table 3: SIL 1 = 10^-6 to 10^-5, SIL 2 = 10^-7 to 10^-6, SIL 3 = 10^-8 to 10^-7. SIL 4 (not used in machinery) = <10^-8. The lower the PFH, the higher the SIL and the more reliable the safety function.",
    "medium",
    ["iec-62061", "sil-3", "pfh", "target-failure-rate"]
  ),

  // ── Module r-4: Collaborative Modes (SMS/HG/SSM/PFL) ─────────────────────
  q(
    "r-4-q1",
    "r-4",
    "multiple-choice",
    "ISO 10218-1:2025 defines four collaborative operation modes. Which mode requires the robot to stop completely when the human enters the collaborative workspace?",
    [
      "Power and Force Limiting (PFL)",
      "Speed and Separation Monitoring (SSM)",
      "Safety-rated Monitored Stop (SMS)",
      "Hand Guiding (HG)",
    ],
    2,
    "Safety-rated Monitored Stop (SMS): the robot can operate with safeguards open, but must perform a safety-rated monitored stop when a human enters the collaborative workspace. Once the human exits, the robot may resume. The stop is monitored by the safety system (not a normal E-stop).",
    "medium",
    ["iso-10218-1", "sms", "collaborative-modes", "monitored-stop"]
  ),
  q(
    "r-4-q2",
    "r-4",
    "multiple-choice",
    "In Hand Guiding (HG) collaborative mode, what is required of the robot control system?",
    [
      "The robot must slow to ≤250 mm/s when the operator approaches.",
      "The robot must be equipped with a hand guiding device that the operator uses to directly move the robot while a safety-rated monitored stop is maintained when the operator releases it; an enabling device or similar control is required.",
      "The robot must operate without any speed restriction when hand guided.",
      "Hand guiding requires the robot to predict the operator's intended path using AI.",
    ],
    1,
    "HG per ISO 10218-1:2025: the operator directly guides the robot via a hand guiding device. The robot performs a safety-rated monitored stop when not being guided. An enabling device (deadman switch) is required so the robot stops if the operator releases control. Speed and force limits also apply.",
    "medium",
    ["iso-10218-1", "hand-guiding", "enabling-device", "collaborative-mode"]
  ),
  q(
    "r-4-q3",
    "r-4",
    "multiple-choice",
    "Speed and Separation Monitoring (SSM) collaborative mode adjusts robot speed based on measured distance to the human. When the human is at the minimum protective distance, what must the robot do?",
    [
      "Maintain current speed and alert the operator.",
      "Perform a safety-rated monitored stop before the human reaches the protective distance.",
      "Increase speed to move the end-effector away from the operator.",
      "Switch to PFL mode automatically.",
    ],
    1,
    "SSM uses a sensing system (laser scanner, camera) to measure the distance between human and robot. As distance decreases, robot speed decreases proportionally. At the minimum protective distance (where stopping distance equals actual separation), the robot must have already achieved a safety-rated monitored stop.",
    "hard",
    ["iso-10218-1", "ssm", "protective-distance", "speed-monitoring"]
  ),
  q(
    "r-4-q4",
    "r-4",
    "multiple-choice",
    "Which ISO 10218-1:2025 collaborative mode requires NO physical separation between robot and human, instead limiting contact forces to biomechanical thresholds?",
    [
      "Safety-rated Monitored Stop (SMS)",
      "Hand Guiding (HG)",
      "Speed and Separation Monitoring (SSM)",
      "Power and Force Limiting (PFL)",
    ],
    3,
    "PFL is the only collaborative mode designed for intentional physical contact. The robot limits its power and clamping/impact forces to biomechanically tolerable thresholds defined in ISO/TS 15066 Annex A (and incorporated in ISO 10218-1:2025). This allows true human-robot collaboration without physical guards.",
    "medium",
    ["iso-10218-1", "pfl", "biomechanical", "collaborative-mode"]
  ),
  q(
    "r-4-q5",
    "r-4",
    "true-false",
    "True or false: according to ISO 10218-1:2025, more than one collaborative mode can be active simultaneously in a single robot application.",
    ["True", "False"],
    0,
    "True. ISO 10218-1:2025 explicitly permits combining collaborative modes. A common example: SSM active during robot motion to reduce speed as the human approaches, automatically switching to SMS (monitored stop) when the human enters a closer zone, and then allowing HG for manual positioning.",
    "medium",
    ["iso-10218-1", "collaborative-modes", "combined-modes"]
  ),
  q(
    "r-4-q6",
    "r-4",
    "multiple-choice",
    "For Speed and Separation Monitoring, what factors determine the minimum protective distance between robot and human?",
    [
      "Only the robot's current TCP speed divided by its maximum deceleration.",
      "The sum of: robot stopping distance at current speed, human approach speed × system reaction time, and any measurement uncertainty of the sensing system.",
      "The robot's rated payload and the operator's mass.",
      "A fixed value of 500mm specified by ISO 10218-1 for all SSM applications.",
    ],
    1,
    "The protective distance formula (from ISO/TS 15066 and ISO 10218-1:2025) accounts for: human approach speed (≥1600 mm/s per ISO 13855 for walking), system reaction time, robot stopping time at current speed, position/measurement uncertainty, and intrusion depth of the sensing zone boundary. All must be summed.",
    "hard",
    ["ssm", "protective-distance", "calculation", "iso-15066"]
  ),
  q(
    "r-4-q7",
    "r-4",
    "multiple-choice",
    "A collaborative robot application uses PFL mode. The hazard analysis identifies the shoulder as a potentially contacted body region. According to ISO/TS 15066 Annex A, which contact type has the lower (more restrictive) force threshold?",
    [
      "Transient contact (impact), because it involves higher peak force in a short time.",
      "Quasi-static contact (clamping), because the robot continues to push and the body region cannot retract, leading to sustained force application.",
      "Both thresholds are identical — ISO/TS 15066 does not distinguish by contact type.",
      "Transient and quasi-static thresholds only differ for the hand; they are identical for the shoulder.",
    ],
    1,
    "ISO/TS 15066 Annex A distinguishes transient (impact, brief) and quasi-static (clamping, sustained) contact. Quasi-static thresholds are lower because the human cannot pull away — sustained force leads to greater injury potential. For most body regions, quasi-static limits are 50–100% of transient limits.",
    "hard",
    ["pfl", "iso-ts-15066", "quasi-static", "transient", "biomechanical"]
  ),
  q(
    "r-4-q8",
    "r-4",
    "multiple-select",
    "Which of the following are required preconditions for using PFL collaborative mode under ISO 10218-1:2025? Select all that apply.",
    [
      "A risk assessment confirming that contact forces are within biomechanical limits under worst-case conditions.",
      "The robot TCP speed must not exceed 250 mm/s at all times during PFL operation.",
      "The robot's safety-rated power and force limiting function must be validated and must meet the required Performance Level.",
      "Physical barriers must be installed around the full robot workspace.",
    ],
    [0, 2],
    "PFL requires: (a) a risk assessment validating that contact forces/pressures meet ISO/TS 15066 Annex A thresholds, and (b) the PFL safety function must meet a required PL (typically PL d per the risk assessment). The 250 mm/s limit is specifically for SSM, not PFL. Physical barriers defeat the purpose of PFL collaborative mode.",
    "hard",
    ["pfl", "iso-10218-1", "risk-assessment", "performance-level"]
  ),

  // ── Module r-5: PFL Validation & R15.806 ──────────────────────────────────
  q(
    "r-5-q1",
    "r-5",
    "multiple-choice",
    "ANSI/RIA R15.806 is the primary standard for validating PFL collaborative robot applications in North America. What is the measurement it specifies for contact force validation?",
    [
      "Visual inspection of the robot's force/torque sensor calibration certificate.",
      "Direct measurement of contact forces and pressures at representative contact points using a biomechanical measurement device (instrumented test tool) under worst-case application conditions.",
      "Simulation-only validation using the robot manufacturer's certified digital twin.",
      "A declaration of conformity from the cobot manufacturer that the rated payload at the tested speed meets ISO/TS 15066.",
    ],
    1,
    "R15.806 requires physical measurement using a calibrated force/pressure measurement device at actual contact points under actual application speeds and trajectories. Manufacturer declarations and simulation alone are insufficient — measurements must be taken in the actual application configuration.",
    "medium",
    ["r15-806", "pfl-validation", "force-measurement", "contact-force"]
  ),
  q(
    "r-5-q2",
    "r-5",
    "multiple-choice",
    "What is the FPMD (Force and Pressure Measurement Device) used in R15.806 validation, and what must it be capable of?",
    [
      "Any calibrated load cell with ≥10 N resolution.",
      "A multi-axis instrumented device that simultaneously measures contact force and contact pressure at the point of contact, with sufficient bandwidth to capture transient impact peaks.",
      "The robot's internal force/torque sensor mounted at the flange.",
      "A pressure-sensitive film (Fuji Prescale) applied to the test surface.",
    ],
    1,
    "R15.806 specifies an FPMD that measures both force (N) and pressure (N/cm²) — ISO/TS 15066 Annex A has separate limits for each. The device must have sufficient frequency response to capture transient impacts (which are brief, high-peak events). Internal robot sensors are not acceptable as they measure at the flange, not at the contact surface.",
    "hard",
    ["r15-806", "fpmd", "force-measurement", "pressure-measurement"]
  ),
  q(
    "r-5-q3",
    "r-5",
    "true-false",
    "True or false: R15.806 validation measurements must be taken at the actual application speed and trajectory, not at the robot's maximum rated speed.",
    ["True", "False"],
    0,
    "True. Validation must reflect the actual application conditions — speed, direction, end-effector configuration, and payload. The application speed is a design choice; what R15.806 validates is that the measured forces at that speed remain within ISO/TS 15066 Annex A limits. If the application speed changes, re-validation is required.",
    "medium",
    ["r15-806", "validation", "application-speed", "measurement"]
  ),
  q(
    "r-5-q4",
    "r-5",
    "multiple-choice",
    "According to R15.806, when PFL measurements exceed ISO/TS 15066 Annex A limits at the application speed, what corrective options are available?",
    [
      "The application must switch to SMS mode — no corrective options exist within PFL.",
      "Reduce TCP speed, reduce payload, modify the end-effector to reduce contact stiffness, modify the trajectory to avoid the contact geometry, or add compliance to the robot system — then re-measure to verify compliance.",
      "Accept the exceedance and document it as a known risk.",
      "Apply a 10% safety factor margin to the measured value and re-declare compliance.",
    ],
    1,
    "R15.806 does not allow accepting exceedances. Corrective options are engineering changes: reduce speed (the most direct lever), reduce payload, modify end-effector geometry/compliance, change trajectory. Each change requires re-measurement because PFL compliance is empirically verified, not calculated.",
    "hard",
    ["r15-806", "corrective-action", "pfl", "iso-ts-15066"]
  ),
  q(
    "r-5-q5",
    "r-5",
    "multiple-choice",
    "ISO/TS 15066 Annex A provides biomechanical limits for body regions. For the skull (top of head), why are the force and pressure limits notably different from those of the hand?",
    [
      "The skull has lower limits because it is more frequently in the robot's path.",
      "The skull is more sensitive to impact — its tissue is thinner over bone, so pain threshold is reached at lower force/pressure. However, skull limits are actually higher than hand limits in some categories because the skull bone provides rigid backing.",
      "The skull limits are undefined — ISO/TS 15066 excludes head contact from PFL applications.",
      "Skull limits are identical to hand limits since they are both bony prominences.",
    ],
    1,
    "ISO/TS 15066 Annex A provides separate limits for each body region based on biomechanical research (pain threshold, injury threshold). Skull has a bony rigid backing, so pressure limits consider the rigidity. Some regions with soft tissue over bone (like the sternum) have stricter limits. The values are body-region-specific — not intuitive without consulting the table.",
    "hard",
    ["iso-ts-15066", "biomechanical-limits", "skull", "body-region"]
  ),
  q(
    "r-5-q6",
    "r-5",
    "multiple-choice",
    "In a PFL validation per R15.806, the measurement device records a peak transient force of 148 N at the operator's forearm. ISO/TS 15066 Annex A lists the forearm transient limit as 160 N and quasi-static limit as 75 N. Is this measurement compliant?",
    [
      "Yes — 148 N is below the 160 N transient limit.",
      "Only if the contact duration was less than 0.5 seconds.",
      "Yes for transient, but the measurement alone is insufficient — the quasi-static force must also be verified separately to ensure it is below 75 N.",
      "No — any reading above 100 N is non-compliant under R15.806.",
    ],
    2,
    "R15.806 requires compliance with BOTH transient (impact) AND quasi-static (clamping) limits. A 148 N reading that is purely transient passes the 160 N limit — but if the robot can clamp the forearm at 148 N, the quasi-static 75 N limit is violated. Both contact types must be assessed and measured.",
    "hard",
    ["r15-806", "iso-ts-15066", "transient", "quasi-static", "compliance"]
  ),
  q(
    "r-5-q7",
    "r-5",
    "multiple-choice",
    "What documentation must be produced at the conclusion of a successful R15.806 PFL validation?",
    [
      "A CE Declaration of Conformity signed by the cobot manufacturer.",
      "A validation report including: robot configuration, application speed and payload, FPMD device identification and calibration status, measurement points and body regions tested, measured values, applicable ISO/TS 15066 Annex A limits, and pass/fail determination for each measurement.",
      "Only the FPMD data logs — no written report is required.",
      "A risk assessment update noting the PFL mode is now in use.",
    ],
    1,
    "R15.806 specifies documentation requirements for the validation record. The report must be traceable: who performed it, what device was used (with calibration certificate reference), what was measured, under what conditions, and the result against the Annex A limits. This record supports both regulatory compliance and future re-validation when the application changes.",
    "medium",
    ["r15-806", "validation-report", "documentation", "traceability"]
  ),
  q(
    "r-5-q8",
    "r-5",
    "multiple-choice",
    "A robot application is initially validated under R15.806 at a given speed and payload. The production engineer later increases the robot's TCP speed by 15% to improve throughput. What is required?",
    [
      "Nothing — the original validation remains valid as long as the speed stays below the robot's rated maximum.",
      "A new R15.806 validation must be performed at the new speed, because impact force is velocity-dependent and the previous measurements at the lower speed cannot be extrapolated.",
      "The original validation can be updated by multiplying measured forces by the speed ratio.",
      "Notify the cobot manufacturer and they will issue an updated declaration.",
    ],
    1,
    "Contact force in a transient impact depends on impact velocity (approximately proportional to v² for kinetic energy considerations). A 15% speed increase can significantly change peak forces. R15.806 validation is application-specific — any change to speed, payload, end-effector, or trajectory requires re-validation.",
    "hard",
    ["r15-806", "re-validation", "speed-change", "application-change"]
  ),

  // ── Module r-6: ROS 2 Ecosystem ───────────────────────────────────────────
  q(
    "r-6-q1",
    "r-6",
    "multiple-choice",
    "ROS 2 uses DDS (Data Distribution Service) as its middleware. What key capability does DDS provide over ROS 1's custom middleware?",
    [
      "DDS provides a simpler API requiring less code for publishers and subscribers.",
      "DDS provides QoS (Quality of Service) policies, peer-to-peer discovery without a central master, and real-time capable communication, enabling robust multi-robot and distributed systems.",
      "DDS replaces the ROS 2 node model with a centralized broker architecture.",
      "DDS is only used for communication between different programming languages (C++ and Python).",
    ],
    1,
    "ROS 2's shift to DDS eliminated the central `roscore` master and introduced configurable QoS (reliability, durability, deadline, liveliness). DDS peer-to-peer discovery enables multi-machine and multi-robot systems without a single point of failure. RCLCPP/RCLPY are abstraction layers over the DDS implementation (FastDDS, CycloneDDS, etc.).",
    "medium",
    ["ros2", "dds", "qos", "middleware"]
  ),
  q(
    "r-6-q2",
    "r-6",
    "multiple-choice",
    "As of 2026, which ROS 2 distribution is the current LTS (Long Term Support) release, and until when is it supported?",
    [
      "ROS 2 Humble Hawksbill — LTS until May 2027",
      "ROS 2 Jazzy Jalisco — LTS until May 2029",
      "ROS 2 Iron Irwini — LTS until November 2024",
      "ROS 2 Rolling Ridley — LTS until 2030",
    ],
    1,
    "ROS 2 Jazzy Jalisco (released May 2024) is the current LTS release, supported until May 2029. ROS 2 Humble (May 2022–May 2027) is also an LTS. Iron (non-LTS, EOL Nov 2024) and Rolling (always latest, no fixed EOL) are also releases but not LTS.",
    "medium",
    ["ros2", "jazzy", "lts", "distribution"]
  ),
  q(
    "r-6-q3",
    "r-6",
    "multiple-choice",
    "In ROS 2, what is the difference between a topic and a service?",
    [
      "Topics use TCP; services use UDP.",
      "Topics provide asynchronous publish-subscribe communication (many-to-many, no response expected). Services provide synchronous request-response communication (one-to-one, with a typed response).",
      "Topics are only for sensor data; services are only for actuator commands.",
      "Services are deprecated in ROS 2 — actions should be used instead.",
    ],
    1,
    "Topics: publisher sends messages to any number of subscribers; no acknowledgment or response. Services: a client sends a request, a server responds once. For long-running tasks with feedback, ROS 2 Actions (built on topics + services) are used instead. All three exist and are current in ROS 2.",
    "easy",
    ["ros2", "topic", "service", "publish-subscribe"]
  ),
  q(
    "r-6-q4",
    "r-6",
    "multiple-choice",
    "What is `nav2` (Navigation2) in the ROS 2 ecosystem?",
    [
      "A ROS 2 package for real-time joint trajectory control of robot arms.",
      "The ROS 2 navigation stack providing behavior-tree-based navigation, SLAM integration, path planning, and costmap management for mobile robots.",
      "A simulation environment for testing ROS 2 nodes in virtual environments.",
      "A tool for recording and replaying ROS 2 bag files.",
    ],
    1,
    "Nav2 is the successor to ROS 1 Navigation stack. It provides lifecycle-managed nodes for localization (AMCL), mapping (SLAM Toolbox), global/local planners, recovery behaviors (via behavior trees), and costmap layers — the full stack for an autonomous mobile robot.",
    "medium",
    ["ros2", "nav2", "navigation", "mobile-robot"]
  ),
  q(
    "r-6-q5",
    "r-6",
    "multiple-choice",
    "In ROS 2, what is a 'lifecycle node' and why is it important for safety-critical robot software?",
    [
      "A node that logs all topic messages to disk for later analysis.",
      "A managed node with defined states (Unconfigured → Inactive → Active → Finalized) and explicit transitions, allowing the system to configure, activate, deactivate, and shut down components in a controlled and predictable order.",
      "A node that automatically restarts when it crashes.",
      "A node that runs only on the primary compute unit and never on secondary processors.",
    ],
    1,
    "Lifecycle nodes (per ROS 2 design) provide deterministic startup and shutdown sequences. A hardware driver lifecycle node can be configured before activation, ensuring parameters are set before hardware communication begins. This predictability is essential for safety — uncontrolled startup order can leave hardware in undefined states.",
    "hard",
    ["ros2", "lifecycle-node", "managed-node", "safety"]
  ),
  q(
    "r-6-q6",
    "r-6",
    "true-false",
    "True or false: SROS 2 (Secure ROS 2) provides authentication and encryption at the DDS layer, enabling access control between ROS 2 nodes.",
    ["True", "False"],
    0,
    "SROS 2 uses DDS Security (OMG DDS-Security specification) to provide authentication (DH-based), access control (XML permission files), and encryption (AES-GCM) between nodes. It enables per-topic publish/subscribe access control so a sensor node cannot publish to a safety-critical command topic.",
    "medium",
    ["ros2", "sros2", "dds-security", "authentication"]
  ),
  q(
    "r-6-q7",
    "r-6",
    "multiple-choice",
    "What is `ros2_control` and what problem does it solve?",
    [
      "A debugging tool for monitoring ROS 2 node CPU usage.",
      "A hardware abstraction framework providing standardized interfaces (hardware interfaces, controllers, controller manager) that decouple high-level motion controllers from specific hardware drivers.",
      "An alternative to `nav2` for manipulator motion planning.",
      "A package for visualizing robot models in RViz2.",
    ],
    1,
    "`ros2_control` separates the 'what to do' (controllers: PID joint position, MoveIt, etc.) from 'how to talk to hardware' (hardware interfaces: serial, EtherCAT, CAN). The controller manager handles real-time loading/unloading of controllers and enforces execution boundaries — critical for robot arm control.",
    "hard",
    ["ros2", "ros2-control", "hardware-interface", "controller-manager"]
  ),
  q(
    "r-6-q8",
    "r-6",
    "multiple-choice",
    "In ROS 2, what is a 'bag file' (`.db3` / `.mcap`) and what is its primary use in robotics development?",
    [
      "A compressed archive of ROS 2 package source code for distribution.",
      "A timestamped recording of ROS 2 topic messages that can be replayed to reproduce robot behavior for debugging, algorithm development, and regression testing without requiring the physical robot.",
      "A binary configuration file for the DDS middleware.",
      "A container format for robot URDF models and mesh files.",
    ],
    1,
    "ROS 2 bag files record serialized topic messages with timestamps using `ros2 bag record`. Replay with `ros2 bag play` feeds the exact same data stream back into the ROS 2 graph. This is indispensable for debugging rare events, testing new algorithms offline, and CI regression testing against captured real-world data.",
    "easy",
    ["ros2", "bag-file", "recording", "replay", "debugging"]
  ),

  // ── Module r-7: Robot Cybersecurity (IEC 62443) ───────────────────────────
  q(
    "r-7-q1",
    "r-7",
    "multiple-choice",
    "IEC 62443 organizes industrial cybersecurity into a zone-and-conduit model. What is a 'zone' in this context?",
    [
      "A geographic area of the factory floor with physical access controls.",
      "A logical grouping of assets (devices, systems, software) that share common security requirements and are protected as a group.",
      "A demilitarized zone (DMZ) network segment between OT and IT networks.",
      "A firewall rule set applied to a specific subnet.",
    ],
    1,
    "IEC 62443-3-2 defines a zone as a grouping of logical and physical assets sharing the same security requirements and targeted by the same threat actors. Zones are defined by their Security Level (SL) target. Conduits are communication paths between zones, also assigned SLs.",
    "medium",
    ["iec-62443", "zone", "conduit", "cybersecurity"]
  ),
  q(
    "r-7-q2",
    "r-7",
    "multiple-choice",
    "IEC 62443 defines Security Levels (SL) 1 through 4. What does SL 2 represent?",
    [
      "Protection against casual or coincidental violation using simple means.",
      "Protection against intentional violation using simple means with low motivation and few resources — the typical industrial insider or opportunistic attacker.",
      "Protection against sophisticated attacks with significant resources and advanced skills.",
      "Protection against state-sponsored attacks with access to insider knowledge.",
    ],
    1,
    "IEC 62443-1-1: SL 1 = casual/coincidental, SL 2 = intentional with simple means/low resources, SL 3 = sophisticated/motivated attacker with significant resources, SL 4 = state-level adversary. Most industrial robot systems target SL 2 or SL 3 depending on criticality.",
    "medium",
    ["iec-62443", "security-level", "sl-2", "threat-model"]
  ),
  q(
    "r-7-q3",
    "r-7",
    "multiple-choice",
    "ISO 10218-1:2025 includes cybersecurity requirements for industrial robots. What is one explicitly required technical control?",
    [
      "All robot network communication must use 256-bit AES encryption.",
      "Robot control systems must support user authentication and authorization, preventing unauthorized access to safety-rated functions and programming interfaces.",
      "Robots must be air-gapped from all external networks.",
      "Proprietary communication protocols must be replaced with open standards.",
    ],
    1,
    "ISO 10218-1:2025 (new in the 2025 revision) adds cybersecurity requirements drawn from IEC 62443. Key requirements include: access control/authentication for programming and safety parameter modification, protection of safety function integrity from unauthorized modification, and secure communication for robot systems connected to networks.",
    "hard",
    ["iso-10218-1", "cybersecurity", "access-control", "authentication"]
  ),
  q(
    "r-7-q4",
    "r-7",
    "multiple-choice",
    "In IEC 62443's Security Level framework, what is the difference between SL-T (Target), SL-C (Capability), and SL-A (Achieved)?",
    [
      "They are three names for the same concept applied to different document versions.",
      "SL-T is the security level required by the risk assessment. SL-C is the security level a product is capable of supporting (from vendor documentation). SL-A is the security level actually achieved in the deployed system after all countermeasures are applied.",
      "SL-T applies to subsystems; SL-C applies to the overall system; SL-A applies to zones.",
      "SL-C and SL-A are identical; SL-T is the regulatory minimum.",
    ],
    1,
    "IEC 62443-3-3 uses this three-way distinction: SL-T comes from the risk assessment (what level do we need?), SL-C comes from product suppliers (what can this device achieve?), SL-A is measured post-deployment (what did we actually achieve?). SL-A ≥ SL-T is the compliance goal.",
    "hard",
    ["iec-62443", "sl-t", "sl-c", "sl-a", "security-level"]
  ),
  q(
    "r-7-q5",
    "r-7",
    "multiple-choice",
    "A robot's teach pendant is connected wirelessly to the robot controller on the plant floor. From a cybersecurity perspective, what is the primary concern and appropriate IEC 62443 countermeasure?",
    [
      "The teach pendant is too heavy — ergonomic risk is the primary concern.",
      "Wireless communication is inherently insecure on the plant floor — the conduit between the teach pendant zone and controller zone must be secured with mutual authentication and encrypted communication (e.g., WPA3 + certificate-based auth) to prevent rogue command injection.",
      "Wireless teach pendants are prohibited by IEC 62443 in all industrial settings.",
      "The robot should use a wired-only pendant — IEC 62443 does not address wireless.",
    ],
    1,
    "A wireless teach pendant is a high-value attack target: compromising it gives physical robot control. IEC 62443 treats this as a conduit crossing a zone boundary. The conduit must enforce strong authentication (so only the legitimate pendant can connect), integrity (commands cannot be tampered), and optionally confidentiality (so motion programs are not exposed).",
    "medium",
    ["iec-62443", "teach-pendant", "wireless", "conduit-security"]
  ),
  q(
    "r-7-q6",
    "r-7",
    "true-false",
    "True or false: patching robot control system firmware introduces cybersecurity risks that must themselves be managed — for example, by verifying cryptographic signatures on firmware images before installation.",
    ["True", "False"],
    0,
    "Patch management is a cybersecurity control, but patching itself is an attack vector: supply chain attacks can deliver malicious firmware via legitimate-looking updates. IEC 62443 requires integrity verification of patches (code signing, hash verification from trusted source) as part of the update process.",
    "medium",
    ["iec-62443", "patch-management", "supply-chain", "firmware-signing"]
  ),
  q(
    "r-7-q7",
    "r-7",
    "multiple-choice",
    "What is 'defense in depth' in the context of IEC 62443 robot cybersecurity?",
    [
      "Using multiple robot joints to provide mechanical redundancy against physical attack.",
      "Applying multiple overlapping layers of security controls (network segmentation, authentication, encryption, monitoring, physical security) so that a breach of one layer does not immediately compromise the entire system.",
      "Installing a single high-quality firewall rated to the required Security Level.",
      "A hardware token system that prevents any network access to the robot controller.",
    ],
    1,
    "IEC 62443 promotes defense in depth: no single security measure is perfect, so multiple independent controls are stacked. For a robot: network segmentation (zone/conduit), authentication at the controller, encrypted communication, audit logging, physical access control, and monitoring — each provides partial protection and together they provide resilience.",
    "medium",
    ["iec-62443", "defense-in-depth", "layered-security"]
  ),
  q(
    "r-7-q8",
    "r-7",
    "multiple-choice",
    "A cybersecurity incident response plan for a robot cell should include which of the following, per IEC 62443 guidance?",
    [
      "Only documentation of the incident after it is resolved.",
      "Detection/identification of the incident, isolation of affected systems (disconnecting the compromised robot from the network), evidence preservation, root cause analysis, remediation, and restoration to verified clean state — all following a documented and tested procedure.",
      "Automatic factory reset of the robot controller firmware without human review.",
      "Immediate restart of all robot controllers to clear volatile memory.",
    ],
    1,
    "IEC 62443-2-1 requires an incident response procedure. Key phases: detect → contain → preserve evidence → analyze → remediate → restore → review. Automatic reset destroys forensic evidence and may re-introduce the vulnerability if the root cause is not understood. Isolation before restoration prevents further compromise during investigation.",
    "hard",
    ["iec-62443", "incident-response", "containment", "remediation"]
  ),

  // ── Module r-8: Capstone ──────────────────────────────────────────────────
  q(
    "r-8-q1",
    "r-8",
    "multiple-choice",
    "A system integrator is deploying a collaborative robot for manual assembly assistance. The task requires the robot to hand a part directly to an operator (contact expected). Which ISO standards form the minimum required compliance basis?",
    [
      "ISO 12100 only — general risk assessment is sufficient.",
      "ISO 12100 (risk assessment methodology), ISO 10218-1 (robot safety requirements — PFL mode), ISO/TS 15066 (collaborative operation biomechanical limits), and ANSI/RIA R15.806 (North America PFL validation) if deployed in the US.",
      "ISO 8373 and ISO 10218-2 only — vocabulary and installation standards cover all requirements.",
      "IEC 62443 only — cybersecurity is the primary concern for connected robots.",
    ],
    1,
    "A PFL application requires: ISO 12100 for the risk assessment framework, ISO 10218-1:2025 for robot safety requirements including PFL mode specification, ISO/TS 15066 for the biomechanical contact force/pressure limits, and R15.806 for the physical measurement validation methodology in North America. All four are required — each addresses a different layer.",
    "hard",
    ["pfl", "iso-10218-1", "iso-12100", "iso-ts-15066", "r15-806", "capstone"]
  ),
  q(
    "r-8-q2",
    "r-8",
    "multiple-choice",
    "During a collaborative robot risk assessment, the team identifies a pinch point between the robot's forearm link and a fixed machine frame. The gap closes to 30mm during normal operation. What is the correct risk reduction approach under ISO 12100?",
    [
      "Apply a warning label near the pinch point.",
      "First attempt inherently safe design (redesign the trajectory or add a fixed guard to eliminate the gap). If that is not feasible, apply safeguarding (presence detection, position-based speed reduction). Information for use is the last resort and insufficient alone for a significant pinch hazard.",
      "Switch to PFL mode to limit the clamping force to ISO/TS 15066 limits and document as residual risk.",
      "If the gap is 30mm (below 50mm entrapment threshold per ISO 13854), no action is required.",
    ],
    1,
    "ISO 12100 three-step hierarchy: Step 1 (preferred) — eliminate the hazard by design (change trajectory to avoid closing the gap, or guard the fixed frame to prevent access). Switching to PFL addresses force limiting but does not eliminate the geometry hazard. ISO 13854 specifies minimum gaps to prevent body part entrapment — 30mm is below safe limits for fingers.",
    "hard",
    ["iso-12100", "risk-reduction", "pinch-point", "hierarchy"]
  ),
  q(
    "r-8-q3",
    "r-8",
    "multiple-choice",
    "A safety function monitors robot TCP speed to implement SSM (Speed and Separation Monitoring). The risk assessment determines PL d is required. The integrator proposes using a single safety PLC with SIL 2 certification. What is the gap?",
    [
      "No gap — SIL 2 maps to PL d and is sufficient.",
      "PL d requires Category 3 or 4 architecture with redundant channels. A single safety PLC may be SIL 2 capable in isolation but cannot achieve PL d without a redundant (dual-channel) architecture for the complete safety function, including the sensing system and output actuator.",
      "The safety PLC must be certified under ISO 13849, not IEC 62061.",
      "SSM requires PL e, not PL d.",
    ],
    1,
    "The PL d requirement covers the complete safety function (sensor → logic → actuator). PL d requires Category 3 (single fault tolerated). A single-channel safety PLC alone — even if SIL 2 rated — implements at most Category 2 for the function as a whole unless redundant sensing and independent output channels are used. The SIL/SILCL of a product is a necessary but not sufficient condition for achieving a PL.",
    "hard",
    ["ssm", "pl-d", "category-3", "safety-plc", "architecture", "capstone"]
  ),
  q(
    "r-8-q4",
    "r-8",
    "multiple-choice",
    "An integrator has deployed a collaborative robot with SROS 2 on ROS 2 Jazzy. The IEC 62443 zone assessment requires SL 2 for the robot zone. What must the integrator verify about the SROS 2 configuration?",
    [
      "That the ROS 2 bag recorder is enabled for all topics.",
      "That SROS 2 access control policies are correctly configured so only authorized nodes can publish to command topics, DDS security is enforced on all inter-node communication within and crossing the zone boundary, and credentials are managed (not default).",
      "That the nav2 stack is updated to the latest version.",
      "That the robot uses FastDDS exclusively, as CycloneDDS does not support SROS 2.",
    ],
    1,
    "SROS 2 is a mechanism, not a guarantee of SL 2. To achieve SL 2, the integrator must: configure non-default credentials (default certs = no security), define access control policies restricting which nodes can publish to safety-relevant topics, ensure encryption is enabled, and verify the configuration is applied and not bypassable. SL 2 also requires monitoring and audit logging.",
    "hard",
    ["sros2", "iec-62443", "sl-2", "access-control", "ros2", "capstone"]
  ),
  q(
    "r-8-q5",
    "r-8",
    "multiple-choice",
    "A robot cell integrator receives an updated firmware package from the robot manufacturer via email. What steps are required before installing it in a production collaborative robot application?",
    [
      "Install immediately — manufacturers always send safe firmware.",
      "Verify the firmware's cryptographic signature against the manufacturer's published public key, test the update on a non-production system, re-run safety function validation (R15.806 / PL verification) if the update may affect safety functions, and update the risk assessment documentation before deploying to production.",
      "Forward the email to the safety team and install the firmware at the next scheduled maintenance window.",
      "Only updates received via the robot's built-in update interface are valid — email delivery is automatically suspect and must be rejected.",
    ],
    1,
    "Supply chain integrity: cryptographic signature verification is mandatory. Functional regression: any firmware change may affect safety function behavior — re-validation is required if safety-relevant components changed. Process: non-production test, regression validation, document approval before production deployment. This is the confluence of IEC 62443 (supply chain) and ISO 13849/ISO 10218-1 (safety function validation).",
    "hard",
    ["firmware-update", "supply-chain", "iec-62443", "validation", "capstone"]
  ),
  q(
    "r-8-q6",
    "r-8",
    "multiple-choice",
    "A collaborative robot application uses PFL mode (ISO 10218-1:2025). After six months in production, the end-effector tooling is replaced with a heavier tool that has a sharper edge profile. What is required before resuming production?",
    [
      "Nothing — PFL mode is self-adapting to the new tool.",
      "A new ISO 12100 risk assessment for the modified configuration, new ISO/TS 15066 biomechanical analysis for the new end-effector geometry, and new R15.806 physical force/pressure measurements — because the sharp edge increases contact pressure even at the same force, and the increased mass changes impact dynamics.",
      "Only a visual inspection of the new tool for sharp edges.",
      "Re-validate only if the new tool exceeds the robot's rated payload.",
    ],
    1,
    "End-effector changes materially affect PFL compliance. Increased mass changes impact forces (F = ma). Sharp edges concentrate force into smaller areas, dramatically increasing contact pressure (P = F/A) even at the same force. Both mass and geometry are inputs to the R15.806 measurement and ISO/TS 15066 comparison. Any change = re-validate.",
    "hard",
    ["pfl", "r15-806", "end-effector", "change-management", "capstone"]
  ),
  q(
    "r-8-q7",
    "r-8",
    "multiple-choice",
    "In a ROS 2-based autonomous mobile robot (AMR) operating in a collaborative mode alongside pedestrians, the nav2 planner is responsible for path planning. What is the safety architecture gap if the nav2 planner is the sole safety function preventing collision?",
    [
      "No gap — nav2 uses safety-certified algorithms.",
      "Nav2 is general-purpose software not designed or certified to any functional safety standard (ISO 13849, IEC 62061). Safety functions must be implemented in a separately validated, safety-rated system (safety laser scanner with SIL/PL rated I/O). Nav2 can supplement but cannot be the sole layer for a safety function.",
      "The gap is that nav2 does not support PFL mode — a PFL controller must be added.",
      "Nav2 must be replaced with a ROS 2 lifecycle-managed node to be safety-valid.",
    ],
    1,
    "Nav2 and ROS 2 are not certified safety software. Safety functions for AMRs in collaborative spaces must be implemented on safety-rated hardware (safety laser scanners, safety-rated controllers) following ISO 13849 or IEC 62061. Nav2 can provide high-level path planning; the safety layer enforces speed/stop regardless of what the planner outputs.",
    "hard",
    ["ros2", "nav2", "amr", "safety-function", "iso-13849", "capstone"]
  ),
  q(
    "r-8-q8",
    "r-8",
    "multiple-choice",
    "A collaborative robot application has passed all safety validations and is in production. The integrator must maintain a technical file. Which statement best describes what the technical file must contain?",
    [
      "Only the robot manufacturer's Declaration of Conformity for the robot itself.",
      "The complete risk assessment (ISO 12100), all safety function specifications and PL/SIL verification records, collaborative operation validation records (R15.806 measurements), any applicable test reports, the instructions for use, and evidence that the system as installed meets all applicable essential safety requirements — updated whenever the system configuration changes.",
      "The maintenance log and spare parts list only.",
      "A statement signed by the safety officer that the installation is safe.",
    ],
    1,
    "Under the EU Machinery Directive (and ISO 10218-2 globally), the technical file must be comprehensive: risk assessment, design documentation, safety function analysis and PL/SIL calculation, test records (including PFL measurements), instructions for use, and declarations. It must be maintained current — a changed configuration without updated documentation is a compliance gap.",
    "hard",
    ["technical-file", "machinery-directive", "iso-10218-2", "documentation", "capstone"]
  ),
];
