import type { AssessmentQuestion } from "@/types/assessment";

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
    phaseId: "8",
    moduleId,
    type,
    question,
    options,
    correct,
    explanation,
    difficulty,
    tags,
    standards: { bloom: "analyze" },
  };
}

export const PHASE_8_QUESTIONS: AssessmentQuestion[] = [
  // ── Module 8-1: Testing ──────────────────────────────────────────────────
  q(
    "8-1-q1",
    "8-1",
    "multiple-choice",
    "What is the testing pyramid?",
    [
      "A shape made of test files",
      "Many unit tests at the base, fewer integration tests in the middle, fewest e2e tests at the top",
      "A testing framework",
      "A project management technique",
    ],
    1,
    "Unit tests are fast and cheap; e2e tests are slow and expensive. The pyramid reflects the optimal ratio.",
    "easy",
    ["testing-pyramid"]
  ),
  q(
    "8-1-q2",
    "8-1",
    "multiple-choice",
    "What does the 'Arrange, Act, Assert' pattern describe?",
    [
      "Three deployment stages",
      "The structure of a test: set up inputs, call the function, check the output",
      "Three types of tests",
      "A CI pipeline",
    ],
    1,
    "AAA is the universal test structure.",
    "easy",
    ["testing", "aaa"]
  ),
  q(
    "8-1-q3",
    "8-1",
    "true-false",
    "True or false: mocking replaces a real dependency with a controlled fake for test isolation.",
    ["True", "False"],
    0,
    "Mocks, stubs, and spies all serve to isolate the unit under test from its dependencies.",
    "easy",
    ["mocking"]
  ),
  q(
    "8-1-q4",
    "8-1",
    "multiple-choice",
    "What is TDD's red-green-refactor cycle?",
    [
      "Write code, then tests, then refactor",
      "Write a failing test (red), make it pass (green), then refactor",
      "Test in red environment, deploy to green",
      "A color-coding convention",
    ],
    1,
    "TDD starts with a failing test, implements just enough to pass, then cleans up.",
    "easy",
    ["tdd"]
  ),
  q(
    "8-1-q5",
    "8-1",
    "multiple-choice",
    "What distinguishes an integration test from a unit test?",
    [
      "Integration tests are longer",
      "Integration tests verify multiple components working together; unit tests verify one function in isolation",
      "They are the same thing",
      "Integration tests don't use assertions",
    ],
    1,
    "Integration tests cross boundaries: API + DB, service + service, module + module.",
    "medium",
    ["integration-test"]
  ),
  q(
    "8-1-q6",
    "8-1",
    "multiple-choice",
    "What is Playwright used for?",
    [
      "Unit testing",
      "End-to-end browser testing — automating user interactions across full page flows",
      "API mocking",
      "Code formatting",
    ],
    1,
    "Playwright drives real browsers, simulating clicks, navigation, and form fills.",
    "medium",
    ["e2e", "playwright"]
  ),
  q(
    "8-1-q7",
    "8-1",
    "multiple-choice",
    "What is property-based testing?",
    [
      "Testing CSS properties",
      "Generating random inputs to verify that invariants hold across many cases",
      "Testing only public methods",
      "A type of load testing",
    ],
    1,
    "Instead of hand-picking examples, property-based testing generates hundreds of random inputs and checks that rules are never violated.",
    "medium",
    ["property-based"]
  ),
  q(
    "8-1-q8",
    "8-1",
    "multiple-choice",
    "When should you NOT use TDD?",
    [
      "Never — always use TDD",
      "When exploring or prototyping and the requirements are unclear",
      "When writing any production code",
      "When the team is large",
    ],
    1,
    "TDD excels when requirements are clear. Exploratory coding benefits from writing tests after the shape stabilizes.",
    "medium",
    ["tdd"]
  ),
  q(
    "8-1-q9",
    "8-1",
    "multiple-choice",
    "What is a test fixture?",
    [
      "A bug fix",
      "A fixed baseline state (data, config, environment) set up before tests run",
      "A test framework",
      "A deployment target",
    ],
    1,
    "Fixtures provide known starting conditions so tests are reproducible and independent.",
    "hard",
    ["fixture"]
  ),
  q(
    "8-1-q10",
    "8-1",
    "multiple-choice",
    "Why should e2e tests be at the top of the pyramid (fewest)?",
    [
      "They're easier to write",
      "They're slow, flaky, expensive, and test too many things at once — reserve them for critical user flows",
      "They're more reliable",
      "They don't need maintenance",
    ],
    1,
    "E2e tests are the slowest and most brittle. Use them sparingly for the most important paths.",
    "hard",
    ["e2e", "testing-pyramid"]
  ),

  // ── Module 8-2: CI/CD and DevOps ─────────────────────────────────────────
  q(
    "8-2-q1",
    "8-2",
    "multiple-choice",
    "What is Continuous Integration?",
    [
      "Deploying continuously",
      "Automatically building and testing code on every push to catch problems early",
      "A Git branching strategy",
      "A project management methodology",
    ],
    1,
    "CI runs automated checks on every code change so problems are caught before merge.",
    "easy",
    ["ci"]
  ),
  q(
    "8-2-q2",
    "8-2",
    "multiple-choice",
    "What is a GitHub Actions workflow?",
    [
      "A manual deployment process",
      "An automated pipeline defined in YAML that runs on triggers (push, PR, schedule)",
      "A code review tool",
      "A Git command",
    ],
    1,
    "Workflows define jobs and steps that run on GitHub-hosted runners in response to events.",
    "easy",
    ["github-actions"]
  ),
  q(
    "8-2-q3",
    "8-2",
    "true-false",
    "True or false: blue-green deployment runs two identical environments and switches traffic between them.",
    ["True", "False"],
    0,
    "Blue (current) and green (new) environments. Switch traffic to green; rollback by switching back to blue.",
    "easy",
    ["blue-green"]
  ),
  q(
    "8-2-q4",
    "8-2",
    "multiple-choice",
    "What is canary deployment?",
    [
      "Deploying to a single server",
      "Gradually rolling out changes to a small percentage of users before full rollout",
      "A testing technique",
      "A logging pattern",
    ],
    1,
    "Canary releases catch problems by exposing new code to 1-5% of traffic before going to 100%.",
    "easy",
    ["canary"]
  ),
  q(
    "8-2-q5",
    "8-2",
    "multiple-choice",
    "What is Infrastructure as Code?",
    [
      "Writing code inside infrastructure",
      "Defining infrastructure (servers, networks, databases) in version-controlled config files rather than manual setup",
      "A type of API",
      "A monitoring tool",
    ],
    1,
    "IaC makes infrastructure reproducible, reviewable, and version-controlled — like application code.",
    "medium",
    ["iac", "terraform"]
  ),
  q(
    "8-2-q6",
    "8-2",
    "multiple-choice",
    "What should happen when a CI check fails?",
    [
      "Merge anyway",
      "Block the merge until the issue is fixed",
      "Delete the branch",
      "Notify the CEO",
    ],
    1,
    "Failing CI blocks merge. Fix the issue first — that's the whole point of CI.",
    "medium",
    ["ci"]
  ),
  q(
    "8-2-q7",
    "8-2",
    "multiple-choice",
    "What is an SBOM?",
    [
      "A build optimization",
      "A Software Bill of Materials — a list of every dependency and its version",
      "A testing framework",
      "A deployment strategy",
    ],
    1,
    "SBOMs enable vulnerability scanning and compliance auditing of your dependency tree.",
    "medium",
    ["sbom", "security"]
  ),
  q(
    "8-2-q8",
    "8-2",
    "multiple-choice",
    "What is a feature flag?",
    [
      "A Git tag",
      "A runtime toggle that enables/disables features without deploying new code",
      "A CSS class",
      "A test assertion",
    ],
    1,
    "Feature flags decouple deployment from release — deploy code with the feature off, enable it gradually.",
    "hard",
    ["feature-flag"]
  ),
  q(
    "8-2-q9",
    "8-2",
    "multiple-choice",
    "What is the 'fail fast' principle in CI?",
    [
      "Deploy quickly and fix later",
      "Run the fastest, most likely-to-fail checks first so failures are caught in seconds, not minutes",
      "Skip slow tests",
      "Fail the build on any warning",
    ],
    1,
    "Order checks: lint (seconds) → typecheck (seconds) → unit tests (seconds) → integration (minutes) → e2e (minutes).",
    "hard",
    ["ci", "fail-fast"]
  ),
  q(
    "8-2-q10",
    "8-2",
    "multiple-choice",
    "What is the difference between CI and CD?",
    [
      "They are the same thing",
      "CI automatically builds/tests; CD automatically deploys to production (or staging)",
      "CI is for frontend, CD is for backend",
      "CI uses YAML, CD uses JSON",
    ],
    1,
    "CI catches problems. CD ships verified code to environments. Together they form the automated delivery pipeline.",
    "hard",
    ["ci", "cd"]
  ),

  // ── Module 8-3: Architecture Patterns ─────────────────────────────────────
  q(
    "8-3-q1",
    "8-3",
    "multiple-choice",
    "What is the dependency rule in Clean Architecture?",
    [
      "All modules depend on each other",
      "Dependencies point inward — inner layers never depend on outer layers",
      "Dependencies point outward",
      "There are no dependencies",
    ],
    1,
    "The domain layer is at the center and depends on nothing. Infrastructure depends on domain, never the reverse.",
    "easy",
    ["clean-architecture"]
  ),
  q(
    "8-3-q2",
    "8-3",
    "multiple-choice",
    "When should you move from a monolith to microservices?",
    [
      "Always start with microservices",
      "When the monolith's deploy cycle, team ownership, or scaling needs can't be met",
      "Never — monoliths are always better",
      "When you have more than 10 files",
    ],
    1,
    "Microservices solve organizational and scaling problems. They create operational complexity. Don't split prematurely.",
    "easy",
    ["microservices"]
  ),
  q(
    "8-3-q3",
    "8-3",
    "true-false",
    "True or false: event sourcing stores every state change as an immutable event rather than overwriting current state.",
    ["True", "False"],
    0,
    "The event log is the source of truth. Current state is derived by replaying events.",
    "easy",
    ["event-sourcing"]
  ),
  q(
    "8-3-q4",
    "8-3",
    "multiple-choice",
    "What does CQRS stand for?",
    [
      "Command Query Response System",
      "Command Query Responsibility Segregation",
      "Central Queue Routing Service",
      "Concurrent Query Read System",
    ],
    1,
    "CQRS separates the write model (commands) from the read model (queries) — each can be optimized independently.",
    "easy",
    ["cqrs"]
  ),
  q(
    "8-3-q5",
    "8-3",
    "multiple-choice",
    "What is a bounded context in DDD?",
    [
      "A memory limit",
      "A boundary within which a particular domain model is defined and consistent",
      "A rate limit",
      "A security perimeter",
    ],
    1,
    "Different bounded contexts can use the same term (e.g., 'Order') with different meanings and models.",
    "medium",
    ["ddd", "bounded-context"]
  ),
  q(
    "8-3-q6",
    "8-3",
    "multiple-choice",
    "What is an ADR?",
    [
      "An API design review",
      "An Architecture Decision Record — a document capturing a decision, its context, and consequences",
      "An automated deployment runner",
      "An access control rule",
    ],
    1,
    "ADRs create a searchable history of why architectural decisions were made.",
    "medium",
    ["adr"]
  ),
  q(
    "8-3-q7",
    "8-3",
    "multiple-choice",
    "What is the Strategy pattern?",
    [
      "A planning technique",
      "Defining a family of algorithms and making them interchangeable at runtime",
      "A database query pattern",
      "A Git branching model",
    ],
    1,
    "Strategy encapsulates algorithms behind a common interface so the caller can swap implementations.",
    "medium",
    ["design-pattern", "strategy"]
  ),
  q(
    "8-3-q8",
    "8-3",
    "multiple-choice",
    "What is the main tradeoff of GraphQL vs REST?",
    [
      "GraphQL is always faster",
      "GraphQL gives clients flexibility to request exact data shapes, but adds server complexity and caching difficulty",
      "REST is deprecated",
      "They are identical",
    ],
    1,
    "GraphQL eliminates over/under-fetching but makes caching harder and adds query complexity on the server.",
    "hard",
    ["graphql", "rest"]
  ),
  q(
    "8-3-q9",
    "8-3",
    "multiple-choice",
    "What is gRPC best suited for?",
    [
      "Browser-to-server communication",
      "High-performance service-to-service communication with strong typing via Protocol Buffers",
      "Static site generation",
      "CSS preprocessing",
    ],
    1,
    "gRPC uses HTTP/2 and protobuf for efficient, typed, bi-directional streaming between services.",
    "hard",
    ["grpc"]
  ),
  q(
    "8-3-q10",
    "8-3",
    "multiple-choice",
    "When should you use the Observer pattern?",
    [
      "For all function calls",
      "When multiple components need to react to state changes without tight coupling",
      "Only in React",
      "For database queries",
    ],
    1,
    "Observer decouples the event source from its listeners. Event emitters, pub/sub, and reactive frameworks all use it.",
    "hard",
    ["design-pattern", "observer"]
  ),

  // ── Module 8-4: Security ─────────────────────────────────────────────────
  q(
    "8-4-q1",
    "8-4",
    "multiple-choice",
    "What is XSS?",
    [
      "A CSS framework",
      "Cross-Site Scripting — injecting malicious scripts into web pages viewed by other users",
      "A testing tool",
      "A deployment strategy",
    ],
    1,
    "XSS injects client-side scripts. Mitigate by escaping output and using Content-Security-Policy headers.",
    "easy",
    ["xss", "owasp"]
  ),
  q(
    "8-4-q2",
    "8-4",
    "multiple-choice",
    "What is SQL injection?",
    [
      "A database optimization",
      "Inserting malicious SQL into input fields to manipulate database queries",
      "A migration tool",
      "A backup technique",
    ],
    1,
    "SQLi exploits unsanitized input concatenated into queries. Mitigate with parameterized queries.",
    "easy",
    ["sqli", "owasp"]
  ),
  q(
    "8-4-q3",
    "8-4",
    "true-false",
    "True or false: OAuth 2.0 is an authorization framework, not an authentication protocol.",
    ["True", "False"],
    0,
    "OAuth 2.0 delegates authorization (access to resources). OIDC (built on OAuth) handles authentication (who you are).",
    "easy",
    ["oauth"]
  ),
  q(
    "8-4-q4",
    "8-4",
    "multiple-choice",
    "What is RBAC?",
    [
      "A testing methodology",
      "Role-Based Access Control — permissions assigned to roles, users assigned to roles",
      "A routing protocol",
      "A CSS naming convention",
    ],
    1,
    "RBAC: users have roles, roles have permissions. Simple, auditable, the default choice for most apps.",
    "easy",
    ["rbac"]
  ),
  q(
    "8-4-q5",
    "8-4",
    "multiple-choice",
    "What is CSRF?",
    [
      "A CSS rendering fix",
      "Cross-Site Request Forgery — tricking a user's browser into making unwanted requests to a site they're logged into",
      "A caching strategy",
      "A responsive framework",
    ],
    1,
    "CSRF exploits existing authentication cookies. Mitigate with CSRF tokens or SameSite cookie attribute.",
    "medium",
    ["csrf", "owasp"]
  ),
  q(
    "8-4-q6",
    "8-4",
    "multiple-choice",
    "Why should passwords be hashed, not encrypted?",
    [
      "Hashing is faster",
      "Hashing is one-way — even if the database is stolen, passwords can't be reversed. Encryption is two-way and requires a key that could also be stolen",
      "They are the same thing",
      "Encryption is deprecated",
    ],
    1,
    "bcrypt/argon2 hash + salt passwords. If the DB leaks, attackers can't reverse the hashes.",
    "medium",
    ["cryptography", "hashing"]
  ),
  q(
    "8-4-q7",
    "8-4",
    "multiple-choice",
    "What is the principle of least privilege?",
    [
      "Give everyone admin access",
      "Grant only the minimum permissions needed for a task — nothing more",
      "Use the cheapest infrastructure",
      "Minimize code comments",
    ],
    1,
    "Least privilege limits blast radius. A service that only reads should never have write permissions.",
    "medium",
    ["security", "least-privilege"]
  ),
  q(
    "8-4-q8",
    "8-4",
    "multiple-choice",
    "What is PKCE in OAuth?",
    [
      "A hashing algorithm",
      "Proof Key for Code Exchange — prevents authorization code interception in public clients (SPAs, mobile apps)",
      "A deployment tool",
      "A CSS methodology",
    ],
    1,
    "PKCE adds a code_verifier/code_challenge to the OAuth flow, protecting against code theft in clients that can't keep secrets.",
    "hard",
    ["oauth", "pkce"]
  ),
  q(
    "8-4-q9",
    "8-4",
    "multiple-choice",
    "What is SSRF?",
    [
      "Server-Side Rendering Framework",
      "Server-Side Request Forgery — tricking the server into making requests to internal resources",
      "A state management pattern",
      "A styling technique",
    ],
    1,
    "SSRF exploits server-side URL fetching to access internal services, metadata endpoints, or cloud credentials.",
    "hard",
    ["ssrf", "owasp"]
  ),
  q(
    "8-4-q10",
    "8-4",
    "multiple-choice",
    "What is defense in depth?",
    [
      "Having one very strong security layer",
      "Layering multiple security controls so that failure of one doesn't compromise the system",
      "Using only firewalls",
      "Encrypting everything twice",
    ],
    1,
    "No single control is sufficient. Layer: input validation + output encoding + CSP + auth + rate limiting + monitoring.",
    "hard",
    ["security", "defense-in-depth"]
  ),

  // ── Module 8-5: Code Quality and Collaboration ───────────────────────────
  q(
    "8-5-q1",
    "8-5",
    "multiple-choice",
    "What should a code review focus on?",
    [
      "Only style and formatting",
      "Correctness, readability, edge cases, test coverage, and design",
      "Speed of implementation",
      "Line count",
    ],
    1,
    "Reviews catch bugs, share knowledge, and maintain quality. Style is handled by formatters.",
    "easy",
    ["code-review"]
  ),
  q(
    "8-5-q2",
    "8-5",
    "multiple-choice",
    "What is a code smell?",
    [
      "A syntax error",
      "A surface-level indicator of a potential deeper design problem — not a bug, but a sign to investigate",
      "A linting rule",
      "A deprecated function",
    ],
    1,
    "Long methods, deep nesting, duplicated code, and god objects are common smells that suggest refactoring.",
    "easy",
    ["refactoring", "code-smell"]
  ),
  q(
    "8-5-q3",
    "8-5",
    "true-false",
    "True or false: an ADR (Architecture Decision Record) documents a decision, its context, and its consequences.",
    ["True", "False"],
    0,
    "ADRs capture the why behind architectural decisions so future teams understand the reasoning.",
    "easy",
    ["adr"]
  ),
  q(
    "8-5-q4",
    "8-5",
    "multiple-choice",
    "What is the Divio documentation framework?",
    [
      "A JavaScript framework",
      "Four types: tutorials (learning), how-tos (goals), references (information), explanations (understanding)",
      "A CI/CD tool",
      "A database",
    ],
    1,
    "Divio structures docs by purpose: tutorials teach, how-tos solve tasks, references list facts, explanations provide context.",
    "easy",
    ["documentation", "divio"]
  ),
  q(
    "8-5-q5",
    "8-5",
    "multiple-choice",
    "When should you refactor?",
    [
      "Never — if it works, don't touch it",
      "When you understand the current code well enough to improve it without changing behavior",
      "Only during code review",
      "Only on Fridays",
    ],
    1,
    "Refactor when you have tests, understand the code, and can improve clarity/structure without changing behavior.",
    "medium",
    ["refactoring"]
  ),
  q(
    "8-5-q6",
    "8-5",
    "multiple-choice",
    "What license is DURA released under?",
    ["MIT", "AGPLv3 (core) + Apache 2.0 (APIs)", "Proprietary", "Creative Commons"],
    1,
    "AGPLv3 ensures the source stays open. Apache 2.0 for APIs allows commercial integration.",
    "medium",
    ["licensing", "open-source"]
  ),
  q(
    "8-5-q7",
    "8-5",
    "multiple-choice",
    "What makes technical writing good?",
    [
      "Using complex vocabulary",
      "Clarity, structure, and concrete examples — optimized for the reader's time",
      "Length and detail",
      "Avoiding all code examples",
    ],
    1,
    "Good tech writing respects the reader's time: clear structure, concrete examples, no unnecessary prose.",
    "medium",
    ["technical-writing"]
  ),
  q(
    "8-5-q8",
    "8-5",
    "multiple-choice",
    "What is the best first contribution to an open source project?",
    [
      "Rewrite the core module",
      "Pick a 'good first issue', fix it, submit a PR following the contribution guide",
      "Open 10 feature requests",
      "Fork and never submit back",
    ],
    1,
    "Start small, follow the contribution guide, and build trust before proposing big changes.",
    "medium",
    ["open-source"]
  ),
  q(
    "8-5-q9",
    "8-5",
    "multiple-choice",
    "What should a portfolio project demonstrate?",
    [
      "That you can copy tutorials",
      "A real problem you solved, the decisions you made, and what you learned",
      "As many technologies as possible",
      "Perfect code with no TODOs",
    ],
    1,
    "Portfolio projects show problem-solving and decision-making, not just technical skills.",
    "hard",
    ["career", "portfolio"]
  ),
  q(
    "8-5-q10",
    "8-5",
    "multiple-choice",
    "What is the most important skill in a technical interview?",
    [
      "Memorizing algorithms",
      "Communicating your thinking process — explaining your approach, tradeoffs, and reasoning out loud",
      "Typing speed",
      "Knowing the exact syntax",
    ],
    1,
    "Interviewers evaluate how you think, not what you've memorized. Talk through your reasoning.",
    "hard",
    ["interview", "career"]
  ),
];
