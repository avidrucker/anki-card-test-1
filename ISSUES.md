# Code Quality Issues — anki-card-test-1

Assessment run: 2026-06-01  
Tool: `avi-code-quality` (config: `examples/anki-card-test-1.edn`)  
Profile: `:teaching-demo`  
Checks: 12 total

---

## Issue 1 — `node_modules` not installed

**Severity:** Required (blocks lint + build checks)  
**Concern:** Correctness  
**Status:** Resolved (2026-06-01)

`node_modules` is absent from the project root. As a result, both `eslint` and `vite` are not found when running `npm run lint` and `npm run build`, causing those checks to fail with exit code 127 (command not found). These failures are an environment gap, not a code defect.

**Fix:** Run `npm install` from the project root.

**Checks unblocked once resolved:**
- `eslint-passes` (required)
- `build-passes` (recommended)

---

## Issue 2 — ESLint not verified to pass

**Severity:** Required  
**Concern:** Correctness  
**Status:** Resolved (2026-06-01)

`npm run lint` has not been confirmed to exit zero. The project has a well-configured `.eslintrc.cjs` (extends `eslint:recommended`, `plugin:react/recommended`, `plugin:react/jsx-runtime`, `plugin:react-hooks/recommended`). Once `node_modules` is installed, lint should be run and any reported warnings or errors resolved.

