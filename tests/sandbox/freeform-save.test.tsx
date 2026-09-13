import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
const mocks = vi.hoisted(() => ({
  put: vi.fn(),
  files: { "/index.js": { code: "const valuableDraft = 42;" } },
}));
vi.mock("@/lib/db/sandbox", () => ({
  putSave: mocks.put,
  getRecentSaves: async () => [],
  deleteSave: vi.fn(),
}));
vi.mock("@/lib/xp-manager", () => ({ awardXPWithToast: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
vi.mock("@codesandbox/sandpack-react", () => ({
  SandpackProvider: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SandpackLayout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SandpackCodeEditor: () => null,
  SandpackConsole: () => null,
  SandpackPreview: () => null,
  useSandpack: () => ({
    sandpack: { files: mocks.files, updateFile: vi.fn(), runSandpack: vi.fn() },
  }),
}));
import FreeformSandboxInner from "@/components/sandbox/FreeformSandboxInner";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.put.mockResolvedValue(undefined);
});
describe("freeform workspace durability", () => {
  it("saves current code before switching language", async () => {
    render(<FreeformSandboxInner />);
    fireEvent.change(screen.getByLabelText("Sandbox language"), {
      target: { value: "typescript" },
    });
    await waitFor(() =>
      expect(mocks.put).toHaveBeenCalledWith(
        expect.objectContaining({ language: "javascript", code: "const valuableDraft = 42;" })
      )
    );
    await waitFor(() =>
      expect(screen.getByLabelText("Sandbox language")).toHaveValue("typescript")
    );
  });
  it("keeps the current workspace and shows failure when persistence fails", async () => {
    mocks.put.mockRejectedValue(new Error("Quota exceeded"));
    render(<FreeformSandboxInner />);
    fireEvent.change(screen.getByLabelText("Sandbox language"), {
      target: { value: "typescript" },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent("could not be saved");
    expect(screen.getByLabelText("Sandbox language")).toHaveValue("javascript");
    expect(screen.queryByText(/^Saved /)).not.toBeInTheDocument();
  });
});
