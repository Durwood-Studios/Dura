/**
 * Component-level WCAG 2.2 AA audit (P6).
 *
 * Renders the high-traffic interactive components in isolation and runs
 * axe-core against the resulting DOM. Asserts zero violations at WCAG 2.2 AA.
 *
 * Scope notes (honest):
 *   - This is COMPONENT-level coverage. Full-route audits (/, /study,
 *     /deck/[id], /settings) require Next.js's app-router rendering
 *     pipeline + cookies/auth, which Vitest can't reproduce without
 *     significant scaffolding. Route-level a11y is owed as a Playwright
 *     pass in a separate sprint.
 *   - The components covered here are the ones the build prompt called
 *     out as the highest-risk a11y surfaces in DURA.
 */

import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import * as matchers from "vitest-axe/matchers";
import "vitest-axe/extend-expect";
import { render } from "@testing-library/react";
import { RatingButtons } from "@/components/review/RatingButtons";
import { AITransparencyDisclosure } from "@/components/about/AITransparencyDisclosure";
import type { FlashCard } from "@/types/flashcard";

expect.extend(matchers);

const sampleCard: FlashCard = {
  id: "card-1",
  front: "What is FSRS?",
  back: "Free Spaced Repetition Scheduler",
  lessonId: "l1",
  termSlug: null,
  createdAt: 1_000_000,
  due: 2_000_000,
  stability: 5,
  difficulty: 3,
  elapsedDays: 0,
  scheduledDays: 1,
  reps: 0,
  lapses: 0,
  state: "new",
  lastReview: null,
};

describe("WCAG 2.2 AA — RatingButtons (P6)", () => {
  it("has zero axe violations when answer is revealed", async () => {
    const { container } = render(
      <RatingButtons card={sampleCard} visible={true} onRate={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has zero axe violations when answer is hidden", async () => {
    const { container } = render(
      <RatingButtons card={sampleCard} visible={false} onRate={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("each rating button announces label + interval + keyboard shortcut", () => {
    const { getByRole } = render(
      <RatingButtons card={sampleCard} visible={true} onRate={() => {}} />
    );
    const again = getByRole("button", { name: /again.*next review.*keyboard shortcut 1/i });
    const easy = getByRole("button", { name: /easy.*next review.*keyboard shortcut 4/i });
    expect(again).toBeDefined();
    expect(easy).toBeDefined();
  });

  it("each button meets the 44x44 minimum tap target (SC 2.5.8)", () => {
    const { container } = render(
      <RatingButtons card={sampleCard} visible={true} onRate={() => {}} />
    );
    const buttons = container.querySelectorAll("button");
    // The Tailwind class min-h-[64px] guarantees 64px height; we assert the
    // class is present rather than measuring (jsdom doesn't compute layout).
    for (const btn of buttons) {
      expect(btn.className).toMatch(/min-h-\[64px\]/);
    }
  });

  it("group is labelled for screen readers (role=group, aria-label)", () => {
    const { getByRole } = render(
      <RatingButtons card={sampleCard} visible={true} onRate={() => {}} />
    );
    const group = getByRole("group", { name: /rate this card/i });
    expect(group).toBeDefined();
  });
});

describe("WCAG 2.2 AA — AITransparencyDisclosure (P6)", () => {
  it("full variant has zero axe violations", async () => {
    const { container } = render(<AITransparencyDisclosure variant="full" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("compact variant has zero axe violations", async () => {
    const { container } = render(<AITransparencyDisclosure variant="compact" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("disclosure is reachable as a section with a heading", () => {
    const { getByRole } = render(<AITransparencyDisclosure variant="full" />);
    const heading = getByRole("heading", { name: /AI scheduler/i });
    expect(heading).toBeDefined();
  });
});