**Fixes applied:**
- Removed stale `eslint-disable` comment (line 135 — rule no longer fires there)
- Added intentional `eslint-disable` at the fetch effect (line 266 — `displayCardData` genuinely can't be in deps without causing a circular re-fetch)
- Dropped unused `viewUpdate` parameter from `onEditorChange` (line 534)
- Added intentional `eslint-disable` at the design-loaded effect (line 550 — `updateEditorTextConditionally` is a plain function, adding it to deps would cause infinite re-runs)

---

## Issue 3 — Build not verified to pass

**Severity:** Recommended  
**Concern:** Correctness  
**Status:** Resolved (2026-06-01)

`npm run build` (Vite) has not been confirmed to exit zero. The project targets GitHub Pages deployment via `npm run deploy`, so a broken build would silently block all future deploys.

**Fix:** After `npm install`, run `npm run build` and resolve any errors. Build now exits 0 in 2.67s (bundle 1.08 MB / 357 kB gzip — chunk size advisory is cosmetic, not a build error).

---

## Issue 4 — Two TODO markers in `src/App.jsx`

**Severity:** Advisory  
**Concern:** Correctness  
**Status:** Resolved (2026-06-01)

Two deferred work items were embedded as inline comments in `src/App.jsx`:

- **TODO: dry code between loadDesign and handleFileRead** — Resolved by extracting `applyDesignData(data, name)` as a shared `useCallback`. Both `loadDesign` and `handleFileRead` now call it; `loadDesign` additionally resets `activeTab`/`viewSide` since the user is explicitly switching designs.

- **TODO: change active tab to be loaded from localStorage** — Resolved as stale/moot. `loadDesign` is only called on initial mount when localStorage is empty (no saved tab to restore), or when the user picks a new design from the dropdown (reset to backHtml is correct UX). The else-branch of the mount effect already restores `savedActiveTab` for normal returning sessions. Comment removed and replaced with an explanatory note.

---

## Issue 5 — No test infrastructure

**Severity:** Advisory  
**Concern:** Correctness  
**Status:** Resolved (2026-06-01)

No `test` script is defined in `package.json` and no test framework is installed. The file `test.cjs` is an Express static server for previewing the production build — it is not a test suite.

For a teaching demo this is acceptable, but the complete absence of tests means there is no automated regression net for the core card-rendering logic or state machine behavior.

**Fixes applied:**
- Installed Vitest; added `"test": "vitest run"` to `package.json`
- Extracted `removeConsecutiveSpaces`, `replacePlaceholders`, `processConditionalContent`, `formatDesignName`, `nextCardIndex`, `prevCardIndex` from App.jsx into `src/cardUtils.js`
- Wrote 51 regression tests in `src/__tests__/cardUtils.test.js` covering all 6 functions, including edge cases for empty inputs, audio arrays, picture placeholder literals, type inputs, nested conditionals, and front-side blank-card fallback
- App.jsx updated to import from cardUtils; `useCallback` wrappers for pure functions removed

---

## Issue 6 — Node version not pinned

**Severity:** Advisory  
**Concern:** Delivery safety  
**Status:** Resolved (2026-06-01)

Neither `.nvmrc` nor `engines.node` in `package.json` is present. The project will silently pick up whatever Node version is active on the machine, which can cause subtle breakage if the version changes (e.g., after a system upgrade or on a different machine).

**Fix applied:** Added `.nvmrc` pinned to `v24.16.0` (the active version at time of resolution).

---

## Issue 7 — Deep nesting in `src/App.jsx`

**Severity:** Advisory  
**Concern:** Readability  
**Status:** Resolved (2026-06-01)

One line in `src/App.jsx` was indented 35+ spaces (exceeded the 20-space / ~5-level threshold):

```
src/App.jsx:                           activeTab === "backHtml" ? backHtml : cardCss;
```

This was a chained ternary inside `formatCode` that duplicated the logic already in `getCurrentTextareaContent()`.

**Fix applied:** Replaced the ternary with a call to `getCurrentTextareaContent()`.

---

## Issue 8 — No hot-reload in dev-local

**Severity:** Advisory  
**Concern:** Developer experience  
**Status:** Resolved (2026-06-01)

Card theme JSON files live in `public/` and are served as static assets. Vite's HMR watches `src/` for JS/JSX/CSS changes but does not watch static files in `public/`, so editing a theme JSON or the `scripts/generate-themes.mjs` generator requires a manual browser refresh to pick up changes. This breaks the tightest possible edit→preview loop when iterating on card designs.

**Fix applied:** Added a zero-dependency inline Vite plugin (`watchPublicJson`) to `vite.config.js`. It registers `public/*.json` with Vite's chokidar watcher and, on any change, sends a `full-reload` signal over the dev server WebSocket. Running `node scripts/generate-themes.mjs` in one terminal now automatically reloads the browser preview with no manual refresh needed.

---

## Issue 9 — Theme CSS inline comments

**Severity:** Advisory  
**Concern:** Maintainability  
**Status:** Resolved (2026-06-01)

The CSS for the 16 existing built-in card themes (the pre-`scripts/generate-themes.mjs` designs) lives inline in their respective `.json` files under `public/`. None of it has inline comments explaining how individual effects are achieved — the choice of font, the gradient trick, the filter chain, the blend mode — so anyone reading or editing a theme must reverse-engineer the intent from the properties alone.

The four new themes authored in `scripts/generate-themes.mjs` do have top-of-file block comments (added 2026-06-01), but those are file-level overviews, not line-level or rule-level explanations of the more surprising techniques.

**Fix applied:** Added `scripts/annotate-themes.mjs` — a one-shot script that prepends a structured comment block to every original theme's `cardCss`. Each block documents the aesthetic, font choices, colour palette, and key CSS techniques (SVG filter chains, blend modes, gradient tricks, pseudo-element patterns, etc.). Script is idempotent (skips files already annotated). All 17 original theme JSON files updated.

---

## Issue 10 — Performance: external asset loading on theme switch

**Severity:** Advisory  
**Concern:** Performance  
**Status:** Resolved (2026-06-02)

Every time the user selects a different card design, `applyStyles` tears down the old `<style>` tag and injects a fresh one containing the new theme's full CSS, including all `@import` statements. This means each theme switch re-fires every network request in that CSS — Google Fonts stylesheet fetches, font file fetches, and the Tachyons CDN fetch — even when the browser has already cached them. On a slow or offline connection the card preview can be blank or unstyled for a perceptible moment.

### Tachyons

9 of 20 themes load Tachyons (~60 KB gzip) from `unpkg.com` on demand:

```
8 Bit Console, Beach Night Poster, Blackboard and Chalk, Classic Apple,
Code Rain, Index Card, Ink on Ricepaper, Starry Night Poster, Stormy Night Poster
```

**Problems:**
- External CDN dependency (unpkg reliability; CORS; no SRI hash)
- Fetched per-theme rather than once at app level
- Duplicates the same URL 9 times across JSON files — a single version bump must touch every file

**Fix options:**
- Add `tachyons` as an npm dependency and import it once in `main.jsx` (removes all CDN fetches)
- Or vendor the minified CSS into `public/tachyons.min.css` and reference it with a relative path

### Google Fonts

21 distinct `fonts.googleapis.com` import URLs are spread across the 20 themes. Each triggers two round trips: the CSS descriptor file then the WOFF2 font file(s). Notable concerns:

| Font | Issue |
|---|---|
| `Noto Sans JP` (wght 100–900) | Full CJK variable font; downloads all 9 weight axes — several hundred KB |
| `M PLUS Rounded 1c` | Appears twice with different weight specs (`wght@400;700` vs `wght@700`) — duplicate for overlapping weights |
| `M PLUS 1p`, `M PLUS 1 Code` | Three separate M PLUS imports in different themes; could be consolidated |
| `Libre Franklin` (wght 100–900) | Full variable axis — most weights never used |
| `Noto Sans JP`, `M PLUS` variants | CJK fonts with thousands of glyphs; only a small Japanese vocabulary subset is ever displayed |

**Fix options:**
- Add `<link rel="preconnect" href="https://fonts.googleapis.com">` and `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` to `index.html` so the TCP/TLS handshake is amortised across all theme loads
- Subset CJK fonts (Noto Sans JP, M PLUS variants) using `pyftsubset` or the Google Fonts `text=` parameter to only download glyphs present in the card data
- Narrow weight ranges on variable fonts to the axes actually used (e.g. `Libre Franklin` only needs regular + bold, not the full 100–900 axis)
- Self-host the most commonly used fonts to remove the external DNS dependency entirely

### `applyStyles` re-fetch behaviour

`applyStyles` in `src/App.jsx` removes the existing `<style id="dynamic-styles">` tag and creates a new one on every call. This is correct for CSS rule isolation but means `@import` statements re-execute on every theme switch, re-queueing network requests even for cached resources.

**Fix options:**
- Detect whether the incoming CSS is identical to the current one and skip the re-inject
- Separate the `@import` block from the rule block — inject imports into a persistent `<link>` element (or a stable `<style>` tag) so they survive theme switches, and only replace the rule block
- Track which font URLs have already been injected and deduplicate at the `applyStyles` level

**Fix applied (2026-06-02):**
- Tachyons installed as npm dep (`import 'tachyons'` in `main.jsx`); CDN `<link>` removed from `index.html`. The `@import` URL in theme JSON files is preserved for Anki export compatibility; `applyStyles` silently drops it in the web app.
- `<link rel="preconnect">` hints for `fonts.googleapis.com` and `fonts.gstatic.com` added to `index.html`.
- `applyStyles` refactored: a persistent `<style id="dynamic-imports">` accumulator survives theme switches and deduplicates font URLs — each URL is injected at most once per page lifetime. The rebuilt `<style id="dynamic-styles">` now contains only keyframes and rules (no `@import`). Inner loop switched from `innerHTML +=` to a single `textContent =` write.
- `performance.mark/measure` instrumentation added to `applyStyles` and `loadDesign`; results visible in DevTools → Performance → User Timings and console (`[perf] applyStyles Xms`).
- Playwright e2e tests added (`e2e/theme-perf.spec.js`): tachyons CDN request count, import dedup DOM assertion, same-theme-switch dedup, applyStyles perf budget, visual snapshots (fonts mocked for determinism).
- Font weight axis narrowing deferred to Issue 12.

---

## Issue 12 — Performance: narrow Google Fonts weight axes to used values only

**Severity:** Advisory  
**Concern:** Performance  
**Status:** Open  
**Parent:** Issue 10

Several themes import Google Fonts with full variable-weight axes even though the card templates only use a small subset of those weights. This causes unnecessary font data to be downloaded on first load.

Suspected over-loaded imports (requires per-theme weight audit to confirm):

| Font | Current import | Likely used weights |
|---|---|---|
| `Libre Franklin` | `wght@100;900` (full axis) | 400, 700 |
| `Noto Sans JP` | `wght@100;900` (full CJK axis) | 400, 700 — and only a small glyph subset |
| `M PLUS Rounded 1c` | `wght@400;700` in one theme, `wght@700` in another | Consolidate to one URL |
| `M PLUS 1p` | Per-theme import | Check weight usage |
| `M PLUS 1 Code` | Per-theme import | Check weight usage |

**Fix approach:**
1. For each affected theme JSON, audit `frontHtml`/`backHtml` templates and CSS for explicit `font-weight` values and utility classes that imply a weight.
2. Update the `@import` URL to request only the weights confirmed in step 1.
3. For CJK fonts (`Noto Sans JP`, M PLUS variants), consider the Google Fonts `text=` parameter to subset to only glyphs present in typical card vocabulary — potential saving of several hundred KB per load.

**Note:** Any change to theme JSON files also affects Anki export. Weight-narrowing changes are safe as long as only unused weights are removed and the change is verified visually in the designer before committing.

---

## Issue 13 — Switching design resets view to Back / Back HTML

**Severity:** Advisory  
**Concern:** UX / correctness  
**Status:** Resolved (2026-06-02)

Selecting a theme from the dropdown always forces `activeTab = "backHtml"` and `viewSide = "back"`, overwriting whatever the user had open. If the user was on the Front HTML tab or the Front View, switching designs silently navigates them away.

**Repro:**
1. Switch to Front HTML tab and / or Front View.
2. Select any design from the dropdown.
3. Observe: editor and preview both jump to Back HTML / Back View.

**Root cause:** `loadDesign` (called by `handleDesignChange`) unconditionally calls `setActiveTab("backHtml")` and `setViewSide("back")` after applying the new design data (`src/App.jsx`, inside the `.then()` of the fetch).

**Fix:** Remove the two unconditional resets from `loadDesign`. The editor and preview should stay on whatever tab/side the user was already viewing. (The initial-load default of "back" can be retained in the mount effect / `localStorage` fallback where it already exists.)

---

## Issue 11 — "About" modal with info button

**Severity:** Advisory  
**Concern:** Usability  
**Status:** Open

The app has no in-app information about itself. A new user landing on the deployed GitHub Pages build has no way to discover who made it, what it does at a high level, or where to go if something is broken. An "ⓘ" info button in the header that opens a small modal would solve this without cluttering the UI.

### UI

- Add a small circular `ⓘ` button to the header (right side, near the Import/Export buttons)
- Clicking it opens a modal overlay with an "×" close button and a click-outside-to-dismiss behaviour
- Modal should be keyboard-accessible: `Escape` closes it, focus is trapped inside while open

### Modal content

**About Card Designer**

A brief one-sentence description of what the app does (design and preview Anki flashcard templates).

**Made by**  
[Avi Drucker](https://github.com/avidrucker) — link to GitHub profile

**Source & issues**  
Link to the GitHub repo (`https://github.com/avidrucker/anki-card-test-1`) with a direct call to action: "Found a bug or have a feature request? [Open an issue](https://github.com/avidrucker/anki-card-test-1/issues)"

**Built with**

| Technology | Role |
|---|---|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| CodeMirror 6 | In-browser HTML/CSS editor panes |
| Prettier | On-blur code formatting |
| Tachyons | Utility CSS (used by several card themes) |
| GitHub Pages | Static hosting & deployment |

### Implementation notes

- Modal state (`isAboutOpen`) lives in `App.jsx` alongside the existing `editingName` / `editorViewCollapsed` booleans — no new state management layer needed
- The `ⓘ` button should use the existing `BTN_STYLE_GLASS` constant (or a close variant) so it matches the eye-toggle and copy buttons already in the header
- The modal itself can be a simple `position: fixed` overlay with a centred white card; no third-party modal library needed
- Trap focus with a `useEffect` that moves focus to the modal on open and restores it to the `ⓘ` button on close

---

## Checks that passed

| Check | Concern | Severity |
|---|---|---|
| No FIXME markers in `src/` | Correctness | Advisory |
| `package-lock.json` present | Delivery safety | Recommended |
| Working tree clean | Delivery safety | Advisory |
| No vague function names in `src/` | Readability | Advisory |
| `src/App.jsx` under 1000 lines (807) | Maintainability | Advisory |
| Runtime dep count ≤ 12 (currently 10) | Maintainability | Advisory |
