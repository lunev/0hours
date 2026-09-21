# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

0hours — a Chrome MV3 extension (talking clock) that announces the time every hour in the user's choice of voice/language. React 19 + TypeScript + Vite 7 + Tailwind CSS 4 + shadcn/ui (Radix primitives), react-router for in-popup navigation. Package manager: npm.

## Repo layout

- `app/` — the entire buildable project: `package.json`, source, config, build scripts. **Run all npm commands from inside `app/`, not the repo root.**
- `voices/` — Python tooling that generates the spoken-hour audio files consumed by the extension (`app/public/audio/<lang>/<hour>.mp3`), using [edge-tts](https://github.com/rany2/edge-tts). Each language is configured in `voices/locales/<lang>.json` (voice name + hour phrases).
- `design/` — logo and promotional artwork, not part of the build. `.psd` sources are gitignored (large) and live only on the maintainer's machine.
- `chrome-webstore/` — Chrome Web Store listing material: `releases/` (committed release zips), `description.txt` (store description, plain text), `testing-instructions.txt` (reviewer testing steps, plain text), `assets/` (exported promo images).
- `site/` — public landing page: a static Vite + React SPA with its own `package.json` (run its npm commands from inside `site/`: `npm run dev`, `npm run build`). Copy lives in `site/src/content.ts`; keep it in sync by hand with `chrome-webstore/description.txt`. `.github/workflows/pages.yml` deploys it to https://lunev.github.io/0hours/ on pushes to `main` that touch `site/`. Needs a public repo with Settings → Pages → Source set to "GitHub Actions", and `base` in `site/vite.config.ts` must equal the repo name.

## Commands

Run from `app/`:
- `npm run dev` — Vite dev server for the popup UI only (background service worker / offscreen audio won't work in this mode).
- `npm run watch` — `vite build --mode development --watch`; use this instead of `dev` when the background service worker needs to run.
- `npm run build` — `tsc -b && vite build`, outputs to `app/build/`.
- **When iterating on changes you want to see live, start `npm run watch` (or `npm run dev` for popup-only UI work) in the background for the session** — don't rely on a one-off `npm run build` at the end, since its output goes stale the moment you make another edit.
- `npm run release` — builds then zips `app/build/` into `chrome-webstore/releases/<slug>-v<version>.zip` (name/version read from `app/public/manifest.json`) via `scripts/release.js`. This script is copy/paste-portable across the other extension repos in this account (the-duplicator, manage-x, parents-reminder) — keep it in sync if you improve it. Release zips are intentionally committed to git, alongside the rest of the Chrome Web Store submission assets.
- No `lint`/`format` npm scripts exist. Lint with `npx eslint .`, format with `npx prettier --write .`.
- `npm test` / `npm run test:coverage` run the Vitest suite (pure logic in `src/lib`, storage-backed hooks in `src/hooks`). It covers logic, not UI — verification of the actual popup still requires `npm run build` then loading `app/build/` unpacked via `chrome://extensions`.

## Architecture notes

- `app/vite.config.ts` has a custom `entryFileNames` that forces the background entry to always emit as unhashed `background.js` — required because `app/public/manifest.json`'s `background.service_worker` references that literal filename. Don't let this get hashed if editing the Vite config.
- MV3 service workers can't play audio directly, so `app/public/offscreen.html`/`offscreen.js` handles audio playback; `app/src/background/background.ts` messages it via `chrome.runtime.sendMessage`.
- `app/src/background/background.ts` schedules an hourly `chrome.alarms` alarm aligned to the top of the hour, and skips firing if the alarm is more than 60s late (e.g. after sleep/wake) to avoid announcing a stale hour.
- Settings are persisted via `chrome.storage` (`app/src/lib/storage.ts`), not env vars — there are no env vars in this project.
- Path alias `@` → `src` (set in both `app/tsconfig.json` and `app/vite.config.ts`).
- `app/eslint.config.js` ignores `dist`, but the real build output dir is `app/build/` — be aware ESLint may not be excluding build artifacts as intended.
- `app/components.json` (shadcn config) points at `src/index.css`, but the actual Tailwind entry file is `src/assets/index.css`.

## Style

- Prettier config (`app/.prettierrc`): double quotes, `printWidth: 100`, trailing commas everywhere, 2-space indent.

## UX/Design conventions

- The popup is narrow (`min-w-100` = 400px, see `app/src/assets/index.css`) and has no fixed height — settings cards should stay compact; prefer collapsing/hiding inactive sections over always-rendering grayed-out controls.
- Icon-only buttons (e.g. play/stop, back arrow) must carry both `title` and `aria-label` since there's no visible text fallback.
- Settings cards use the shared `Card` component (`app/src/components/ui/card.tsx`, installed via `npx shadcn add card` then customized to `bg-card p-4 flex flex-col gap-3 rounded-md shadow-sm dark:shadow-card border border-border/40`), with an uppercase `text-[10px] tracking-widest font-bold text-muted-foreground` label next to a `size-3.5` lucide icon as the header. `dark:shadow-card` depends on the `--card-shadow`/`--shadow-card` tokens in `src/assets/index.css` — copy those alongside `card.tsx` when porting it to another repo.
- For a fixed, non-growing set of choices (e.g. the languages in `LANGUAGES`), prefer an always-visible compact grid of chips/buttons over a `Select` dropdown — it avoids scrolling and is more scannable in a small popup. Reserve `Select` for open-ended or long/variable-length lists.
- After any UI change, run `npx eslint .`, `npx prettier --write .`, and `npm run build` (from `app/`) before considering it done, then confirm by loading `app/build/` unpacked in `chrome://extensions` — there's no automated UI test suite.

## Versioning & changelog policy

- Every release bumps `app/public/manifest.json`'s `version` (and `app/package.json`'s, kept manually in sync — no tooling links them):
  - **patch** (x.y.Z): internal-only change (refactor, tests, tooling) — no changelog entry.
  - **minor** (x.Y.0): user-facing improvement or new feature — add a `app/src/config/changelog.ts` entry.
  - **major** (X.0.0): large or breaking change to how the extension behaves — add a `app/src/config/changelog.ts` entry.
- `app/src/config/changelog.ts` entries are shown to users in a "what's new" dialog after they update (`app/src/components/changelog-dialog.tsx`, backed by `app/src/hooks/useChangelogUpdate.ts`). Write entries for the _user_, not for developers: what's useful or visible to them, never internal/code-level descriptions ("refactored X", "added tests"). Skip the entry entirely for internal-only releases — do not pad the changelog with a "nothing changed" line.
- Update detection is driven by `chrome.runtime.onInstalled` in `background.ts`: any event with `reason === "update"` (including a manual "Update" or unpacked-reload click in `chrome://extensions`) sets a `changelogPending` flag in `chrome.storage.local` — no version comparison. The popup checks that flag on mount (`app/src/hooks/useChangelogUpdate.ts`) and looks up the entry for the current manifest version (`app/src/lib/changelog.ts`'s `getChangelogEntryForVersion`); if none exists the flag is cleared silently. Dismissing the dialog clears the flag, so it won't reappear until the next update event.
