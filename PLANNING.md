# DURA — Engineering Education, Hardened by Design

> **Product:** DURA
> **Company:** Durwood Studios LLC
> **Ideation:** Dustin Snellings
> **License:** AGPLv3 (core platform) · Apache 2.0 (APIs + integrations)
> **Repository:** github.com/Durwood-Studios/Dura
> **Status:** Open source · In development
> **Last Updated:** April 8, 2026

---

## Vision

DURA is an open-source, offline-capable learning platform that takes anyone from absolute zero to CTO-ready through mastery-gated, standards-backed engineering education.

It does not promise shortcuts. It provides the means — verified through hardened skills testing — for those willing to do the work.

Built for every screen. Works without internet. Free forever at the core.

---

## Free Forever Principle

DURA's core platform is free. Permanently. This is not a trial, not freemium, not "free until traction." The AGPLv3 license legally guarantees the source stays open.

No feature gates behind payment. No premium content tiers. No "upgrade to unlock." The tip button is voluntary gratitude, not access control.

Future revenue (if any) comes from new products built on top of DURA — managed hosting for institutions, enterprise SSO, analytics dashboards, consulting. Never from restricting what already exists.

Trust at scale is the product.

---

## Table of Contents

1. What We're Building
2. Who It's For
3. Tech Stack
4. Project Structure
5. Curriculum Architecture
6. Adaptive Paths
7. The CTO Track
8. Lesson System
9. Bite-Sized Learning Mode
10. Code Sandbox System
11. Spaced Repetition (FSRS)
12. Verified Dictionary
13. Gamification
14. Study Modes
15. Learning Goals
16. Skills Verification
17. Teacher Path
18. Supporting Pages
19. Integrations
20. Design System
21. Animation and Motion
22. Responsive Design
23. Performance
24. PWA and Offline
25. Accessibility
26. Legal Compliance
27. Open Source Strategy
28. Standards Mapping
29. Analytics and Data
30. Support the Developer
31. Value and Growth Strategy
32. Implementation Timeline
33. Blockers and TODO

---

## 1. What We're Building

DURA is a Progressive Web App that teaches software engineering, AI engineering, and technology leadership from the ground up.

### Core Principles

1. Reading-first. No video dependency. Content works on any connection.
2. Mastery-gated. You advance when you prove it, not when time passes.
3. Standards-backed. Every lesson maps to ACM CS2023, SWEBOK v4, or SFIA 9.
4. Offline-capable. The PWA works without internet after first load.
5. Open source. The core platform is free. Always.
6. Bite-sized and deep. 5-8 minute micro-lessons that do not sacrifice rigor.
7. Verification through testing. Hardened assessments that prove competency.
8. No bold claims. We provide the means. The learner provides the will.

---

## 2. Who It's For

Complete beginner: Starts Phase 0. ~2,850 hours to CTO Track.
Career switcher: Starts Phase 0 accelerated. ~1,800 hours.
Bootcamp graduate: Starts Phase 3. ~1,300 hours to fill the gap.
Mid-level engineer: Starts Phase 5. ~1,300 hours to Staff/CTO.
Senior pushing Staff/CTO: Phase 7 + CTO Track. ~800 hours.
Teacher/Mentor: Teacher Dashboard for curriculum delivery.
Anyone, anywhere, any device: Skill Assessment determines entry point.

---

## 3. Tech Stack

Framework: Next.js 15 (App Router, Server Components)
Language: TypeScript (strict mode, no any)
Styling: Tailwind CSS v4 (config-free, uses @theme in CSS)
UI Components: shadcn/ui + 21st.dev community components
Content: MDX via next-mdx-remote
Animation: Motion (Framer Motion v12) + GSAP ScrollTrigger
Smooth Scroll: Lenis
State: Zustand with IndexedDB persistence
Offline Storage: IndexedDB via idb
PWA: Serwist (next-pwa successor)
Auth: Supabase Auth (optional — app works without it)
Database: Supabase PostgreSQL (optional, for sync/social features)
Code Sandboxes: Sandpack (JS/React), Pyodide (Python), Judge0 (compiled)
Code Editor: Monaco Editor (advanced exercises)
Syntax Highlighting: Shiki (build-time, zero runtime cost)
Deployment: Vercel (hobby tier, auto-deploy from GitHub)
Fonts: DM Sans (body) + JetBrains Mono (code) + Instrument Serif (accent)
Icons: Lucide React
Validation: Zod (runtime)
Analytics: Custom privacy-first event tracker (IndexedDB-based)

---

## 4. Project Structure

