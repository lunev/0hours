# 0hours — Talking Clock & Hourly Time Announcer

A Chrome extension (Manifest V3) that announces the time every hour, in your choice of voice and language.

[Project page](https://lunevdev.com/projects/0hours)

## Features

- Announces the current hour aloud, once per hour, on the hour
- Supports 11 languages: German, English, Spanish, French, Italian, Japanese, Korean, Polish, Portuguese, Turkish, Ukrainian
- Adjustable volume and quiet hours
- Skips the announcement if the alarm fires more than 60 seconds late (e.g. after the machine wakes from sleep), instead of announcing a stale hour

## Tech stack

React 19, TypeScript, Vite 7, Tailwind CSS 4, shadcn/ui (Radix primitives), react-router.

## Development

```bash
npm install
npm run dev     # Vite dev server for the popup UI only
npm run watch   # rebuilds the extension bundle on change — use this instead of `dev`
                 # when you need the background service worker running
```

To load the extension in Chrome:

1. `npm run build` (or `npm run watch` for live rebuilds)
2. Open `chrome://extensions`, enable Developer mode
3. "Load unpacked" and select the `build/` directory

There is no automated test suite — verification is manual via the steps above.

## Building a release

```bash
npm run release
```

Builds the extension and zips `build/` into `../chrome-webstore/release/<slug>-v<version>.zip`, using the name/version from `public/manifest.json`.

To compare against a previously released build:

```bash
npm run prev [version]
```

Wipes `build/` and restores it from a past release zip (optionally matching a specific version).

## Linting & formatting

```bash
npx eslint .
npx prettier --write .
```

## Project structure

- `src/background/background.ts` — MV3 service worker; schedules the hourly alarm and delegates audio playback
- `public/offscreen.html` / `offscreen.js` — offscreen document that plays audio, since MV3 service workers can't play audio directly
- `src/pages/` — popup UI (home, settings)
- `public/audio/<lang>/<hour>.mp3` — spoken-hour audio files per language
