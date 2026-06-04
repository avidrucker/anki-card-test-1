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
**Status:** Resolved (2026-06-04)  
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
**Status:** Resolved (2026-06-04)

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

## Issue 14 — UX / a11y audit for all 21 pre-made card themes

**Severity:** Advisory  
**Concern:** Accessibility / Usability  
**Status:** Open

No accessibility review has been performed on the 21 pre-made card themes. Each theme ships with its own CSS (colour palette, typography, animations) and HTML templates, so issues like low contrast, hard-to-read fonts, and unsuppressed motion vary theme by theme.

### Per-theme checklist

For each of the 21 themes, verify all items below. Record pass / fail / N/A per theme in a follow-up table once the audit is complete.

#### Colour contrast
- [ ] **Body text vs. background** — minimum 4.5:1 (WCAG AA normal text)
- [ ] **Heading / large text vs. background** — minimum 3:1 (WCAG AA large text, ≥18 pt or ≥14 pt bold)
- [ ] **No information conveyed by colour alone** — e.g., highlighted terms also use underline, bold, or another non-colour cue

#### Typography
- [ ] **Minimum readable font size** — body text ≥ 14 px at default zoom (Anki default font size is 20 px; check any theme that overrides it smaller)
- [ ] **Line height ≥ 1.4** for multi-line body text blocks (WCAG 1.4.12 Text Spacing)
- [ ] **Letter-spacing / word-spacing** not so tight that it becomes illegible
- [ ] **CJK fonts load and render legibly** — themes using `Noto Sans JP` or `M PLUS` variants: confirm Japanese/Korean/Chinese glyphs display at an appropriate size and weight

#### Motion & animation
- [ ] **`prefers-reduced-motion` respected** — any `@keyframes` or `animation:` rule is either gated behind `@media (prefers-reduced-motion: no-preference)` or offers a static fallback. Animated themes (12 of 21):
  - 8 Bit Console, Beach Night Poster, Blackboard and Chalk, Brutalist HTML, Classic Apple, Code Rain, Game Menu UI, Glowing Blue Circuits, Index Card, Ink on Ricepaper, Starry Night Poster, Stormy Night Poster, Zenburn Theme
- [ ] **No content flashes** — no animation that produces more than 3 flashes per second (WCAG 2.3.1 — seizure risk)

#### Readability in context
- [ ] **Both sides readable** — front and back HTML templates: verify the card content area is not obscured by decorative background elements (full-bleed images, overlay layers, low-opacity text)
- [ ] **Text does not overflow card bounds** at default template content lengths
- [ ] **Decorative images marked as presentational** — background images serving only aesthetic purposes do not need alt text, but any `<img>` in the HTML templates should have appropriate `alt`

#### High-contrast / forced-colours mode (stretch goal)
- [ ] **Theme degrades gracefully under `forced-colors: active`** — decorative backgrounds collapse but text remains legible and card structure is still visible

### Themes to audit

| # | Theme | Animated | CJK fonts |
|---|---|---|---|
| 1 | 8 Bit Console | Yes | Yes |
| 2 | Beach Night Poster | Yes | Yes |
| 3 | Blackboard and Chalk | Yes | Yes |
| 4 | Blueprint Theme | No | Yes |
| 5 | Brutalist HTML | Yes | No |
| 6 | Classic Apple | Yes | No |
| 7 | Code Rain | Yes | Yes |
| 8 | Da Vinci Sketch | No | No |
| 9 | Full Photo | No | Yes |
| 10 | Full Photo 2 | No | Yes |
| 11 | Game Menu UI | Yes | Yes |
| 12 | Glowing Blue Circuits | Yes | Yes |
| 13 | Halftone Comics | No | No |
| 14 | Index Card | Yes | No |
| 15 | Ink on Ricepaper | Yes | No |
| 16 | Starry Night Poster | Yes | Yes |
| 17 | Stormy Night Poster | Yes | No |
| 18 | Tarot Card | No | No |
| 19 | Vaporwave | No | No |
| 20 | You Died | No | No |
| 21 | Zenburn Theme | Yes | Yes |

### Implementation notes

- Use browser DevTools **Accessibility** panel (or the axe browser extension) to check contrast ratios; the Playwright e2e suite can be extended with `@axe-core/playwright` for automated contrast checking across themes.
- For `prefers-reduced-motion`, test by setting `Emulate CSS media feature prefers-reduced-motion: reduce` in DevTools.
- Fixes will almost certainly need to be applied per-theme in the individual JSON files under `public/`. Use `scripts/annotate-themes.mjs` as a model for batch edits where the same fix applies to multiple themes.

---

## Issue 15 — Visual design review pass on all pre-existing card themes

**Severity:** Advisory  
**Concern:** Design quality / Usability  
**Status:** Open

No structured visual design review has been performed on the existing themes since they were authored. As the set has grown to 21 themes — with varying age, origin, and intent — some are likely to have inconsistencies, visual rough edges, or layout issues that weren't caught at authoring time. This issue tracks a single dedicated pass to catch and fix those problems.

### Scope

Review each of the 21 pre-made themes (excluding `dummy_card_data`) for the following categories of problem:

#### Layout & proportion
- [ ] Card content overflows its container at default template content lengths
- [ ] Front and back sides have mismatched proportions or padding
- [ ] Text or image areas clip, overlap, or leave excessive whitespace
- [ ] The card does not render at a consistent aspect ratio across themes

#### Typography
- [ ] Font size is too small or too large relative to the card area
- [ ] Line height is cramped for multi-line content
- [ ] Font weight or style is inconsistent with the theme's aesthetic (e.g., a serif in a pixel-art theme)
- [ ] Google Fonts load correctly and render at the intended weight

#### Colour & contrast
- [ ] Text contrast falls below 4.5:1 against its background (cross-reference with Issue 14 a11y audit)
- [ ] Background colours or gradients clash with the text colour in unexpected ways
- [ ] Decorative colours overwhelm the content area

