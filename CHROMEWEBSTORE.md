# Chrome Web Store Compliance

Tracking file for Chrome Web Store submission requirements: permission justifications (single-purpose policy) and privacy-relevant data handling notes. Keep this in sync whenever `app/public/manifest.json` permissions change.

## Single Purpose

0hours announces the current time aloud once every hour, on the hour, in a voice/language the user chooses. Every permission below exists to support that one purpose.

## Permission Justifications

Current permissions declared in `app/public/manifest.json`: `["storage", "alarms", "offscreen"]`. No `host_permissions` are declared.

### `storage`

Used to persist the user's selected voice/language, volume, quiet-hours settings, and changelog-seen state locally via `chrome.storage.local`, so preferences survive popup close and browser restart. Accessed in `app/src/lib/storage.ts`. No alternative to `storage` exists for this — it is the only API for persisting extension state.

### `alarms`

Used to schedule the hourly chime. `chrome.alarms` is the only API for scheduling recurring work in an MV3 service worker, which does not stay alive on a plain `setTimeout`/`setInterval`. Usage: `app/src/background/background.ts` creates an alarm aligned to the top of the hour and, in its `onAlarm` listener, checks the fire time and skips announcing if it's more than 60 seconds late (e.g. after the machine wakes from sleep) rather than announcing a stale hour.

### `offscreen`

Used to actually play the hourly audio. MV3 service workers cannot play audio directly, so `app/src/background/background.ts` creates an offscreen document (`app/public/offscreen.html`/`offscreen.js`) via `chrome.offscreen.createDocument()` with reason `AUDIO_PLAYBACK`, and messages it to play the appropriate `<lang>/<hour>.mp3` file.

## Privacy-Relevant Data Handling

- **Data collected:** user-selected voice/language, volume, and quiet-hours settings, plus a flag tracking whether the "what's new" changelog dialog has been seen. No browsing history, page content, tab URLs, or credentials are read or stored.
- **Where it's stored:** locally in the browser via `chrome.storage.local`. This data is not synced across devices.
- **External transmission:** none. The codebase makes no `fetch`/`XMLHttpRequest`/network calls of any kind, and no `host_permissions` are declared. All spoken-hour audio files are bundled with the extension (`app/public/audio/`), pre-generated at build time — nothing is fetched at runtime. No data is sent to the developer or any third party.
