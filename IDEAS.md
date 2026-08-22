# Ideas

Future feature ideas, not yet planned or scheduled. Not user-facing documentation.

## Toolbar icon/badge reflects muted state

Show on the toolbar icon whether the next hourly chime will be skipped — because Silence Mode
(quiet hours) is currently active, or because the active tab matches a Muted Pages pattern.

**Approach:** prefer `chrome.action.setBadgeText`/`setBadgeBackgroundColor` over swapping the
full icon image — a badge (e.g. a dot, or "Zzz") needs no new icon art at every manifest size,
unlike `chrome.action.setIcon()` with dedicated "muted" icon variants.

**Why this isn't just a visual tweak:** "muted right now" depends on live state that changes
without the extension doing anything — the clock crossing the quiet-hours boundary, or the user
switching tabs. Today the background worker only evaluates mute conditions once an hour, when the
`hourlyChime` alarm fires (see `shouldPlayChime` in `app/src/lib/scheduling.ts`). Reflecting state
live in the badge means the service worker needs to also listen for `chrome.tabs.onActivated`/
`onUpdated` (tab switches, for Muted Pages) and a periodic time tick (for Silence Mode's start/end
boundary) — new background-worker plumbing beyond what exists today.

**Open question:** should the badge reflect Silence Mode only, Muted Pages only, or both combined
(and if both, how to distinguish which reason in the badge/tooltip)?