#### Image handling
- [ ] If the theme includes an image and the card has no image, the layout breaks or shows a blank zone
- [ ] Image does not scale or crop gracefully at different aspect ratios
- [ ] Image filter effects (grayscale, brightness, SVG filters) behave as intended

#### Animation & motion
- [ ] Animated elements do not cause layout reflow or jitter
- [ ] Animations loop cleanly with no visual pop at the loop point
- [ ] (Cross-reference Issue 14: `prefers-reduced-motion` is respected)

#### Overall polish
- [ ] The theme looks intentional and finished rather than a rough draft
- [ ] Front and back sides feel visually related (same design language) while being distinct
- [ ] The theme is clearly differentiated from the most visually similar theme in the set

### Themes to review

| # | Theme | Notes |
|---|---|---|
| 1 | 8 Bit Console | Check pixel font sizing at card dimensions |
| 2 | Beach Night Poster | Multi-filter complexity — verify all layers composite correctly |
| 3 | Blackboard and Chalk | Check chalk texture legibility on dark background |
| 4 | Blueprint Theme | Verify grid lines don't interfere with text zones |
| 5 | Brutalist HTML | Intentional roughness — check it reads as deliberate, not broken |
| 6 | Classic Apple | Check dithering filter renders correctly on retina displays |
| 7 | Code Rain | Verify animated characters don't obscure card content |
| 8 | Da Vinci Sketch | Check sketch effect on images with transparent backgrounds |
| 9 | Full Photo | Verify text contrast over arbitrary user photos |
| 10 | Full Photo 2 | Same as above; check back side differs visually |
| 11 | Game Menu UI | 7-light specular — check render performance |
| 12 | Glowing Blue Circuits | Check glow intensity; verify text sits above circuit layer |
| 13 | Halftone Comics | Check dot pattern scale; verify speech bubble layout |
| 14 | Index Card | Check ruled-line alignment with text baseline |
| 15 | Ink on Ricepaper | 4× Sobel pass — verify edge detection doesn't create noise artifacts |
| 16 | Starry Night Poster | Check feMorphology star shapes at different zoom levels |
| 17 | Stormy Night Poster | Verify dark background doesn't swallow dark text |
| 18 | Tarot Card | Check ornate border doesn't crowd content at normal card size |
| 19 | Vaporwave | Verify gradient + grid lines are clearly visible |
| 20 | You Died | Confirm ash particle animation doesn't obscure the text |
| 21 | Zenburn Theme | Verify muted palette maintains enough text contrast |

### Output

For each theme with a finding: create a sub-issue or inline fix note describing what was found, what was changed, and how it was verified (screenshot or Playwright visual snapshot comparison).

---

## Issue 16 — Revise Vaporwave theme to match max-datom.com aesthetic

**Severity:** Advisory  
**Concern:** Design quality  
**Status:** Open  
**Reference:** https://max-datom.com/

The current Vaporwave theme uses a purple/violet gradient background with a pink grid and pink-dominant text — a "pastel aesthetic internet" interpretation of vaporwave. The max-datom.com site shows a sharper, darker **synthwave/outrun** variant: near-black teal background, dominant bright cyan grid, hot-pink used only as a single italic accent, and grey-white as the primary text colour. The overall feel is more cinematic and game-UI than retro-internet. The revision should shift the existing theme toward that reference without restructuring the HTML.

### Reference screenshot analysis (max-datom.com)

| Element | Current theme | Target (max-datom.com) |
|---|---|---|
| Background | Purple gradient `#0d0221 → #1a0533 → #2d1b69` | Near-black dark teal `#001414` (flat or very subtle gradient) |
| Grid colour | Pink `rgba(255,113,206,0.55)` lines | Bright cyan `#00e5cc` lines, noticeably higher opacity |
| Grid height | `42%` of card | ~50–55% — grid is the visual centrepiece, not a subtle floor |
| Grid perspective | `perspective(220px) rotateX(58deg)` | Similar perspective depth, horizon sits at ~50% card height |
| Sun | Pink/orange/red half-circle with stripe cutouts | Absent or replaced with a subtle cyan horizon glow line |
| Primary text colour | Hot pink `#ff71ce` | Light grey-white `#d8e8e8` — most text is NOT pink |
| Accent colour | Cyan `#01cdfe`, purple `#b967ff`, yellow `#fffb96` | Hot pink `#ff2090` used sparingly for ONE italic subtitle element only |
| Eyebrow / subtitle | `"Ａ Ｅ Ｓ Ｔ Ｈ Ｅ Ｔ Ｉ Ｃ"` full-width chars in purple | Italic/script style in hot pink — matches the "Analy Personal Assistant" cursive line |
| Font | VT323 (bitmap monospace) | Max-datom uses a chunkier bitmap font (possibly `"Press Start 2P"`); VT323 is acceptable but worth testing `"Press Start 2P"` |
| Image filter | `hue-rotate(270deg)` → purple/pink tint | `hue-rotate(180deg)` → cyan/teal tint to match new palette |
| Text glow | Pink/cyan/purple multi-colour glows | Cyan glow on most text; hot-pink glow only on the italic accent element |

### Specific changes to `Vaporwave.json`

**`cardCss`:**

1. **`:root` variables** — replace entire palette:
   ```css
   --vp-bg:     #001414;
   --vp-cyan:   #00e5cc;
   --vp-pink:   #ff2090;
   --vp-white:  #d8e8e8;
   --vp-dim:    #6a9090;
   ```

2. **`.card` and `.vapor-card` background** — replace purple gradient:
   ```css
   background: #001414;
   /* or very subtle: linear-gradient(180deg, #000d0d 0%, #001a1a 100%) */
   ```

