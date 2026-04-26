/**
 * Type augmentation: teach Vitest's expect() about vitest-axe's matcher.
 * The shipped vitest-axe/extend-expect module targets the `Vi.Assertion`
 * namespace, but Vitest 4 uses `vitest.Assertion`; this file bridges
 * both shapes so `expect(results).toHaveNoViolations()` typechecks
 * regardless of which import surface vitest exposes.
 */

import type { AxeResults } from "axe-core";

interface AxeMatchers {
  toHaveNoViolations(): void;
}

declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars
  interface Assertion<T = unknown> extends AxeMatchers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

export type { AxeResults };
