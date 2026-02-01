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

// Alarm Event Handler
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "hourlyChime") {
    const settings = await storage.get<Settings>("settings");

    // 1. Check if the extension is active
    if (!settings || !settings.active) return;

    // 2. Check for Silence Mode (Quiet Hours)
    if (settings.quietHours?.enabled) {
      if (isQuietNow(settings.quietHours.start, settings.quietHours.end)) {
        console.log("Silence mode active. Chime skipped.");
        return;
      }
    }

    // 3. Determine the hour (current time at chime execution)
    const now = new Date();
    const hour = now.getHours();
    const displayHour = hour % 12 || 12;

    const lang = settings.language;
    const volume = settings.volume / 100;
    const filePath = `audio/${lang}/${displayHour}.mp3`;

    console.log(`Playing chime: ${lang.toUpperCase()} version for ${displayHour} o'clock.`);
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
