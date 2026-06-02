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
**Status:** Open

Card theme JSON files live in `public/` and are served as static assets. Vite's HMR watches `src/` for JS/JSX/CSS changes but does not watch static files in `public/`, so editing a theme JSON or the `scripts/generate-themes.mjs` generator requires a manual browser refresh to pick up changes. This breaks the tightest possible edit→preview loop when iterating on card designs.

**Desired behaviour:** Running `npm run dev` should automatically reload the card preview in the browser whenever a theme JSON in `public/` changes (i.e. after `node scripts/generate-themes.mjs` is run).

**Possible approaches:**
- Add a Vite plugin or custom middleware that watches `public/*.json` and sends an HMR invalidation signal on change.
- Wire a file-watcher (e.g. `chokidar-cli` or a small Node script) that calls `node scripts/generate-themes.mjs` on source change and then triggers a browser reload via a WebSocket or Vite's `ws` server.
- Add an `npm run dev:themes` script that wraps `generate-themes.mjs` in watch mode (using `--watch` or `chokidar`) so saving the generator script auto-regenerates the JSONs and Vite picks up the static file change.

---

## Issue 9 — Theme CSS inline comments

**Severity:** Advisory  
**Concern:** Maintainability  
**Status:** Open

The CSS for the 16 existing built-in card themes (the pre-`scripts/generate-themes.mjs` designs) lives inline in their respective `.json` files under `public/`. None of it has inline comments explaining how individual effects are achieved — the choice of font, the gradient trick, the filter chain, the blend mode — so anyone reading or editing a theme must reverse-engineer the intent from the properties alone.

The four new themes authored in `scripts/generate-themes.mjs` do have top-of-file block comments (added 2026-06-01), but those are file-level overviews, not line-level or rule-level explanations of the more surprising techniques.

**Desired behaviour:** Each card theme's CSS should have inline comments at the rule or property level wherever the technique is non-obvious. Examples of what warrants a comment:
- A `filter: contrast(22)` that sharpens soft radial-gradient dots into crisp halftone circles
- A `mix-blend-mode: multiply` that makes a dot grid image-adaptive
- A `transform: perspective(220px) rotateX(58deg)` that creates the vaporwave grid floor
- A `box-shadow: inset 0 0 0 1px … inset 0 0 0 3px …` that produces a nested ornate frame border
- A `repeating-linear-gradient` stripe overlay that creates the retro-sun horizontal bands

**Scope:** All 16 original themes + the 4 new themes in `generate-themes.mjs`.

---

## Issue 10 — Performance: external asset loading on theme switch

**Severity:** Advisory  
**Concern:** Performance  
**Status:** Open

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
