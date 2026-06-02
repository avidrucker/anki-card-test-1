import { test, expect } from '@playwright/test';

async function waitForAppReady(page) {
  await page.waitForSelector('.card-container');
  await page.waitForFunction(() => {
    const ds = document.getElementById('dynamic-styles');
    return ds && ds.textContent.length > 0;
  });
}

/** Returns the text of the currently active editor tab, or null. */
async function getActiveTab(page) {
  return page.evaluate(() => {
    const active = [...document.querySelectorAll('.tabs button')].find(
      (b) => b.classList.contains('fw6')
    );
    return active ? active.textContent.trim() : null;
  });
}

/** Returns the text of the currently active view button, or null. */
async function getActiveView(page) {
  return page.evaluate(() => {
    const active = [...document.querySelectorAll('.view-tabs button')].find(
      (b) => b.classList.contains('active')
    );
    return active ? active.textContent.trim() : null;
  });
}

/** Select a theme and wait for styles to settle. */
async function switchDesign(page, label) {
  await page.selectOption('select', { label });
  await page.waitForFunction(() => document.getElementById('dynamic-styles') !== null);
  await page.waitForTimeout(150);
}

test.describe('Design switching preserves editor tab and view (issue 13)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/');
    await waitForAppReady(page);
  });

  test('default state is Back HTML tab + Back View', async ({ page }) => {
    expect(await getActiveTab(page)).toBe('Back HTML');
    expect(await getActiveView(page)).toBe('Back View');
  });

  test('stays on Front HTML tab when switching design', async ({ page }) => {
    await page.getByRole('button', { name: 'Front HTML' }).click();
    expect(await getActiveTab(page)).toBe('Front HTML');

    await switchDesign(page, 'Index Card');

    expect(await getActiveTab(page)).toBe('Front HTML');
  });

  test('stays on CSS tab when switching design', async ({ page }) => {
    await page.getByRole('button', { name: 'CSS' }).click();
    expect(await getActiveTab(page)).toBe('CSS');

    await switchDesign(page, 'Index Card');

    expect(await getActiveTab(page)).toBe('CSS');
  });

  test('stays on Front View when switching design', async ({ page }) => {
    await page.getByRole('button', { name: 'Front View' }).click();
    expect(await getActiveView(page)).toBe('Front View');

    await switchDesign(page, 'Index Card');

    expect(await getActiveView(page)).toBe('Front View');
  });

  test('stays on Front HTML + Front View when switching design', async ({ page }) => {
    await page.getByRole('button', { name: 'Front HTML' }).click();
    await page.getByRole('button', { name: 'Front View' }).click();
    expect(await getActiveTab(page)).toBe('Front HTML');
    expect(await getActiveView(page)).toBe('Front View');

    await switchDesign(page, 'Blackboard and Chalk');

    expect(await getActiveTab(page)).toBe('Front HTML');
    expect(await getActiveView(page)).toBe('Front View');
  });

  test('stays on Back HTML + Back View when switching design', async ({ page }) => {
    expect(await getActiveTab(page)).toBe('Back HTML');
    expect(await getActiveView(page)).toBe('Back View');

    await switchDesign(page, 'Blackboard and Chalk');

    expect(await getActiveTab(page)).toBe('Back HTML');
    expect(await getActiveView(page)).toBe('Back View');
  });
});
