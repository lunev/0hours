import type { ChimeBadgeState } from "@/lib";

/**
 * Toolbar badge text for each chime state. Kept short since Chrome truncates
 * badge text to ~4 visible characters.
 */
export const BADGE_TEXT: Record<ChimeBadgeState, string> = {
  off: "",
  chiming: "",
  "quiet-hours": "🌙",
  "muted-page": "🔕",
};

/** Toolbar icon tooltip (`chrome.action.setTitle`) for each chime state. */
export const BADGE_TITLE: Record<ChimeBadgeState, string> = {
  off: "0hours — chime is off",
  chiming: "0hours",
  "quiet-hours": "0hours — chime muted (quiet hours)",
  "muted-page": "0hours — chime muted (this page)",
};