3. **`.vapor-grid` colour** — change pink lines to cyan:
   ```css
   background-image:
     linear-gradient(rgba(0,229,204,0.65) 1px, transparent 1px),
     linear-gradient(90deg, rgba(0,229,204,0.65) 1px, transparent 1px);
   height: 52%;
   ```

4. **`.vapor-sun` / `.vapor-sun-wrap`** — two options:
   - **Option A (remove):** Set `.vapor-sun-wrap { display: none; }` — let the grid be the sole hero element.
   - **Option B (horizon glow):** Replace the sun with a thin horizontal glow line at the grid horizon: `box-shadow: 0 0 18px 4px rgba(0,229,204,0.6)` on a 1px-tall absolutely-positioned `div` at 48% from top.
   - Recommendation: **Option B** — the horizon glow anchors the grid visually without the distraction of the striped sun.

5. **`.vapor-term`** — change from pink to white with cyan glow:
   ```css
   color: var(--vp-white);
   text-shadow: 0 0 14px var(--vp-cyan), 2px 2px 0 rgba(0,229,204,0.3);
   ```

6. **`.vapor-eyebrow`** — change from full-width purple chars to hot-pink italic accent:
   ```css
   font-style: italic;
   color: var(--vp-pink);
   text-shadow: 0 0 10px var(--vp-pink);
   letter-spacing: 0.1em;
   ```
   Also update the eyebrow text in `frontHtml` and `backHtml` from `"Ａ Ｅ Ｓ Ｔ Ｈ Ｅ Ｔ Ｉ Ｃ"` to something shorter and italic-appropriate, e.g. `"Synthwave Study"` or `"Ａ Ｅ Ｓ Ｔ Ｈ Ｅ Ｔ Ｉ Ｃ"` retained but restyled pink italic.

7. **All other text** (`.vapor-reading`, `.vapor-translation`, `.vapor-prompt`, etc.) — change to `var(--vp-white)` or `var(--vp-cyan)` with cyan glow. Remove yellow and purple entirely.

8. **`.vapor-picture img`** — update image filter:
   ```css
   filter: hue-rotate(180deg) saturate(1.8) brightness(0.8);
   border-color: var(--vp-cyan);
   box-shadow: 0 0 12px var(--vp-cyan);
   ```

9. **Input field** — update border/glow from blue to cyan (already close, just variable swap).

**Optional font upgrade:**

Test replacing `VT323` with `"Press Start 2P"` (also on Google Fonts). Press Start 2P is chunkier and matches the max-datom title font more closely. Tradeoff: it is wider and may require smaller `font-size` values on `.vapor-term` (drop from `4.5rem` to ~`2.5rem`). If legibility at smaller sizes is acceptable, prefer Press Start 2P; otherwise keep VT323.

### What should NOT change

- HTML template structure (`frontHtml` / `backHtml`) — no restructuring needed
- The perspective grid concept — already correct, just recoloured
- VT323 font import — keep unless Press Start 2P is tested and preferred
- The `{{type:term}}` input block on the front side

### Verification

After changes, visually compare against the max-datom.com screenshot (saved at `max-datom-screenshot.png` in project root) for:
- [ ] Background is dark teal, not purple
- [ ] Grid lines are bright cyan and visually dominant
- [ ] Only one element (eyebrow/subtitle) uses hot pink
- [ ] All other text is grey-white or cyan
- [ ] Image filter tints cyan, not purple
- [ ] Playwright visual snapshot updated (`e2e/` suite)

---

## Issue 17 — Holo Foil sparkle effect bleeds outside picture bounds

**Severity:** Advisory  
**Concern:** Visual correctness  
**Status:** Resolved (2026-06-03)

The sparkle/shimmer overlay on the Holographic Foil theme renders outside the picture element's bounding box — sparkle particles are visible in the card area surrounding the image, not only over the image itself.

**Have:** Sparkle effect overflows the `{{picture}}` container and is visible outside the image bounds.

**Should have:** Sparkle effect is fully clipped to the picture element's bounds; no sparkle particles appear outside the image area.

**Repro:**
1. Select the Holographic Foil theme in the designer.
2. Load a card that includes a picture.
3. Observe: the sparkle/shimmer layer extends beyond the image into the surrounding card layout.

**Likely fix:** Add `overflow: hidden` (or equivalent `clip-path`) to the picture wrapper element in `public/Holographic Foil.json` `cardCss` so the sparkle pseudo-element is clipped to the image container's bounds.

---

## Issue 18 — Hollow Knight back view tags text is too small to read

**Severity:** Advisory  
**Concern:** Readability  
**Status:** Resolved (2026-06-03)

The `.hk-tags` rule sets `font-size: 0.85rem` and `opacity: 0.5` — the smallest and most faded text on the back view. At card viewing distance the tags are effectively illegible.

**Have:** Tags render at `0.85rem` with `opacity: 0.5` in `public/Hollow Knight Lore Tablet.json` `cardCss` (line 110).

**Should have:** Tags are legible at normal viewing distance — font size increased (suggest `1rem`–`1.1rem`) and/or opacity raised to be clearly readable without straining.

**Repro:**
1. Select the Hollow Knight Lore Tablet theme.
2. Load a card with non-empty tags and flip to the back.
3. Observe: tags text is noticeably smaller and more faded than all surrounding fields.

---

## Issue 19 — Hollow Knight back view uses no Japanese font

**Severity:** Advisory  
**Concern:** Design quality  
**Status:** Open

The HK back view applies Cinzel (a Latin serif) to all text fields — reading, transliteration, tags, and input — including content that contains Japanese characters. No Japanese font is imported or specified, so Japanese glyphs fall back to the system default and clash with the stone-tablet aesthetic.

**Have:** `@import` in `public/Hollow Knight Lore Tablet.json` loads only `Cinzel Decorative` and `Cinzel`; no Japanese-capable font is present. Japanese text in `.hk-reading`, `.hk-transliteration`, and `.hk-tags` renders in the OS fallback font.

