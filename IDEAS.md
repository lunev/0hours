# Ideas

Future feature ideas, not yet planned or scheduled. Not user-facing documentation.

// Muted Pages: match against all open tabs, not just the active one.
Today shouldPlayChime/getChimeBadgeState only look at the active tab's URL. If I'm
screen-sharing (e.g. a Google Meet tab) while some other tab is active/focused, the
muted-pages check misses it and the chime still fires.

Fix tried once already and reverted (see git history around 2026-09-01): swap the
active-tab query for chrome.tabs.query({}) and match if ANY open tab matches a muted
pattern (isAnyPageMuted).

Pros:
- Fixes the actual reported problem (screen-share/background-tab case).
- No new permission needed — `tabs` is already granted, so no Chrome Web Store review
  friction.
- Small, isolated change: one new lib function + swapping one query in background.ts.

Cons:
- Semantic shift: "muted" becomes "matching tab open anywhere," not "currently viewing
  it" — a forgotten background tab could silently suppress chimes you'd actually want.
  Worth calling out in the changelog entry.
- Inconsistency risk: the popup's own "Page Muted" bell icon (home/index.tsx, via
  useActiveTabUrl) stays active-tab-only unless it's updated too — otherwise it
  disagrees with the toolbar badge/actual chime behavior (confirmed live: badge showed
  muted-page, popup icon didn't, for a meet.google.com tab open in the background).
- Non-active-tab changes only get picked up on the 1-minute badgeTick cadence, not
  instantly, unless onUpdated/onRemoved/onCreated listeners are also broadened (scope
  creep decided against last time to keep the change small).

UI/UX improvements worth doing alongside it (mainly to offset the Cons above, since
"why is it muted right now" gets less obvious once it's not the tab you're looking at):

REQUIRED companion, not optional: once mute can be caused by a tab you're not even
looking at, 0hours must tell the user WHY it's muted, not just THAT it's muted —
otherwise it looks broken/silent for no visible reason. Concretely, surface the
matching tab's hostname (not a generic "Page Muted" label) in all three places that
currently show mute state:
- NextChime.tsx (popup, when active): e.g. "Muted — meet.google.com" instead of
  "Page Muted".
- Toolbar badge title (chrome.action.setTitle in badge.ts/background.ts): same
  hostname, shown on hover, since the badge glyph itself has no room for text.
- MutedPagesSetting.tsx: mark which configured pattern(s) currently have a live
  matching tab open (e.g. a small dot/badge next to that pattern) so the settings
  list itself explains current state, not just lets you edit patterns blind.
getChimeBadgeState/isAnyPageMuted would need to return which pattern/URL matched, not
just a boolean, to drive this.

Privacy note: this feature exists specifically for screen-sharing, and the popup
itself can end up on the shared screen if opened mid-share. Showing the hostname is
fine when it's the tab actually being shared (the common case), but if the match is
on a different, unrelated muted tab, that hostname would also be visible to anyone
watching. Likely a non-issue in practice (people mostly mute the call domain itself),
but worth keeping in mind rather than a full mitigation.

Also:
- Fix the popup's "Page Muted" bell icon (home/index.tsx) to use the same all-tabs
  check as the badge, so the popup never contradicts the toolbar.
- Changelog entry (per CLAUDE.md versioning policy, this is a minor user-facing
  change) should explicitly describe the new "muted if open in any tab, with the
  reason shown" behavior so it doesn't read as a mysterious/unexpected change.
