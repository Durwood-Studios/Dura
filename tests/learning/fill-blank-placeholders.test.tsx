import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FillBlank } from "@/components/lesson/FillBlank";

const { passQuiz } = vi.hoisted(() => ({ passQuiz: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ track: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/stores/progress", () => ({
  useProgressStore: (selector: (state: { passQuiz: () => void }) => unknown): unknown =>
    selector({ passQuiz }),
}));

afterEach((): void => {
  cleanup();
  vi.clearAllMocks();
});

describe("FillBlank placeholder runs", (): void => {
  it.each(["______", "____"])(
    "renders one usable single blank for %s",
    (placeholder: string): void => {
      const { container } = render(
        <FillBlank question={`A binary digit is a ${placeholder}.`} answer="bit" />
      );
      expect(screen.getAllByRole("textbox")).toHaveLength(1);
      expect(container.textContent).not.toContain("_");
      fireEvent.change(screen.getByRole("textbox"), { target: { value: "bit" } });
      fireEvent.click(screen.getByRole("button", { name: /check/i }));
      expect(passQuiz).toHaveBeenCalledOnce();
    }
  );

  it("keeps multiple answers at their corresponding phrases after long placeholder runs", (): void => {
    render(<FillBlank prompt="First ______ then ___ finish." answers={["alpha", "beta"]} />);
    const secondPhrase = screen.getByText(/then/);
    expect(secondPhrase).toContainElement(screen.getByRole("textbox", { name: "Blank 2" }));
    expect(secondPhrase).not.toContainElement(screen.getByRole("textbox", { name: "Blank 1" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Blank 1" }), {
      target: { value: "alpha" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Blank 2" }), {
      target: { value: "beta" },
    });
    fireEvent.click(screen.getByRole("button", { name: /check/i }));
    expect(passQuiz).toHaveBeenCalledOnce();
  });
});