```
dura/
  public/ manifest.json, icons/, og/
  src/
    app/
      layout.tsx — Root: fonts, metadata, providers
      page.tsx — Splash/landing page
      loading.tsx — Global loading skeleton
      error.tsx — Global error boundary
      not-found.tsx — Custom 404
      (marketing)/ about, how-it-works, open-source
      (app)/
        layout.tsx — App shell: sidebar + top bar + mobile nav
        loading.tsx — App loading skeleton
        error.tsx — App error boundary
        dashboard/page.tsx
        paths/ [phaseId]/ [moduleId]/ [lessonId]/
        review/page.tsx
        dictionary/page.tsx
        sandbox/page.tsx
        goals/page.tsx
        stats/page.tsx
        verify/page.tsx
        settings/page.tsx
        teach/ page.tsx, export/page.tsx
      api/
        v1/
          terms/route.ts — Dictionary API
          terms/[slug]/route.ts — Single term
          phases/route.ts — Curriculum phases
          health/route.ts — Health check
    components/
      ui/ — shadcn/ui base + skeletons
      splash/ — Hero, PhaseGrid, Features, CTA
      lesson/ — LessonReader, ScrollTracker, CompletionGate, CodeBlock, Quiz, ParsonsPanel, FillBlank, SandboxExercise, BiteMode, VocabTooltip
      review/ — FlashcardDeck, ReviewStats
      dictionary/ — TermCard, DifficultyToggle, SearchBar
      sandbox/ — JSPlayground, PythonPlayground, MonacoEditor, OutputConsole
      goals/ — GoalSetter, GoalTracker, MilestoneTimeline
      study/ — FocusMode, PomodoroTimer, SessionStats
      verify/ — SkillTest, CertificateView, VerificationBadge
      nav/ — TopBar, Sidebar, MobileNav, Breadcrumbs
      motion/ — ScrollReveal, PageTransition, StaggerList, ConfettiCannon
      seo/ — MetaTags, ShareButton
      providers/ — ThemeProvider
      teacher/
    content/
      phases.ts — Phase metadata and module stubs
      dictionary/ — Term definitions
      phases/ 0 through 9, each with modules and lessons
    lib/
      db.ts — IndexedDB schema and connection
      db/ — Typed helpers: progress, flashcards, goals, preferences
      fsrs.ts — FSRS-5 spaced repetition algorithm
      analytics.ts — Privacy-first event tracking
      dictionary.ts — Term search and filter utilities
      xp.ts — XP calculation and leveling
      streak.ts — Streak tracking
      og.ts — Open Graph metadata helpers
      utils.ts — cn(), formatTime, generateId, debounce, throttle
      supabase/ — client.ts, server.ts, middleware.ts
    stores/
      progress.ts — Lesson progress UI state
      review.ts — Flashcard review session state
      preferences.ts — Theme, study mode, font size
      ui.ts — Sidebar, modals, command palette
    types/
      curriculum.ts — Phase, Module, LessonMeta, LessonProgress
      flashcard.ts — FlashCard, ReviewRating
      analytics.ts — AnalyticsEvent
  CLAUDE.md — Claude Code project rules
  PLANNING.md — This file
  DECISIONS.md
  CONTRIBUTING.md
  CODE_OF_CONDUCT.md
  LICENSE — AGPLv3
  doc/adr/
  .github/ workflows/ci.yml, ISSUE_TEMPLATE/, PULL_REQUEST_TEMPLATE.md
  .husky/ pre-commit, commit-msg
  .vscode/ settings.json, extensions.json
```

---

## 5. Curriculum Architecture

10 Phases. ~2,850 total hours. Zero to CTO.

Phase 0: Digital Literacy — 50h, 4 modules, ~16 lessons
Phase 1: Programming Fundamentals — 225h, 6 modules, ~45 lessons
Phase 2: Web Development — 275h, 5 modules, ~50 lessons
Phase 3: CS Fundamentals — 225h, 5 modules, ~40 lessons
Phase 4: Backend Engineering — 275h, 5 modules, ~45 lessons
Phase 5: Systems Engineering — 350h, 4 modules, ~35 lessons
Phase 6: AI/ML Engineering — 400h, 6 modules, ~50 lessons
Phase 7: Advanced Systems — 350h, 4 modules, ~30 lessons
Phase 8: Professional Practice — 200h, 5 modules, ~35 lessons
Phase 9: CTO Track — 500h, 8 modules, ~60 lessons

Total: 52 modules, ~406 lessons

---

## 6. Adaptive Paths

