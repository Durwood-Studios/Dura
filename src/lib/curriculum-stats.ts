/**
 * Single source of truth for curriculum headline numbers.
 *
 * Every marketing surface (Hero, page metadata, About, Open Source,
 * teach/print) imports these instead of hardcoding counts — the counts
 * went stale once (539 shipped while the tree grew to 660).
 * tests/paths/curriculum-stats.test.ts asserts these against the actual
 * src/content/phases tree, so a curriculum change that forgets to bump
 * them fails CI. README.md repeats the numbers as prose; the same test
 * checks it stays in sync.
 */
export const TOTAL_PHASES = 15;
export const TOTAL_MODULES = 118;
export const TOTAL_LESSONS = 660;
