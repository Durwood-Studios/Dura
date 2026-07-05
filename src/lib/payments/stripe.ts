import Stripe from "stripe";

/**
 * ⚠️ HIGH-RISK SURFACE: src/lib/payments/** — human review required before merge.
 *
 * Voluntary "Support the Developer" tipping ONLY. Per CLAUDE.md Rule 7
 * (Free Forever), this must never gate, unlock, or paywall any DURA feature.
 * A tip buys nothing but our gratitude.
 *
 * The Stripe client is constructed lazily from STRIPE_SECRET_KEY so the app
 * builds and runs with tipping simply dormant when the key is absent — the
 * same graceful-degradation contract the verification HMAC layer uses.
 */

let cached: Stripe | null | undefined;

/** Returns a configured Stripe client, or null when STRIPE_SECRET_KEY is unset. */
export function getStripe(): Stripe | null {
  if (cached !== undefined) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  cached = key ? new Stripe(key) : null;
  return cached;
}

/** Whether tipping is configured. Drives 503s on the endpoints and hides the UI. */
export function isTippingEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
