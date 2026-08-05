/**
 * NaN can never reach the screen. Degraded local records (encrypted
 * rows read with no active key) produce undefined numeric fields, and
 * one NaN in a sum poisoned the dashboard's Time Spent card ("NaNh
 * NaNm"). Formatters are the last line of defense — they must render a
 * sane zero for any non-finite input.
 */
import { describe, expect, it } from "vitest";

import { formatCount, formatMinutes, formatTime } from "@/lib/utils";

describe("formatters never render NaN", () => {
  const poisons = [NaN, Infinity, -Infinity];

  it("formatTime falls back to 0s", () => {
    for (const value of poisons) {
      expect(formatTime(value)).toBe("0s");
    }
    expect(formatTime(3_600_000)).toBe("1h 0m");
  });

  it("formatMinutes falls back to 0 min", () => {
    for (const value of poisons) {
      expect(formatMinutes(value)).toBe("0 min");
    }
    expect(formatMinutes(90)).toBe("1h 30m");
  });

  it("formatCount falls back to 0", () => {
    for (const value of poisons) {
      expect(formatCount(value)).toBe("0");
    }
    expect(formatCount(1500)).toBe("1.5k");
  });
});
