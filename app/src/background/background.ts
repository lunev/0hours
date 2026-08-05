import { getDisplayHour, getSecondsToNextHour, shouldPlayChime, storage } from "@/lib";
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

// Lifecycle Events
chrome.runtime.onInstalled.addListener((details) => {
  setupNextAlarm();

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
chrome.runtime.onStartup.addListener(setupNextAlarm);

/**
 * Listen for scheduled alarms.
 * Since this is a Service Worker, it wakes up specifically to handle this event.
 */
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "hourlyChime") {
    // Retrieve user preferences from chrome.storage
    const settings = await storage.get<Settings>("settings");

    /**
     * DECISION: should this chime actually play?
     * Covers time drift after sleep/wake, the extension's active toggle,
     * and the user's quiet hours window. See scheduling.ts for the logic.
     */
    if (!shouldPlayChime(settings, alarm.scheduledTime)) return;

    /**
     * ASSET PREPARATION
     * 1. Get current hour (0-23).
     * 2. Convert to 12-hour format (e.g., 0 becomes 12, 13 becomes 1) to match audio file names.
     * 3. Construct the path to the localized MP3 asset.
     */
    const displayHour = getDisplayHour(new Date().getHours());

    const lang = settings.language; // 'en' or 'uk'
    const volume = settings.volume / 100; // Convert 0-100 scale to 0.0-1.0
    const filePath = `audio/${lang}/${displayHour}.mp3`;

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
