import type { ChangelogEntry } from "@/types";

/**
 * Shown to users as a "what's new" alert after 0hours updates. Not every
 * release needs an entry — internal-only changes (refactors, tests, tooling)
 * simply have none. Write for the user: what's useful or visible to them,
 * never internal/code-level details.
 */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "3.6.0",
    date: "2026-08-23",
    highlights: [
      "Added a toolbar badge showing at a glance when the chime is off, silenced by quiet hours, or muted on the current page.",
      'The main screen now shows "Page Muted" when the active tab is on your muted-pages list.',
    ],
  },
  {
    version: "3.5.0",
    date: "2026-08-22",
    highlights: [
      "Added Muted Pages — list sites where you don't want the hourly chime to interrupt you, and it'll stay quiet whenever that page is active.",
    ],
  },
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
