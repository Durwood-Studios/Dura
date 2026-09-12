import { getDB } from "@/lib/db";
import { triggerShadowWrite } from "@/lib/storage/shadow-write";
import type { AssessmentResult, Certificate } from "@/types/assessment";

/** Save the outcome and its certificate together so a partial save cannot claim completion. */
export async function saveVerification(
  result: AssessmentResult,
  certificate?: Certificate
): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction(["assessment-results", "certificates"], "readwrite");
    await Promise.all([
      tx.objectStore("assessment-results").put(result),
      ...(certificate ? [tx.objectStore("certificates").put(certificate)] : []),
      tx.done,
    ]);
    triggerShadowWrite();
  } catch (error: unknown) {
    console.error("[verification] Could not save result:", error);
    throw new Error("Your result could not be saved. Keep this page open and try saving again.");
  }
}
