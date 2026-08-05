import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { getChangelogEntryForVersion } from "@/lib/changelog";
import { type ChangelogEntry } from "@/types";
import { CHANGELOG, STORAGE_KEYS } from "@/config";

export const useChangelogUpdate = (changelog: ChangelogEntry[] = CHANGELOG) => {
  const [entry, setEntry] = useState<ChangelogEntry | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadChangelog = async () => {
      const isPending = await storage.get<boolean>(STORAGE_KEYS.CHANGELOG_PENDING);
      if (!isPending) return;

      const currentVersion = chrome.runtime.getManifest().version;
      const matchingEntry = getChangelogEntryForVersion(changelog, currentVersion);

      if (matchingEntry) {
        setEntry(matchingEntry);
        setIsOpen(true);
      } else {
        // Nothing user-facing shipped in this update — clear the flag
        // silently so we don't keep checking on every popup open.
        await storage.set(STORAGE_KEYS.CHANGELOG_PENDING, false);
      }
    };

    loadChangelog();
  }, [changelog]);

  const dismiss = async () => {
    await storage.set(STORAGE_KEYS.CHANGELOG_PENDING, false);
    setIsOpen(false);
  };

  return { entry, isOpen, dismiss };
};
