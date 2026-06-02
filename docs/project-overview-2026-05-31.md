# Anki Card Designer — Project Overview (2026-05-31)

React/Vite web app for designing Anki flashcard templates, live at
https://avidrucker.github.io/anki-card-test-1/

Branch `main`, clean and up to date with origin. Last commit: `update todos`.

## Overall Status

Very feature-complete. The core editing loop — HTML/CSS editors, live preview,
save/load, syntax highlighting, 15+ built-in themes — is done. Remaining work is
mostly polish and deeper Anki integration.

## Open Work (high-priority, bolded in TODOS.md)

- Maximize editor pane (expand/collapse)
- Replace Save/Export + Load/Import buttons with SVG icons
- User-defined field name conversions (e.g. `{{reading}}` → `{{yomi}}`)
- Refactor for readability/maintainability
- CDN-hosted non-Google fonts
- Instructions doc for transferring designs to Anki + link in-app
- Text input + hint fields for all remaining themes
- Offline-first / service worker
- Export to `.apkg`

## Unfinished Themes

- Illuminated manuscript
- Halloween
- Steampunk (gears, brass, glass)

## In-Progress ([o]) Items

- Play button, hint, and input field Anki-transfer support for most themes
- CDN font migration for non-Google fonts
- Filter hover transitions (subtle image unfilter on hover)
