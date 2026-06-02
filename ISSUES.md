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

## Checks that passed

| Check | Concern | Severity |
|---|---|---|
| No FIXME markers in `src/` | Correctness | Advisory |
| `package-lock.json` present | Delivery safety | Recommended |
| Working tree clean | Delivery safety | Advisory |
| No vague function names in `src/` | Readability | Advisory |
| `src/App.jsx` under 1000 lines (807) | Maintainability | Advisory |
| Runtime dep count ≤ 12 (currently 10) | Maintainability | Advisory |
