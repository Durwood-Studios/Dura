import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/payments/stripe";

/**
 * ⚠️ HIGH-RISK SURFACE (payments) — human review required before merge.
 *
 * Stripe webhook for tip events. The signature is verified against
 * STRIPE_WEBHOOK_SECRET before anything is trusted. Per Rule 7 a completed
 * tip unlocks NOTHING — we only acknowledge it. This handler exists so the
 * integration is auditable and future non-gating side effects (e.g. a public
 * "supporters" count) have a verified entry point.
 */

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  // Raw body is required for signature verification.
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      // Rule 7: acknowledge gratitude, unlock nothing.
      console.info(
        `Tip received: ${session.amount_total ?? 0} ${session.currency ?? "usd"} (${session.mode}).`
      );
      break;
    }
    default:
      // Ignore unrelated events.
      break;
  }

  return NextResponse.json({ received: true });
}
