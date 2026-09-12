# Robotics curriculum review

All 37 phase13 lessons were reviewed and revised in this change. Their LP metadata/structure checks pass and all compile as MDX. This is a content and executable-example review, not professional certification or validation of physical machinery.

## Material corrections

- Risk assessment: removed invented occurrence categories in the ISO13849 risk graph, unsupported mandatory document forms, automatic numeric acceptance rules, and unjustified PL reductions.
- Functional safety: corrected IEC62061 scope, Category2 test-frequency direction, Category3/PL claims, channel reliability examples, fabricated subsystem equations, and universal software technique mandates. Proof-test models now state demand mode, assumptions and units.
- Collaborative applications: corrected protective separation terms and uncertainties; removed acceptance of sensitive head contact, unconditional mode exclusivity, and conflation of monitored stops with maintenance isolation.
- Contact testing: removed fabricated body-region thresholds and annex attribution. Distinguished nominal average pressure from peak-pressure measurement. Replaced invented universal calibration intervals, bandwidths, sample rates, repeat counts, margins and retest rules with explicit method/evidence requirements.
- Vocabulary and performance: corrected unrestricted six-axis reach claims, unsupported architecture rankings, fabricated ISO9283 statistics/test positions, false revision/deprecation claims, and guessed vendor-mode mappings.
- Cybersecurity and capstone: removed the invented four-control ISO overlay and false claim that course verification authenticates or validates an engineering package. Portfolio tasks now state assumptions, unresolved evidence and claim limits.
- ROS: corrected release information, unsupported certification/hiring assertions, disabled-by-default security assumptions, missing launch imports, interface/lifecycle confusion, invalid MoveIt message/API use, partial-path execution, and lifecycle management represented as physical safety protection.
- Robotics mathematics: corrected printed FK, inertia and PID gain outputs; added IK boundary checks and PID initialization/unwinding handling. Replaced a load-free PID simulation falsely described as having permanent load error, and MPC examples claiming guaranteed physical constraint enforcement. Removed the claim that navigation requires SLAM and perfect GPS.

## Verification

`python3 tests/curriculum/robotics-examples.py` passes four regression tests. It executes printed mathematical examples and checks FK/IK round trips, unreachable/singular boundaries, gravity/inertia values, PID initial/reset derivative handling, invalid sampling intervals and integrator unwinding. It syntax-checks all Python fences. ROS-dependent code is **not** represented as executed: the required native environment is absent.

`npx vitest run tests/paths/content-reachability.test.ts tests/standards/lp-1-conformance.test.ts` passed 680 tests at this review point. The historical baseline remains unchanged; current clean status does not erase the historical inventory.

## Source scope

Primary references are linked at the relevant lessons. Technical scope checks used ISO/IEC and A3 catalogs, DGUV machinery guidance, NIST separation-monitoring research, ILAC uncertainty/decision guidance, and official ROS, ros2_control, MoveIt and Nav2 documentation. Model-dependent safety values were not invented where controlled full-standard or supplier evidence was unavailable. Numerical teaching criteria are explicitly fictional and are not human-contact acceptance limits.

WrittenExercise tasks assess learner-authored reasoning through a rubric/model answer, not automatic professional mastery. Some ROS lessons provide bounded implementation fragments and review exercises; full native simulation or real-device integration needs the named external environment and its own verification.
