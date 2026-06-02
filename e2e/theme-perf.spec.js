import { test, expect } from '@playwright/test';

// Themes that include a tachyons CDN @import in their CSS
const TACHYONS_THEMES = ['8 Bit Console', 'Beach Night Poster', 'Blackboard and Chalk'];

// Themes that use Google Fonts (for dedup tests)
const FONT_THEMES = ['Blackboard and Chalk', 'Beach Night Poster', 'Index Card'];

// Visual snapshot themes — representatively different aesthetics
const SNAPSHOT_THEMES = ['8 Bit Console', 'Blackboard and Chalk', 'Index Card', 'Code Rain'];

/** Extract all font URLs currently in <style id="dynamic-imports"> */
async function getInjectedImportUrls(page) {
  return page.evaluate(() => {
    const tag = document.getElementById('dynamic-imports');
    if (!tag) return [];
    return [...tag.textContent.matchAll(/url\(['"]?([^'")\s]+)['"]?\)/g)].map(m => m[1]);
  });
}

/** Select a theme by its display name and wait for styles to apply */
async function selectTheme(page, displayName) {
  await page.selectOption('select', { label: displayName });
  // Wait for dynamic-styles to be rebuilt, confirming applyStyles ran
  await page.waitForFunction(() => document.getElementById('dynamic-styles') !== null);
  await page.waitForTimeout(200);
}

test.describe('Tachyons — no CDN requests', () => {
  test('loading tachyons-themed cards fires zero requests to unpkg.com', async ({ page }) => {
    const unpkgRequests = [];
    page.on('request', req => {
      if (req.url().includes('unpkg.com')) unpkgRequests.push(req.url());
    });

    await page.addInitScript(() => localStorage.clear());
    await page.goto('/');
    await page.waitForSelector('.card-container');

    for (const theme of TACHYONS_THEMES) {
      await selectTheme(page, theme);
    }

    expect(unpkgRequests).toHaveLength(0);
  });
});

test.describe('Import deduplication', () => {
  test('dynamic-imports accumulator has no duplicate URLs after repeated theme switches', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/');
    await page.waitForSelector('.card-container');

    // Switch through font themes twice to exercise dedup
    for (const theme of [...FONT_THEMES, ...FONT_THEMES]) {
      await selectTheme(page, theme);
    }

    const urls = await getInjectedImportUrls(page);
    const uniqueUrls = new Set(urls);

    // Every URL should appear exactly once
    expect(urls.length).toBe(uniqueUrls.size);
  });

  test('switching back to the same theme adds no new imports', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/');
    await page.waitForSelector('.card-container');

    // Load two distinct themes to populate the accumulator
    await selectTheme(page, 'Blackboard and Chalk');
    await selectTheme(page, 'Index Card');

    // Snapshot the accumulator after both themes are loaded
    const urlsMid = await getInjectedImportUrls(page);

    // Switch back to the already-seen theme — no new URLs should be added
    await selectTheme(page, 'Blackboard and Chalk');
    const urlsAfter = await getInjectedImportUrls(page);

    expect(urlsAfter.length).toBe(urlsMid.length);
  });
});

test.describe('Performance budget', () => {
  test('applyStyles runs under 100ms per call after 5 theme switches', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/');
    await page.waitForSelector('.card-container');

    const themes = ['Blackboard and Chalk', 'Beach Night Poster', 'Index Card', '8 Bit Console', 'Code Rain'];
    for (const theme of themes) {
      await selectTheme(page, theme);
    }

    const durations = await page.evaluate(() =>
      performance.getEntriesByName('applyStyles').map(e => e.duration)
    );

    expect(durations.length).toBeGreaterThan(0);
    for (const d of durations) {
      expect(d).toBeLessThan(100);
    }
  });
});

test.describe('Visual snapshots', () => {
  test.beforeEach(async ({ page }) => {
    // Abort external font requests for deterministic rendering across machines
    await page.route('**fonts.googleapis.com**', route => route.abort());
    await page.route('**fonts.gstatic.com**', route => route.abort());
    await page.addInitScript(() => localStorage.clear());
  });

  for (const theme of SNAPSHOT_THEMES) {
    test(`card preview renders for theme: ${theme}`, async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('.card-container');
      await selectTheme(page, theme);

      const card = page.locator('.card-container');
      await expect(card).toHaveScreenshot(`${theme}.png`);
    });
  }
});