35-question skill assessment (10 minutes) maps to Dreyfus levels and recommends a path. Users can always switch or access any unlocked phase.

PATH A Foundation: 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9
PATH B Career Switch: 0(fast) → 1 → 2 → 4 → 3 → 8(subset)
PATH C Bootcamp Grad: 3 → 5 → 4(adv) → 6 → 7 → 8
PATH D Mid to Senior: 5 → 3(adv) → 6 → 7 → 8
PATH E AI Specialist: 6 → 3(ML math) → 7(agents) → 8
PATH F CTO Track: 8 → 9 (requires Phase 5+ completion)

---

## 7. The CTO Track (Phase 9)

The typical CTO career takes 10-15 years. DURA compresses the learning — not the experience — by eliminating wasted time and teaching the day-to-day realities at every company stage.

Completion of DURA does not make someone a CTO. It gives them every tool, framework, and understanding that a CTO needs — verified through rigorous testing. The gap between completion and the title is execution and opportunity.

### 8 Modules, 500 hours

9-1: The Engineering Manager Transition (60h)
1:1s, performance reviews, hiring, firing, skip-levels. Sprint planning, velocity. Day-to-day reality at each step.

9-2: Technical Architecture at Scale (80h)
System design for 10K to 100M users. Build vs buy frameworks. FinOps. Security architecture, SOC 2. What breaks at each scale threshold.

9-3: Team Building and Org Design (60h)
Team Topologies. Conway's Law. Scaling 5 to 100 engineers. VP Eng vs CTO split. How to design teams that ship.

9-4: Product Strategy and Roadmapping (50h)
RICE/MoSCoW prioritization. Tech debt quantification. Translating tech to board language. How to say no to the CEO.

9-5: Business Fundamentals for CTOs (60h)
Unit economics. Technology budgeting. M&A due diligence. The CTO's role in fundraising. How to defend a $2M infrastructure spend.

9-6: The Startup CTO (70h)
80% coding, 20% firefighting. Foundational decisions that compound. First 5 hires. You ARE the engineering department.

9-7: The Scale-Up CTO (60h)
Builder to enabler transition. Process design. DORA metrics. Managing managers. Your IDE gathers dust — now what.

9-8: The Enterprise CTO (60h)
3-5 year strategy. Innovation labs. Board presentations. 70% intake, 20% synthesis, 10% storytelling.

### Essential Reading (integrated into lessons)

The Manager's Path, An Elegant Puzzle, Staff Engineer, High Output Management, The Hard Thing About Hard Things, Team Topologies, Accelerate, The Lean Startup

---

## 8. Lesson System

Every lesson follows this structure:

Header: Title, phase, estimated time, difficulty, standards mapping
Body: Long-form reading (700px max-width, 1.8 line-height). Interactive element every 2-3 minutes. Dictionary terms auto-linked with dotted underlines.
Code: Syntax-highlighted blocks (Shiki, light theme default). Runnable sandbox exercises.
Exercises: Quiz, Parsons problem, fill-in-the-blank, sandbox challenge, explain-in-your-words prompt.
Vocabulary: 5-10 terms with one-click flashcard creation.
Completion: Scroll >=85% AND time >=70% of estimate AND quiz passed.
XP: 50 per lesson.

### Content Voice

Direct, technical, no fluff. Explain WHY before HOW. Admit complexity. Day-to-day context for professional phases. Edge cases and methodology included. Not a lecture — an open learning resource.

---

## 9. Bite-Sized Learning Mode

For learners on the go. Auto-detected on mobile or set in preferences.

Lessons split into 2-4 minute micro-segments. Each segment ends with one interaction. Swipe to advance. Progress saves per-segment. Optimized for one-handed phone use. Daily goal: complete 3 segments (configurable).

Research: 90% of learners prefer 5-10 min modules. Completion jumps from 20% to 80%+.

---

## 10. Code Sandbox System

Inline: Shiki + console mock — read-only display
Light: Sandpack — JS/TS/React interactive exercises
Full: Monaco + Pyodide — Python + data science
Advanced: Monaco + Judge0 API — compiled languages

Freeform sandbox page at /sandbox. Choose language, write/run/save code, share via URL, fork lesson exercises. Works offline (Sandpack + Pyodide run in-browser).

### Language Support Tiers

DURA prioritizes depth over breadth. We do not aim to support "every language."

Tier 1 — Full support (lessons + sandbox + exercises + dictionary terms):
JavaScript, TypeScript, Python, HTML/CSS, SQL
These cover 90% of DURA's curriculum (Phases 0-6, 8).

