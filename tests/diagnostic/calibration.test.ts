import { describe, expect, it } from "vitest";
import { calibrate } from "@/lib/diagnostic/calibration";

describe("calibrate", () => {
  it("flags certainty + correct as calibrated", () => {
    expect(calibrate(true, 5).flag).toBe("calibrated");
    expect(calibrate(true, 4).flag).toBe("calibrated");
  });

  it("flags doubt + correct as underconfident", () => {
    expect(calibrate(true, 1).flag).toBe("underconfident");
    expect(calibrate(true, 2).flag).toBe("underconfident");
  });

  it("flags the middle band as calibrated regardless of outcome", () => {
    expect(calibrate(true, 3).flag).toBe("calibrated");
    expect(calibrate(false, 3).flag).toBe("calibrated");
  });

  it("flags certainty + wrong as overconfident", () => {
    expect(calibrate(false, 5).flag).toBe("overconfident");
    expect(calibrate(false, 4).flag).toBe("overconfident");
  });

  it("flags doubt + wrong as calibrated", () => {
    expect(calibrate(false, 1).flag).toBe("calibrated");
    expect(calibrate(false, 2).flag).toBe("calibrated");
  });

  it("attaches a non-empty human-readable note", () => {
    for (const c of [1, 2, 3, 4, 5] as const) {
      expect(calibrate(true, c).note.length).toBeGreaterThan(10);
      expect(calibrate(false, c).note.length).toBeGreaterThan(10);
    }
  });

  it("echoes the input confidence in the reading", () => {
    expect(calibrate(true, 4).confidence).toBe(4);
    expect(calibrate(false, 2).confidence).toBe(2);
  });
});
