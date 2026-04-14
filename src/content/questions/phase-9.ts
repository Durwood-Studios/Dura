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
    phaseId: "9",
    moduleId,
    type,
    question,
    options,
    correct,
    explanation,
    difficulty,
    tags,
    standards: { bloom: "evaluate" },
  };
}

export const PHASE_9_QUESTIONS: AssessmentQuestion[] = [
  // ── Module 9-1: Engineering Manager Transition ───────────────────────────
  q(
    "9-1-q1",
    "9-1",
    "multiple-choice",
    "What is the biggest mindset shift from IC to engineering manager?",
    [
      "Writing more code",
      "Your output is measured by your team's output, not your personal contribution",
      "Attending fewer meetings",
      "Learning a new programming language",
    ],
    1,
    "Managers create leverage through others. Your code throughput drops to near zero; your team's throughput should increase.",
    "easy",
    ["management", "transition"]
  ),
  q(
    "9-1-q2",
    "9-1",
    "multiple-choice",
    "What is the primary purpose of a 1:1 meeting?",
    [
      "Status updates",
      "The direct report's agenda — their concerns, growth, blockers, and feedback",
      "Sprint planning",
      "Code review",
    ],
    1,
    "1:1s belong to the report. Status updates happen in standups. 1:1s are for trust, career, and the things people won't say in a group.",
    "easy",
    ["one-on-ones"]
  ),
  q(
    "9-1-q3",
    "9-1",
    "multiple-choice",
    "What should a PIP (Performance Improvement Plan) include?",
    [
      "Only a termination date",
      "Specific measurable goals, timeline, support provided, and consequences of not meeting them",
      "A list of past mistakes",
      "A salary reduction",
    ],
    1,
    "A PIP is a structured path to improvement — specific, measurable, time-bound, with clear support and consequences.",
    "medium",
    ["pip", "firing"]
  ),
  q(
    "9-1-q4",
    "9-1",
    "multiple-choice",
    "What is calibration in performance reviews?",
    [
      "Setting salaries",
      "Managers comparing their ratings across teams to ensure consistent standards",
      "A technical interview",
      "Sprint velocity adjustment",
    ],
    1,
    "Calibration prevents one manager's 'exceeds expectations' from being another's 'meets expectations.'",
    "medium",
    ["performance-review"]
  ),
  q(
    "9-1-q5",
    "9-1",
    "true-false",
    "True or false: the best engineering managers still write significant production code daily.",
    ["True", "False"],
    1,
    "EMs who code daily become bottlenecks. Your job is to enable the team, not to be the top contributor.",
    "medium",
    ["management"]
  ),
  q(
    "9-1-q6",
    "9-1",
    "multiple-choice",
    "What is the 'maker-manager schedule' concept?",
    [
      "A project management tool",
      "Makers need long uninterrupted blocks; managers work in short meeting-filled intervals — and the two conflict",
      "A calendar app",
      "A hiring framework",
    ],
    1,
    "Paul Graham's insight: protect your team's maker schedule by batching your meetings and keeping their calendars clear.",
    "medium",
    ["scheduling"]
  ),
  q(
    "9-1-q7",
    "9-1",
    "multiple-choice",
    "When should you escalate a problem to your director?",
    [
      "Never — handle everything yourself",
      "When the impact exceeds your authority, the timeline requires senior intervention, or you need a decision you can't make",
      "For every minor issue",
      "Only during annual reviews",
    ],
    1,
    "Escalate based on impact and authority. Under-escalating burns trust; over-escalating wastes leadership bandwidth.",
    "hard",
    ["managing-up"]
  ),
  q(
    "9-1-q8",
    "9-1",
    "multiple-choice",
    "What makes a hiring rubric effective?",
    [
      "It scores candidates on a single dimension",
      "It defines specific, observable criteria per competency with examples at each rating level",
      "It asks about hobbies",
      "It focuses only on years of experience",
    ],
    1,
    "Rubrics reduce bias by forcing evaluators to assess specific competencies with concrete evidence, not gut feeling.",
    "hard",
    ["hiring"]
  ),

  // ── Module 9-2: Architecture at Scale ─────────────────────────────────────
  q(
    "9-2-q1",
    "9-2",
    "multiple-choice",
    "At ~10K users, what typically breaks first?",
    [
      "The frontend framework",
      "The database — single instance can't handle the read/write load",
      "The DNS",
      "The programming language",
    ],
    1,
    "The database is almost always the first bottleneck. Connection pooling, read replicas, and query optimization are first moves.",
    "easy",
    ["scaling"]
  ),
  q(
    "9-2-q2",
    "9-2",
    "multiple-choice",
    "What is the system design interview framework?",
    [
      "Just start coding",
      "Requirements → constraints → high-level design → detailed design → tradeoffs",
      "Pick a database first",
      "Draw the UI wireframe",
    ],
    1,
    "Always start with requirements and constraints. The architecture follows from understanding what you're optimizing for.",
    "easy",
    ["system-design"]
  ),
  q(
    "9-2-q3",
    "9-2",
    "multiple-choice",
    "What does TCO mean in a build-vs-buy decision?",
    [
      "Technical Code Output",
      "Total Cost of Ownership — including maintenance, training, integration, and opportunity cost over time",
      "Team Collaboration Overhead",
      "Test Coverage Objective",
    ],
    1,
    "TCO captures the full lifetime cost, not just the purchase price. Maintenance and integration often dominate.",
    "medium",
    ["build-vs-buy"]
  ),
  q(
    "9-2-q4",
    "9-2",
    "multiple-choice",
    "What is FinOps?",
    [
      "A financial reporting tool",
      "A practice of managing cloud costs with engineering, finance, and business collaboration",
      "A deployment strategy",
      "A type of database",
    ],
    1,
    "FinOps brings financial accountability to cloud spending — engineers see what their services cost and optimize accordingly.",
    "medium",
    ["finops", "cloud"]
  ),
  q(
    "9-2-q5",
    "9-2",
    "multiple-choice",
    "What is zero trust architecture?",
    [
      "Trust no one inside or outside the network — verify every request regardless of source",
      "Trust internal traffic completely",
      "No security at all",
      "Trust based on IP address",
    ],
    1,
    "Zero trust: 'never trust, always verify.' Every request is authenticated and authorized, even from inside the network perimeter.",
    "medium",
    ["security", "zero-trust"]
  ),
  q(
    "9-2-q6",
    "9-2",
    "multiple-choice",
    "At 100M users, what architectural pattern becomes essential?",
    [
      "Monolithic deployment",
      "Global distribution with regional sharding and eventual consistency",
      "Single database",
      "Manual scaling",
    ],
    1,
    "At global scale, latency requires regional presence, sharding handles data volume, and eventual consistency is the unavoidable tradeoff.",
    "hard",
    ["scaling"]
  ),
  q(
    "9-2-q7",
    "9-2",
    "multiple-choice",
    "What is the primary risk of vendor lock-in?",
    [
      "The vendor's logo is ugly",
      "Switching costs become prohibitive, giving the vendor pricing power and reducing your architectural flexibility",
      "It's faster",
      "It improves security",
    ],
    1,
    "Lock-in means switching costs exceed the benefit of alternatives. Evaluate portability before deep integration.",
    "hard",
    ["build-vs-buy", "vendor"]
  ),
  q(
    "9-2-q8",
    "9-2",
    "multiple-choice",
    "What is SOC 2 compliance?",
    [
      "A programming standard",
      "An audit framework verifying that a company handles customer data securely based on Trust Service Criteria",
      "A deployment tool",
      "A database type",
    ],
    1,
    "SOC 2 is often required by enterprise customers. It covers security, availability, processing integrity, confidentiality, and privacy.",
    "hard",
    ["security", "compliance"]
  ),

  // ── Module 9-3: Org Design ────────────────────────────────────────────────
  q(
    "9-3-q1",
    "9-3",
    "multiple-choice",
    "What are the four team types in Team Topologies?",
    [
      "Frontend, backend, QA, DevOps",
      "Stream-aligned, platform, enabling, complicated-subsystem",
      "Product, engineering, design, data",
      "Junior, mid, senior, staff",
    ],
    1,
    "Team Topologies provides a vocabulary for team design. Stream-aligned teams deliver value; platform teams reduce cognitive load.",
    "easy",
    ["team-topologies"]
  ),
  q(
    "9-3-q2",
    "9-3",
    "multiple-choice",
    "What does Conway's Law state?",
    [
      "Code quality degrades over time",
      "Organizations design systems that mirror their communication structure",
      "Meetings expand to fill available time",
      "All software eventually becomes legacy",
    ],
    1,
    "Conway's Law: if you have 4 teams, you'll get a 4-component architecture. Design your org to get the architecture you want.",
    "easy",
    ["conways-law"]
  ),
  q(
    "9-3-q3",
    "9-3",
    "multiple-choice",
    "When should the CTO role split from VP of Engineering?",
    [
      "Always from day one",
      "When the company reaches ~50-100 engineers and external-facing tech leadership and internal engineering management can't be done well by one person",
      "Never",
      "At IPO",
    ],
    1,
    "CTO: external (tech strategy, industry, customers). VP Eng: internal (people, process, delivery). One person can do both at 20 engineers; at 100, it's too much.",
    "medium",
    ["vp-eng", "cto"]
  ),
  q(
    "9-3-q4",
    "9-3",
    "multiple-choice",
    "What is psychological safety in an engineering team?",
    [
      "Never having disagreements",
      "Team members feel safe to take risks, admit mistakes, and raise concerns without fear of punishment",
      "Physical office security",
      "Avoiding all conflict",
    ],
    1,
    "Psychological safety is the #1 predictor of team effectiveness (Google's Project Aristotle). It enables honest communication and learning from failure.",
    "medium",
    ["culture"]
  ),
  q(
    "9-3-q5",
    "9-3",
    "multiple-choice",
    "What is the inverse Conway maneuver?",
    [
      "Reorganizing code to match the org chart",
      "Designing the org structure to produce the desired system architecture",
      "Reversing all Conway's Law effects",
      "A Git revert strategy",
    ],
    1,
    "If you want a microservices architecture, create teams aligned to service boundaries. The architecture will follow.",
    "hard",
    ["conways-law", "org-design"]
  ),
  q(
    "9-3-q6",
    "9-3",
    "multiple-choice",
    "What is a blameless postmortem?",
    [
      "Not reviewing incidents at all",
      "Analyzing what happened and how to prevent recurrence without assigning personal blame",
      "Blaming the on-call engineer",
      "A retrospective for sprints only",
    ],
    1,
    "Blameless postmortems focus on systems and processes, not people. Blame discourages reporting; learning prevents recurrence.",
    "medium",
    ["culture", "incidents"]
  ),
  q(
    "9-3-q7",
    "9-3",
    "multiple-choice",
    "At what team size does communication overhead become the dominant cost?",
    [
      "2-3 people",
      "5-8 people — Brooks's Law: adding people to a late project makes it later",
      "50+ only",
      "Never — more people is always better",
    ],
    1,
    "Communication channels grow as n(n-1)/2. At 7-8 people, a team starts spending more time coordinating than building.",
    "hard",
    ["scaling", "communication"]
  ),
  q(
    "9-3-q8",
    "9-3",
    "multiple-choice",
    "What is a platform team's purpose?",
    [
      "Building the product directly",
      "Reducing cognitive load for stream-aligned teams by providing self-service internal tools and infrastructure",
      "Managing HR functions",
      "Running marketing campaigns",
    ],
    1,
    "Platform teams enable stream-aligned teams to move fast without each team reinventing deployment, observability, or data pipelines.",
    "medium",
    ["team-topologies", "platform"]
  ),

  // ── Module 9-4: Product Strategy ──────────────────────────────────────────
  q(
    "9-4-q1",
    "9-4",
    "multiple-choice",
    "What does RICE stand for in prioritization?",
    [
      "Revenue, Impact, Cost, Effort",
      "Reach, Impact, Confidence, Effort",
      "Risk, Investment, Capability, Execution",
      "Requirements, Implementation, Coding, Evaluation",
    ],
    1,
    "RICE: Reach × Impact × Confidence / Effort. Produces a comparable score across different initiatives.",
    "easy",
    ["rice", "prioritization"]
  ),
  q(
    "9-4-q2",
    "9-4",
    "multiple-choice",
    "What are the four DORA metrics?",
    [
      "Revenue, growth, churn, NPS",
      "Deployment frequency, lead time for changes, change failure rate, time to restore service",
      "Lines of code, commits, PRs, reviews",
      "Uptime, latency, throughput, errors",
    ],
    1,
    "DORA metrics measure engineering delivery performance. Elite teams deploy on demand with <1h lead time, <5% change failure, and <1h restore.",
    "easy",
    ["dora-metrics"]
  ),
  q(
    "9-4-q3",
    "9-4",
    "multiple-choice",
    "How do you make the business case for paying down tech debt?",
    [
      "Just say 'the code is messy'",
      "Quantify the cost: developer hours wasted, incidents caused, features blocked, and compare to the cost of fixing it",
      "Refuse to ship new features",
      "Wait until it causes an outage",
    ],
    1,
    "Tech debt is a business argument: 'We spend X hours/week on workarounds. Fixing it costs Y and saves Z per quarter.'",
    "medium",
    ["tech-debt"]
  ),
  q(
    "9-4-q4",
    "9-4",
    "multiple-choice",
    "What is the difference between leading and lagging indicators?",
    [
      "They are the same thing",
      "Leading indicators predict future outcomes (code reviews completed); lagging indicators report past results (revenue, incidents)",
      "Leading is faster, lagging is slower",
      "Leading is for leaders only",
    ],
    1,
    "Leading indicators let you course-correct before lagging indicators show damage. Track both.",
    "medium",
    ["metrics"]
  ),
  q(
    "9-4-q5",
    "9-4",
    "multiple-choice",
    "What is the CTO's most important skill when talking to the board?",
    [
      "Technical depth",
      "Translating complex technical decisions into business impact and risk that non-technical people can act on",
      "Slide design",
      "Public speaking voice",
    ],
    1,
    "The board doesn't care about your tech stack. They care about how technology affects revenue, risk, and competitive position.",
    "hard",
    ["stakeholder-management"]
  ),
  q(
    "9-4-q6",
    "9-4",
    "multiple-choice",
    "What is MoSCoW prioritization?",
    [
      "A city-based framework",
      "Must have, Should have, Could have, Won't have — categorizing requirements by necessity",
      "A coding standard",
      "A deployment strategy",
    ],
    1,
    "MoSCoW forces hard conversations about what's actually required vs. what's nice to have.",
    "easy",
    ["moscow", "prioritization"]
  ),
  q(
    "9-4-q7",
    "9-4",
    "multiple-choice",
    "When should a startup pivot?",
    [
      "At the first sign of difficulty",
      "When the data consistently shows the current approach isn't reaching product-market fit despite iterations",
      "Never — always persist",
      "Every quarter",
    ],
    1,
    "Pivots should be data-driven: user retention, activation metrics, and revenue signals tell you whether to persist or change direction.",
    "hard",
    ["product-market-fit"]
  ),
  q(
    "9-4-q8",
    "9-4",
    "multiple-choice",
    "What makes a good quarterly roadmap?",
    [
      "A list of features with exact ship dates",
      "Themes aligned to business goals, with milestones, dependencies identified, and flexibility for discovery",
      "A Gantt chart with no slack",
      "Whatever the CEO asks for",
    ],
    1,
    "Good roadmaps communicate priorities and tradeoffs, not promises. Themes > features. Outcomes > outputs.",
    "medium",
    ["roadmapping"]
  ),

  // ── Module 9-5: Business Fundamentals ─────────────────────────────────────
  q(
    "9-5-q1",
    "9-5",
    "multiple-choice",
    "What is LTV (Lifetime Value)?",
    [
      "The cost to acquire a customer",
      "The total revenue a customer generates over their entire relationship with the company",
      "The time until a customer churns",
      "The company's total revenue",
    ],
    1,
    "LTV = average revenue per user × average customer lifespan. LTV must exceed CAC for a sustainable business.",
    "easy",
    ["unit-economics"]
  ),
  q(
    "9-5-q2",
    "9-5",
    "multiple-choice",
    "What is the difference between CAPEX and OPEX?",
    [
      "They are the same thing",
      "CAPEX is upfront investment in assets; OPEX is ongoing operational spending. Cloud shifted IT from CAPEX to OPEX",
      "CAPEX is cheaper",
      "OPEX requires board approval",
    ],
    1,
    "The cloud shift: instead of buying servers (CAPEX), you pay monthly for usage (OPEX). Different accounting treatment.",
    "easy",
    ["budgeting"]
  ),
  q(
    "9-5-q3",
    "9-5",
    "multiple-choice",
    "What does a CTO do in an investor meeting?",
    [
      "Sit quietly",
      "Demonstrate technical credibility, explain the architecture at a high level, answer due diligence questions, and show the team can execute",
      "Write code live",
      "Negotiate the valuation",
    ],
    1,
    "Investors want confidence that the tech works, the team can ship, and the CTO understands the business context.",
    "medium",
    ["fundraising"]
  ),
  q(
    "9-5-q4",
    "9-5",
    "multiple-choice",
    "What should a technical M&A evaluation assess?",
    [
      "Only the codebase quality",
      "Tech stack compatibility, team retention risk, technical debt, security posture, and integration complexity",
      "Just the number of engineers",
      "The logo design",
    ],
    1,
    "M&A tech eval covers: can we integrate this? Will key engineers stay? What's the hidden debt? What security risks exist?",
    "medium",
    ["ma", "evaluation"]
  ),
  q(
    "9-5-q5",
    "9-5",
    "multiple-choice",
    "How do you defend a $2M infrastructure spend to a skeptical CFO?",
    [
      "Just say 'we need it'",
      "Frame in business terms: cost of downtime, revenue at risk, cost-per-user reduction, and ROI timeline",
      "Threaten to quit",
      "Ask the CEO to override the CFO",
    ],
    1,
    "Speak the CFO's language: revenue protected, cost avoided, payback period, and what happens if you DON'T spend it.",
    "hard",
    ["budgeting", "stakeholder"]
  ),
  q(
    "9-5-q6",
    "9-5",
    "multiple-choice",
    "What is burn rate?",
    [
      "CPU utilization",
      "The rate at which a startup spends cash — monthly burn. Runway = cash / monthly burn",
      "API request rate",
      "Employee turnover rate",
    ],
    1,
    "If you have $3M and burn $250K/month, your runway is 12 months. CTOs must understand this to plan hiring and infrastructure.",
    "easy",
    ["financial-modeling"]
  ),
  q(
    "9-5-q7",
    "9-5",
    "multiple-choice",
    "What IP considerations matter for a CTO?",
    [
      "Only patents",
      "Code ownership (work-for-hire), open source license compliance, trade secrets, patent strategy, and data privacy obligations",
      "Nothing — lawyers handle it",
      "Only trademarks",
    ],
    1,
    "CTOs must ensure the company owns its code, complies with OSS licenses, and protects trade secrets.",
    "hard",
    ["legal", "ip"]
  ),
  q(
    "9-5-q8",
    "9-5",
    "multiple-choice",
    "What is the key principle when presenting technology strategy to a board?",
    [
      "Maximum technical detail",
      "Lead with business impact, then explain the technology as the enabler — not the other way around",
      "Use as many acronyms as possible",
      "Keep it to one slide",
    ],
    1,
    "Board members think in revenue, risk, and market position. Frame tech decisions as business decisions.",
    "medium",
    ["board", "communication"]
  ),

  // ── Module 9-6: Startup CTO ───────────────────────────────────────────────
  q(
    "9-6-q1",
    "9-6",
    "multiple-choice",
    "What is the 'boring technology thesis'?",
    [
      "Use the latest frameworks",
      "Choose proven, well-understood technologies so you spend innovation tokens on the product, not the stack",
      "Technology should be boring to learn",
      "Never try new things",
    ],
    1,
    "Dan McKinley's thesis: you have limited innovation tokens. Spend them on your product differentiator, not on unproven infrastructure.",
    "easy",
    ["tech-stack"]
  ),
  q(
    "9-6-q2",
    "9-6",
    "multiple-choice",
    "What should a startup CTO's first hire be?",
    [
      "A junior developer",
      "A strong generalist backend/full-stack engineer who can ship independently and covers your weaknesses",
      "A QA engineer",
      "A designer",
    ],
    1,
    "First hire fills your biggest gap. If you're backend-heavy, hire a frontend generalist. The first 5 hires set the culture.",
    "easy",
    ["hiring", "startup"]
  ),
  q(
    "9-6-q3",
    "9-6",
    "multiple-choice",
    "What should a startup CTO never skip, even in an MVP?",
    [
      "Comprehensive documentation",
      "Security basics (auth, input validation, secrets management) and automated tests for core flows",
      "Performance optimization",
      "Internationalization",
    ],
    1,
    "MVPs can skip polish. They cannot skip security, basic testing, and deployment automation — those compound from day one.",
    "medium",
    ["mvp", "startup"]
  ),
  q(
    "9-6-q4",
    "9-6",
    "multiple-choice",
    "What is sustainable pace in a startup?",
    [
      "Working 80-hour weeks indefinitely",
      "A workload that the team can maintain for years — intense but not burning out",
      "Only working 9-5",
      "Taking every other week off",
    ],
    1,
    "Startups need sustained intensity, not sprints that leave the team exhausted. Burnout causes attrition, which costs more than slower shipping.",
    "medium",
    ["startup", "pace"]
  ),
  q(
    "9-6-q5",
    "9-6",
    "multiple-choice",
    "What makes a CTO technically credible to investors?",
    [
      "Name-dropping technologies",
      "Clearly explaining architecture decisions, demonstrating understanding of scaling challenges, and showing a working product",
      "Having a PhD",
      "Using the latest AI buzzwords",
    ],
    1,
    "Investors assess: can this person build the product, scale it, and hire a team? Show working software and clear thinking.",
    "hard",
    ["fundraising", "startup"]
  ),
  q(
    "9-6-q6",
    "9-6",
    "true-false",
    "True or false: at a 5-person startup, the CTO should still be writing most of the code.",
    ["True", "False"],
    0,
    "At 5 people, the CTO IS the senior engineer. The transition to management happens at 15-25 engineers.",
    "easy",
    ["startup"]
  ),
  q(
    "9-6-q7",
    "9-6",
    "multiple-choice",
    "What is the biggest risk of over-engineering at the startup stage?",
    [
      "The code is too clean",
      "You build for scale you don't have yet, wasting the most constrained resource: time to product-market fit",
      "Other engineers can't understand it",
      "It's too fast",
    ],
    1,
    "Premature scaling is the #1 startup killer after 'no market need.' Build for 10x your current scale, not 1000x.",
    "hard",
    ["startup", "over-engineering"]
  ),
  q(
    "9-6-q8",
    "9-6",
    "multiple-choice",
    "What should the founding CTO's first technical decision be?",
    [
      "Choose the perfect tech stack",
      "Set up CI/CD and automated deployment — so every subsequent decision ships faster",
      "Build a custom framework",
      "Hire a DevOps team",
    ],
    1,
    "The first decision that compounds: automated build → test → deploy. Everything you build after ships faster because of this.",
    "medium",
    ["startup", "ci-cd"]
  ),

  // ── Module 9-7: Scale-Up CTO ──────────────────────────────────────────────
  q(
    "9-7-q1",
    "9-7",
    "multiple-choice",
    "What is the hardest transition for a scale-up CTO?",
    [
      "Learning new technologies",
      "Moving from builder to enabler — your individual technical contribution approaches zero",
      "Managing a budget",
      "Hiring faster",
    ],
    1,
    "The identity shift from 'I build things' to 'I enable others to build things' is the defining challenge of the scale-up CTO.",
    "easy",
    ["transition"]
  ),
  q(
    "9-7-q2",
    "9-7",
    "multiple-choice",
    "What do DORA metrics measure?",
    [
      "Code quality",
      "Software delivery performance: deployment frequency, lead time, change failure rate, MTTR",
      "Developer happiness",
      "Revenue per engineer",
    ],
    1,
    "DORA metrics are the industry standard for measuring engineering delivery performance.",
    "easy",
    ["dora-metrics"]
  ),
  q(
    "9-7-q3",
    "9-7",
    "multiple-choice",
    "What is an RFC process?",
    [
      "A random function call",
      "Request for Comments — a structured proposal for significant technical changes that invites team-wide input before a decision",
      "A code review tool",
      "A deployment procedure",
    ],
    1,
    "RFCs distribute decision-making, create documentation, and ensure major changes are reviewed before implementation begins.",
    "medium",
    ["process", "rfc"]
  ),
  q(
    "9-7-q4",
    "9-7",
    "multiple-choice",
    "What is developer experience (DX)?",
    [
      "How many years a developer has worked",
      "The quality of tools, workflows, and processes that affect how productive and satisfied engineers are in their daily work",
      "The user experience of a developer tool",
      "A hiring metric",
    ],
    1,
    "Good DX: fast builds, clear docs, easy onboarding, reliable CI. Poor DX: slow builds, tribal knowledge, flaky tests.",
    "medium",
    ["dx", "productivity"]
  ),
  q(
    "9-7-q5",
    "9-7",
    "multiple-choice",
    "What is the purpose of skip-level meetings?",
    [
      "To undermine direct managers",
      "To build relationships with ICs, gather unfiltered feedback, and spot issues that might not surface through management layers",
      "To assign work directly",
      "To review code",
    ],
    1,
    "Skip-levels give senior leaders direct signal from the team. Handle carefully — never undermine the intermediate manager.",
    "medium",
    ["managing-managers"]
  ),
  q(
    "9-7-q6",
    "9-7",
    "multiple-choice",
    "When should you consider a platform rewrite?",
    [
      "Every few years, on principle",
      "When the cost of maintaining the current platform consistently exceeds the cost of building a replacement, with evidence",
      "Whenever a new technology appears",
      "Never — always iterate",
    ],
    1,
    "Rewrites are expensive and risky. Only justified when the data shows maintenance cost has become untenable.",
    "hard",
    ["legacy", "rewrite"]
  ),
  q(
    "9-7-q7",
    "9-7",
    "multiple-choice",
    "What is an architecture council?",
    [
      "A team that writes all the code",
      "A group of senior engineers who review and guide major technical decisions to ensure consistency and quality across teams",
      "A vendor selection committee",
      "A project management office",
    ],
    1,
    "Architecture councils prevent divergence at scale. They review RFCs, maintain standards, and ensure cross-team alignment.",
    "hard",
    ["architecture", "governance"]
  ),
  q(
    "9-7-q8",
    "9-7",
    "multiple-choice",
    "What is the biggest risk when an organization grows from 50 to 200 engineers?",
    [
      "Running out of desk space",
      "Communication overhead overwhelms delivery — teams spend more time coordinating than building",
      "Too many programming languages",
      "Too many standups",
    ],
    1,
    "Brooks's Law at scale. The solution is team autonomy with clear interfaces, not more meetings.",
    "hard",
    ["scaling", "communication"]
  ),

  // ── Module 9-8: Enterprise CTO ────────────────────────────────────────────
  q(
    "9-8-q1",
    "9-8",
    "multiple-choice",
    "How does an enterprise CTO allocate their time?",
    [
      "90% coding",
      "~70% intake (reading, meetings, listening), ~20% synthesis (strategy, decisions), ~10% storytelling (presenting, writing)",
      "50% meetings, 50% coding",
      "100% management",
    ],
    1,
    "The enterprise CTO is an information processor. Most time is spent gathering context; the value is in synthesis and communication.",
    "easy",
    ["enterprise"]
  ),
  q(
    "9-8-q2",
    "9-8",
    "multiple-choice",
    "What is a technology radar?",
    [
      "A scanning device",
      "A visualization that categorizes technologies by adoption readiness: adopt, trial, assess, hold — guiding team decisions",
      "A CI/CD tool",
      "A monitoring dashboard",
    ],
    1,
    "ThoughtWorks popularized the radar format. It provides organization-wide guidance on which technologies to use, try, or avoid.",
    "easy",
    ["governance", "technology-radar"]
  ),
  q(
    "9-8-q3",
    "9-8",
    "multiple-choice",
    "What is the purpose of succession planning for a CTO?",
    [
      "Planning your retirement party",
      "Ensuring the organization can continue to function and grow if you leave — developing leaders who can step up",
      "Hiring your replacement before you're fired",
      "Planning the next product launch",
    ],
    1,
    "A CTO who is irreplaceable has failed at their job. Building leadership depth is one of the most important long-term responsibilities.",
    "medium",
    ["succession"]
  ),
  q(
    "9-8-q4",
    "9-8",
    "multiple-choice",
    "What does a 3-year technology strategy include?",
    [
      "A list of features to build",
      "Current state assessment, target architecture, capability gaps, migration roadmap, investment priorities, and risk mitigation",
      "A marketing plan",
      "A detailed sprint backlog",
    ],
    1,
    "Long-range strategy: where we are, where we're going, what gaps exist, what it costs, and what risks we're accepting.",
    "medium",
    ["strategy"]
  ),
  q(
    "9-8-q5",
    "9-8",
    "multiple-choice",
    "Why should enterprise CTOs maintain an industry presence?",
    [
      "Personal ego",
      "Recruiting (top talent joins visible leaders), influence (shape industry direction), learning (stay current), and brand (company credibility)",
      "It's not important",
      "Only for marketing",
    ],
    1,
    "Industry presence is a strategic asset: it attracts talent, surfaces trends early, and builds the company's technical brand.",
    "medium",
    ["industry", "leadership"]
  ),
  q(
    "9-8-q6",
    "9-8",
    "multiple-choice",
    "What is the role of an Architecture Review Board (ARB)?",
    [
      "To approve every code change",
      "To review significant architectural decisions, ensure alignment with strategy, and provide governance without slowing teams down",
      "To hire architects",
      "To manage the technology budget",
    ],
    1,
    "ARBs provide guardrails, not gates. Review the big decisions; trust teams with the day-to-day.",
    "hard",
    ["governance", "arb"]
  ),
  q(
    "9-8-q7",
    "9-8",
    "multiple-choice",
    "What is the most important skill for a CTO presenting to a board of directors?",
    [
      "Technical vocabulary",
      "Distilling complex technology decisions into business risk, revenue impact, and competitive advantage in plain language",
      "Reading slides verbatim",
      "Showing code demos",
    ],
    1,
    "The board thinks in business terms. The CTO's job is to translate technology into the language of risk, opportunity, and investment.",
    "hard",
    ["board", "communication"]
  ),
  q(
    "9-8-q8",
    "9-8",
    "multiple-choice",
    "What is the final measure of a successful CTO?",
    [
      "Lines of code written",
      "The organization's ability to deliver technology that drives business outcomes — sustainably, at scale, with a team that wants to stay",
      "Personal technical skills",
      "Number of patents filed",
    ],
    1,
    "A great CTO leaves behind a healthy organization that ships, a team that grows, and a strategy that outlasts their tenure.",
    "hard",
    ["leadership", "legacy"]
  ),
];
