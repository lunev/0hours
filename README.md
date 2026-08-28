<p align="center">
  <img src="app/public/icons/logo128x128.png" width="96" alt="0hours logo">
</p>

<h1 align="center">0hours</h1>

<p align="center">
  A Chrome extension that announces the time every hour, in your choice of voice and language.
</p>

<p align="center">
  <a href="https://lunevdev.com/projects/0hours">Project page</a>
</p>

## Features

- **Hourly announcements** — announces the current hour aloud, once per hour, on the hour.
- **13 languages** — German, English, Spanish, French, Italian, Japanese, Korean, Polish, Portuguese, Swedish, Turkish, Ukrainian, and Chinese.
- **Adjustable volume and quiet hours.**
- **Stale-hour protection** — skips the announcement if the alarm fires more than 60 seconds late (e.g. after the machine wakes from sleep), instead of announcing the wrong hour.

## Usage

1. Install the extension and pin it to the Chrome toolbar.
2. Click the extension icon to open the popup.
3. Pick a voice/language in Settings, and adjust volume or quiet hours as needed.
4. Leave the extension running — it announces the time once per hour, on the hour.

## Development

Manifest V3 extension (popup + background service worker + offscreen document for audio) built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui.

```sh
cd app
npm install
npm run dev     # Vite dev server for the popup UI only
npm run watch   # rebuilds the extension bundle on change — use this instead of `dev`
                # when you need the background service worker running
```

Load it unpacked in Chrome: `npm run build`, then go to `chrome://extensions` → enable Developer mode → **Load unpacked** → select `app/build`.

| Command (run from `app/`)                 | Purpose                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| `npm run dev`                             | Vite dev server for the popup UI only                                     |
| `npm run watch`                           | Watch-mode build — use when the background service worker needs to run    |
| `npm run build`                           | Typecheck and production build                                            |
| `npm run release`                         | Build, then zip into `chrome-webstore/releases/` for the Chrome Web Store |
| `npm test`                                | Run tests; `npm run test:coverage` for a coverage report                  |
| `npx eslint .` / `npx prettier --write .` | Lint / format                                                             |

See [`CLAUDE.md`](CLAUDE.md) for repo layout and other conventions.

## Structure

- **`app/`** — the extension itself (React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui).
- **`voices/`** — Python tooling that generates the spoken-hour audio files consumed by the extension (`app/public/audio/<lang>/<hour>.mp3`), using [edge-tts](https://github.com/rany2/edge-tts). Each language is configured in `voices/locales/<lang>.json` (voice name + hour phrases). Regenerate audio with:
  ```bash
  cd voices
  python3 -m venv .venv && source .venv/bin/activate
  pip install -r requirements.txt
  python3 generate_audio.py            # all languages
  python3 generate_audio.py --lang pl  # a single language
  ```
- **`design/`** — logo and promotional artwork source files (`.psd`), not part of the build.
- **`chrome-webstore/`** — ready-to-submit Chrome Web Store assets: exported promo images (`assets/`), listing description and reviewer testing instructions, and built release zips (`releases/`, produced by `npm run release` in `app/`).

## Compatibility

Google Chrome on Windows and Mac.

## Changelog

All notable user-facing changes are listed here. Internal work like dependency upgrades, refactors, and build tooling is left out.

### 3.8.0 - 2026-08-28

- Added an occasional dismissible prompt in the corner of the popup — another quick way to ask a question, make a suggestion, or report a problem via the Chrome Web Store support page.

### 3.7.0 - 2026-08-23

- Added a Feedback icon in Settings that opens the Chrome Web Store support page, so you can ask a question, make a suggestion, or report a problem directly.

### 3.6.0 - 2026-08-23

- Added a toolbar badge (with icon and tooltip) that shows at a glance when the chime is off, silenced by quiet hours, or muted for the current page.
- The main screen now shows a "Page Muted" label when the active tab is on your muted-pages list, matching the existing Silent Mode indicator.

### 3.5.0 - 2026-08-22

- Added Muted Pages — list sites where you don't want the hourly chime to interrupt you, and it'll stay quiet whenever that page is active.

### 3.4.0 - 2026-08-13

- Settings no longer briefly flashes English before showing your saved language.

### 3.3.0 - 2026-08-13

- Refreshed dark mode with new background, card, and text colors.
- Made the selected language easier to spot in the language picker.

### 3.2.0 - 2026-08-11

- Snappier navigation between the main screen and Settings, with no slide animation.
- Refined the hover effect on buttons for a cleaner look.
- Fixed the popup sometimes appearing wider than intended in Chrome.

### 3.1.0 - 2026-08-05

- 0hours now shows a short summary of what's new right after it updates.
- Added Chinese and Swedish as voice languages.
