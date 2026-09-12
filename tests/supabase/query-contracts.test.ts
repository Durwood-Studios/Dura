import { beforeEach, describe, expect, it, vi } from "vitest";

const { from, upsert, select, or, limit, rpc } = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
  upsert: vi.fn(),
  select: vi.fn(),
  or: vi.fn(),
  limit: vi.fn(),
}));
vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({ from, rpc }) }));
vi.mock("@/lib/analytics/consent-gate", () => ({ isAnalyticsEnabled: () => true }));
import { batchSyncAnalytics, syncXPEvents } from "@/lib/supabase/queries/analytics";
import { syncLessonProgress } from "@/lib/supabase/queries/progress";
import { syncReviewLogs } from "@/lib/supabase/queries/flashcards";
import { syncAssessmentResults } from "@/lib/supabase/queries/assessments";
import { textSearchContent } from "@/lib/supabase/queries/search";

beforeEach((): void => {
  vi.clearAllMocks();
  upsert.mockResolvedValue({ error: null });
  rpc.mockResolvedValue({ error: null });
  from.mockReturnValue({ upsert, select });
  select.mockReturnValue({ or });
  or.mockReturnValue({ limit });
  limit.mockResolvedValue({ data: [], error: null });
});

describe("database client contracts", (): void => {
  it("sends a JSON array to the jsonb progress RPC, not a double-encoded string", async (): Promise<void> => {
    await syncLessonProgress("learner-a", []);
    expect(rpc).toHaveBeenCalledWith("sync_progress", { p_user_id: "learner-a", p_data: [] });
  });

  it("deduplicates analytics and XP within each learner's primary key", async (): Promise<void> => {
    await batchSyncAnalytics("learner-a", []);
    await syncXPEvents("learner-a", []);
    expect(upsert).toHaveBeenNthCalledWith(1, [], {
      onConflict: "user_id,id",
      ignoreDuplicates: true,
    });
    expect(upsert).toHaveBeenNthCalledWith(2, [], {
      onConflict: "user_id,id",
      ignoreDuplicates: true,
    });
  });

  it("searches the published content metadata table without requiring vectors", async (): Promise<void> => {
    await textSearchContent("arrays");
    expect(from).toHaveBeenCalledWith("content_embeddings");
    expect(or).toHaveBeenCalledWith("title.ilike.%arrays%,body_preview.ilike.%arrays%");
  });
});

it("replays append-only reviews and assessments without requesting forbidden updates", async (): Promise<void> => {
  await syncReviewLogs("learner-a", []);
  await syncAssessmentResults("learner-a", []);
  expect(upsert).toHaveBeenNthCalledWith(1, [], {
    onConflict: "user_id,id",
    ignoreDuplicates: true,
  });
  expect(upsert).toHaveBeenNthCalledWith(2, [], {
    onConflict: "id,user_id",
    ignoreDuplicates: true,
  });
});