**Should have:** At least 3–4 Japanese font candidates are trialed on the back view and the best aesthetic match for the stone-tablet / ancient-script feel is selected and committed. Candidates to try: Zen Antique, Shippori Mincho B1, Hina Mincho, Noto Serif JP.

**Repro:**
1. Select the Hollow Knight Lore Tablet theme.
2. Load a card whose reading/transliteration fields contain Japanese characters.
3. Flip to the back view.
4. Observe: Japanese glyphs render in the OS system font, not a font matched to the theme aesthetic.

---

## Issue 20 — Pokémon front: blinking cursor shows when input is unfocused

**Severity:** Advisory  
**Concern:** Visual correctness  
**Status:** Resolved (2026-06-03)

The `.gb-input-wrap::after` pseudo-element runs the `gb-blink` animation unconditionally — the `_` cursor blinks even when the input has never been touched.

**Have:** `.gb-input-wrap::after` is always rendered and animating in `public/Pokemon RBY.json` `cardCss` (line 174–185).

**Should have:** Cursor blinks only while the input is focused. Fix: change selector to `.gb-input-wrap:focus-within::after`.

**Repro:**
1. Select the Pokémon RBY theme; view the front side.
2. Do not click the input field.
3. Observe: `_` cursor blinks in the empty input without any focus.

---

## Issue 20b — Pokémon front: restore pixel `_` cursor that tracks typed text

**Severity:** Advisory  
**Concern:** Design quality  
**Status:** Open  
**Parent:** Issue 20

The fake `_` cursor was removed (Issue 20 fix) because it was absolutely positioned and couldn't track the text insertion point. The real browser caret (styled `var(--gb-dark)`) is correct but not pixel-aesthetic.

**Have:** Input uses the browser's standard I-beam/line caret in `var(--gb-dark)`.

**Should have:** A `_` character in "Press Start 2P" that sits immediately after the last typed character and blinks, matching the GB aesthetic.

**Investigation approach:** Because "Press Start 2P" is monospace, character width is constant and predictable — a small script could listen to `input` events, count characters, and set a CSS custom property (`--cursor-x: calc(N * 1ch)`) that the `::after` pseudo-element reads for its `left` offset. Needs a font-loaded guard before measuring `ch` width.

---

## Issue 21 — Pokémon front: placeholder text renders in browser-default gray

**Severity:** Advisory  
**Concern:** Visual correctness / Design quality  
**Status:** Resolved (2026-06-03)

No `::placeholder` colour rule exists for `.gb-input-wrap input`. The browser renders placeholder text in its default gray, which is off-palette for the 4-shade GB green design.

**Have:** `{{type:term}}` input has no `::placeholder { color: … }` rule; placeholder appears gray in `public/Pokemon RBY.json`.

**Should have:** Placeholder uses a GB palette green — e.g. `var(--gb-dark)` (`#306230`) — so it stays visually consistent with the rest of the card.

**Repro:**
1. Select the Pokémon RBY theme; view the front side.
2. Observe the "Type your answer here" placeholder text — it is gray, not green.

---

## Issue 22 — Pokémon front: text sizes too large relative to card area

**Severity:** Advisory  
**Concern:** Design quality  
**Status:** Resolved (2026-06-03)

Front-view text elements use the same large sizes as the back-view content, making the banner and prompt dominate the card with little breathing room. The user-facing ask is roughly half the current sizes on the front only; back sizes are intentionally unchanged.

**Have:** `.gb-wild-banner` and `.gb-prompt` at `1.80rem`; `.gb-input-wrap input` and its `::after` cursor at `1.95rem`; `.gb-hint-link` at `1.65rem`; `.gb-hint-text` at `1.80rem` — all in `public/Pokemon RBY.json` `cardCss`.

**Should have:** Front-side text sizes reduced to roughly half current values (suggested: banner/prompt `~0.9rem`, input `~1rem`, hint text proportionally scaled). Back-side class sizes (`gb-term`, `gb-reading`, etc.) remain unchanged.

**Repro:**
1. Select the Pokémon RBY theme; view the front side.
2. Observe: the banner and prompt text appear oversized; the input field and hint text leave minimal margin within the menu box.

---

## Issue 23 — Pokémon back: Japanese text fields render in non-pixel system fallback font

**Severity:** Advisory  
**Concern:** Design quality  
**Status:** Resolved (2026-06-03)

The back view applies `"Press Start 2P"` to all fields including `.gb-reading`, `.gb-transliteration`, and `.gb-tags`. Press Start 2P is a Latin-only font; Japanese glyphs fall through to the OS system font, breaking the pixel aesthetic for those fields.

**Have:** `@import` in `public/Pokemon RBY.json` loads only `Press Start 2P` (Latin-only). Fields containing Japanese glyphs render in the OS default serif/sans font.

**Should have:** A Unicode-capable pixel font — e.g. `UnifontMedium` (as used in the 8 Bit Console theme via `https://cdn.jsdelivr.net/gh/avidrucker/anki-card-test-1/public/UnifontMedium.woff`) — is applied to the Japanese-bearing fields (`gb-reading`, `gb-transliteration`, `gb-tags`) so glyphs render in a pixel style consistent with the GB aesthetic.

**Repro:**
1. Select the Pokémon RBY theme; view the back side with a card containing Japanese reading or transliteration.
2. Observe: Japanese characters render in a system font, not a pixel font.

---

## Issue 24 — Pokémon front/back: play button lacks explicit pixel font-family

**Severity:** Advisory  
**Concern:** Design quality  
**Status:** Resolved (2026-06-03)

`.append-play-btn-text button` sets only `font-size: 9rem` — no `font-family` is declared. The button inherits `"Press Start 2P"` from `.card`, which is Latin-only and inconsistent with the 8 Bit Console approach of explicitly using `UnifontMedium` (a Unicode pixel font) at `5rem`.

