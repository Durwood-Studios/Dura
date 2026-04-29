---
name: mission-lock
description: >
  Execution state tracker that persists goals, decisions, and progress
  across a multi-message conversation. This is organism's AUTHORITATIVE
  memory store — organism's ORGANISM STATE block is a read-through view,
  not a parallel store. Prevents drift, repetition, and lost context.
  Trigger when the user says "lock this in", "track this", "don't lose
  this", "mission lock", "stay on target", "remember the plan", "don't
  forget", "where were we", "what did we decide", "stay focused", "keep
  track", "recap the plan", "what's left to do", or when Claude detects
  that a conversation has produced decisions needing persistence. Also
  trigger when synergize outputs a plan, value-amplifier identifies a
  multi-step strategy, chrono-decider has a locked decision to carry
  forward, seed produces a PLANNING.md, or any skill outputs a plan
  requiring sustained execution. This skill doesn't DO the work — it
  makes sure the work stays coherent.
---

# Mission Lock

You are an execution state manager. When a conversation produces a plan, strategy,
or multi-step goal, you lock it into a persistent mission state that Claude
references across every subsequent message — preventing drift, context loss,
repetition, and the classic failure mode of "Claude forgot what we decided 8
messages ago."

## Why This Exists

Claude's biggest weakness in long conversations is **decision amnesia**. The user
and Claude agree on an approach in message 4. By message 12, Claude has subtly
drifted from that approach — not because it's wrong, but because the decision
isn't reinforced in context. The user has to re-explain. This wastes tokens,
breaks flow, and degrades output quality.

Mission Lock solves this by creating an explicit, compact state object that Claude
includes (internally) at the start of each response, keeping all prior decisions
active.

## When to Activate

Mission Lock activates when ANY of these conditions are met:

1. **Explicit request:** User says "lock this in", "track this", "mission lock"
2. **Plan produced:** synergize, value-amplifier, seed, demo-video-director,
   or any skill outputs a multi-step plan or activation strategy
3. **Decision made:** The user makes a clear decision ("let's go with option B",
   "use React for this", "target investors not consumers")
4. **Scope defined:** The conversation has established clear goals, constraints,
   and deliverables that need to persist
5. **Drift detected:** Claude notices it's about to repeat information or
   contradict an earlier decision

## The Mission State Object

When activated, build and maintain this state:

```
╔══════════════════════════════════════════╗
║ MISSION: [one-line objective]            ║
╠══════════════════════════════════════════╣
║ DECISIONS LOCKED:                        ║
║  • [decision 1 — what was chosen + why]  ║
║  • [decision 2]                          ║
║  • [decision 3]                          ║
╠══════════════════════════════════════════╣
║ DONE:                                    ║
║  ✓ [completed step]                      ║
║  ✓ [completed step]                      ║
╠══════════════════════════════════════════╣
║ ACTIVE:                                  ║
║  → [current step — what we're doing NOW] ║
╠══════════════════════════════════════════╣
║ NEXT:                                    ║
║  ○ [upcoming step]                       ║
║  ○ [upcoming step]                       ║
╠══════════════════════════════════════════╣
║ CONSTRAINTS:                             ║
║  • [active constraint]                   ║
║  • [active constraint]                   ║
╠══════════════════════════════════════════╣
║ CHANGED:                                 ║
║  ~ [anything that shifted since last]    ║
╚══════════════════════════════════════════╝
```

## How to Use the State

### On Activation

1. Scan the conversation for decisions, goals, constraints, and progress
2. Build the initial mission state
3. Display it to the user for confirmation: "Here's what I'm tracking. Correct?"
4. Lock it in

### Every Subsequent Message

1. Internally reference the mission state before responding
2. Check: does this response ALIGN with locked decisions?
3. If the user's request conflicts with a locked decision, flag it:
   > "This conflicts with our locked decision to [X]. Want to update the mission?"
4. Update the state if progress was made (move items from NEXT → ACTIVE → DONE)
5. Show a brief state update ONLY when something meaningful changed, not every message

### On User Redirect

When the user changes direction:

1. Acknowledge the change explicitly
2. Move the old decision to CHANGED with a note
3. Lock the new decision
4. Show the updated state

### On Completion

When all NEXT items are done:

1. Show the final state with all items in DONE
2. Summarize what was accomplished
3. Ask: "Mission complete. Anything to add, or should I unlock?"

## State Display Rules

- **Show the full state** when first activated and when the user asks for status
- **Show a one-line update** when a step moves from NEXT → ACTIVE or ACTIVE → DONE
  (e.g., "✓ Shot list complete. → Now: post-production spec")
- **Don't show anything** when the state hasn't changed — just work
- **Always show CHANGED** when a decision is modified — this is the drift prevention

## Integration with Ecosystem Skills

### With synergize:

When synergize outputs an activation plan, mission-lock captures it:

- Activation steps → NEXT queue
- Synergy conditions → CONSTRAINTS
- Emergent property target → MISSION

### With value-amplifier:

When value-amplifier identifies the output level and strategy:

- Target value level → DECISIONS LOCKED
- Leverage points → CONSTRAINTS
- Multi-step value strategy → NEXT queue

### With seed:

When seed produces a PLANNING.md:

- Project type and scope → MISSION
- Key architectural decisions → DECISIONS LOCKED
- Build phases → NEXT queue

### With demo-video-director:

When director produces a storyboard:

- Creative brief decisions → DECISIONS LOCKED
- Shot list → NEXT queue (each shot = a step)
- Style/tone/palette → CONSTRAINTS

### With skill-forge:

When forge begins building a skill:

- Skill type and architecture → DECISIONS LOCKED
- Forge steps (0-8) → NEXT queue
- Ecosystem scan results → CONSTRAINTS

### With temp-skill:

When a temp-skill mounts, add to state:

- `ACTIVE OVERLAY: temp:[name] mounted — [purpose]`
- On unmount, move to DONE

## Anti-Patterns

- **Over-tracking** — Don't mission-lock a simple Q&A. This is for multi-step
  work spanning 5+ messages. One-shot tasks don't need state management.

- **Rigidity** — The mission state is a guide, not a cage. If the user's new
  idea is better than the locked plan, UPDATE the plan. Don't defend bad decisions
  just because they're locked.

- **State spam** — Don't show the full state every message. Most messages need
  zero state display. Only surface it when something changed or the user asks.

- **Phantom progress** — Don't mark things DONE that aren't actually done.
  If Claude produced a draft but the user hasn't approved it, it's ACTIVE, not DONE.
