import { describe, expect, it } from "vitest";
import type { ChangelogEntry } from "@/types";
import { getChangelogEntryForVersion } from "./changelog";

const entries: ChangelogEntry[] = [
  { version: "3.1.0", date: "2026-08-05", highlights: ["Added a what's new alert"] },
  { version: "3.0.0", date: "2026-07-01", highlights: ["Redesigned settings"] },
];

describe("getChangelogEntryForVersion", () => {
  it("returns the matching entry", () => {
    expect(getChangelogEntryForVersion(entries, "3.0.0")).toEqual(entries[1]);
  });

  it("returns null when no entry matches the version", () => {
    expect(getChangelogEntryForVersion(entries, "2.0.0")).toBeNull();
  });

  it("returns null for an empty changelog", () => {
    expect(getChangelogEntryForVersion([], "3.1.0")).toBeNull();
  });
});