**Have:** `public/Pokemon RBY.json` `cardCss` line 202: `.append-play-btn-text button { font-size: 9rem; cursor: pointer; color: var(--gb-white); }` — no `font-family`.

**Should have:** Play button explicitly declares a pixel `font-family` (e.g. `UnifontMedium` for Unicode coverage, or `"Press Start 2P"` if the symbol renders correctly) and uses a size comparable to the 8 Bit Console (`5rem`), matching the retro-design approach.

**Repro:**
1. Select the Pokémon RBY theme; view a card with audio.
2. Observe the play button — it has no explicit pixel font declaration and is rendered at an oversized 9rem compared to the retro design's 5rem.

---

## Issue 25 — Steampunk: Japanese font experiment unresolved; three unused fonts still loaded

**Severity:** Advisory  
**Concern:** Design quality / Performance  
**Status:** Resolved (2026-06-03)

A temporary 4-font comparison block was added to `public/Steampunk.json` to evaluate Japanese fonts for `.sp-term` and `.sp-reading`. The winner (Noto Serif JP) has not been promoted to the main rules, and the three losing fonts (Shippori Mincho B1, Zen Old Mincho, Yuji Syuku) are still imported and defined.

**Have:**
- `.sp-term` uses `"Cinzel Decorative"` (Latin-only); `.sp-reading` uses `"IM Fell English"` (Latin-only) — Japanese glyphs fall back to the system font.
- `cardCss` line 17: second `@import` loads all four Japanese fonts.
- Lines 239–261: temporary experiment classes (`.sp-term--shippori-b1`, `.sp-reading--shippori-b1`, `.sp-term--zen-old`, `.sp-reading--zen-old`, `.sp-term--yuji`, `.sp-reading--yuji`, `.sp-term--noto`, `.sp-reading--noto`) and `.sp-font-label` remain in the stylesheet.

**Should have:**
- `.sp-term` and `.sp-reading` updated to `font-family: "Noto Serif JP", serif`.
- Second `@import` (line 17) replaced with a single Noto Serif JP import (weights 400, 700, 900 are sufficient).
- All font-experiment classes and `.sp-font-label` removed.
- Any corresponding experiment markup in `frontHtml`/`backHtml` (font-label spans, experiment wrapper divs) cleaned up if present.

**Repro:**
1. Select the Steampunk theme; view the back side with a card that has Japanese in the term or reading fields.
2. Observe: Japanese glyphs do not render in Noto Serif JP or any intentional Japanese font.

---

## Issue 26 — Pokémon: SVG palette filter colors visually diverge from CSS custom properties

**Severity:** Advisory  
**Concern:** Visual correctness  
**Status:** Resolved (2026-06-03) — closed as side effect of Issue 28

The GB 4-shade palette is defined in two places: CSS custom properties (`--gb-black` / `--gb-dark` / `--gb-light` / `--gb-white`) and the `feComponentTransfer discrete` tableValues in the SVG `#gb-palette` filter. The float-to-hex conversion checks out on paper (e.g. `0.059 × 255 = 15 = 0x0F`), but the filtered image pixels visually diverge from the equivalent CSS-painted UI elements when viewed side by side in the browser.

**Have:** Filtered image pixels and CSS palette elements appear as noticeably different shades on screen despite the tableValues being mathematically equivalent to the CSS hex colours (`#0f380f`, `#306230`, `#8bac0f`, `#9bbc0f`). Root cause likely lies in the browser's SVG filter rendering pipeline — colour space handling, gamma correction, or floating-point precision in `feComponentTransfer`.

Current tableValues (both `frontHtml` and `backHtml` SVG blocks):
```
feFuncR: 0.059  0.188  0.545  0.608
feFuncG: 0.220  0.384  0.675  0.737
feFuncB: 0.059  0.188  0.059  0.059
```

**Should have:** Filtered image shades are perceptually indistinguishable from the CSS palette used for the card UI chrome.

**Repro:**
1. Select the Pokémon RBY theme; load a card with a picture on the back side.
2. Compare the filtered image shades against the `gb-menu-box` background (`--gb-white`) and the `gb-battle-zone` background (`--gb-dark`).
3. Observe: the filtered tones do not match the CSS-painted areas exactly.

**Investigation notes:**
- `color-interpolation-filters="sRGB"` is already set on the filter, which should prevent linear-light blending errors — check if removing it changes anything.
- Try expressing the tableValues as exact fractions derived from the hex bytes (e.g. `15/255 = 0.05882…` rather than `0.059`) to eliminate rounding as a variable.
- DevTools eyedropper on a filtered pixel vs. a CSS-painted element is the fastest way to confirm the actual rendered hex difference.

---

## Issue 27 — Pokémon front: input field background is tinted instead of transparent

**Severity:** Advisory  
**Concern:** Design quality  
**Status:** Resolved (2026-06-03)

The `{{type:term}}` input has `background: var(--gb-light)` (`#8bac0f`) at rest and switches to `var(--gb-white)` on focus — both are opaque GB greens. The input should be visually clear so the menu-box background shows through.

**Have:** `.gb-input-wrap input { background: var(--gb-light); }` and `.gb-input-wrap input:focus { background: var(--gb-white); }` in `public/Pokemon RBY.json` `cardCss`.

**Should have:** Both rest and focus states use `background: transparent` so no fill colour is applied to the input field.

**Repro:**
1. Select the Pokémon RBY theme; view the front side.
2. Observe: the input box has a visible light-green fill before and after clicking into it.

---

## Issue 28 — Pokémon theme uses green LCD palette instead of classic monochrome

**Severity:** Advisory  
**Concern:** Design quality  
**Status:** Resolved (2026-06-03)

The theme currently uses the Game Boy Color green-tinted LCD palette. The target aesthetic is the original monochrome Game Boy — true black, white, and two grays.

