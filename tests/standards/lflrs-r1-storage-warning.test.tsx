import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { StorageDurabilityWarning } from "@/components/storage/StorageDurabilityWarning";

function stubPersist(value: boolean | "missing"): void {
  if (value === "missing") {
    vi.stubGlobal("navigator", { ...navigator, storage: undefined });
    return;
  }
  vi.stubGlobal("navigator", {
    ...navigator,
    storage: {
      ...navigator.storage,
      persist: vi.fn().mockResolvedValue(value),
    },
  });
}

describe("LFLRS-R1 — StorageDurabilityWarning", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("shows warning when storage is best-effort", async () => {
    stubPersist(false);
    render(<StorageDurabilityWarning />);
    await waitFor(() => {
      expect(screen.getByText(/Your study data may be cleared/i)).toBeInTheDocument();
    });
  });

  it("does NOT show warning when storage is persistent", async () => {
    stubPersist(true);
    const { container } = render(<StorageDurabilityWarning />);
    await waitFor(() => {
      expect(container.querySelector('[role="status"]')).toBeNull();
    });
  });

  it("does NOT show warning when persistence API is unsupported", async () => {
    stubPersist("missing");
    const { container } = render(<StorageDurabilityWarning />);
    await waitFor(() => {
      expect(container.querySelector('[role="status"]')).toBeNull();
    });
  });

  it("hides on dismiss and persists the dismissal", async () => {
    stubPersist(false);
    const user = userEvent.setup();
    const { unmount } = render(<StorageDurabilityWarning />);

    const dismissButton = await screen.findByRole("button", {
      name: /dismiss durability warning/i,
    });
    await user.click(dismissButton);

    expect(localStorage.getItem("dura:storage:durability-warning-dismissed")).toBe("1");
    expect(screen.queryByText(/Your study data may be cleared/i)).toBeNull();

    unmount();
    render(<StorageDurabilityWarning />);
    expect(screen.queryByText(/Your study data may be cleared/i)).toBeNull();
  });
});
