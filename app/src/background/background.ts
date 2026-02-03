import { isQuietNow, storage } from "@/lib";
import { type Settings } from "@/types";

/**
 * Schedules the alarm to trigger at the start of the next hour
 */
async function setupNextAlarm() {
  await chrome.alarms.clear("hourlyChime");

  const now = new Date();
  const secondsToNextHour = (60 - now.getMinutes()) * 60 - now.getSeconds();

  chrome.alarms.create("hourlyChime", {
    when: Date.now() + secondsToNextHour * 1000,
    periodInMinutes: 60,
  });

  console.log(`Next chime scheduled in ${Math.floor(secondsToNextHour / 60)} minutes.`);
}

// Lifecycle Events
chrome.runtime.onInstalled.addListener(setupNextAlarm);
chrome.runtime.onStartup.addListener(setupNextAlarm);

/**
 * Listen for scheduled alarms.
 * Since this is a Service Worker, it wakes up specifically to handle this event.
 */
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "hourlyChime") {
    /**
     * TIME DRIFT PROTECTION
     * When a computer enters sleep mode, Chrome pauses the Service Worker.
     * Upon waking up, Chrome triggers any "missed" alarms immediately.
     * We calculate the 'drift' (difference between current time and scheduled time)
     * to ensure we don't announce an outdated hour (e.g., announcing 2:00 PM at 2:25 PM).
     */
    const now = Date.now();
    const drift = Math.abs(now - alarm.scheduledTime);
    const ONE_MINUTE = 60 * 1000; // 60,000 milliseconds

    if (drift > ONE_MINUTE) {
      console.log(`Skipping delayed chime. Drift: ${Math.round(drift / 1000)}s`);
      return; // Exit if the alarm is more than 60 seconds late
    }

    // Retrieve user preferences from chrome.storage
    const settings = await storage.get<Settings>("settings");

    /**
     * VALIDATION 1: Global Active State
     * If the user has toggled the extension OFF in the UI, we abort.
     */
    if (!settings || !settings.active) return;

    /**
     * VALIDATION 2: Silence Mode (Quiet Hours)
     * Check if the current time falls within the user-defined 'Do Not Disturb' range.
     */
    if (settings.quietHours?.enabled) {
      if (isQuietNow(settings.quietHours.start, settings.quietHours.end)) {
        console.log("Silence mode active. Chime skipped.");
        return;
      }
    }

    /**
     * ASSET PREPARATION
     * 1. Get current hour (0-23).
     * 2. Convert to 12-hour format (e.g., 0 becomes 12, 13 becomes 1) to match audio file names.
     * 3. Construct the path to the localized MP3 asset.
     */
    const date = new Date();
    const hour = date.getHours();
    const displayHour = hour % 12 || 12;

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
