# DURA Claude Code Skills

**Location in repo:** `.claude/skills/`
**For:** Claude Code (VSCode extension + terminal)
**Version:** 1.0 | 2026-04-25

---

## What This Is

These are the skills Claude Code uses when working inside DURA.
Each skill is a specialised capability that Claude Code reads when
the task matches the skill's trigger conditions.

Claude Code discovers skills by reading this directory at session start.
Skills load on demand — only the relevant one loads per task.

---

## Skills in This Folder

| Skill                  | When Claude Code Uses It                                                  |
| ---------------------- | ------------------------------------------------------------------------- |
| `dev-loop`             | Writing Claude Code prompts, planning implementation, commit messages     |
| `audit`                | Before any merge to main — quality gate, finds what's wrong               |
| `bounded-research`     | Researching APIs, standards, library behaviour before implementing        |
| `brief`                | Summarising what was built at the end of a phase                          |
| `bug-reporter`         | Logging any bug found during implementation in standard format            |
| `mission-lock`         | Tracking goals and decisions across a long multi-phase session            |
| `premortem`            | Before major architectural decisions — imagines what kills the approach   |
| `gold-standard`        | Enforcing LFLRS, AINDGS, PPLAS standards — generates compliance artifacts |
| `frontend-design-plus` | Building any UI component — enforces WCAG 2.2, responsive design          |

---

## How to Use

Claude Code reads skills from `.claude/skills/` automatically.

To invoke a specific skill explicitly in a prompt:

```
Use the audit skill before suggesting any changes to the sync layer.
Use the premortem skill before we implement IndexedDB encryption.
Use the gold-standard skill to check if this analytics approach
conforms to PPLAS-1.0.
```

To let Claude Code choose automatically — just describe the task.
It will select the right skill based on the trigger conditions in each SKILL.md.

---

## DURA-Specific Notes

**Always active context for Claude Code in this repo:**

- Stack: React 19 + TypeScript strict + Next.js 15 + Supabase + IndexedDB + FSRS-5
- Standards: LFLRS-1.0, AINDGS-1.0, PPLAS-1.0 (see `doc/standards/`)
- Commit convention: `[AI: claude-code ~X%] type: description (standard/law)`
- High-risk paths requiring human review: `src/lib/auth/**`, `src/lib/crypto.ts`,
  `supabase/migrations/**`, `src/lib/supabase/queries/analytics.ts`

**The gold-standard skill** has project-specific references in `gold-standard/references/`.
These contain the enforcement framework, output templates, and research protocol
built specifically for DURA's three novel standards.

---

## Maintenance

When a standard changes, update `gold-standard/references/enforcement-framework.md`.
When a new high-risk path is added, update CLAUDE.md AND the bug-reporter skill trigger list.
When the stack changes, update this README's DURA-Specific Notes section.
