import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
const count = z.number().int().nonnegative();
const item = z.object({ label: z.string(), value: count });
const day = z.object({ date: z.string(), value: count });
const report = z.object({
  eventCount: count,
  dau: count,
  wau: count,
  distinctNames: count,
  eventsPerDay: z.array(day),
  signupsPerDay: z.array(day),
  topEvents: z.array(item),
  lessons: z.array(item),
  searches: z.array(item),
  quizzes: z.array(item),
});
export type LearningReport = z.infer<typeof report>;

/** Exact server aggregation through the admin session's RLS; no raw-row-limit approximation. */
export async function getLearningReport(
  client: SupabaseClient
): Promise<{ data: LearningReport | null; error: { message: string } | null }> {
  try {
    const response = await client.rpc("admin_learning_report");
    if (response.error) throw new Error(response.error.message);
    return { data: report.parse(response.data), error: null };
  } catch (error) {
    console.error("[admin] Report unavailable", error);
    return {
      data: null,
      error: {
        message:
          "Exact reports are unavailable. Check the staged admin-report database update and your administrator access.",
      },
    };
  }
}
