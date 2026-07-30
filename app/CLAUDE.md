# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

0hours — a Chrome MV3 extension (talking clock) that announces the time every hour in the user's choice of voice/language. React 19 + TypeScript + Vite 7 + Tailwind CSS 4 + shadcn/ui (Radix primitives), react-router for in-popup navigation. Package manager: npm.

## Commands

- `npm run dev` — Vite dev server for the popup UI only (background service worker / offscreen audio won't work in this mode).
- `npm run watch` — `vite build --mode development --watch`; use this instead of `dev` when the background service worker needs to run.
- `npm run build` — `tsc -b && vite build`, outputs to `build/`.
- `npm run release` — builds then zips `build/` into `release/<slug>-v<version>.zip` (name/version read from `public/manifest.json`). Release zips are intentionally committed to git.
- `npm run prev [version]` — wipes `build/` and restores it from a previous release zip, for comparing against production.
- No `lint`/`format`/`test` npm scripts exist. Lint with `npx eslint .`, format with `npx prettier --write .`.
- No automated tests — verification is manual: `npm run build`, then load `build/` unpacked via `chrome://extensions`.

## Architecture notes

- `vite.config.ts` has a custom `entryFileNames` that forces the background entry to always emit as unhashed `background.js` — required because `public/manifest.json`'s `background.service_worker` references that literal filename. Don't let this get hashed if editing the Vite config.
- MV3 service workers can't play audio directly, so `public/offscreen.html`/`offscreen.js` handles audio playback; `src/background/background.ts` messages it via `chrome.runtime.sendMessage`.
- `src/background/background.ts` schedules an hourly `chrome.alarms` alarm aligned to the top of the hour, and skips firing if the alarm is more than 60s late (e.g. after sleep/wake) to avoid announcing a stale hour.
- Settings are persisted via `chrome.storage` (`src/lib/storage.ts`), not env vars — there are no env vars in this project.
- Path alias `@` → `src` (set in both `tsconfig.json` and `vite.config.ts`).
- `eslint.config.js` ignores `dist`, but the real build output dir is `build/` — be aware ESLint may not be excluding build artifacts as intended.
- `components.json` (shadcn config) points at `src/index.css`, but the actual Tailwind entry file is `src/assets/index.css`.

## Style

- Prettier config (`.prettierrc.json`): double quotes, `printWidth: 100`, trailing commas everywhere, 2-space indent.