**Have:** CSS custom properties in `public/Pokemon RBY.json` use a green-tinted palette:
```
--gb-white: #9bbc0f
--gb-light: #8bac0f
--gb-dark:  #306230
--gb-black: #0f380f
```
SVG filter tableValues are also tuned to this green palette.

**Should have:** Palette replaced with classic monochrome 4-shade values:
```
--gb-white: #ffffff  (255, 255, 255)
--gb-light: #a9a9a9  (169, 169, 169)
--gb-dark:  #545454  ( 84,  84,  84)
--gb-black: #000000  (  0,   0,   0)
```
SVG `feComponentTransfer discrete` tableValues updated to match — exact fractions derived from the new hex bytes:
```
feFuncR/G/B shade 1 (black):      0.000  0.000  0.000
feFuncR/G/B shade 2 (dark gray):  0.329  0.329  0.329   (84/255)
feFuncR/G/B shade 3 (light gray): 0.663  0.663  0.663  (169/255)
feFuncR/G/B shade 4 (white):      1.000  1.000  1.000
```
All three R/G/B funcs use the same tableValues since the target is achromatic. The SVG filter update also closes the rendering-pipeline mismatch tracked in Issue 26.

**Repro:**
1. Select the Pokémon RBY theme.
2. Observe: the card renders in green tones rather than classic black-and-white.

---

## Issue 29 — Holographic Foil effect does not look convincingly holographic

**Severity:** Advisory  
**Concern:** Design quality  
**Status:** Open

The current Holo Foil theme uses a rotating conic-gradient + SVG feTurbulence sparkle + feSpecularLighting sweep. In practice the card does not read as a holographic foil card to a viewer.

**Have:** Three-layer effect (rainbow conic-gradient, feTurbulence sparkle mask, feSpecularLighting sweep) produces an animated shimmer but lacks the characteristic rainbow-shift-on-tilt, prismatic depth, and sharp glint behaviour of real holographic foil.

**Should have:** The card's image zone convincingly mimics a holographic foil trading card — rainbow iridescence that shifts with viewing angle (simulated via pointer/device-orientation events or CSS `@property` animation), sharp prismatic glints, and a foil texture that feels physically plausible.

