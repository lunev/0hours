import type { ChangelogEntry } from "@/types";

/**
 * Shown to users as a "what's new" alert after 0hours updates. Not every
 * release needs an entry — internal-only changes (refactors, tests, tooling)
 * simply have none. Write for the user: what's useful or visible to them,
 * never internal/code-level details.
 */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "3.4.0",
    date: "2026-08-13",
    highlights: ["Settings no longer briefly flashes English before showing your saved language."],
  },
  {
    version: "3.3.0",
    date: "2026-08-13",
    highlights: [
      "Refreshed dark mode with new background, card, and text colors.",
      "Made the selected language easier to spot in the language picker.",
    ],
  },
  {
    version: "3.2.0",
    date: "2026-08-11",
    highlights: [
      "Snappier navigation between the main screen and Settings, with no slide animation.",
      "Refined the hover effect on buttons for a cleaner look.",
      "Fixed the popup sometimes appearing wider than intended in Chrome.",
    ],
  },
  {
    version: "3.1.0",
    date: "2026-08-05",
    highlights: [
      "0hours now shows a short summary of what's new right after it updates.",
      "Added Chinese and Swedish as voice languages.",
    ],
  },
];
