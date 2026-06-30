# Changelog

All notable changes to DURA are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

## [Unreleased]

## [0.1.0] - 2026-06-18

### Added

- Cross-device sync for sandbox, assessment, tutorial, and dojo via Supabase
- Admin dashboard at /admin with auth gate, feedback viewer, and user analytics
- Profile editing page and settings entry card
- User profile and sign-out in sidebar and mobile drawer
- Apple Sign-In authentication support
- Edge rate limiting on auth endpoints via Upstash Redis
- PWA update notification bento card with confetti explosion and layered exit animation
- Smooth-scrolling landing page redesign with premium motion and responsive layout
- Industry standards map component
- Feedback form and viewer
- Phase Q: Quantitative / HFT Systems (8 lessons)
- Phase H: Hardware Verification — SystemVerilog, UVM, SVA, UPF (8 lessons)
- Phase E: Embedded / Firmware phase with code-first lessons anchored to ruling standards
- Phase M: Manufacturing Systems (12 lessons — IPC-A-610J, ASME Y14.5, GD&T, Six Sigma DMAIC, Lean/TPS, IATF core tools, ISA-95/ISA-88, MTConnect, OPC-UA, TSN, IEC 62443, RAMI 4.0)
- Specialty phases renamed from letter IDs to numeric (10–14)
- Embedded, Robotics SW, and Manufacturing Systems career tracks
- Curriculum discovery primitive: outcome → phase sequence (Paths page)
- Backward navigation between lessons
- Lesson annotations support
- Specialty phase question files wired to correct phase IDs
- Sandpack-powered sandbox: templates, save management, fullscreen, console output
- AI features panel with BYOK (Bring Your Own Key) opt-in
- AI Transparency Disclosure (EU AI Act Art. 13/14 compliance)
- FSRS-based flashcard scheduling with rating buttons (Again / Hard / Good / Easy)
- IndexedDB-backed learner record with import/export (local-first, offline-capable)
- Restore from file feature in settings
- Push notification support: streak reminders, due flashcards, daily goal nudges
- Keyboard shortcuts reference in settings
- Locale picker for interface language selection
- AGPLv3 open-source license

### Changed

- Performance: cut client JS bundle via optimizePackageImports and lazy Lenis initialization
- Sidebar nav: overflow-hidden + min-h-0 so scroll actually fires on long nav lists
- Theme toggle: optimistic update + simple light/dark cycle; eliminated hydration race and amber glow artifact
- Agentic Control Plane moved to gitignored local tooling (not in repo history)
- Phase links now resolve correctly to /paths/[phaseId] (legacy phase route compatibility)

### Fixed

- /admin route conflict causing Vercel build failure
- Sign-out now actually clears Supabase session; mobile drawer parity with desktop
- PWA confetti: eliminated end-of-confetti flicker with blackout overlay; blur backdrop stays alive through confetti phase
- Theme hydration race condition and amber sun glow artifact in dark mode
- Sidebar nav overflow-y-auto not scrolling (missing overflow-hidden + min-h-0)
- OWASP ASVS Level 2 hardening — 6 auth audit findings resolved
- Embedded/Robotics/Manufacturing tracks marked as complete in phase registry

[Unreleased]: https://github.com/Durwood-studios/Dura/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Durwood-studios/Dura/releases/tag/v0.1.0