Tier 2 — Sandbox support via Judge0 (run code, referenced in lessons):
Rust, Go, C, C++, Java
These cover systems engineering and advanced topics (Phases 5, 7).

Tier 3 — Reference only (mentioned in lessons, no sandbox):
Everything else. DURA is not Exercism or LeetCode. We teach engineering
principles through a focused set of languages, not syntax for 60+ languages.

### Operating System Support

The platform: Equal on all OS. DURA is a PWA — Chrome, Firefox, Safari, Edge
on Windows, macOS, Linux, iOS, Android. Responsive. Offline.

The content: Linux-primary with Windows equivalents.

- Terminal lessons (Phase 0): bash commands primary, PowerShell in expandable
  "Windows" callout blocks. macOS terminal is bash-compatible by default.
- Git lessons: identical on all OS.
- Dev environment setup: VS Code setup covered for Windows, macOS, and Linux.
- Docker lessons: Linux-native concepts, Docker Desktop for macOS/Windows noted.
- Systems engineering (Phase 5): Linux-centric by nature (OS internals, networking).
  This is not a bias — production servers run Linux. We teach what's real.

Lesson MDX supports a <PlatformToggle> component (future) that lets users set
their OS preference and see relevant commands throughout all lessons.

---

## 11. Spaced Repetition (FSRS)

FSRS-5 algorithm implemented directly (no external dependency). Target retention 90%. Cards auto-generated from vocabulary and quizzes. 4 ratings: Again, Hard, Good, Easy. Leitner box visualization. Export to Anki.

Safe fallback: if FSRS math fails for any reason, card shows again tomorrow.

---

## 12. Verified Dictionary

Three difficulty tiers per term: Beginner (analogy), Intermediate (technical + code), Advanced (spec-level + edge cases).

In-lesson: dotted underline on first occurrence, hover tooltip, click for slide-in panel. Standalone page: fuzzy search, phase filter, backlinks to lessons, add to review deck. API for external integrations (/api/v1/terms). Offline-cached via IndexedDB. Exportable as PDF, CSV, Dash docset.

Each term has its own URL: dura.dev/dictionary/algorithm — drives SEO traffic.

---

## 13. Gamification

XP: 50/lesson, 10/quiz, 5/flashcard, 25/sandbox challenge.
Streaks: Consecutive days with activity. 1 freeze/week.
Leagues: Segmented by activity level.
Badges: Phase completion, streak milestones, perfect quizzes.
Milestones: Junior Ready (Phase 4), Senior Ready (Phase 8), CTO Ready (Phase 9).
No punitive mechanics. No pay-to-win. No pay-to-anything. Celebrations on completion.

Level system: level = floor(sqrt(totalXp / 100))

---

## 14. Study Modes

Standard: Full lesson with all interactions.
Bite: Micro-segments, swipe navigation.
Focus: Distraction-free (hides nav, mutes notifications).
Review: Flashcards only.
Sprint: Pomodoro timer with session tracking.
Challenge: Time-limited exercises.

---

## 15. Learning Goals

Daily: Minutes or lessons per day.
Weekly: Lessons or hours per week.
Phase: Target completion date.
Career: Target role with path mapping.
Custom milestones with reminders.
Dashboard shows progress, projections, on-track status.

---

## 16. Skills Verification

### Mastery Gates

10-15 questions per module. 80% to advance. Retakeable after 24h cooldown. Different questions each attempt.

### Phase Verification Tests

45-60 minutes, 25-40 questions, includes sandbox challenges. Scored, timestamped, verification hash. Shareable link: dura.dev/verify/{hash}.

### Certificates

Auto-generated on phase completion. Name, phase, date, score, QR code, standards covered. Downloadable PDF. LinkedIn badge. Embeddable image badge.

No inflated language. States: "Demonstrated mastery of [topics] through verified assessment."

---

## 17. Teacher Path

Dashboard: Browse curriculum, view standards alignment, track students, create classes, assign content, view aggregate stats.

Exportable resources (no auth required): Lesson PDFs, module workbooks, vocabulary CSV/Anki, quiz bank JSON, curriculum map PDF, cheat sheets, reading lists.

Network effect: one teacher brings 30 students.

---

## 18. Supporting Pages

How-To Guides (/howto): Practical guides for common tasks. Dev environment setup, Git basics, reading errors, deploying, interview prep.

Tutorials (/tutorials): Standalone project-based tutorials. Build a CLI tool, REST API, RAG chatbot, React dashboard. Each references relevant DURA lessons.

About (/about): Mission, philosophy, Durwood Studios LLC, Dustin Snellings, open source story, standards backing. No marketing fluff.

