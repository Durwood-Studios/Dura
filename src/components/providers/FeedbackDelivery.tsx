"use client";

import { useEffect } from "react";
import { startFeedbackDelivery } from "@/lib/feedback/delivery";

/** Keep locally saved feedback deliverable independently of authentication and navigation. */
export function FeedbackDelivery(): null {
  useEffect(startFeedbackDelivery, []);
  return null;
}
