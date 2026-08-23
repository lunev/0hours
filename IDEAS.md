# Ideas

Future feature ideas, not yet planned or scheduled. Not user-facing documentation.

## Contact / report a bug link

No way today for a user to reach the developer with a bug report or question from inside the
extension — nothing in the popup/Settings points anywhere.

**Approach:** the Chrome Web Store listing already has a built-in "Contact the developer" flow
(Ask a question / Make a suggestion / Report a problem, under the listing's support section) — no
need to build or host a separate form (a Google Form was the original idea here, but this makes
that unnecessary). Simplest version: a link (Settings page, most likely near the bottom) straight
to the extension's Chrome Web Store listing page, where that native flow already lives.

**Open question:** exact link placement/framing ("Contact us" vs. "Report a bug" vs. "Feedback"),
and whether it's worth surfacing this at all given it's already one click away via the extension's
entry in `chrome://extensions` → Details → "View in Chrome Web Store".
