import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { LearnerRecordImportError, parseLearnerRecordZip } from "@/lib/learner-record/import";
import type { CanonicalLearnerRecord } from "@/lib/learner-record/types";

const VALID_UUID = "11111111-2222-4333-8444-555555555555";

function validCanonical(): CanonicalLearnerRecord & { "x-dura"?: unknown } {
  return {
    schema_version: "lflrs-1.0",
    learner_id: VALID_UUID,
    exported_at: "2026-05-28T10:00:00.000Z",
    cards: [],
    review_log: [],
    mastery_records: [],
  };
}

async function buildZip(payload: unknown): Promise<Blob> {
  const zip = new JSZip();
  zip.file("learner-record.json", JSON.stringify(payload));
  return zip.generateAsync({ type: "blob" });
}

describe("parseLearnerRecordZip", () => {
  it("rejects a non-ZIP blob", async () => {
    const blob = new Blob(["not a zip"], { type: "text/plain" });
    await expect(parseLearnerRecordZip(blob)).rejects.toBeInstanceOf(LearnerRecordImportError);
  });

  it("rejects a ZIP missing learner-record.json", async () => {
    const zip = new JSZip();
    zip.file("readme.txt", "hi");
    const blob = await zip.generateAsync({ type: "blob" });
    await expect(parseLearnerRecordZip(blob)).rejects.toThrow(/missing learner-record\.json/i);
  });

  it("rejects malformed JSON", async () => {
    const zip = new JSZip();
    zip.file("learner-record.json", "{not json");
    const blob = await zip.generateAsync({ type: "blob" });
    await expect(parseLearnerRecordZip(blob)).rejects.toThrow(/isn't valid JSON/i);
  });

  it("rejects payload missing canonical fields", async () => {
    const blob = await buildZip({ schema_version: "lflrs-1.0", learner_id: VALID_UUID });
    await expect(parseLearnerRecordZip(blob)).rejects.toThrow(/canonical shape/i);
  });

  it("parses a minimal valid record", async () => {
    const blob = await buildZip(validCanonical());
    const { summary } = await parseLearnerRecordZip(blob);
    expect(summary.cardsParsed).toBe(0);
    expect(summary.cardsRestored).toBe(0);
    expect(summary.cardsSkippedNoContent).toBe(0);
    expect(summary.reviewLogsRestored).toBe(0);
    expect(summary.modulesRestored).toBe(0);
    expect(summary.sourceLearnerId).toBe(VALID_UUID);
    expect(summary.sourceGeneratedAt).toBe("2026-05-28T10:00:00.000Z");
  });

  it("counts cards-with-content vs skipped", async () => {
    const payload = validCanonical();
    payload.cards = [
      {
        id: "22222222-2222-4333-8444-555555555555",
        due: "2026-06-01T00:00:00.000Z",
        stability: 1,
        difficulty: 5,
        reps: 0,
        lapses: 0,
        state: "New",
        last_modified: "2026-05-28T10:00:00.000Z",
      },
      {
        id: "33333333-2222-4333-8444-555555555555",
        due: "2026-06-01T00:00:00.000Z",
        stability: 1,
        difficulty: 5,
        reps: 0,
        lapses: 0,
        state: "New",
        last_modified: "2026-05-28T10:00:00.000Z",
      },
    ];
    const blob = await buildZip(payload);
    const { summary } = await parseLearnerRecordZip(blob);
    expect(summary.cardsParsed).toBe(2);
    // Both cards lack a termSlug → content unrecoverable
    expect(summary.cardsRestored).toBe(0);
    expect(summary.cardsSkippedNoContent).toBe(2);
  });

  it("rejects oversized blobs before parsing (zip-bomb guard)", async () => {
    // 51 MB blob trips the MAX_ZIP_BYTES (50 MB) gate.
    const big = new Uint8Array(51 * 1024 * 1024);
    const blob = new Blob([big.buffer], { type: "application/zip" });
    await expect(parseLearnerRecordZip(blob)).rejects.toThrow(/too large/i);
  });

  it("rejects ZIPs with too many entries (zip-bomb guard)", async () => {
    const zip = new JSZip();
    zip.file("learner-record.json", JSON.stringify(validCanonical()));
    // 64 entries is the cap; add 65 extras to push over.
    for (let i = 0; i < 65; i++) zip.file(`bogus-${i}.txt`, "x");
    const blob = await zip.generateAsync({ type: "blob" });
    await expect(parseLearnerRecordZip(blob)).rejects.toThrow(/entries/i);
  });

  it("reads x-dura sidecar lesson_progress + goals counts", async () => {
    const payload = {
      ...validCanonical(),
      "x-dura": {
        lesson_progress: [{}, {}, {}],
        goals: [{}],
        export_version: "1.0",
      },
    };
    const blob = await buildZip(payload);
    const { summary } = await parseLearnerRecordZip(blob);
    expect(summary.lessonProgressRestored).toBe(3);
    expect(summary.goalsRestored).toBe(1);
  });
});
