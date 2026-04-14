import type { DictionaryTerm } from "@/types/dictionary";

/**
 * CTO Track and remaining gap terms — 50 terms covering management,
 * org design, product, business, strategy, leadership, and technical gaps.
 */
export const CTO_GAPS_TERMS: DictionaryTerm[] = [
  // ── Management (8) ──────────────────────────────────────────────
  {
    slug: "engineering-manager",
    term: "Engineering Manager",
    aliases: ["EM"],
    category: "leadership",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "A person who leads a team of software engineers, helping them grow and get their work done on time.",
      intermediate:
        "A technical leader responsible for people management, project delivery, and team health within an engineering organization. Balances hands-on technical guidance with coaching, hiring, and process improvement.",
      advanced:
        "A role at the intersection of technical strategy and organizational psychology, accountable for team throughput, retention, career development, and cross-functional alignment. Effective EMs create leverage through systems — hiring loops, sprint rituals, feedback cadences — rather than individual contribution.",
    },
    seeAlso: ["tech-lead", "one-on-one", "performance-review"],
  },
  {
    slug: "tech-lead",
    term: "Tech Lead",
    aliases: ["TL", "technical lead"],
    category: "leadership",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner: "A senior developer who guides the technical decisions for a team or project.",
      intermediate:
        "An individual contributor with additional responsibility for technical direction, code quality standards, and architecture decisions within a team. Usually still writes code but spends significant time on design reviews and mentoring.",
      advanced:
        "A role combining deep technical expertise with influence responsibilities — owning technical vision, managing tech debt strategy, de-risking architectural choices, and serving as the escalation point for complex implementation decisions. Distinct from engineering management in that the primary axis is technical rather than people.",
    },
    seeAlso: ["engineering-manager", "staff-engineer"],
  },
  {
    slug: "staff-engineer",
    term: "Staff Engineer",
    aliases: ["staff+", "principal engineer"],
    category: "leadership",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "A very experienced engineer who works on the hardest problems and helps set direction for the whole company's technology.",
      intermediate:
        "A senior individual-contributor role above senior engineer that operates across teams, driving technical strategy, mentoring leads, and tackling ambiguous, high-impact problems without direct management authority.",
      advanced:
        "A leadership-track IC role characterized by org-wide scope, architectural ownership, and influence without authority. Staff engineers create technical leverage by writing RFCs, sponsoring migrations, establishing standards, and aligning technical investments with business outcomes. Leveling often maps to director-equivalent in management tracks.",
    },
    seeAlso: ["tech-lead", "engineering-manager"],
  },
  {
    slug: "one-on-one",
    term: "One-on-One",
    aliases: ["1:1", "1-on-1"],
    category: "leadership",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "A regular private meeting between a manager and a team member to talk about work, goals, and any problems.",
      intermediate:
        "A recurring meeting between a manager and direct report focused on career development, blockers, feedback, and relationship building. Typically 30 minutes weekly or biweekly, with the report owning the agenda.",
      advanced:
        "A structured coaching ritual that serves as the primary feedback loop in management. Effective 1:1s balance tactical unblocking with strategic career conversations, use running documents for continuity, and surface organizational signals that would otherwise remain hidden. Research consistently links 1:1 frequency with employee engagement and retention.",
    },
    seeAlso: ["engineering-manager", "skip-level", "performance-review"],
  },
  {
    slug: "performance-review",
    term: "Performance Review",
    aliases: ["perf review", "performance evaluation"],
    category: "leadership",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "A formal check-in where a manager evaluates how well someone is doing their job and discusses areas to improve.",
      intermediate:
        "A periodic evaluation process that assesses an employee's contributions against expectations, often tied to compensation adjustments and promotion decisions. Usually includes self-assessment, peer feedback, and manager evaluation.",
      advanced:
        "A calibrated assessment mechanism within talent management systems, combining quantitative output metrics with qualitative peer signals. Well-designed review cycles mitigate recency bias through brag documents, separate compensation discussions from growth conversations, and use calibration committees to ensure cross-team fairness.",
    },
    seeAlso: ["one-on-one", "pip-performance", "hiring-rubric"],
  },
  {
    slug: "hiring-rubric",
    term: "Hiring Rubric",
    aliases: ["interview scorecard", "evaluation criteria"],
    category: "leadership",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "A checklist or scoring guide that interviewers use to fairly evaluate job candidates.",
      intermediate:
        "A structured evaluation framework that defines the competencies, signals, and scoring criteria interviewers use to assess candidates consistently. Reduces bias by ensuring every candidate is measured against the same bar.",
      advanced:
        "A calibration instrument in structured interviewing that maps role-specific competencies to observable behavioral signals across interview stages. Effective rubrics include anti-bias nudges, distinguish between levels, define what 'strong no' through 'strong yes' look like concretely, and are validated against on-the-job performance data over time.",
    },
    seeAlso: ["performance-review", "engineering-manager"],
  },
  {
    slug: "pip-performance",
    term: "Performance Improvement Plan",
    aliases: ["PIP"],
    category: "leadership",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "A formal plan given to an employee who is not meeting expectations, with clear goals to improve within a set time.",
      intermediate:
        "A documented process that outlines specific performance deficiencies, measurable improvement goals, support resources, and a timeline — typically 30 to 90 days. Serves as both a coaching tool and a legal record.",
      advanced:
        "A structured remediation framework that operationalizes the gap between current and expected performance with SMART objectives, check-in cadences, and defined success criteria. Ethically administered PIPs genuinely aim for recovery; organizationally they also create a defensible record. Leaders must distinguish between skill gaps (trainable) and will gaps (cultural misalignment) to select the right intervention.",
    },
    seeAlso: ["performance-review", "one-on-one"],
  },
  {
    slug: "skip-level",
    term: "Skip-Level Meeting",
    aliases: ["skip-level 1:1"],
    category: "leadership",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "A meeting where you talk to your manager's manager, skipping one level up in the company.",
      intermediate:
        "A periodic meeting between a senior leader and individual contributors two or more levels below, designed to surface ground-level feedback, build trust, and identify issues that may not flow through normal reporting lines.",
      advanced:
        "An organizational sensing mechanism that provides leaders with unfiltered signal about team health, process friction, and cultural drift. Effective skip-levels use psychological safety techniques, rotate participants, and feed insights back into management calibration without creating back-channel dynamics that undermine direct managers.",
    },
    seeAlso: ["one-on-one", "engineering-manager", "psychological-safety-term"],
  },

  // ── Org Design (7) ──────────────────────────────────────────────
  {
    slug: "team-topology-term",
    term: "Team Topologies",
    aliases: ["team topology"],
    category: "org-design",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way of organizing engineering teams so they can build and ship software faster with fewer dependencies on other teams.",
      intermediate:
        "A framework by Matthew Skelton and Manuel Pais that defines four fundamental team types — stream-aligned, platform, enabling, and complicated-subsystem — and three interaction modes to reduce cognitive load and optimize delivery flow.",
      advanced:
        "An organizational design model grounded in Conway's Law that treats team structure as architecture. It prescribes minimizing cross-team dependencies through well-defined APIs between team types, uses team cognitive load as a primary sizing heuristic, and evolves interaction modes (collaboration, X-as-a-Service, facilitating) over time as capabilities mature.",
    },
    seeAlso: ["conways-law-term", "platform-team", "stream-aligned-team", "enabling-team"],
  },
  {
    slug: "conways-law-term",
    term: "Conway's Law",
    aliases: ["Conway's law"],
    category: "org-design",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "The idea that the software a company builds ends up looking like the company's own communication structure.",
      intermediate:
        "An adage stating that organizations design systems that mirror their own communication structures. If three teams build a compiler, you get a three-pass compiler. Used to argue that org structure and architecture must be co-designed.",
      advanced:
        "Melvin Conway's 1967 observation, empirically validated across decades, that the homomorphism between organizational communication graphs and system module dependency graphs is nearly inevitable. The 'Inverse Conway Maneuver' deliberately restructures teams to produce a desired architecture, treating org design as a first-class architectural tool.",
    },
    seeAlso: ["team-topology-term", "cognitive-load"],
  },
  {
    slug: "span-of-control",
    term: "Span of Control",
    aliases: ["management ratio"],
    category: "org-design",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "How many people one manager directly supervises — too many and the manager can't help everyone effectively.",
      intermediate:
        "The number of direct reports a single manager oversees. In engineering, 5-8 is typical. A wider span means less coaching time per person; a narrower span adds management layers and communication overhead.",
      advanced:
        "An organizational design parameter that trades off managerial depth (coaching quality, feedback frequency) against hierarchy flatness (decision speed, autonomy). Optimal span depends on team maturity, task complexity, and tooling support. Research by Google's Project Oxygen and others links effective span to manager capability rather than a fixed number.",
    },
    seeAlso: ["engineering-manager", "team-topology-term"],
  },
  {
    slug: "platform-team",
    term: "Platform Team",
    aliases: ["platform engineering team"],
    category: "org-design",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "A team that builds tools and services so other developers can ship their features faster without worrying about infrastructure.",
      intermediate:
        "A team that provides self-service internal capabilities — CI/CD pipelines, deployment platforms, observability stacks — as a product to stream-aligned teams. Success is measured by developer adoption and reduced cognitive load for feature teams.",
      advanced:
        "An enabling infrastructure team operating in X-as-a-Service interaction mode, whose product is developer experience. Platform teams apply product management practices (user research, roadmaps, SLOs) to internal tooling, create golden paths that encode best practices, and measure success through adoption metrics, lead time reduction, and stream-aligned team autonomy.",
    },
    seeAlso: ["team-topology-term", "stream-aligned-team", "enabling-team"],
  },
  {
    slug: "stream-aligned-team",
    term: "Stream-Aligned Team",
    aliases: ["product team", "feature team"],
    category: "org-design",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "A team that owns one part of the product from start to finish and can ship changes without waiting on other teams.",
      intermediate:
        "The primary team type in Team Topologies, aligned to a single stream of work — a product, feature set, or user journey. Responsible for the full lifecycle: build, run, and iterate. Depends on platform and enabling teams for capabilities outside its core mission.",
      advanced:
        "A long-lived, cross-functional team with end-to-end ownership of a value stream, optimized for flow. Stream-aligned teams internalize as much of the delivery pipeline as possible, push complexity to platform teams, and interact with enabling teams in time-boxed facilitation engagements. Their health is measured by DORA metrics and business KPIs tied to their stream.",
    },
    seeAlso: ["team-topology-term", "platform-team", "dora-metrics-term"],
  },
  {
    slug: "enabling-team",
    term: "Enabling Team",
    aliases: ["coaching team"],
    category: "org-design",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "A team of specialists who temporarily help other teams learn new skills or adopt new tools.",
      intermediate:
        "A team that assists stream-aligned teams in acquiring new capabilities — such as observability, testing practices, or cloud migration — through time-boxed facilitation rather than doing the work for them.",
      advanced:
        "A knowledge-transfer-oriented team operating in facilitating interaction mode, whose success metric is the speed at which stream-aligned teams become self-sufficient in a target capability. Enabling teams detect capability gaps across the organization, curate best practices, and dissolve their engagement once the knowledge is embedded, making them inherently transient in scope.",
    },
    seeAlso: ["team-topology-term", "stream-aligned-team", "platform-team"],
  },
  {
    slug: "cognitive-load",
    term: "Cognitive Load",
    aliases: ["mental overhead"],
    category: "org-design",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "How much a person or team has to keep in their head at once — too much and they slow down or make mistakes.",
      intermediate:
        "The total amount of mental effort required to operate within a system. In Team Topologies, it is the primary heuristic for team sizing: if a team's cognitive load exceeds capacity, the domain should be split or platform capabilities offloaded.",
      advanced:
        "A concept borrowed from educational psychology (Sweller, 1988) and applied to software team design. Intrinsic load (essential domain complexity), extraneous load (accidental complexity from tooling and process), and germane load (learning investment) must all fit within a team's cognitive budget. Minimizing extraneous load through platform abstractions and clear domain boundaries is the central lever in modern org design.",
    },
    seeAlso: ["team-topology-term", "conways-law-term", "span-of-control"],
  },

  // ── Product (7) ─────────────────────────────────────────────────
  {
    slug: "roadmap-term",
    term: "Roadmap",
    aliases: ["product roadmap"],
    category: "product",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "A plan that shows what features or improvements a team intends to build and roughly when.",
      intermediate:
        "A strategic communication artifact that aligns stakeholders on planned initiatives, timelines, and priorities. Modern roadmaps emphasize outcomes and themes over fixed feature lists to accommodate learning and changing requirements.",
      advanced:
        "A living alignment tool that maps business objectives to time-horizoned delivery themes. Effective roadmaps use a Now/Next/Later framework, tie each initiative to measurable outcomes (OKRs, North Star Metric), and are continuously reprioritized based on validated learning. Anti-pattern: treating the roadmap as a commitment contract rather than a strategic hypothesis.",
    },
    seeAlso: ["okr", "north-star-metric", "rice-scoring"],
  },
  {
    slug: "rice-scoring",
    term: "RICE Scoring",
    aliases: ["RICE framework", "RICE"],
    category: "product",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "A scoring method that helps teams decide what to build first by rating ideas on Reach, Impact, Confidence, and Effort.",
      intermediate:
        "A prioritization framework where each initiative is scored as (Reach × Impact × Confidence) / Effort. Produces a single comparable number to rank features, bug fixes, and improvements against each other.",
      advanced:
        "A quantitative prioritization model from Intercom designed to reduce opinion-driven roadmapping. Reach is the number of users affected per time period; Impact is scored on a predefined scale; Confidence accounts for estimation uncertainty; Effort normalizes scope. Limitations include subjective Impact scoring and the temptation to game Confidence — mitigated by calibration sessions and pairing RICE with qualitative signals.",
    },
    seeAlso: ["moscow-method", "roadmap-term"],
  },
  {
    slug: "moscow-method",
    term: "MoSCoW Method",
    aliases: ["MoSCoW prioritization", "MoSCoW"],
    category: "product",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way to sort features into four groups: Must have, Should have, Could have, and Won't have — to decide what gets built first.",
      intermediate:
        "A prioritization technique that categorizes requirements into Must-have (critical for launch), Should-have (important but not blocking), Could-have (nice-to-have), and Won't-have (explicitly deferred). Common in time-boxed delivery like sprints or releases.",
      advanced:
        "A categorical prioritization heuristic originating from DSDM that forces explicit scope negotiation by requiring stakeholders to classify every requirement. Effective use caps Must-haves at ~60% of capacity, preventing scope creep. Weakness: the categories are ordinal, not ratio-scaled, so the method does not capture trade-offs between items within the same category — pair with RICE or WSJF for finer granularity.",
    },
    seeAlso: ["rice-scoring", "roadmap-term"],
  },
  {
    slug: "product-market-fit-term",
    term: "Product-Market Fit",
    aliases: ["PMF"],
    category: "product",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "When you have built something people actually want and are willing to use regularly.",
      intermediate:
        "The stage at which a product satisfies strong market demand — users retain, recommend, and are upset if the product disappears. Often measured by the Sean Ellis survey (>40% 'very disappointed' threshold) and organic growth metrics.",
      advanced:
        "A phase-transition point where pull from the market exceeds push from the company. Indicators include high retention cohorts, negative churn, organic virality, and sales cycle compression. Marc Andreessen's original formulation emphasizes that PMF is felt qualitatively before it is measured quantitatively. Pre-PMF, optimize for learning velocity; post-PMF, optimize for growth efficiency.",
    },
    seeAlso: ["north-star-metric", "unit-economics-term"],
  },
  {
    slug: "north-star-metric",
    term: "North Star Metric",
    aliases: ["NSM"],
    category: "product",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "The single most important number that shows whether a product is succeeding at delivering value to its users.",
      intermediate:
        "A single metric that captures the core value a product delivers to users, used to align the entire organization. For Spotify it is time spent listening; for Airbnb, nights booked. Sub-metrics (input metrics) drive the North Star.",
      advanced:
        "A focal metric in the growth model that correlates with long-term business value and reflects user value realization. A well-chosen NSM decomposes into a driver tree of input metrics owned by different teams, creating alignment without centralized control. Risks include Goodhart's Law (metric optimization diverging from actual value) and tunnel vision — mitigate with guardrail metrics.",
    },
    seeAlso: ["okr", "product-market-fit-term"],
  },
  {
    slug: "okr",
    term: "OKR",
    aliases: ["Objectives and Key Results"],
    category: "product",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "A goal-setting method where you pick an objective (what you want to achieve) and key results (how you will know you achieved it).",
      intermediate:
        "A framework popularized by Intel and Google for setting and tracking goals. Objectives are qualitative and aspirational; Key Results are quantitative and measurable. Typically set quarterly with 60-70% achievement considered healthy for stretch OKRs.",
      advanced:
        "A cascading goal-alignment framework that decouples intent (Objectives) from measurement (Key Results). Effective OKR implementations use bidirectional alignment — top-down strategic context and bottom-up team-level commitments — grade on a 0.0-1.0 scale, and explicitly decouple OKR attainment from compensation to preserve psychological safety around ambitious targets.",
    },
    seeAlso: ["north-star-metric", "roadmap-term", "sprint-velocity"],
  },
  {
    slug: "sprint-velocity",
    term: "Sprint Velocity",
    aliases: ["velocity", "team velocity"],
    category: "product",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "How much work a team typically finishes in one sprint, used to plan how much work to take on next time.",
      intermediate:
        "The total story points (or comparable units) a team completes per sprint, averaged over several sprints. Used for capacity planning and forecasting, not performance evaluation.",
      advanced:
        "A planning heuristic in Scrum that provides a trailing-average throughput signal for sprint commitment. Velocity is team-specific, context-dependent, and unsuitable for cross-team comparison or individual performance measurement. More sophisticated forecasting uses Monte Carlo simulation on cycle-time distributions rather than deterministic velocity projections.",
    },
    seeAlso: ["okr", "dora-metrics-term"],
  },

  // ── Business (8) ────────────────────────────────────────────────
  {
    slug: "unit-economics-term",
    term: "Unit Economics",
    aliases: ["per-unit economics"],
    category: "business",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "The math that shows whether a business makes or loses money on each customer or each sale.",
      intermediate:
        "The revenue and costs associated with a single unit of a business model — typically one customer, one transaction, or one subscription. Healthy unit economics means each unit is profitable after accounting for acquisition and servicing costs.",
      advanced:
        "The marginal contribution analysis of a business model's atomic unit. Key ratios include LTV:CAC (>3:1 healthy), payback period (<12 months ideal for SaaS), and gross margin per unit. Unit economics must hold at scale — beware metrics that look positive in early cohorts due to founder-led sales but degrade as acquisition channels saturate.",
    },
    seeAlso: ["customer-acquisition-cost", "lifetime-value", "burn-rate-term"],
  },
  {
    slug: "customer-acquisition-cost",
    term: "Customer Acquisition Cost",
    aliases: ["CAC"],
    category: "business",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "How much money it costs to get one new customer, including marketing and sales expenses.",
      intermediate:
        "Total sales and marketing spend divided by the number of new customers acquired in a given period. A core metric for evaluating growth efficiency, typically analyzed alongside LTV to ensure sustainable growth.",
      advanced:
        "A fully loaded acquisition cost metric that should include all variable costs attributable to acquisition: ad spend, sales salaries, tooling, content production, and attribution overhead. Blended CAC masks channel-specific economics — segment by channel and cohort. CAC payback period (months to recover CAC from gross margin) is often more actionable than the raw number.",
    },
    seeAlso: ["lifetime-value", "unit-economics-term", "burn-rate-term"],
  },
  {
    slug: "lifetime-value",
    term: "Lifetime Value",
    aliases: ["LTV", "CLV", "customer lifetime value"],
    category: "business",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "The total amount of money a business expects to earn from one customer over the entire time they remain a customer.",
      intermediate:
        "The predicted net revenue a customer will generate over their entire relationship with a business. Calculated as average revenue per user × gross margin × average customer lifespan. The LTV:CAC ratio is a key health metric.",
      advanced:
        "A forward-looking probabilistic metric computed as the discounted sum of expected future gross margin contributions from a customer cohort. Sophisticated models use survival analysis (Kaplan-Meier or BG/NBD) rather than simple averages, segment by acquisition channel and behavior cohort, and apply a discount rate to reflect time value. Over-optimistic LTV estimates are a leading cause of unsustainable growth spending.",
    },
    seeAlso: ["customer-acquisition-cost", "unit-economics-term"],
  },
  {
    slug: "burn-rate-term",
    term: "Burn Rate",
    aliases: ["cash burn", "monthly burn"],
    category: "business",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "How much money a startup spends each month beyond what it earns — the speed at which it uses up its cash.",
      intermediate:
        "The net rate at which a company spends its cash reserves, typically expressed monthly. Gross burn is total spend; net burn is spend minus revenue. Determines runway and informs fundraising timing.",
      advanced:
        "A treasury management metric calculated as the month-over-month decrease in cash and cash equivalents. Net burn should be analyzed alongside revenue growth rate to compute the 'Hype Ratio' (burn multiple = net burn / net new ARR). A burn multiple >2x signals inefficient growth. Boards typically require 18-24 months of runway post-raise to provide adequate buffer for fundraising cycles.",
    },
    seeAlso: ["runway-term", "unit-economics-term", "series-a"],
  },
  {
    slug: "runway-term",
    term: "Runway",
    aliases: ["cash runway"],
    category: "business",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner: "How many months a startup can keep operating before it runs out of money.",
      intermediate:
        "Current cash balance divided by monthly net burn rate. A startup with $1.2M in the bank burning $100K/month has 12 months of runway. The metric drives hiring pace and fundraising urgency.",
      advanced:
        "A dynamic survival metric that must account for revenue trajectory, planned hiring, and seasonal spending patterns — not just current burn. Scenario modeling (base case, upside, downside) is essential. The fundraising rule of thumb: begin raising when you have 6-9 months of runway remaining, as venture rounds typically take 3-6 months to close.",
    },
    seeAlso: ["burn-rate-term", "series-a"],
  },
  {
    slug: "series-a",
    term: "Series A",
    aliases: ["Series A round", "Series A funding"],
    category: "business",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "The first major round of funding a startup raises from professional investors after proving the idea works.",
      intermediate:
        "A venture capital financing round typically ranging from $5M-$20M, occurring after a seed stage, in exchange for preferred equity. Investors expect evidence of product-market fit, meaningful traction metrics, and a credible path to scale.",
      advanced:
        "An institutional priced equity round that establishes board governance, liquidation preferences, anti-dilution provisions, and pro-rata rights. Series A investors perform technical due diligence, financial modeling, and reference checks. The round sets the valuation benchmark for all subsequent raises. Current market medians fluctuate, but the core bar remains: demonstrated PMF, repeatable go-to-market motion, and capital-efficient growth.",
    },
    seeAlso: ["cap-table", "burn-rate-term", "technical-due-diligence", "product-market-fit-term"],
  },
  {
    slug: "cap-table",
    term: "Cap Table",
    aliases: ["capitalization table"],
    category: "business",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "A spreadsheet that shows who owns what percentage of a company — founders, investors, and employees.",
      intermediate:
        "A document listing all shareholders, their equity stakes, option grants, and convertible instruments. Essential for understanding dilution across funding rounds and for modeling exit scenarios.",
      advanced:
        "A ledger of all outstanding equity securities — common stock, preferred stock, options, warrants, SAFEs, and convertible notes — along with their terms (vesting schedules, liquidation preferences, participation rights, anti-dilution clauses). Cap table management becomes critical at scale; modeling tools (Carta, Pulley) simulate round impacts, exercise windows, 409A valuations, and waterfall distributions.",
    },
    seeAlso: ["series-a", "technical-due-diligence"],
  },
  {
    slug: "technical-due-diligence",
    term: "Technical Due Diligence",
    aliases: ["tech DD", "technical audit"],
    category: "business",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "When investors examine a startup's code, systems, and engineering team before deciding whether to invest.",
      intermediate:
        "An evaluation of a company's technology stack, architecture, code quality, security posture, team composition, and technical debt — typically conducted during a funding round or acquisition. Identifies risks that could affect scalability or execution speed.",
      advanced:
        "A systematic assessment covering architecture (scalability, reliability, modularity), code quality (test coverage, CI/CD maturity, DORA metrics), security (vulnerability management, compliance certifications), IP ownership (clean room provenance, OSS license exposure), team (key-person risk, hiring pipeline), and tech debt quantification. Findings are risk-rated and factored into valuation, deal terms, and post-close integration plans.",
    },
    seeAlso: ["series-a", "cap-table", "dora-metrics-term"],
  },

  // ── Strategy (6) ────────────────────────────────────────────────
  {
    slug: "technology-radar-term",
    term: "Technology Radar",
    aliases: ["tech radar"],
    category: "strategy",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "A visual guide that shows which technologies a company recommends using, trying, or avoiding.",
      intermediate:
        "A tool popularized by ThoughtWorks that categorizes technologies, tools, platforms, and techniques into four rings — Adopt, Trial, Assess, Hold — to guide an organization's technology choices and reduce fragmentation.",
      advanced:
        "A technology governance instrument that crowdsources engineering signal into a curated, opinionated guide. Effective radars are updated quarterly by a cross-team working group, distinguish between organizational context and industry trends, and are paired with Architecture Decision Records for specific adoption decisions. The format reduces bike-shedding by externalizing collective judgment.",
    },
    seeAlso: ["architecture-review-board-term", "request-for-comments"],
  },
  {
    slug: "architecture-review-board-term",
    term: "Architecture Review Board",
    aliases: ["ARB"],
    category: "strategy",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "A group of senior engineers who review big technical decisions to make sure they are sound before the team commits.",
      intermediate:
        "A cross-functional governance body that reviews and approves significant architectural decisions — new services, technology adoptions, data model changes — ensuring alignment with organizational standards and long-term strategy.",
      advanced:
        "A lightweight governance mechanism that balances team autonomy with organizational coherence. Modern ARBs operate asynchronously via RFC review, apply decision criteria (reversibility, blast radius, standards compliance), and maintain an architecture decision log. Anti-pattern: gatekeeping that creates bottlenecks. The board's value scales with its ability to advise rather than block.",
    },
    seeAlso: ["request-for-comments", "technology-radar-term"],
  },
  {
    slug: "request-for-comments",
    term: "Request for Comments",
    aliases: ["RFC", "design doc"],
    category: "strategy",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "A written proposal that describes a technical plan and invites feedback from the team before building it.",
      intermediate:
        "A structured document that proposes a significant technical change, outlines alternatives considered, defines success criteria, and solicits async review. RFCs create a decision record and distribute knowledge across the organization.",
      advanced:
        "A decision-forcing function that converts hallway conversations into durable, reviewable artifacts. An effective RFC template includes context, problem statement, proposed solution, alternatives, risks, rollback plan, and acceptance criteria. RFCs reduce key-person dependency, create institutional memory, and align stakeholders asynchronously — critical for distributed teams. Pair with ADR (Architecture Decision Records) for recording the final decision.",
    },
    seeAlso: ["architecture-review-board-term", "technology-radar-term"],
  },
  {
    slug: "dora-metrics-term",
    term: "DORA Metrics",
    aliases: ["DORA", "Accelerate metrics"],
    category: "strategy",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "Four measurements that show how well a software team delivers: how often they deploy, how fast, how often things break, and how quickly they fix problems.",
      intermediate:
        "Four key metrics from the DORA (DevOps Research and Assessment) team: Deployment Frequency, Lead Time for Changes, Change Failure Rate, and Mean Time to Recovery. Teams are classified as Elite, High, Medium, or Low performers based on these metrics.",
      advanced:
        "A statistically validated set of software delivery performance indicators derived from the Accelerate State of DevOps research program. DORA metrics are outcome-oriented (not output-oriented) and correlate with organizational performance. Elite performers deploy on demand with <1 hour lead time, <5% change failure rate, and <1 hour recovery time. The metrics resist Goodhart's Law better than most because they are balanced — improving one at the expense of others moves the team down, not up.",
    },
    seeAlso: ["slo-term", "incident-response-term", "sprint-velocity", "stream-aligned-team"],
  },
  {
    slug: "incident-response-term",
    term: "Incident Response",
    aliases: ["IR", "incident management"],
    category: "strategy",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "The process a team follows when something breaks in production — who gets alerted, how they fix it, and how they prevent it from happening again.",
      intermediate:
        "A structured process for detecting, triaging, mitigating, and resolving production incidents. Includes on-call rotations, severity classification, communication protocols, and post-incident review. PagerDuty and Opsgenie are common tooling choices.",
      advanced:
        "A sociotechnical system encompassing detection (alerting, anomaly detection), response (incident commander role, communication bridges, status pages), mitigation (runbooks, feature flags, rollback), and learning (blameless postmortems, action item tracking). Mature incident response programs measure MTTD, MTTA, MTTM, and MTTR separately, run game days to stress-test the process, and treat incidents as learning opportunities rather than failures.",
    },
    seeAlso: ["blameless-postmortem-term", "slo-term", "dora-metrics-term", "health-check"],
  },
  {
    slug: "slo-term",
    term: "Service Level Objective",
    aliases: ["SLO", "SLA", "SLI"],
    category: "strategy",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "A target for how reliable a service should be — for example, 'the website should be available 99.9% of the time.'",
      intermediate:
        "A target value for a Service Level Indicator (SLI) — such as 99.95% availability or p99 latency under 200ms. SLOs define the reliability contract between a service and its consumers. When an SLO is backed by a business agreement, it becomes an SLA.",
      advanced:
        "A reliability engineering primitive from Google's SRE framework. SLIs are the metrics (availability, latency, throughput, correctness), SLOs are the targets, and error budgets are the inverse (100% - SLO). Error budget policies govern the trade-off between reliability investment and feature velocity: when the budget is exhausted, feature work pauses in favor of reliability work. This creates an objective, data-driven negotiation framework between product and engineering.",
    },
    seeAlso: ["dora-metrics-term", "incident-response-term", "health-check"],
  },

  // ── Leadership (6) ──────────────────────────────────────────────
  {
    slug: "psychological-safety-term",
    term: "Psychological Safety",
    aliases: ["psych safety"],
    category: "leadership",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "When team members feel safe to speak up, ask questions, and admit mistakes without fear of being punished or embarrassed.",
      intermediate:
        "A shared belief among team members that it is safe to take interpersonal risks — asking questions, admitting errors, proposing ideas. Google's Project Aristotle found it to be the single strongest predictor of team effectiveness.",
      advanced:
        "A construct from Amy Edmondson's research defined as the absence of interpersonal fear in a group context. It enables learning behaviors (experimentation, feedback seeking, error reporting) that are prerequisites for high performance in knowledge work. Leaders cultivate it through modeling vulnerability, responding productively to bad news, and sanctioning interpersonal aggression. It is necessary but not sufficient — high-performing teams pair psychological safety with high accountability.",
    },
    seeAlso: ["blameless-postmortem-term", "servant-leadership", "one-on-one"],
  },
  {
    slug: "blameless-postmortem-term",
    term: "Blameless Postmortem",
    aliases: ["blameless retrospective", "incident review"],
    category: "leadership",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "A meeting after something goes wrong where the team focuses on what happened and how to prevent it — without blaming anyone.",
      intermediate:
        "A structured review conducted after an incident that focuses on systemic causes rather than individual fault. Documents the timeline, contributing factors, and action items. The blameless framing encourages honest disclosure, leading to better prevention.",
      advanced:
        "A learning-from-failure practice rooted in safety science and resilience engineering (Dekker, Cook). Blamelessness does not mean accountability-free — it means replacing 'who caused this' with 'what conditions made this outcome likely.' Effective postmortems use facilitators, structured templates, counterfactual analysis, and produce tracked action items. The document becomes organizational memory that prevents repeat incidents.",
    },
    seeAlso: ["psychological-safety-term", "incident-response-term", "slo-term"],
  },
  {
    slug: "servant-leadership",
    term: "Servant Leadership",
    aliases: [],
    category: "leadership",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "A leadership style where the leader's main job is to support their team and remove obstacles so the team can do great work.",
      intermediate:
        "A philosophy where the leader prioritizes the growth and well-being of team members over their own authority. In engineering, this means removing blockers, securing resources, shielding the team from distractions, and advocating for their career development.",
      advanced:
        "A leadership model originated by Robert Greenleaf (1970) that inverts the traditional power hierarchy. The leader's effectiveness is measured by the growth of those served: do they become healthier, wiser, more autonomous, more likely to become servant-leaders themselves? In tech organizations, servant leadership manifests as context-setting over directive management, investing in team leverage over personal visibility, and measuring success by team outcomes rather than individual heroics.",
    },
    seeAlso: ["psychological-safety-term", "delegation-framework", "engineering-manager"],
  },
  {
    slug: "delegation-framework",
    term: "Delegation Framework",
    aliases: ["delegation levels", "delegation poker"],
    category: "leadership",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "A system that helps managers decide which decisions to make themselves, which to make together with the team, and which to hand off entirely.",
      intermediate:
        "A model that defines levels of delegation — from 'Tell' (manager decides) through 'Consult,' 'Agree,' 'Advise,' to 'Delegate' (team decides). Helps leaders be explicit about decision authority and avoid both micromanagement and abdication.",
      advanced:
        "A decision-rights allocation framework (often based on Jurgen Appelo's Management 3.0 delegation levels) that maps each decision type to an appropriate authority level. Effective implementation uses a delegation board — a visible matrix of decisions and their current delegation levels — reviewed periodically as team maturity evolves. The framework operationalizes situational leadership theory by making implicit authority structures explicit and negotiable.",
    },
    seeAlso: ["servant-leadership", "maker-manager-schedule", "engineering-manager"],
  },
  {
    slug: "maker-manager-schedule",
    term: "Maker-Manager Schedule",
    aliases: ["maker schedule", "manager schedule"],
    category: "leadership",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "The idea that people who write code need long uninterrupted blocks of time, while managers work in shorter meeting-filled chunks — and both need to respect each other's style.",
      intermediate:
        "Paul Graham's observation that makers (engineers, designers) need half-day or full-day blocks for deep work, while managers operate in one-hour slots. Scheduling a single meeting in the middle of a maker's afternoon can destroy an entire productive block.",
      advanced:
        "A scheduling heuristic with deep roots in flow state research (Csikszentmihalyi) and attention residue theory (Leroy). Organizations operationalize it through meeting-free days, core collaboration hours, async-first communication norms, and calendar audits. Tech leads straddling both schedules face the hardest version — they must deliberately protect maker blocks while fulfilling manager obligations, often by batching meetings and using office hours.",
    },
    seeAlso: ["delegation-framework", "engineering-manager", "tech-lead"],
  },
  {
    slug: "managing-up-term",
    term: "Managing Up",
    aliases: ["upward management"],
    category: "leadership",
    phaseIds: ["9"],
    lessonIds: [],
    definitions: {
      beginner:
        "The skill of communicating clearly with your boss — keeping them informed, understanding their priorities, and making their job easier.",
      intermediate:
        "The practice of proactively managing the relationship with your manager: providing timely status updates, framing problems with proposed solutions, understanding their goals and communication preferences, and escalating risks early rather than late.",
      advanced:
        "A bidirectional influence practice that optimizes the manager-report working relationship for mutual effectiveness. Key techniques include pre-wiring decisions with stakeholders before formal review, framing requests in terms of business impact, providing appropriate abstraction level for the audience (detail for ICs, outcomes for executives), and building trust through reliable delivery and transparent risk communication. Senior ICs and tech leads who manage up effectively gain organizational leverage disproportionate to their formal authority.",
    },
    seeAlso: ["one-on-one", "skip-level", "maker-manager-schedule"],
  },

  // ── Gaps (8) ────────────────────────────────────────────────────
  {
    slug: "api-gateway",
    term: "API Gateway",
    aliases: ["gateway"],
    category: "infrastructure",
    phaseIds: ["7", "8"],
    lessonIds: [],
    definitions: {
      beginner:
        "A single front door that all requests to your backend go through — it handles things like security checks and routing before passing requests to the right service.",
      intermediate:
        "A reverse proxy that sits in front of backend services and handles cross-cutting concerns: authentication, rate limiting, request routing, protocol translation, and response caching. Examples include Kong, AWS API Gateway, and NGINX.",
      advanced:
        "An infrastructure component implementing the API Gateway pattern that centralizes ingress concerns — authN/authZ, TLS termination, rate limiting, request transformation, circuit breaking, and observability (distributed tracing headers, access logs). In microservice architectures, gateways prevent duplication of cross-cutting logic across services. Trade-off: the gateway becomes a single point of failure and a deployment bottleneck if not operated as a stateless, horizontally scalable tier.",
    },
    seeAlso: ["webhook", "circuit-breaker", "health-check"],
  },
  {
    slug: "webhook",
    term: "Webhook",
    aliases: ["HTTP callback", "web callback"],
    category: "infrastructure",
    phaseIds: ["7", "8"],
    lessonIds: [],
    definitions: {
      beginner:
        "A way for one app to automatically notify another app when something happens — like getting a text message when someone pays you.",
      intermediate:
        "An HTTP callback triggered by an event in a source system. Instead of polling, the consumer registers a URL, and the source POSTs event data to that URL when the event occurs. Common in payment processors, CI/CD, and third-party integrations.",
      advanced:
        "An event-driven integration pattern using HTTP POST as the transport mechanism. Production-grade webhook systems require HMAC signature verification (to authenticate the sender), idempotency handling (duplicate delivery is common), retry with exponential backoff (on receiver failure), and dead-letter queues for undeliverable events. Receiver endpoints should return 2xx immediately and process asynchronously to avoid timeout-driven retries.",
    },
    seeAlso: ["idempotency", "retry-pattern", "api-gateway"],
  },
  {
    slug: "idempotency",
    term: "Idempotency",
    aliases: ["idempotent"],
    category: "infrastructure",
    phaseIds: ["7", "8"],
    lessonIds: [],
    definitions: {
      beginner:
        "Making sure that doing the same action twice has the same effect as doing it once — so if a payment request is sent twice by accident, you only get charged once.",
      intermediate:
        "A property of an operation where performing it multiple times produces the same result as performing it once. Critical in distributed systems where network retries can cause duplicate requests. Implemented via idempotency keys, upserts, or conditional writes.",
      advanced:
        "A mathematical property (f(f(x)) = f(x)) applied to distributed system design to ensure safety under at-least-once delivery semantics. Implementation strategies include client-generated idempotency keys stored server-side with TTL, database upserts with natural keys, and conditional writes (ETags, compare-and-swap). Stripe's idempotency key pattern is the industry reference. Without idempotency guarantees, retry logic and webhook redelivery can cause data corruption.",
    },
    seeAlso: ["eventual-consistency-term", "retry-pattern", "webhook"],
  },
  {
    slug: "eventual-consistency-term",
    term: "Eventual Consistency",
    aliases: ["eventually consistent"],
    category: "infrastructure",
    phaseIds: ["7", "8"],
    lessonIds: [],
    definitions: {
      beginner:
        "A system where different parts might show slightly different data for a short time, but they all sync up eventually.",
      intermediate:
        "A consistency model in distributed systems where replicas may temporarily return stale data but are guaranteed to converge to the same value once updates stop. Trades strong consistency for higher availability and lower latency, per the CAP theorem.",
      advanced:
        "A weak consistency model formalized in the context of the CAP theorem and the PACELC framework. Under eventual consistency, the system guarantees liveness (all reads eventually return the latest write) but not safety (reads may return stale values during convergence). Conflict resolution strategies include last-writer-wins (LWW), vector clocks, and CRDTs. Application-level compensation patterns (saga, read-your-writes via session stickiness) are often needed to provide acceptable UX despite backend eventual consistency.",
    },
    seeAlso: ["idempotency", "circuit-breaker"],
  },
  {
    slug: "circuit-breaker",
    term: "Circuit Breaker",
    aliases: ["circuit breaker pattern"],
    category: "infrastructure",
    phaseIds: ["7", "8"],
    lessonIds: [],
    definitions: {
      beginner:
        "A safety mechanism that stops your app from repeatedly calling a broken service — like a fuse that trips to prevent damage.",
      intermediate:
        "A resilience pattern that monitors failures to an external dependency and 'trips' after a threshold, immediately returning errors instead of attempting calls. After a cooldown, it allows a trial request through. Prevents cascade failures in distributed systems.",
      advanced:
        "A state-machine pattern (Closed → Open → Half-Open) from Michael Nygard's 'Release It!' that provides fail-fast behavior for failing dependencies. Configuration parameters include failure threshold, timeout window, half-open trial count, and success threshold to close. In practice, circuit breakers are combined with retry policies, bulkheads, and timeouts in a resilience stack (e.g., Polly, resilience4j, Hystrix). Observability of circuit state transitions is critical for operational awareness.",
    },
    seeAlso: ["retry-pattern", "graceful-shutdown", "health-check"],
  },
  {
    slug: "retry-pattern",
    term: "Retry Pattern",
    aliases: ["retry with backoff", "exponential backoff"],
    category: "infrastructure",
    phaseIds: ["7", "8"],
    lessonIds: [],
    definitions: {
      beginner:
        "Automatically trying a failed request again after a short wait — like re-dialing a phone number that was busy.",
      intermediate:
        "A resilience pattern that retries failed operations with increasing delays between attempts (exponential backoff) and randomized jitter to prevent thundering herd. Must be paired with idempotency to avoid side effects from duplicate requests.",
      advanced:
        "A fault-tolerance pattern that addresses transient failures (network blips, temporary overload) by retrying with exponential backoff (delay = base × 2^attempt) plus full or decorrelated jitter. Key design decisions: max retries, retryable vs. non-retryable errors (never retry 400s, always retry 503s), backoff ceiling, and circuit breaker integration to stop retries when the dependency is confirmed down. AWS's architecture blog on exponential backoff and jitter is the canonical reference.",
    },
    seeAlso: ["idempotency", "circuit-breaker", "webhook"],
  },
  {
    slug: "health-check",
    term: "Health Check",
    aliases: ["healthcheck", "liveness probe", "readiness probe"],
    category: "infrastructure",
    phaseIds: ["7", "8"],
    lessonIds: [],
    definitions: {
      beginner:
        "A simple endpoint that reports whether a service is running and healthy — like a heartbeat monitor for your app.",
      intermediate:
        "An HTTP endpoint (typically /health or /healthz) that returns the service's status. Kubernetes distinguishes liveness probes (is the process alive?) from readiness probes (can it accept traffic?). Load balancers use health checks to route traffic away from unhealthy instances.",
      advanced:
        "A service observability primitive with two critical variants: shallow checks (process is alive, returns 200) and deep checks (dependencies are reachable, disk/memory within thresholds). Kubernetes liveness probes restart stuck containers; readiness probes remove them from service discovery. Anti-pattern: deep health checks on liveness probes cause cascading restarts during dependency outages. Health check endpoints should be unauthenticated, lightweight, and exclude sensitive information from responses.",
    },
    seeAlso: ["graceful-shutdown", "circuit-breaker", "incident-response-term", "slo-term"],
  },
  {
    slug: "graceful-shutdown",
    term: "Graceful Shutdown",
    aliases: ["graceful termination"],
    category: "infrastructure",
    phaseIds: ["7", "8"],
    lessonIds: [],
    definitions: {
      beginner:
        "When an app finishes what it is currently doing before turning off, instead of stopping abruptly and losing work in progress.",
      intermediate:
        "The process of shutting down a service by first stopping acceptance of new requests, then completing in-flight requests, closing database connections, and flushing buffers before exiting. Prevents data loss and dropped requests during deployments or scaling events.",
      advanced:
        "A lifecycle management pattern triggered by SIGTERM that executes an ordered teardown: deregister from service discovery (fail health checks), drain in-flight requests within a configurable timeout, close persistent connections (DB pools, message consumers), flush async buffers (logs, metrics), and exit with code 0. In Kubernetes, the terminationGracePeriodSeconds (default 30s) defines the window before SIGKILL. Proper graceful shutdown is a prerequisite for zero-downtime deployments and autoscaling.",
    },
    seeAlso: ["health-check", "circuit-breaker", "api-gateway"],
  },
];
