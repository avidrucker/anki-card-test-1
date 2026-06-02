# Issue 10: External Asset Loading Performance — Implementation Plan

**Date:** 2026-06-02  
**Status:** Implemented

## Problem

Every time a theme is selected, `applyStyles` tears down and recreates `<style id="dynamic-styles">`, including all `@import` statements. This causes the browser to re-process every font/CDN import on every theme switch — even for cached assets. On a cold or slow connection the card preview can be blank for a perceptible moment.

**Scope:** web-app experience only (Anki export CSS unchanged).

Three sub-problems addressed:
1. **Tachyons CDN double-load** — 9 themes embed `@import url("https://unpkg.com/tachyons...")` in CSS; replaced with npm-bundled version.
2. **Google Fonts — no preconnect** — no warm-start hints meant each cold DNS+TLS handshake added 100–300 ms before the first font byte arrives.
3. **`applyStyles` re-fetches all `@import` on every switch** — even fonts already loaded were re-injected, re-queueing browser network work.

A separate Issue 12 covers font weight axis narrowing (deferred).

---

## Changes Made

### `package.json` / `src/main.jsx`
- Installed `tachyons` as an npm dependency.
- Added `import 'tachyons'` to `main.jsx` — Vite bundles it into the app CSS.

### `index.html`
- Removed `<link rel="stylesheet" href="https://unpkg.com/tachyons...">` (now bundled).
- Added `<link rel="preconnect" href="https://fonts.googleapis.com">` and `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`.

### `src/App.jsx` — `applyStyles`
1. **BUNDLED_CDN filter** — strips `@import` URLs that are now locally bundled (tachyons) before any processing, keeping the original JSON theme files intact for Anki export.
2. **Persistent `<style id="dynamic-imports">` accumulator** — font `@import` URLs are appended only when genuinely new; the tag survives theme switches. The rebuilt `<style id="dynamic-styles">` gets only keyframes + rules (no `@import`).
3. **`textContent` batch write** — replaced `innerHTML +=` loop (O(n²)) with a single `textContent =` from a pre-joined array (O(n)).
4. **Performance marks** — `performance.mark/measure` + `console.debug('[perf] applyStyles Xms')` wraps the function body.

### `src/App.jsx` — `loadDesign`
- Added `performance.mark/measure` around the fetch + apply call, logging `[perf] loadDesign Xms`.

### `e2e/theme-perf.spec.js` + `playwright.config.js`
Five Playwright tests covering:

| Test | What it asserts |
|---|---|
| Import dedup | Switching A→B (shared font): 0 new `fonts.googleapis.com` requests |
| Tachyons no CDN | Loading 3 tachyons themes: 0 requests to `unpkg.com` |
| DOM state | `<style#dynamic-imports>` never contains duplicate URLs after 5 theme switches |
| Perf budget | `applyStyles` duration < 100 ms (via `performance.getEntries`) |
| Visual snapshots | Card preview for 4 representative themes (fonts mocked via `page.route()` abort for determinism) |

### `ISSUES.md`
- Issue 10 marked Resolved.
- Issue 12 logged: font weight axis narrowing.

---

## Tradeoffs Recorded

- **Persistent accumulator** grows for the page lifetime (never shrinks). Correct for caching; if `text=` subsetting is added to font URLs later, dedup logic must compare full URL strings (already does).
- **Theme JSON files unchanged** — tachyons `@import` stays in exported CSS for Anki compatibility. Web app silently drops it.
- **Visual snapshot brittleness** mitigated by aborting external font routes → system-font fallback renders identically across machines/CI.
- **Font weight narrowing deferred** — tracked as Issue 12. Potential 100–500 KB saving per CJK font not yet captured.
