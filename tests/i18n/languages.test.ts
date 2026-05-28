import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  ENABLED_LOCALES,
  LOCALES,
  findLocale,
  resolveLocale,
} from "@/lib/i18n/languages";

describe("locale registry", () => {
  it("has unique locale codes", () => {
    const codes = LOCALES.map((l) => l.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("includes Apple's iOS 18 base languages", () => {
    // Spot-check a handful — full list is the file itself.
    const expected = [
      "ar",
      "zh-Hans",
      "zh-Hant",
      "en",
      "es",
      "fr",
      "de",
      "hi",
      "ja",
      "ko",
      "pt-BR",
      "ru",
      "th",
      "tr",
      "uk",
      "vi",
    ];
    for (const code of expected) {
      expect(findLocale(code), `expected ${code} in registry`).toBeDefined();
    }
  });

  it("default locale is enabled", () => {
    const entry = findLocale(DEFAULT_LOCALE);
    expect(entry?.enabled).toBe(true);
  });

  it("RTL locales declared correctly", () => {
    expect(findLocale("ar")?.direction).toBe("rtl");
    expect(findLocale("he")?.direction).toBe("rtl");
    expect(findLocale("en")?.direction).toBe("ltr");
  });

  it("ENABLED_LOCALES matches the enabled rows", () => {
    expect(ENABLED_LOCALES).toEqual(LOCALES.filter((l) => l.enabled).map((l) => l.code));
  });
});

describe("resolveLocale", () => {
  it("falls back to default for empty input", () => {
    expect(resolveLocale("")).toBe(DEFAULT_LOCALE);
    expect(resolveLocale(null)).toBe(DEFAULT_LOCALE);
    expect(resolveLocale(undefined)).toBe(DEFAULT_LOCALE);
  });

  it("matches exact code when enabled", () => {
    // Today only `en` is enabled. Exact match returns it.
    expect(resolveLocale("en")).toBe("en");
  });

  it("falls back to default for a disabled exact match", () => {
    // 'fr' is in the registry but disabled — should resolve to default.
    expect(resolveLocale("fr")).toBe(DEFAULT_LOCALE);
  });

  it("normalizes underscore form", () => {
    expect(resolveLocale("en_US")).toBe("en");
  });

  it("falls back to default when no enabled match exists", () => {
    expect(resolveLocale("zz-ZZ")).toBe(DEFAULT_LOCALE);
  });
});
