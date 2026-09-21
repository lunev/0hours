import { describe, expect, it } from "vitest";
import { isPageMuted, matchesPattern, normalizeForMatch } from "./pageMatch";

describe("normalizeForMatch", () => {
  it("lowercases", () => {
    expect(normalizeForMatch("Example.COM")).toBe("example.com");
  });

  it("strips the scheme", () => {
    expect(normalizeForMatch("https://example.com")).toBe("example.com");
    expect(normalizeForMatch("http://example.com")).toBe("example.com");
  });

  it("strips a leading www.", () => {
    expect(normalizeForMatch("www.example.com")).toBe("example.com");
  });

  it("strips trailing slashes", () => {
    expect(normalizeForMatch("example.com/")).toBe("example.com");
    expect(normalizeForMatch("example.com//")).toBe("example.com");
  });

  it("keeps slashes that are not trailing", () => {
    expect(normalizeForMatch("example.com//path/")).toBe("example.com//path");
  });

  it("reduces a slash-only string to empty", () => {
    expect(normalizeForMatch("///")).toBe("");
  });

  it("stays linear on URLs with many non-trailing slashes", () => {
    // A `/\/+$/` regex takes several seconds on this input (quadratic backtracking).
    const hostile = `https://example.com${"/".repeat(200_000)}x`;
    const start = performance.now();
    expect(normalizeForMatch(hostile)).toBe(`example.com${"/".repeat(200_000)}x`);
    expect(performance.now() - start).toBeLessThan(1000);
  });

  it("trims whitespace", () => {
    expect(normalizeForMatch("  example.com  ")).toBe("example.com");
  });
});

describe("matchesPattern", () => {
  it("matches an exact hostname", () => {
    expect(matchesPattern("https://example.com/page", "example.com")).toBe(true);
  });

  it("matches a subdomain of the pattern", () => {
    expect(matchesPattern("https://docs.google.com/document", "google.com")).toBe(true);
  });

  it("does not match an unrelated domain that merely contains the pattern", () => {
    expect(matchesPattern("https://notexample.com/page", "example.com")).toBe(false);
  });

  it("is case-insensitive and ignores scheme/www/trailing slash on both sides", () => {
    expect(matchesPattern("https://www.Figma.com/", "figma.com")).toBe(true);
  });

  it("matches path-scoped patterns by substring", () => {
    expect(
      matchesPattern("https://docs.google.com/document/d/abc123", "docs.google.com/document"),
    ).toBe(true);
  });

  it("does not match a path-scoped pattern against a different path", () => {
    expect(
      matchesPattern("https://docs.google.com/spreadsheets/d/abc123", "docs.google.com/document"),
    ).toBe(false);
  });

  it("rejects an empty or whitespace-only pattern", () => {
    expect(matchesPattern("https://example.com", "")).toBe(false);
    expect(matchesPattern("https://example.com", "   ")).toBe(false);
  });
});

describe("isPageMuted", () => {
  it("is false for a missing URL", () => {
    expect(isPageMuted(undefined, ["example.com"])).toBe(false);
    expect(isPageMuted(null, ["example.com"])).toBe(false);
    expect(isPageMuted("", ["example.com"])).toBe(false);
  });

  it("is false for an empty pattern list", () => {
    expect(isPageMuted("https://example.com", [])).toBe(false);
  });

  it("is true when any pattern matches", () => {
    expect(isPageMuted("https://example.com", ["other.com", "example.com"])).toBe(true);
  });

  it("is false when no pattern matches", () => {
    expect(isPageMuted("https://example.com", ["other.com", "another.com"])).toBe(false);
  });
});
