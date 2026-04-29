/**
 * DLS-2.0 §Spring Physics — value lock.
 *
 * These tests don't exercise behavior; they pin the canonical spec values
 * so a future tweak (e.g. raising `snappy.stiffness` from 500 → 550 because
 * "it feels better") fails CI. The spring vocabulary is governance —
 * changing it requires a CODEOWNERS-gated amendment to
 * standards/dls/dls-2.0.md.
 */

import { describe, expect, it } from "vitest";
import { SPRINGS, motionConfig } from "@/lib/motion/springs";

describe("DLS-2.0 SPRINGS — canonical values", () => {
  it("snappy: stiffness 500, damping 35, mass 0.8", () => {
    expect(SPRINGS.snappy).toEqual({
      type: "spring",
      stiffness: 500,
      damping: 35,
      mass: 0.8,
    });
  });

  it("fluid: stiffness 280, damping 26, mass 1", () => {
    expect(SPRINGS.fluid).toEqual({
      type: "spring",
      stiffness: 280,
      damping: 26,
      mass: 1,
    });
  });

  it("settle: stiffness 180, damping 18, mass 1.2", () => {
    expect(SPRINGS.settle).toEqual({
      type: "spring",
      stiffness: 180,
      damping: 18,
      mass: 1.2,
    });
  });

  it("drift: stiffness 60, damping 20, mass 2", () => {
    expect(SPRINGS.drift).toEqual({
      type: "spring",
      stiffness: 60,
      damping: 20,
      mass: 2,
    });
  });

  it("bounce: stiffness 400, damping 12, mass 0.6", () => {
    expect(SPRINGS.bounce).toEqual({
      type: "spring",
      stiffness: 400,
      damping: 12,
      mass: 0.6,
    });
  });

  it("motionConfig defaults to SPRINGS.fluid", () => {
    expect(motionConfig.transition).toBe(SPRINGS.fluid);
  });

  it("every spring is type 'spring' (never an easing curve)", () => {
    for (const name of Object.keys(SPRINGS) as Array<keyof typeof SPRINGS>) {
      expect(SPRINGS[name].type).toBe("spring");
    }
  });

  it("springs are frozen — runtime tweaks are blocked at the type layer", () => {
    // The `as const` assertion gives readonly types. Runtime mutability
    // would still be possible without Object.freeze, but the type system
    // catches it. This test confirms the SpringName union covers exactly
    // the five canonical springs.
    const names: Array<keyof typeof SPRINGS> = ["snappy", "fluid", "settle", "drift", "bounce"];
    for (const name of names) {
      expect(SPRINGS[name]).toBeDefined();
    }
    expect(Object.keys(SPRINGS).sort()).toEqual(names.sort());
  });
});
