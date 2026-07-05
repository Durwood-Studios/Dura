import { z } from "zod";

/**
 * Tip configuration. Amounts are whole US dollars, converted to cents at the
 * Stripe boundary. Bounds keep a fat-fingered or malicious amount sane.
 */
export const TIP_PRESETS_USD = [3, 5, 10, 25] as const;
export const TIP_MIN_USD = 1;
export const TIP_MAX_USD = 500;

export const TIP_INTERVALS = ["once", "month"] as const;
export type TipInterval = (typeof TIP_INTERVALS)[number];

/** Request body for POST /api/tips/checkout. */
export const tipRequestSchema = z.object({
  amountUsd: z.number().int().min(TIP_MIN_USD).max(TIP_MAX_USD),
  interval: z.enum(TIP_INTERVALS),
});

export type TipRequest = z.infer<typeof tipRequestSchema>;
