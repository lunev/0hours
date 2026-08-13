# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

0hours — a Chrome MV3 extension (talking clock) that announces the time every hour in the user's choice of voice/language. React 19 + TypeScript + Vite 7 + Tailwind CSS 4 + shadcn/ui (Radix primitives), react-router for in-popup navigation. Package manager: npm.

## Commands

- `npm run dev` — Vite dev server for the popup UI only (background service worker / offscreen audio won't work in this mode).
- `npm run watch` — `vite build --mode development --watch`; use this instead of `dev` when the background service worker needs to run.
- `npm run build` — `tsc -b && vite build`, outputs to `build/`.
- `npm run release` — builds then zips `build/` into `../chrome-webstore/releases/<slug>-v<version>.zip` (name/version read from `public/manifest.json`) via `scripts/release.js`. This script is copy/paste-portable across the other extension repos in this account (the-duplicator, manage-x, parents-reminder) — keep it in sync if you improve it. Release zips are intentionally committed to git, alongside the rest of the Chrome Web Store submission assets.
- No `lint`/`format` npm scripts exist. Lint with `npx eslint .`, format with `npx prettier --write .`.
- `npm test` / `npm run test:coverage` run the Vitest suite (pure logic in `src/lib`, storage-backed hooks in `src/hooks`). It covers logic, not UI — verification of the actual popup still requires `npm run build` then loading `build/` unpacked via `chrome://extensions`.

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

## UX/Design conventions

- The popup is narrow (`min-w-100` = 400px, see `src/assets/index.css`) and has no fixed height — settings cards should stay compact; prefer collapsing/hiding inactive sections over always-rendering grayed-out controls.
- Icon-only buttons (e.g. play/stop, back arrow) must carry both `title` and `aria-label` since there's no visible text fallback.
- Settings cards follow a consistent shape: `bg-card p-4 rounded-xl border border-border/40`, with an uppercase `text-[10px] tracking-widest font-bold text-muted-foreground` label next to a `size-3.5` lucide icon as the header.
- For a fixed, non-growing set of choices (e.g. the languages in `LANGUAGES`), prefer an always-visible compact grid of chips/buttons over a `Select` dropdown — it avoids scrolling and is more scannable in a small popup. Reserve `Select` for open-ended or long/variable-length lists.
- After any UI change, run the `app:verify` skill (build + lint + prettier) before considering it done, then confirm by loading `build/` unpacked in `chrome://extensions` — there's no automated UI test suite.

## Versioning & changelog policy

- Every release bumps `public/manifest.json`'s `version` (and `package.json`'s, kept manually in sync — no tooling links them):
  - **patch** (x.y.Z): internal-only change (refactor, tests, tooling) — no changelog entry.
  - **minor** (x.Y.0): user-facing improvement or new feature — add a `src/config/changelog.ts` entry.
  - **major** (X.0.0): large or breaking change to how the extension behaves — add a `src/config/changelog.ts` entry.
- `src/config/changelog.ts` entries are shown to users in a "what's new" dialog after they update (`src/components/changelog-dialog.tsx`, backed by `src/hooks/useChangelogUpdate.ts`). Write entries for the _user_, not for developers: what's useful or visible to them, never internal/code-level descriptions ("refactored X", "added tests"). Skip the entry entirely for internal-only releases — do not pad the changelog with a "nothing changed" line.
- Update detection is driven by `chrome.runtime.onInstalled` in `background.ts`: any event with `reason === "update"` (including a manual "Update" or unpacked-reload click in `chrome://extensions`) sets a `changelogPending` flag in `chrome.storage.local` — no version comparison. The popup checks that flag on mount (`src/hooks/useChangelogUpdate.ts`) and looks up the entry for the current manifest version (`src/lib/changelog.ts`'s `getChangelogEntryForVersion`); if none exists the flag is cleared silently. Dismissing the dialog clears the flag, so it won't reappear until the next update event.
