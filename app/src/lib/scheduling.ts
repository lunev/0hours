import type { Settings } from "@/types";
import { isPageMuted } from "./pageMatch";

export const CHIME_DRIFT_THRESHOLD_MS = 60 * 1000;

/**
 * Seconds from `now` until the start of the next hour.
 */
export const getSecondsToNextHour = (now: Date) => {
  return (60 - now.getMinutes()) * 60 - now.getSeconds();
};

/**
 * True once an alarm fires more than CHIME_DRIFT_THRESHOLD_MS after its scheduled
 * time (e.g. Chrome catching up a missed alarm after sleep/wake), meaning the hour
 * it would announce is stale.
 */
export const isChimeDrifted = (scheduledTime: number, now: number) => {
  return Math.abs(now - scheduledTime) > CHIME_DRIFT_THRESHOLD_MS;
};

/**
 * Converts a 24-hour hour (0-23) to the 12-hour value used in audio filenames.
 */
export const getDisplayHour = (hour: number) => hour % 12 || 12;

/**
 * True while `now` falls within the [start, end) quiet-hours window. Handles
 * overnight windows where start is later in the day than end (e.g. 22:00-08:00).
 */
export const isQuietNow = (start: string, end: string, now: Date = new Date()) => {
  const current = now.getHours() * 60 + now.getMinutes();

  const [sH, sM] = start.split(":").map(Number);
  const [eH, eM] = end.split(":").map(Number);
  const s = sH * 60 + sM;
  const e = eH * 60 + eM;

  if (s < e) {
    // Standard interval (e.g., 10:00 AM - 6:00 PM)
    return current >= s && current < e;
  } else {
    // Overnight interval (e.g., 10:00 PM - 8:00 AM)
    return current >= s || current < e;
  }
};

/**
 * Single decision point for whether the hourly chime should fire: not stale,
 * the extension is turned on, we're not inside the user's quiet hours, and
 * the active tab (if known) isn't on a muted page.
 */
export const shouldPlayChime = (
  settings: Settings | null,
  scheduledTime: number,
  now: Date = new Date(),
  activeTabUrl?: string | null,
): settings is Settings => {
  if (isChimeDrifted(scheduledTime, now.getTime())) return false;
  if (!settings || !settings.active) return false;
  if (
    settings.quietHours?.enabled &&
    isQuietNow(settings.quietHours.start, settings.quietHours.end, now)
  ) {
    return false;
  }
  if (settings.mutedPages?.enabled && isPageMuted(activeTabUrl, settings.mutedPages.patterns)) {
    return false;
  }
  return true;
};

export type ChimeBadgeState = "off" | "chiming" | "quiet-hours" | "muted-page";

/**
 * Live badge state for the toolbar icon: which of the (mutually exclusive,
 * for badge purposes) reasons explains whether the next chime will play.
 * Quiet hours takes priority over muted pages when both apply, since it's
 * the broader, time-based reason rather than a single tab's.
 */
export const getChimeBadgeState = (
  settings: Settings | null,
  now: Date = new Date(),
  activeTabUrl?: string | null,
): ChimeBadgeState => {
  if (!settings || !settings.active) return "off";
  if (
    settings.quietHours.enabled &&
    isQuietNow(settings.quietHours.start, settings.quietHours.end, now)
  ) {
    return "quiet-hours";
  }
  if (settings.mutedPages.enabled && isPageMuted(activeTabUrl, settings.mutedPages.patterns)) {
    return "muted-page";
  }
  return "chiming";
};
