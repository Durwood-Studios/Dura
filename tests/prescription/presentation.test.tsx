import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DailyPrescription } from "@/components/prescription/DailyPrescription";
import { buildPlan } from "@/lib/prescription/engine";
import { COLD_START } from "@/lib/prescription/fixtures";

describe("daily plan presentation", () => {
  it("shows the lesson name and one usable action for migrated first-lesson progress", () => {
    const plan = buildPlan({
      ...COLD_START,
      phase: { ...COLD_START.phase, currentLessonId: "0/0-1/01" },
    });
    render(
      <DailyPrescription
        plan={plan}
        lessonTitles={{ "/paths/0/0-1/01": "Binary: The Language of Machines" }}
      />
    );
    expect(
      screen.getByRole("heading", { name: "Binary: The Language of Machines" })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Open lesson" })).toHaveAttribute(
      "href",
      "/paths/0/0-1/01"
    );
    expect(screen.queryByText(/signal|Lesson advance|0\/0-1\/01/)).not.toBeInTheDocument();
  });
});
