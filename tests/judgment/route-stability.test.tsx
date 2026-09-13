import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { PageTransition } from "@/components/motion/PageTransition";
const state = vi.hoisted(() => ({ pathname: "/judgment", reducedMotion: false }));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));
vi.mock("@/stores/preferences", () => ({
  usePreferencesStore: () => state.reducedMotion,
}));
function Draft(): React.ReactElement {
  const [value, setValue] = useState("");
  return (
    <textarea
      aria-label="Decision"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
}
afterEach(() => vi.unstubAllGlobals());
it("route and motion changes retain the live input subtree and its unsaved state", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  const { rerender } = render(
    <PageTransition>
      <Draft />
    </PageTransition>
  );
  const field = screen.getByRole("textbox");
  fireEvent.change(field, { target: { value: "Reasoning entered during navigation" } });
  state.pathname = "/judgment/new-case";
  rerender(
    <PageTransition>
      <Draft />
    </PageTransition>
  );
  expect(screen.getByRole("textbox")).toBe(field);
  expect(field).toHaveValue("Reasoning entered during navigation");
  state.reducedMotion = true;
  rerender(
    <PageTransition>
      <Draft />
    </PageTransition>
  );
  expect(screen.getByRole("textbox")).toBe(field);
  expect(field).toHaveValue("Reasoning entered during navigation");
});
