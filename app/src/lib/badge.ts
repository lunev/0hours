import type { Settings } from "@/types";
import { BADGE_TEXT, BADGE_TITLE } from "@/config";
import { type ChimeBadgeState, getChimeBadgeState } from "./scheduling";

export interface BadgeAppearance {
  text: string;
  title: string;
}

export const getBadgeAppearance = (state: ChimeBadgeState): BadgeAppearance => ({
  text: BADGE_TEXT[state],
  title: BADGE_TITLE[state],
});

/**
 * Applies the toolbar badge/title for the current chime state. Called
 * whenever something that affects `getChimeBadgeState` changes: the active
 * tab, the clock crossing a quiet-hours boundary, or settings themselves.
 * Badge background color is left to Chrome's default.
 */
export const updateChimeBadge = async (
  settings: Settings | null,
  activeTabUrl?: string | null,
  now: Date = new Date(),
): Promise<void> => {
  const appearance = getBadgeAppearance(getChimeBadgeState(settings, now, activeTabUrl));

  await chrome.action.setBadgeText({ text: appearance.text });
  await chrome.action.setTitle({ title: appearance.title });
};