Open Source (/open-source): Contribution guide, architecture, roadmap, contributors wall, GitHub link.

---

## 19. Integrations

All optional. App works fully without any of them.

Authentication (Supabase Auth): Optional. GitHub + Google + Apple Sign In (Apple Developer account active). One tap to connect, one tap to disconnect. Enables cross-device sync, teacher features.

Future: GitHub (sandbox export), Discord (community link), Anki (flashcard export), LinkedIn (badges), VS Code extension (dictionary).

### Integration Philosophy

1. The feature works without it (offline-first)
2. Connection is one action
3. Disconnection loses no local data

---

## 20. Design System

### Design Philosophy

Bright, study-neutral, premium. People sit with this for hours.
Think: Notion's clarity + Linear's polish + Stripe Docs' readability.
Light mode is the DEFAULT. Dark mode is a toggle.

### Colors — Light Theme (default)

Background: #FAFAFA (warm off-white, not pure white)
Surface: #FFFFFF (cards, elevated surfaces)
Subtle: #F5F5F4 (section backgrounds, alternating)
Accent Background: #F0FDF4 (emerald tinted highlights)
Border: #E5E5E5 (neutral)
Border Subtle: #F0F0F0 (faint dividers)
Text Primary: #171717 (near-black, high contrast)
Text Secondary: #525252 (body text)
Text Muted: #A3A3A3 (captions)
Accent Emerald: #10B981 (primary brand)
Accent Cyan: #06B6D4 (secondary accent)
Accent Amber: #F59E0B (streaks, XP)
Accent Purple: #8B5CF6 (flashcards, review)
Accent Rose: #F43F5E (errors)
Shadow SM: 0 1px 2px rgba(0,0,0,0.05)
Shadow MD: 0 4px 12px rgba(0,0,0,0.08)
Shadow LG: 0 12px 40px rgba(0,0,0,0.1)

### Colors — Dark Theme (toggle)

Background: #08080d
Surface: #111118
Subtle: #1a1a24
Accent colors remain the same in both themes.

### Phase Colors

Phase 0: #6ee7b7, Phase 1: #93c5fd, Phase 2: #c4b5fd, Phase 3: #fda4af, Phase 4: #fdba74
Phase 5: #f0abfc, Phase 6: #67e8f9, Phase 7: #fcd34d, Phase 8: #a3e635, Phase 9: #f472b6

### Typography

Body: DM Sans 400 (reads better on light than 300)
Headings: DM Sans 600 (not 700 — too heavy on light backgrounds)
Code: JetBrains Mono 400
Accent: Instrument Serif italic (taglines only)
Body size: 16-18px desktop, 15-16px mobile
Line height: 1.8 for reading, 1.5 for UI
Code size: 14px
Max content width: 700px for reading
Code blocks: #F5F5F4 background with dark text (light theme default)

### Component Library

Base: shadcn/ui (Radix primitives + Tailwind)
Premium: 21st.dev community components (Hero, bento grids, cards, navbars, CTAs)
Install: npx shadcn@latest add "https://21st.dev/r/{author}/{component}"
Custom: All lesson-specific components (Quiz, Parsons, Sandbox, VocabTooltip)

### Component Style

