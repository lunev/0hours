# Muted Pages — mute the hourly chime on specific tabs

## Context

0hours announces the hour aloud once per hour via `chrome.alarms`. The user wants the chime to
stay silent when they're on certain pages (e.g. active work tools) at the moment it would fire.
Chrome has no built-in "is on a call" / "is playing media" signal, so after discussing the
options the scope was narrowed to what's actually reliable: mute when the **active tab's URL
matches a pattern from a user-editable list**. This mirrors the existing Quiet Hours feature
(same enabled-flag + condition shape) but is triggered by tab context instead of time of day.

Requires adding the `tabs` permission (not currently in the manifest) so the background service
worker can read the active tab's URL when the alarm fires — user has approved this.

## Settings schema

`app/src/types/settings.ts` — add a field sibling to `quietHours`:

```ts
mutedPages: {
  enabled: boolean;
  patterns: string[];
};
```

`app/src/config/settings.ts` `DEFAULT_SETTINGS` — add `mutedPages: { enabled: false, patterns: [] }`.

No migration needed: `background.ts` already accesses `quietHours?.enabled` defensively for
users on older stored settings; do the same for `mutedPages?.enabled`.

## Matching logic — new file `app/src/lib/pageMatch.ts`

Pure functions, no `chrome.*` dependency (kept testable like the rest of `lib/`):

- `normalizeForMatch(value)` — lowercase, strip `scheme://`, strip leading `www.`, strip
  trailing slash(es).
- `matchesPattern(url, pattern)` — normalize both sides; if the pattern contains `/`, do a
  forgiving substring match on the full normalized URL (path-scoped); otherwise treat it as a
  hostname and match exact host or subdomain (`host === pattern || host.endsWith(".pattern")`).
- `isPageMuted(url, patterns)` — `false` for a missing/empty URL or empty pattern list, else
  `patterns.some(p => matchesPattern(url, p))`.

Export via `app/src/lib/index.ts` (`export * from "./pageMatch"`).

## Wiring into the chime gate

`app/src/lib/scheduling.ts` — keep `shouldPlayChime` **synchronous** (its own test file has no
`chrome` stubbing today; don't force that). Add a 4th optional trailing param so the existing
tests keep compiling untouched:

```ts
export const shouldPlayChime = (
  settings: Settings | null,
  scheduledTime: number,
  now: Date = new Date(),
  activeTabUrl?: string | null,
): settings is Settings => {
  if (isChimeDrifted(scheduledTime, now.getTime())) return false;
  if (!settings || !settings.active) return false;
  if (settings.quietHours?.enabled && isQuietNow(settings.quietHours.start, settings.quietHours.end, now)) {
    return false;
  }
  if (settings.mutedPages?.enabled && isPageMuted(activeTabUrl, settings.mutedPages.patterns)) {
    return false;
  }
  return true;
};
```

`app/src/background/background.ts`'s `chrome.alarms.onAlarm` listener (~line 42-52): only pay
for `chrome.tabs.query` when the feature is actually configured, then pass the URL through:

```ts
const settings = await storage.get<Settings>(STORAGE_KEYS.SETTINGS); // also fixes hardcoded "settings" string

let activeTabUrl: string | undefined;
if (settings?.mutedPages?.enabled && settings.mutedPages.patterns.length > 0) {
  const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  activeTabUrl = activeTab?.url;
}

if (!shouldPlayChime(settings, alarm.scheduledTime, undefined, activeTabUrl)) return;
```

`lastFocusedWindow: true` (not `currentWindow`) since a service worker isn't attached to any
window. No windows open → `activeTab` undefined → `activeTabUrl` undefined → chime plays
normally (never silently swallowed by an ambiguous "no tab" case).

Also fixes a pre-existing bug while touching this line: `background.ts` currently reads storage
with a hardcoded `"settings"` string instead of `STORAGE_KEYS.SETTINGS`.

## Manifest & versioning

`app/public/manifest.json`:
- `"permissions"`: add `"tabs"`.
- `"version"`: `3.4.0` → `3.5.0` (minor: new user-facing feature).

`app/package.json`: bump `"version"` to `3.5.0` to match (manually kept in sync).

`app/src/config/changelog.ts` — prepend a user-facing entry, e.g.:
> "Added Muted Pages — list sites where you don't want the hourly chime to interrupt you, and
> it'll stay quiet whenever that page is active."

## Settings UI — new `app/src/pages/settings/components/MutedPagesSetting.tsx`

Follow `QuietHoursSetting.tsx`'s exact pattern: `Card` > header row (icon + uppercase label +
`Switch`) > fade-in sub-content when enabled. No chip-list component exists in the repo yet, so
compose one from `Input` + `Button` (add) + a hand-rolled chip `<button>` (styled like
`LanguageSetting.tsx`'s chip precedent) — consistent with `CLAUDE.md`'s guidance to avoid
`Select` for open-ended, user-editable lists.

Interaction: type in the `Input`, add via Enter or a `+` icon button; dedupe by normalized value;
reject empty/whitespace; each chip doubles as its own remove button (icon-only → needs `title` +
`aria-label` per `CLAUDE.md`'s icon-button rule).

Wire into `app/src/pages/settings/index.tsx` right after `QuietHoursSetting` (grouped as
"when not to chime" settings):

```tsx
<MutedPagesSetting
  mutedPages={settings.mutedPages}
  onChange={(mutedPages) => setSettings({ ...settings, mutedPages })}
/>
```

**Non-goal:** no live "muted right now" indicator on the home page — unlike quiet hours, whether
the *next* chime is muted depends on which tab is active an hour from now, not on the current
popup state. Leave `home/index.tsx` / `NextChime.tsx` untouched.

## Testing

New `app/src/lib/pageMatch.test.ts` (colocated, matching repo convention): exact hostname match,
subdomain match, lookalike-domain rejection (`example.com` vs `notexample.com`), scheme/`www.`/
trailing-slash normalization, case-insensitivity, path-scoped substring matching, empty/blank
pattern rejected, `isPageMuted` with missing URL or empty pattern list.

Extend `app/src/lib/scheduling.test.ts`'s `shouldPlayChime` block: muted when tab matches a
pattern; not muted when it doesn't; not muted when `activeTabUrl` is undefined; ignored entirely
when `mutedPages.enabled` is false. Existing 7 tests need no changes (no `mutedPages` in their
base fixture → optional-chained guard short-circuits, same as `quietHours?.` already does).

Not unit-testable (per repo convention — no UI test suite): after `npx eslint .`,
`npx prettier --write .`, `npm run build`, load `app/build/` unpacked and manually verify — add a
pattern for the current tab, trigger the alarm via the service worker console in
`chrome://extensions`, confirm the chime is skipped; confirm normal playback with the feature off
or on a non-matching tab; confirm it still plays with all windows closed.

## Critical files

- `app/src/types/settings.ts`
- `app/src/config/settings.ts`
- `app/src/lib/pageMatch.ts` (new)
- `app/src/lib/scheduling.ts`
- `app/src/background/background.ts`
- `app/src/pages/settings/components/MutedPagesSetting.tsx` (new)
- `app/src/pages/settings/index.tsx`
- `app/public/manifest.json`
- `app/package.json`
- `app/src/config/changelog.ts`
