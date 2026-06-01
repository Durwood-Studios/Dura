import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Certificate } from "@/types/assessment";

vi.mock("@/lib/db/certificates", () => ({
  getCertificateByHash: vi.fn(),
}));

vi.mock("@/lib/supabase/queries/certificates", () => ({
  getCertificateByHash: vi.fn(),
}));

import { lookupCertificate } from "@/lib/verify/lookup";
import { getCertificateByHash as getLocal } from "@/lib/db/certificates";
import { getCertificateByHash as getRemote } from "@/lib/supabase/queries/certificates";

const FIXTURE: Certificate = {
  id: "cert_abc",
  phaseId: "0",
  userId: null,
  displayName: "Anonymous Learner",
  phaseTitle: "Phase 0: Digital Literacy",
  score: 0.92,
  totalQuestions: 25,
  completedAt: 1717000000000,
  verificationHash: "deadbeef".repeat(8),
  standards: ["cs2023-csf-1"],
};

const ORIGINAL_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

beforeEach(() => {
  vi.mocked(getLocal).mockReset();
  vi.mocked(getRemote).mockReset();
  process.env.NEXT_PUBLIC_SUPABASE_URL = ORIGINAL_SUPABASE_URL ?? "https://example.supabase.co";
});

describe("lookupCertificate", () => {
  it("returns local source when the cert exists in IDB", async () => {
    vi.mocked(getLocal).mockResolvedValueOnce(FIXTURE);

    const result = await lookupCertificate(FIXTURE.verificationHash);

    expect(result).toEqual({ certificate: FIXTURE, source: "local" });
    expect(getRemote).not.toHaveBeenCalled();
  });

  it("falls through to the registry when local misses", async () => {
    vi.mocked(getLocal).mockResolvedValueOnce(null);
    vi.mocked(getRemote).mockResolvedValueOnce(FIXTURE);

    const result = await lookupCertificate(FIXTURE.verificationHash);

    expect(result).toEqual({ certificate: FIXTURE, source: "registry" });
    expect(getRemote).toHaveBeenCalledWith(FIXTURE.verificationHash);
  });

  it("returns null when both sources miss", async () => {
    vi.mocked(getLocal).mockResolvedValueOnce(null);
    vi.mocked(getRemote).mockResolvedValueOnce(null);

    const result = await lookupCertificate("ghost-hash");

    expect(result).toBeNull();
  });

  it("returns null and swallows registry errors", async () => {
    vi.mocked(getLocal).mockResolvedValueOnce(null);
    vi.mocked(getRemote).mockRejectedValueOnce(new Error("network blown"));

    const result = await lookupCertificate(FIXTURE.verificationHash);

    expect(result).toBeNull();
  });

  it("skips the registry when Supabase is not configured", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    vi.mocked(getLocal).mockResolvedValueOnce(null);

    const result = await lookupCertificate(FIXTURE.verificationHash);

    expect(result).toBeNull();
    expect(getRemote).not.toHaveBeenCalled();
  });
});
