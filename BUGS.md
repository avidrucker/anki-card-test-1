# Bugs

## Open

### BUG-001 — Steampunk CSS scoping breaks app visual appearance

**Severity:** High (corrupts the designer UI when the theme is active)

**Symptom:** Loading the Steampunk design visually corrupts the Card Designer application chrome — editor tabs, panel backgrounds, and controls pick up Steampunk's iron/parchment colors.

**Root cause:** Two scoping leaks in the draft CSS:

1. Custom properties defined at `:root { --sp-iron: #2a2520; ... }` are global. The `applyStyles` function intentionally exempts `:root` from the `.card-container` prefix scoping, so these variables are available app-wide and can override any app CSS that references the same names.

2. `html, body, div#qa { height: 100%; }` — after the `.card-container` prefix pass, becomes `.card-container html, body, div#qa { height: 100%; }`. CSS parses this as three comma-separated selectors: `.card-container html` (harmless), `body` (global — affects whole page), and `div#qa` (global). `body` and `div#qa` are now bare global rules.

**Fix (applied):** Move all custom properties into `.sp-card { --sp-*: ...; }` so they are scoped to the card element and its descendants. Remove the `html, body, div#qa` line (it is only needed for Anki's native renderer, not the in-browser designer, and the `.card-container` scoping pass cannot safely handle comma-separated selectors that mix card and document elements).

**Status:** Resolved — Steampunk redesign scopes all variables under `.sp-card`.