**Spike — research before implementing:**
- Survey CodePen for high-quality holographic card CSS demos (search: "holographic card CSS", "holo foil trading card", "Pokemon holographic CSS")
- Note which techniques are used: CSS `background-blend-mode`, `mix-blend-mode`, `filter: hue-rotate()`, pointer-tracking via `mousemove`/`deviceorientation`, `backdrop-filter`, SVG `feDiffuseLighting`/`feSpecularLighting`, WebGL shaders
- Identify the minimum set of techniques that produces a convincing result within a static `<style>` block (no external JS libraries, must work in Anki's WebView)
- Record the best reference implementations and note what each contributes

Output of spike: a short findings note added to this issue, listing the chosen technique(s) and at least one reference CodePen/demo URL, before any CSS is written.

---

## Issue 30 — Steampunk theme visual design lacks reference-quality authenticity

**Severity:** Advisory  
**Concern:** Design quality  
**Status:** Resolved (2026-06-04)

The current Steampunk theme has the right vocabulary (aged parchment, brass/copper accents, Cinzel typography) but has not been benchmarked against high-quality steampunk UI/card designs. Without a reference survey it is unclear whether the current implementation is close to its aesthetic ceiling or has significant room to improve.

**Have:** Steampunk theme designed from scratch with no reference CodePen or visual inspiration sources documented.

**Should have:** A short findings note on this issue listing the strongest steampunk card/UI CSS references found, the key techniques they use (texture overlays, noise filters, SVG rust/oxidation effects, gear motifs, aged-paper gradients, brass border treatments), and a concrete list of improvements to apply to the theme.

**References collected so far:**
- https://codepen.io/Avoloch/pen/ZYYXYdv — steampunk card CSS demo (added 2026-06-04)

**Spike — research before implementing:**
- Analyse the reference above; note which specific techniques it uses (texture layers, border treatment, gear motifs, typography, colour palette)
- Search CodePen for additional steampunk card and UI demos ("steampunk card CSS", "steampunk UI", "aged parchment CSS", "brass border effect")
- Search Dribbble/Behance for steampunk trading card or flashcard visual references
- Note techniques: SVG `feTurbulence` paper texture, `feColorMatrix` sepia, riveted border via `radial-gradient`, gear/cog pseudo-elements, letterpress text shadow, aged-vellum background gradients
- Identify what the current theme is missing vs. the reference bar
- Record findings before any CSS is written

---

## Issue 31 — Blueprint Theme front side is missing a type-answer input field

**Severity:** Advisory  
**Concern:** Correctness / Usability  
**Status:** Resolved (2026-06-03)

The Blueprint Theme front side shows only an audio player and a prompt line. There is no `{{type:term}}` input field, so the user cannot type their answer — the core study interaction is absent.

**Have:** `frontHtml` in `public/Blueprint Theme.json` contains only an audio element and a static prompt paragraph; no `{{type:term}}` input or wrapper div.

**Should have:** A `{{type:term}}` input field present on the front side, consistent with other themes that support typed answers (e.g. Pokémon RBY, Holographic Foil, Hollow Knight Lore Tablet).

**Repro:**
1. Select the Blueprint Theme; view the front side.
2. Observe: no text input field is rendered — only the audio element and the prompt text.

---

## Issue 32 — Da Vinci Sketch front side is missing a type-answer input field

**Severity:** Advisory  
**Concern:** Correctness / Usability  
**Status:** Resolved (2026-06-03)

The Da Vinci Sketch front side shows only an audio player and a prompt line, with no `{{type:term}}` input field.

**Have:** `frontHtml` in `public/Da Vinci Sketch.json` contains only an audio element and a static prompt paragraph; no `{{type:term}}` input or wrapper div.

**Should have:** A `{{type:term}}` input field on the front side, styled to match the sketch aesthetic — underline/bottom-border only, no box border or outline (e.g. `border: none; border-bottom: 1px solid <ink-colour>; outline: none; background: transparent`).

**Repro:**
1. Select the Da Vinci Sketch theme; view the front side.
2. Observe: no text input field is rendered — only the audio element and the prompt text.

---

## Issue 33 — Full Photo front side is missing a type-answer input field

**Severity:** Advisory  
**Concern:** Correctness / Usability  
**Status:** Resolved (2026-06-03)

The Full Photo front side shows only an audio player and a prompt line, with no `{{type:term}}` input field.

**Have:** `frontHtml` in `public/Full Photo.json` contains only an audio element and a static prompt paragraph; no `{{type:term}}` input or wrapper div.

**Should have:** A `{{type:term}}` input field on the front side, styled to complement the full-bleed photo background — likely transparent or semi-transparent with a white/light border so it remains visible over an arbitrary photo.

**Repro:**
1. Select the Full Photo theme; view the front side.
2. Observe: no text input field is rendered.

---

## Issue 34 — Full Photo 2 front side is missing a type-answer input field

**Severity:** Advisory  
**Concern:** Correctness / Usability  
**Status:** Resolved (2026-06-03)

The Full Photo 2 front side shows only an audio player and a prompt line, with no `{{type:term}}` input field.

**Have:** `frontHtml` in `public/Full Photo 2.json` contains only an audio element and a static prompt paragraph; no `{{type:term}}` input or wrapper div.

**Should have:** A `{{type:term}}` input field on the front side, styled to match the off-white header band — likely placed inside or below the header section with a dark border to contrast against the light background.

**Repro:**
1. Select the Full Photo 2 theme; view the front side.
2. Observe: no text input field is rendered.

---

## Issue 35 — Tachyons audit: custom CSS duplicates utilities already in Tachyons

**Severity:** Advisory  
**Concern:** Maintainability  
**Status:** Open

Each theme's `cardCss` contains hand-rolled CSS rules for common layout and typography concerns (margin, padding, flex, font-size, opacity, text-align, display, etc.) that Tachyons already covers with single-class utilities. This creates redundancy, increases per-theme CSS size, and makes it harder to spot what is genuinely theme-specific vs. structural boilerplate.

**Have:** Themes contain custom CSS rules that reimplement Tachyons utilities, e.g. explicit `margin: 0`, `display: flex`, `font-size: 1rem`, `opacity: 0.5`, `text-align: center`, `width: 100%`, `box-sizing: border-box` — all covered by Tachyons classes (`ma0`, `flex`, `f5`, `o-50`, `tc`, `w-100`, `box-border`). No audit has been done to identify the overlap.

**Should have:** A per-theme findings table identifying:
1. Custom CSS rules that can be **replaced** by standard Tachyons classes (move to HTML, remove from CSS)
2. Custom CSS rules that appear in 3+ themes and could become a **shared utility class** in a project-level stylesheet (e.g. `<style>` in `index.html` or a `src/themes.css`)
3. Rules that are genuinely theme-specific and should stay in `cardCss`

After the audit, apply the consolidations theme by theme and verify visually.

**Scope:** All 28 themes in `public/*.json` plus any shared CSS in `src/`.

**Note:** Tachyons is globally available (imported in `main.jsx`). Classes added to theme HTML are available in both the designer preview and Anki export.

---

## Issue 36 — CSS/HTML editor cursor jumps to top of pane while typing

**Severity:** Advisory  
**Concern:** UX / Correctness  
**Status:** Resolved (2026-06-04)

When typing in the CSS (or HTML) editor panel, the CodeMirror cursor spontaneously jumps to the top of the editor after certain keystrokes, interrupting editing flow.

**Have:** Typing in the editor causes the cursor to jump to position 0 (top of file) mid-edit.

**Should have:** Cursor stays at the insertion point for the entire editing session; it only moves when the user explicitly navigates or a tab/design switch occurs.

**Root cause (diagnosed):**

The LOAD `useEffect` (`src/App.jsx` ~line 107) has `[activeTab, frontHtml, backHtml, cardCss]` as dependencies:

```js
useEffect(() => {
  setCurrentEditorText(contentToLoad);   // ← resets CodeMirror value
  ...
}, [activeTab, frontHtml, backHtml, cardCss]);
```

When the user types, `onEditorChange` sets `currentEditorText`, which the SAVE effect writes back to `cardCss` (or `frontHtml`/`backHtml`). That state change is in the LOAD effect's dependency array, so the LOAD effect re-fires on every keystroke, calling `setCurrentEditorText(cardCss)` with the current content. Any external write to CodeMirror's `value` prop resets the cursor to position 0 — even when the string is identical.

The `isLoadingTabContentRef` guard was intended to prevent this but is set asynchronously (50 ms `setTimeout`) and is not checked before the `setCurrentEditorText` call in the LOAD effect.

**Fix approach (to research and confirm before implementing):**

1. **Remove source-content deps from the LOAD effect** — change the dependency array to `[activeTab]` only. The LOAD effect should fire when the user switches tabs, not when content changes from typing. The SAVE effect already handles the reverse direction.
2. **Guard with `isLoadingTabContentRef`** — before `setCurrentEditorText` in the LOAD effect, check the flag and skip if the user is actively editing (belt-and-suspenders).
3. **Consider CodeMirror's imperative API** — instead of setting the `value` prop (which always resets cursor), use `EditorView.dispatch` with a `replaceAll` transaction that preserves cursor position when the incoming content equals the current content.

**Regression test (must pass before closing):**

1. Select any design; open the CSS editor tab.
2. Click into the middle of a long CSS rule (not the first line).
3. Type 10+ characters.
4. Verify: cursor remains at the insertion point after every keystroke — it does not jump to the top of the file.
5. Switch tabs and back; verify content and cursor position are restored correctly.

---

## Issue 37 — About modal uses white/light theme instead of app dark theme

**Severity:** Advisory  
**Concern:** Design quality / Usability  
**Status:** Resolved (2026-06-04)

The About modal uses a white background and dark-gray text, which clashes with the app's dark-gray/near-black UI. The `ⓘ` button icon is not visually centred inside its circular glass button.

**Have:** Modal rendered with `bg-white dark-gray` — looks like a foreign light-mode component dropped into a dark UI. The `ⓘ` character sits off-centre inside the `BTN_STYLE_GLASS` button (which uses `pa2 w2 h2` without explicit flex centering).

**Should have:** Modal background, text, and border colours match the app's existing dark palette (e.g. `bg-dark-gray white` with a `b--gray` border, consistent with the editor and header areas). The `ⓘ` icon is horizontally and vertically centred inside its button using `flex items-center justify-center`.

**Repro:**
1. Load the app (dark UI).
2. Click the `ⓘ` button.
3. Observe: modal is stark white, jarring against the dark background; `ⓘ` icon appears top-left of its button rather than centred.

---

## Issue 38 — Pokémon theme padding and layout spacing needs improvement

**Severity:** Advisory  
**Concern:** Design quality  
**Status:** Open

The Pokémon RBY theme's layout uses spacing values that leave elements cramped or poorly proportioned at card preview size.

**Have:** Current padding and margin values in `public/Pokemon RBY.json` `cardCss` produce a layout that does not make effective use of the card area — elements feel squeezed or misaligned.

**Should have:** Padding and margins adjusted so the card content breathes appropriately at the default preview size, consistent with the Game Boy aesthetic (tight but not cramped; clear visual hierarchy between zones).

**Repro:**
1. Select the Pokémon RBY theme.
2. View front and back sides.
3. Observe: layout spacing feels off — elements are too close together or proportions are awkward.

---

## Issue 39 — About button uses Unicode ⓘ instead of matching SVG icon

**Severity:** Advisory  
**Concern:** Design quality  
**Status:** Open

The `ⓘ` About button uses a raw Unicode character while all other icon buttons (`eyeIcon`, `eyeSlashIcon`, `copyIcon`, `checkIcon`) use inline Font Awesome 5 SVGs from `src/icons.jsx` with `fill="gray"`. The Unicode glyph renders differently across OSes and fonts, and is visually inconsistent with the rest of the icon set.

**Have:** `ⓘ` Unicode character inside a `<span>` in the About button; no `infoIcon` export in `src/icons.jsx`.

**Should have:** An `infoIcon` added to `src/icons.jsx` using the Font Awesome 5 Free `fa-info-circle` SVG path (same license, CC BY 4.0), with `fill="gray"` to match existing icons. About button updated to render `{infoIcon}` instead of the Unicode character.

**Repro:**
1. Inspect the About button (`ⓘ`) next to the eye-toggle button in the header.
2. Observe: the `ⓘ` glyph is a Unicode character, not an SVG; its weight, size, and rendering differ from the SVG icons beside it.

**Implementation note:** Font Awesome 5 Free `info-circle` path is available at `https://fontawesome.com/icons/info-circle` under CC BY 4.0. Add it to `src/icons.jsx` alongside the existing four exports.

---

## Issue 40 — Steampunk: create 3–4 card variations with brass, wood, and large spinning gears

**Severity:** Advisory  
**Concern:** Design quality  
**Status:** Open  
**Parent:** Issue 30

The current Steampunk theme uses one layout and one visual treatment. Expanding it to 3–4 distinct visual variations would showcase the aesthetic range of the genre and give users meaningful choice.

**Have:** One Steampunk card design — parchment body, iron-black header band with wood-grain texture, brass gradient rule, rotating corner gears (`⚙` glyph, footer only).

**Should have:** 3–4 distinct visual treatments saved as separate theme JSON files, each leaning into a different steampunk sub-aesthetic. Each variation must include prominently visible spinning metallic gear(s), richer brass/copper surface treatments, and at least one wood-surface zone.

### Proposed variations

**Variation A — "The Engine Room"**  
Dark iron/coal aesthetic. Near-black `#1a0d00` background. Large SVG gear(s) visible behind the content area (CSS `clip-path` or `opacity` layer), slowly rotating. Copper piping accent border. Brass rivets at corners. Courier Prime monospace for all text (typewriter aesthetic). Content zone uses a dark aged-metal texture.

**Variation B — "The Airship Logbook"**  
Parchment + reclaimed mahogany. Wide wood-plank header using the multi-layer gradient technique. Large brass cog watermark centred behind the term (low-opacity `⚙` at `8–10rem`, rotating). Soft leather-brown ink. Cinzel Decorative header, IM Fell English body.

**Variation C — "The Inventor's Workshop"**  
Blueprint meets brass — dark navy/indigo background with a faint grid, brass-foil lettering (`mix-blend-mode: screen` or outline text). SVG gears in two sizes at opposing corners, counter-rotating. Mechanical sans-serif (`Exo 2`) for readability against dark background.

**Variation D — "The Royal Society"**  
Formal Victorian manuscript. Ivory vellum body. Ornate ruled border (double-line with corner flourishes via CSS). Deep burgundy `#4a0a14` header band. Gold-leaf gradient title. Two large decorative gear SVGs flanking the term on the back side. Libre Baskerville body text.

### Implementation notes

- Each variation is a new `public/Steampunk-*.json` file (e.g. `Steampunk Engine Room.json`) following the existing `sp-*` class namespace pattern.
- Spinning gears: use `@keyframes` rotation on a large Unicode `⚙` (8–12rem) or an inline SVG gear path placed as an absolutely-positioned background element within the card.
- Register each new file in the `availableDesigns` array in `src/App.jsx`.
- Verify all variations visually at card preview size before committing.

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
