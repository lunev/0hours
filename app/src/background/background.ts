import {
  getDisplayHour,
  getSecondsToNextHour,
  shouldPlayChime,
  storage,
  updateChimeBadge,
} from "@/lib";
import { STORAGE_KEYS } from "@/config";
import { type Settings } from "@/types";

/**
 * Schedules the alarm to trigger at the start of the next hour
 */
async function setupNextAlarm() {
  await chrome.alarms.clear("hourlyChime");

  const now = new Date();
  const secondsToNextHour = getSecondsToNextHour(now);

  chrome.alarms.create("hourlyChime", {
    when: Date.now() + secondsToNextHour * 1000,
    periodInMinutes: 60,
  });

  console.log(`Next chime scheduled in ${Math.floor(secondsToNextHour / 60)} minutes.`);
}

/**
 * Ticks once a minute so the toolbar badge can catch a quiet-hours window
 * opening or closing without waiting for the next hourly chime.
 */
async function setupBadgeTick() {
  await chrome.alarms.clear("badgeTick");
  chrome.alarms.create("badgeTick", { periodInMinutes: 1 });
}

/**
 * Recomputes and applies the toolbar badge for the current moment: settings,
 * the quiet hours window, and (only if muted pages are configured) the
 * active tab's URL.
 */
async function refreshBadge() {
  const settings = await storage.get<Settings>(STORAGE_KEYS.SETTINGS);

  let activeTabUrl: string | undefined;
  if (settings?.mutedPages?.enabled && settings.mutedPages.patterns.length > 0) {
    const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    activeTabUrl = activeTab?.url;
  }

  await updateChimeBadge(settings, activeTabUrl);
}

// Lifecycle Events
chrome.runtime.onInstalled.addListener((details) => {
  setupNextAlarm();
  setupBadgeTick();
  refreshBadge();

  /**
   * Flags that the "what's new" dialog should show next time the popup
   * opens. Set on every extension update — including a manual "Update" or
   * unpacked-reload click in chrome://extensions — no version comparison.
   * Not set on a fresh install: a brand-new user has nothing to catch up on.
   */
  if (details.reason === "update") {
    storage.set(STORAGE_KEYS.CHANGELOG_PENDING, true);
  }
});
chrome.runtime.onStartup.addListener(() => {
  setupNextAlarm();
  setupBadgeTick();
  refreshBadge();
});

// Live badge inputs: the active tab (for Muted Pages) changing by switch or navigation.
chrome.tabs.onActivated.addListener(() => {
  refreshBadge();
});
chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.url) refreshBadge();
});
// ...and settings themselves changing (e.g. toggling active/quietHours/mutedPages in the popup).
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes[STORAGE_KEYS.SETTINGS]) refreshBadge();
});

/**
 * Listen for scheduled alarms.
 * Since this is a Service Worker, it wakes up specifically to handle this event.
 */
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "badgeTick") {
    await refreshBadge();
    return;
  }

  if (alarm.name === "hourlyChime") {
    // Retrieve user preferences from chrome.storage
    const settings = await storage.get<Settings>(STORAGE_KEYS.SETTINGS);

    // Only query the active tab when muted pages are actually configured —
    // no need to pay for chrome.tabs.query otherwise.
    let activeTabUrl: string | undefined;
    if (settings?.mutedPages?.enabled && settings.mutedPages.patterns.length > 0) {
      const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      activeTabUrl = activeTab?.url;
    }

    /**
     * DECISION: should this chime actually play?
     * Covers time drift after sleep/wake, the extension's active toggle,
     * the user's quiet hours window, and muted pages. See scheduling.ts.
     */
    if (!shouldPlayChime(settings, alarm.scheduledTime, undefined, activeTabUrl)) return;

    /**
     * ASSET PREPARATION
     * 1. Get current hour (0-23).
     * 2. Convert to 12-hour format (e.g., 0 becomes 12, 13 becomes 1) to match audio file names.
     * 3. Construct the path to the localized WebM/Opus asset.
     */
    const displayHour = getDisplayHour(new Date().getHours());

    const lang = settings.language; // 'en' or 'uk'
    const volume = settings.volume / 100; // Convert 0-100 scale to 0.0-1.0
    const filePath = `audio/${lang}/${displayHour}.webm`;

    console.log(`Playing chime: ${lang.toUpperCase()} version for ${displayHour} o'clock.`);

    /**
     * AUDIO EXECUTION
     * Service Workers cannot play audio directly. We delegate the playback
     * to an 'Offscreen Document' which has access to the DOM and the Audio API.
     */
    await playSoundSequence(filePath, volume);
  }
});

/**
 * Manages the Offscreen Document for audio playback
 */
async function playSoundSequence(filePath: string, volume: number) {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
  });

  if (existingContexts.length === 0) {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
      justification: "Hourly time notification",
    });
  }

  chrome.runtime.sendMessage({
    action: "play_sequence",
    voicePath: filePath,
    volume: volume,
  });
}
