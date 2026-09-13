# Engineering Judgment Practice 1.0

Status: internal authoring and evaluation contract, September 2026. This supplements LP-1.0; it does not replace prerequisite teaching or establish accreditation. Dura-specific learning efficacy and this rubric's reliability have not been validated.

## Required case structure

Each versioned case must state a bounded decision, affected people, binding constraints, distinguish observations from assumptions, and offer at least two defensible alternatives under some stated circumstances. A deliberately weak option may expose a misconception but cannot replace meaningful alternatives. Prerequisite links must resolve to actual teaching; a phase landing page is orientation, not proof that a learner has the necessary knowledge. Explain unfamiliar operational terms within the brief or link a specific lesson.

Require the learner to commit an initial rationale before counterevidence is shown. The rationale must identify uncertainty, compare alternatives on common criteria, apply a source within its scope, define observable validation and a stop/rollback rule. Reveal new evidence that challenges an assumption, then require a justified revision. Retaining the same option is valid if the reasoning responds to the new information. Confidence is a self-report, not a calibrated probability of correctness.

Show the worked comparison after the learner attempts the task; explain why it is defensible and where another answer could be acceptable. End with a different-context transfer prompt. A guided label alone is not scaffolding: teachers should model one explanation, ask the learner to explain it, then fade prompts on a different case. Do not reveal one case's final answer before recording the same case's initial attempt when using it as an assessment.

## Evidence levels and claims

| Evidence available                                                  | Permitted conclusion                                 | Not established                                |
| ------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------- |
| Required fields present                                             | A response was recorded                              | Reasoning quality or correctness               |
| Learner rubric self-ratings                                         | Learner reports a self-review                        | Independent grading or competency              |
| Named teacher review with cited response excerpts                   | That reviewer judged this case against these anchors | Inter-rater reliability or broad transfer      |
| Two independent raters, disagreement analysis, retained anchors     | Reliability evidence for this task and sample        | Program efficacy or professional qualification |
| Delayed unfamiliar case, scored blind to condition                  | Evidence of retention/transfer in the stated sample  | General job readiness or accreditation         |
| Comparative study with prespecified outcomes and appropriate design | Effects supported by that study and its limits       | Universal effectiveness                        |

The app's 15-character field checks are completeness checks only. Neither clicking a source, matching a preferred option, high confidence nor word count earns correctness credit. Never issue a signed assessment credential from these records. Software tests establish functionality, not learning effects.

## Teacher evaluation

Use the six 0–3 anchored dimensions in `src/lib/judgment/cases.ts`: framing, evidence, tradeoffs, standards, validation and revision. Retain a quotation or pointer to the learner's evidence for each judgment. Permit disagreement with the worked example when the alternative satisfies constraints and addresses uncertainty. Flag unsupported safety assurances, fabricated standards claims and ignored counterevidence for corrective feedback; do not silently average them away in a total.

Before using ratings for consequential decisions, independently double-score a varied sample, report agreement and disagreement patterns by dimension, revise ambiguous anchors and rescore. Do not invent a validated pass threshold. Provide accessible response formats and do not equate writing fluency with engineering reasoning. Use no physical machinery, real-money trading, production deployment or sensitive learner data in these scenarios.

## Learning-science rationale and limits

The [IES/WWC 2007 practice guide](https://ies.ed.gov/ncee/wwc/practiceguide/1) rates deep explanatory questioning and quizzing to revisit key content as strong evidence; spacing and alternating worked examples with problem solving as moderate; introductory pre-questions and some self-monitoring recommendations as minimal. These are the guide's recommendation ratings, not ratings of Dura. Its content-learning evidence does not directly validate this case sequence or professional judgment transfer.

The seven-day review reminder is a product default, not an experimentally established optimum. For a meaningful review, retrieve the argument before reopening the example and solve a fresh case; simply rereading a stored answer is not retrieval practice. Collect delayed transfer evidence before claiming that learners improved judgment. A future opt-in evaluation should specify outcomes, comparable groups or a defensible repeated-measures design, attrition, accessibility, scorer blinding, uncertainty estimates and privacy boundaries before observing results.

## Release checks

Validate every case/source ID and prerequisite route, unique evidence and option IDs, complete worked revision and transfer prompt, and all intended path recommendations. Independently check numerical examples and technical claims. Record source edition and review date. Tests must demonstrate immutable initial attempts, delayed counterevidence, revision/self-review distinction, local persistence and accessible export. Cases remain examples of reasoning, not a complete path curriculum or an assertion of standards conformance.
