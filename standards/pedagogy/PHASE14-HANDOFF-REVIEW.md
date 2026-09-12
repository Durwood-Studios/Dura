# Manufacturing handoff and verification review

Reviewed 2026-09-12. The ten lessons in modules 14-7 through 14-14 were rewritten around explicit, self-contained review cases. They retain their declared Bloom levels, provide guided practice and model reasoning, and avoid presenting a browser simulation as machine, protocol, or safety validation. The other 25 manufacturing lessons were reviewed separately in the same curriculum pass.

## Corrected teaching defects

- Y14.41 does not automatically make all drawings non-authoritative. Product-package precedence, revision, semantic PMI, and import capability are separate checks. A filename is not evidence of a complete transfer.
- IPC acceptance class does not follow automatically from an industry label. Removed universal contractual, process-parameter, and repair-release claims; the exercises use explicit fictional criteria and controlled disposition records.
- ISA-95 describes activities rather than a fixed device-to-level or network topology rule. Batch target and actual quantities remain distinct, and duplicate-message behavior is explicitly an application contract.
- MTConnect/OPC UA interoperability does not itself prove freshness, timing bounds, or safe control behavior. Unavailable readings cannot become normal-quality zero, and receipt time cannot silently replace source time.
- Removed unsupported IEC 62443 sector-specific level assignments and fabricated claims that ISO 10218 adds exactly four universal controls. Target requirements, component capability, and achieved integrated evidence remain distinct; RAMI/IIRA usage is not mandated by customer nationality.
- Removed a misleading CNC simulator that ignored offsets and treated unsupported motion as if validated. Paper state traces distinguish sequential absolute/incremental moves, G98/G99 return behavior, and unresolved physical clearance. CAM review distinguishes actual simulation coverage from unmodeled fixtures or changed postprocessors.
- Measurement examples preserve independent-input assumptions, coverage-factor limits, asymmetric specification limits, and unresolved uncertainty overlap. Display precision and an empty inspection list cannot establish conformance.
- Removed misleading MRP code that could reuse stock across orders, explode components before parent netting, and recurse without cycle protection. Worked planning cases net usable parents first, reserve components once, offset component availability from parent start, and exclude quality holds.

## Evidence and limits

All 35 manufacturing lessons and all 668 curriculum lessons pass the current structural audit and compile as MDX. Whole-curriculum assessment-property checks separately validate actual component contracts. The new cases include independently checked coordinate traces (6, 4, 7, 1), uncertainty intervals, and parent/component quantity conservation (five builds, 20 bearings, 16 initially planned receipts or 18 after a two-bearing hold).

These checks establish delivery and stated example behavior. They do not establish shop-floor qualification, complete normative standards conformance, a production MRP system, or a certified security/safety design. No machine commands, purchase orders, or industrial configuration changes were executed.

Each lesson links the relevant primary source: ASME, IPC, ISA, OPC Foundation, IEEE, the joint IIRA/RAMI paper, Haas, Autodesk, or BIPM. Public scopes and references support the bounded teaching claims; licensed clauses and customer contracts still determine actual acceptance requirements.
