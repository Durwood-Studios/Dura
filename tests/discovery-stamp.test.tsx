import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ get: vi.fn(), save: vi.fn() }));
vi.mock("@/lib/discovery/passport", () => ({
  getDiscoveryPassport: mocks.get,
  saveDiscoveryActivity: mocks.save,
}));
vi.mock("@/lib/storage/owner", () => ({ getStorageOwner: () => "guest" }));
import {
  DiscoveryStampStatus,
  markActivityComplete,
} from "@/components/discover/DiscoveryStampStatus";
beforeEach(() => {
  mocks.get.mockReset().mockResolvedValue({ activities: [] });
  mocks.save.mockReset();
});
it("reports failed stamps and retries the actual persistence", async () => {
  render(<DiscoveryStampStatus slug="binary-painter" />);
  await waitFor(() => expect(mocks.get).toHaveBeenCalled());
  mocks.save.mockRejectedValueOnce(new Error("disk"));
  await act(async () => {
    expect(await markActivityComplete("binary-painter")).toBe(false);
  });
  expect(screen.getByRole("alert")).toHaveTextContent("not saved");
  mocks.save.mockResolvedValueOnce({ activities: ["binary-painter"] });
  mocks.get.mockResolvedValue({ activities: ["binary-painter"] });
  fireEvent.click(screen.getByRole("button", { name: "Retry saving stamp" }));
  await screen.findByText("Exploration stamp saved in this learner’s passport.");
  expect(mocks.save).toHaveBeenCalledTimes(2);
});
it("a failed initial load never awards an exploration stamp", async () => {
  mocks.get.mockRejectedValueOnce(new Error("unavailable"));
  render(<DiscoveryStampStatus slug="binary-painter" />);
  fireEvent.click(await screen.findByRole("button", { name: "Retry loading passport" }));
  await waitFor(() => expect(mocks.get).toHaveBeenCalledTimes(2));
  expect(mocks.save).not.toHaveBeenCalled();
});