Cards: white surface, subtle border (#E5E5E5), soft shadow-sm, rounded-xl (12px)
Cards on hover: shadow-md, scale(1.01), 200ms transition
Sections alternate: #FAFAFA → #F5F5F4 → #FFFFFF for visual rhythm
Buttons: emerald fill for primary, outlined for secondary, ghost for tertiary
Minimum tap target: 48px on mobile
Focus indicators: 2px ring, emerald color

---

## 21. Animation and Motion

Stack: Motion v12 (component animations, page transitions), GSAP ScrollTrigger (scroll sequences, pinning), Lenis (smooth scroll), CSS scroll-driven (progress bars, parallax).

Timing: Hover 150-250ms, page transitions 300-500ms, scroll reveals 400-800ms ease-out, list stagger 50-100ms. Spring: stiffness 300, damping 30.

Philosophy: Subtle, not flashy. This is a study space, not a SaaS landing page. Animations support focus, not distract from it.

---

## 22. Responsive Design

Mobile (<640px): Single column, bottom tab nav (Home, Learn, Review, Dict, Stats), swipe gestures, 48px min tap targets, horizontal code scroll, pull-to-refresh.

Tablet (640-1024px): Collapsible sidebar, split view for lesson+sandbox in landscape, floating TOC button.

Desktop (>1024px): Three-column (sidebar, content, TOC). Keyboard shortcuts. Hover tooltips. Side-by-side sandbox.

---

## 23. Performance

Targets: Lighthouse >=95, FCP <1.5s, LCP <2.5s, CLS <0.1, TTI <3s, offline load <300ms. No single page loads more than 150 kB First Load JS.

Strategy: Static generation for lessons (ISR), code split per route, lazy load heavy components (Sandpack/Monaco/Pyodide only when visible), next/image optimization, font subsetting via next/font, Shiki at build time, prefetch next lesson after 10s, IndexedDB for all progress (no API calls for basic usage), dynamic imports for Motion/GSAP (not top-level), React.memo for repeated list items, virtual scroll for 10K+ dictionary terms, skeletons everywhere (never blank screens).

---

## 24. PWA and Offline

Service worker (Serwist): App shell precached, lessons stale-while-revalidate, static cache-first, progress network-first with 3s timeout. Dictionary fully cached.

IndexedDB stores: progress, flashcards, goals, preferences, dictionary-cache, analytics.

Sync: Offline changes marked unsynced. Background Sync API batches on reconnect. Conflicts: completion=OR, reviews=latest, scores=append-only.

---

## 25. Accessibility

WCAG 2.1 AA. 4.5:1 contrast, full keyboard nav, screen reader compatible, visible focus indicators, 200% zoom support, prefers-reduced-motion respected, skip-to-content links, code blocks announced with language context.

---

## 26. Legal Compliance

GDPR: Consent management, export/deletion rights, 72h breach notification.
COPPA: Age gate for under-13 (updated rules April 22, 2026).
FERPA: AES-256 encryption, audit logs, RBAC (institutional use).
No behavioral advertising. No data selling. No third-party tracking scripts.

---

## 27. Open Source Strategy

License: AGPLv3 core, Apache 2.0 APIs.
Repo: README with badges/GIF/install, CONTRIBUTING.md, CODE_OF_CONDUCT.md, 10+ good-first-issue labels, CI/CD (ESLint, type check, build, GitHub Actions).
Community: Every contributor is a stakeholder. Community dictionary submissions via PR.
Sustainability: Free core forever. Future managed cloud and enterprise tiers built ON TOP, never restricting the core.

---

## 28. Standards Mapping

Every lesson frontmatter includes: CS2023 knowledge units, SWEBOK v4 knowledge area, Bloom's level, SFIA level, Dreyfus stage. Teacher dashboard filters by any standard.

### Current Standards (verified April 2026)

ACM CS2023 — Current. No successor exists. ACM's Living Curriculum Taskforce is exploring a continuously-updated model, but no output yet. Next full revision ~2033 under the old cycle.

SWEBOK v4.0a — Current (minor correction release September 2025). SWEBOK v5 is aspirational only. SWEBOK Summit 2026 at ICSE (April 2026, Rio) is gathering input. No timeline for v5.

SFIA 9 — Current (October 2024). SFIA 10 is in early consultation (accepting change requests). Expected ~2027 based on the 3-year cycle. Monitor closely.

DURA will update mappings when new versions are formally published. Until then, CS2023 + SWEBOK v4 + SFIA 9 are the authoritative references.

### AI Engineering Competency Framework

No industry-standard "AI Body of Knowledge" equivalent to SWEBOK exists specifically for AI/ML engineering. The field moves faster than standards bodies.

DURA's approach:

- Map Phase 6 (AI/ML Engineering) lessons to CS2023's AI knowledge area and SFIA 9's AI-specific skills (machine learning, data engineering, AI model development).
- Publish DURA's own open-source "AI Engineering Competency Framework" as a structured reference. If DURA's framework becomes a community-adopted reference, that is moat.
- Framework covers: prompt engineering, RAG pipelines, agentic systems, MCP development, fine-tuning, evaluation (RAGAS), deployment, monitoring, responsible AI.
- Structured as: Competency → Knowledge Units → Skill Levels (Dreyfus mapping).
- Published at /standards/ai-engineering and as a downloadable PDF.
- Updated as the field evolves — this is a living document, not a static standard.

---

## 29. Analytics and Data

### Privacy-First Event Tracking

No PII. No cookies. No third-party scripts. Behavioral events queued to IndexedDB, batch-synced when online.

### Events Tracked

lesson_started, lesson_completed, quiz_attempted, quiz_passed, flashcard_rated, flashcard_session_completed, dictionary_searched, dictionary_term_viewed, sandbox_executed, streak_extended, phase_unlocked, verification_started, verification_passed, goal_set, goal_achieved, study_mode_changed, theme_changed, share_clicked

### Why This Data Matters

This data answers: "What learning sequences produce mastery fastest?" — worth more than the platform itself to any EdTech acquirer. Every event is timestamped. Every pattern is learnable. This is the moat.

### Data Principles

1. User owns their data — exportable, deletable
2. No PII — events are behavioral, not personal
3. Privacy-first — no cookies, no fingerprinting, no third-party
4. Batch sync — never blocks UI, flushes every 5 seconds
5. Graceful failure — if analytics breaks, the app keeps working

---

## 30. Support the Developer

DURA is free. The code is open source. The content is given away. A single, tasteful tip button lets grateful learners support the work.

### Implementation: Stripe Payment Links (zero backend)

4 Payment Links in Stripe Dashboard:

- $5 "Coffee"
- $15 "Lunch"
- $50 "Boost"
- Custom amount

TipButton component: floating bottom-right (desktop), in settings (mobile). Also appears on About page, phase completion celebrations, and footer. Subtle pulse on first visit, then never again. No guilt. No nag. No paywall.

Copy: "DURA is free and open source — built by Dustin Snellings at Durwood Studios. If this platform helped your journey, a tip keeps the lights on."

Stripe fees: 2.9% + 30 cents. No other fees. No middleman platforms.

---

## 31. Value and Growth Strategy

### Acquisition-Grade Architecture

Five principles that make DURA worth acquiring:

1. MOAT — Learning analytics data that answers "What sequences produce mastery fastest?" No one else has this at this granularity for engineering education.

2. RETENTION — Progress is identity. Years of tracked learning, verified skills, goal history. Exportable (GDPR compliance = trust = retention paradox).

3. VIRALITY — Every achievement shareable. Certificates get URLs. Phase completion generates social cards. Dictionary terms individually linkable. One-tap share.

4. NETWORK EFFECTS — Teachers bring 30 students. Community dictionary contributions. Open source contributors are stakeholders. API consumers build on DURA's data.

5. PLATFORM — API-first. Dictionary API, verification API, curriculum API. VS Code extensions, CLI tools, other platforms can integrate. Not a product — an ecosystem.

### SEO Strategy

Dictionary terms are individually indexed pages (dura.dev/dictionary/algorithm). The dictionary becomes the best programming reference on the internet. Drives top-of-funnel traffic organically.

### Growth Levers

- Open source launches (Product Hunt, Hacker News, X)
- Teacher adoption (one teacher = 30 students)
- Dictionary SEO (500+ indexed term pages)
- Shareable certificates (LinkedIn, X, portfolio)
- API ecosystem (third-party integrations)
- Build-in-public content (technical blog, X threads)

---

## 32. Implementation Timeline

Phase A (Week 1-2): Foundation — scaffold, PWA, IndexedDB, app shell, splash page, TipButton, deploy.
Phase B (Week 2-4): Core lesson experience — MDX pipeline, all interactive components, Phase 0 content.
Phase C (Week 4-6): Sandboxes + review — Sandpack, Pyodide, FSRS, flashcards, freeform sandbox.
Phase D (Week 6-7): Assessment + paths — skill quiz, path engine, mastery gates, certificates.
Phase E (Week 7-8): Goals + study modes + gamification.
Phase F (Week 8-10): Dictionary, glossary, how-tos, tutorials, about pages.
Phase G (Week 10-11): Teacher dashboard, export engine, class management.
Phase H (Week 11-20): Content sprint — all 406 lessons + 500 dictionary terms.
Phase I (Week 20-22): Polish, audits, launch.

---

## 33. Blockers and TODO

### Immediate (before Phase A)

1. Acquire domain (dura.dev or alternative)
2. Create logo and PWA icons
3. ~~Create Supabase project~~ DONE
4. ~~Initialize GitHub repo under Durwood Studios org~~ DONE
5. Create 4 Stripe Payment Links in Stripe Dashboard
6. ~~Connect Vercel~~ DONE
7. ~~Set up CI/CD pipeline~~ DONE

### Content (before Phase H)

8. Establish voice guide with sample lessons
9. Compile initial dictionary term list
10. Design quiz templates and scoring rubrics
11. Create sandbox exercise templates

### Technical (during implementation)

12. Judge0: self-host vs cloud decision
13. Monaco bundle size benchmarking
14. Pyodide offline testing
15. Certificate verification hash system design

### Post-Launch

16. AI tutor (Claude API integration)
17. Cohort-based learning
18. Discussion forums
19. Mobile app wrapper
20. Localization (Spanish, Portuguese, Japanese)
21. VS Code dictionary extension
22. Rive celebration animations
23. OAuth providers (GitHub, Google, Apple) — needs Vercel production URL for callbacks

### Educational Content to Produce

24. "From Zero to Production" — Granular PDF teaching professional project setup. Covers repo creation, Git workflow, Next.js scaffold, TypeScript, Tailwind v4, ESLint + Prettier, Husky + commitlint, CI/CD, Vercel, Supabase, VS Code config. Written from this session's actual setup as source material.

---

## Appendix A — Build Concerns and Deferred Items (Living)

> Tracked here so PLANNING.md reflects the real state of the codebase.
> Last synced: end of Phase E, 49 commits on main.

### A1. Known deferred (filed by phase)

- **Bite, Review, Challenge study modes** — declared in preferences type;
  Focus + Sprint are the only modes with behavior. Filed for a later polish
  round after Phase I launch.
- **Strict gating enforcement** — Settings has a toggle (Phase E) but the
  paths navigation still lets users bypass mastery gates. UI flag exists;
  enforcement in the route layer is not wired. File to Phase I polish.
- **`phase_unlocked` analytics event** — declared in the type union since
  infrastructure, never fired. Will fire when strict-gating enforcement
  ships (same blocker as above).
- **MilestoneBadge component** — Phase E prompt asked for it; shipped
  LevelBadge + StreakFlame + toasts + dashboard streak instead. Dedicated
  milestone grid is a polish item.
- **Streak-extended toast** — toast store supports `kind: "streak"` but
  nothing currently pushes it. One-line add in streak-manager.
- **Home page 151 kB First Load** — pre-existing, slightly over the
  150 kB target. Standalone chore, Phase I.
- **Sandpack console pass/fail verdict** — the in-lesson exercise verdict
  in `SandboxExerciseInner.tsx` is optimistic (doesn't actually read
  console output). Real verdict requires reading Sandpack client listeners.
  Phase C refinement, filed.
- **Prettier MDX template literals** — Prettier collapses indentation
  inside `initialCode` / `solution` template strings in lesson MDX files.
  JS still parses; authored code renders uglier than intended. Fix with
  `<!-- prettier-ignore -->` blocks. Batch chore, unscheduled.
- **PWA / Serwist** — deliberately deferred during Phase A. Phase I.
- **Cross-device certificate verification** — certificates are local-only
  because there is no auth backend yet. The `/verify/[hash]` not-found
  page already explains this. Blocked on Supabase auth, filed post-launch.
- **Dictionary scale** — 30 terms shipped in Phase C vs. the 500+
  planning target. Will scale during the Phase H content sprint alongside
  lesson writing.

### A2. Scope clarifications applied during the build

- **Streak persistence strategy** — planning §24 lists "goals, preferences,
  dictionary-cache, analytics" as the IDB stores. Streak was added as a
  **field on the Preferences record** (not its own store) because it's a
  singleton. DB v4 has progress, moduleProgress, phaseProgress, flashcards,
  reviewLogs, goals, preferences, dictionaryCache, analytics, sandbox-saves,
  assessment-results, certificates, xp-events.
- **XP persistence strategy** — originally lesson-only via
  `LessonProgress.xpEarned`. Phase E added a dedicated `xp-events` store
  with a deterministic id (`xp_{source}_{sourceId}`) so the same award
  can never double-write. `LessonProgress.xpEarned` is retained for
  back-compat but new totals read from `getTotalXP()`.
- **Question bank shape** — planning §16 says "different questions each
  attempt". Phase D shipped `selectMasteryQuestions` with a mulberry32
  PRNG seeded by `Date.now()` so consecutive attempts get different
  orderings. Phase verification uses weighted selection across the pool
  (30% easy, 50% medium, 20% hard).
- **Certificate security model** — planning §16 mentions "verification
  hash". Phase D ships a client-side SHA-256 with a versioned salt
  (`dura-verify-v1`). Documented in `src/lib/crypto.ts` as
  "honest-but-curious" — true tamper proofing requires server-side HMAC,
  filed for when Supabase lands.
- **Soft gating v1** — Phase D/E deliberately do not hard-block navigation
  to locked modules. Mastery icons are purely visual. Strict mode is a
  preference toggle with no enforcer yet.

### A3. Standards mapping coverage

All Phase 0 lessons and Phase 0 question bank entries include partial
standards frontmatter (CS2023, SWEBOK, Bloom, SFIA, Dreyfus). Phases 1-9
lessons do not exist yet (Phase H content sprint). The AI Engineering
Competency Framework (§28) is not yet published; it lands when Phase 6
content is authored.
