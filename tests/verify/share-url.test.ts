import { describe, expect, it } from "vitest";
import { buildSignedShareUrl, readSignatureFromUrl } from "@/lib/verify/client";
import type { Certificate } from "@/types/assessment";

const BASE = "https://dura.example";
const HASH = "deadbeef".repeat(8);
const SIG = "abcd1234".repeat(8);

const CERT_BASE: Pick<Certificate, "verificationHash" | "signature"> = {
  verificationHash: HASH,
  signature: undefined,
};

describe("buildSignedShareUrl", () => {
  it("omits the sig param when the cert has no signature", () => {
    expect(buildSignedShareUrl(BASE, CERT_BASE)).toBe(`${BASE}/verify/${HASH}`);
  });

  it("appends the signature as a sig query param when present", () => {
    expect(buildSignedShareUrl(BASE, { ...CERT_BASE, signature: SIG })).toBe(
      `${BASE}/verify/${HASH}?sig=${SIG}`
    );
  });

  it("encodes signatures that contain reserved characters", () => {
    // Should never happen for a real hex signature, but the function must
    // not break the URL if the caller passes weird input.
    const weird = "abc def+/=";
    const url = buildSignedShareUrl(BASE, { ...CERT_BASE, signature: weird });
    expect(url).toContain("sig=abc%20def%2B%2F%3D");
  });
});

describe("readSignatureFromUrl", () => {
  it("returns null when no sig param is present", () => {
    expect(readSignatureFromUrl(new URLSearchParams(""))).toBeNull();
  });

  it("returns the signature when present and well-formed", () => {
    expect(readSignatureFromUrl(new URLSearchParams(`sig=${SIG}`))).toBe(SIG);
  });

  it("rejects malformed signatures (not 64 hex chars)", () => {
    expect(readSignatureFromUrl(new URLSearchParams("sig=abc"))).toBeNull();
    expect(readSignatureFromUrl(new URLSearchParams("sig=not-hex-at-all"))).toBeNull();
    expect(readSignatureFromUrl(new URLSearchParams(`sig=${SIG}extra`))).toBeNull();
  });
});
