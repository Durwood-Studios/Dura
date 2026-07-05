import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/payments/stripe";
import { tipRequestSchema } from "@/lib/payments/tips";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-client-ip";

/**
 * ⚠️ HIGH-RISK SURFACE (payments) — human review required before merge.
 *
 * Creates a Stripe Checkout Session for a VOLUNTARY tip. Redirect-based
 * hosted Checkout keeps all card data on Stripe (no PCI surface here).
 * Per Rule 7, the session grants nothing — success just says thank you.
 */

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Tipping is not configured." }, { status: 503 });
  }

  // Basic abuse guard: 10 checkout creations / 5 min / IP.
  const ip = getClientIp(request);
  const { success, retryAfter } = await rateLimit(`tips:${ip}`, {
    limit: 10,
    windowMs: 5 * 60 * 1_000,
  });
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  let parsed;
  try {
    parsed = tipRequestSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid tip amount." }, { status: 400 });
  }
  const { amountUsd, interval } = parsed;

  // Use our own resolved origin for return URLs (never a client-supplied one).
  const origin = request.nextUrl.origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: interval === "month" ? "subscription" : "payment",
      // Voluntary support — no product is fulfilled.
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amountUsd * 100,
            product_data: {
              name: interval === "month" ? "Monthly support for DURA" : "One-time tip for DURA",
              description:
                "A voluntary thank-you to the developer. DURA is free forever — this unlocks nothing.",
            },
            ...(interval === "month" ? { recurring: { interval: "month" as const } } : {}),
          },
        },
      ],
      submit_type: interval === "month" ? undefined : "donate",
      success_url: `${origin}/support?status=thanks`,
      cancel_url: `${origin}/support?status=canceled`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Could not start checkout." }, { status: 502 });
    }
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Could not start checkout." }, { status: 502 });
  }
}
