# Core curriculum mapping review

Reviewed 2026-09-12 against the authored modules and LP-1.0. This records scope decisions, not external certification, accreditation, exam equivalence, or an independently assessed SFIA level.

| Module | Reviewed learning scope                                                           | Mapping decision                                                                            |
| ------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1-7    | Object construction, encapsulation, inheritance and composition                   | Retain lesson metadata; no unverified AP or CSTA crosswalk                                  |
| 2-6    | TypeScript contracts, interfaces, generics, configuration and typed React         | Retain lesson metadata; no invented language-specific AP equivalence                        |
| 2-7    | Polling, SSE, WebSocket lifecycle and real-time application behavior              | Retain lesson metadata; no inferred external-networking certification                       |
| 3-6    | Logic, sets, counting, proof and probability                                      | Retain lesson metadata; topical overlap alone does not establish an exam-objective mapping  |
| 4-6    | Queue delivery, Kafka/RabbitMQ concepts, event sourcing and service communication | Retain lesson metadata; no module-wide professional level inferred from five lessons        |
| 5-5    | Threads, races, async execution, atomics and message-based coordination           | Retain lesson metadata; no formal professional attainment inferred from completing examples |

These six rows use `lesson-metadata-only`, as do the separately reviewed advanced modules. Empty module-level arrays mean no module-level claim. They do not mean that the topic lacks educational value or that completing it demonstrates every competency of the referenced profession.

## AP taxonomy correction

The stored AP CSP taxonomy used seven parts, and AP CSA used ten units. Those labels must not be shown as a verified current alignment. College Board's [current CSP course](https://apcentral.collegeboard.org/courses/ap-computer-science-principles) has five Big Ideas. Its [CSA course description effective fall 2025](https://apcentral.collegeboard.org/media/pdf/ap-computer-science-a-course-and-exam-description-effective-fall-2025.pdf) has four units.

The original AP arrays remain in `HISTORICAL_AP_MAPPINGS` as unverified migration evidence. Current `PHASE_STANDARDS`, module badges, standards aggregation, and AP topic lookup receive empty AP arrays. A future objective-by-objective review can establish a current, explicitly versioned crosswalk; this change does not invent one by renumbering old labels. Existing CSTA and other legacy mappings are not newly certified by this review.

## Content review and evidence

All 245 lessons in phases 1–5 received lesson-specific metadata and structural review. Phases 4–5 now use explicit written tasks where browser execution would not validate the backend, infrastructure, or reasoning competency. Each task has a scenario, a model response, and three observable rubric criteria; guided practice precedes it. Existing Bloom levels were retained or supported with a task at that level. Original historical LP findings remain immutable in the baseline; migrated phases have a stricter zero-current-findings regression assertion.

The work also repaired executable examples in phases 1–3, including an infinite heap loop, wrong topological ordering, incomplete data-structure methods, an invalid multiplication token, malformed SSE literals, and incorrect RPN test data. Regression tests execute the actual MDX solution literals. Compiling MDX alone would not catch these behavioral defects.

Primary sources used to resolve specific disputed claims:

- [Node event loop documentation](https://nodejs.org/learn/asynchronous-work/event-loop-timers-and-nexttick): scheduling assumptions and timer ordering.
- [TypeScript strictFunctionTypes](https://www.typescriptlang.org/tsconfig/strictFunctionTypes.html) and [skipLibCheck](https://www.typescriptlang.org/tsconfig/skipLibCheck.html): parameter compatibility and declaration checking.
- [React useEffect](https://react.dev/reference/react/useEffect): cleanup and dependency behavior.
- [PostgreSQL WAL](https://www.postgresql.org/docs/current/wal-intro.html) and [standby replication](https://www.postgresql.org/docs/current/warm-standby.html): durable ordering, replay, and acknowledgment scope.
- [PostgreSQL isolation](https://www.postgresql.org/docs/current/transaction-iso.html): visibility and concurrency guarantees.
- [Dockerfile concepts](https://docs.docker.com/build/concepts/dockerfile/) and [Compose startup order](https://docs.docker.com/compose/how-tos/startup-order/): image and service-lifecycle boundaries.
- [Railway variables](https://docs.railway.com/variables) and [Vercel environments](https://vercel.com/docs/deployments/environments): explicit environment configuration.
- [RFC 9293](https://www.rfc-editor.org/rfc/rfc9293.html), [RFC 8446](https://www.rfc-editor.org/rfc/rfc8446.html), and [RFC 7766](https://www.rfc-editor.org/rfc/rfc7766.html): TCP, TLS, and DNS transport behavior.
- [Linux EEVDF documentation](https://docs.kernel.org/scheduler/sched-eevdf.html): current fair-scheduling terminology.

A passing structural checker is not proof of complete pedagogical quality or that every legacy technical statement has been independently verified. The scenarios and counterexamples above make the reviewed contracts testable, while external standards claims remain bounded to their actual evidence.
