import type { ChangelogEntry } from "@/types";

/**
 * The changelog entry for the given version, if one was written for it.
 * No entry means the release had nothing user-facing to announce.
 */
export const getChangelogEntryForVersion = (
  changelog: ChangelogEntry[],
  version: string,
): ChangelogEntry | null => changelog.find((entry) => entry.version === version) ?? null;
