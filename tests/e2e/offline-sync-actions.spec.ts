import { test, expect } from '@playwright/test';

async function login(page) {
  await page.goto('/');
  await page.getByLabel('Email Address').fill('admin@aegisaudit.com');
  await page.getByLabel('Password').fill('admin123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible({ timeout: 8000 });
}

function openMenu(page, label: string) {
  return page.getByRole('button', { name: label }).first().click();
}

test.describe('Offline -> Online sync for Action creation', () => {
  test('queue Action offline then sync on reconnect', async ({ page }) => {
    await login(page);

    // Navigate to Action Hub and capture baseline total
    await openMenu(page, 'Action Hub');
    await expect(page.getByRole('heading', { name: 'Action & Task Hub' })).toBeVisible();
    const totalLocator = page.getByTestId('actions-total-value');
    const before = Number(await totalLocator.textContent());

    // Go offline for the app logic (toggle internal online flag)
    await page.evaluate(() => { window.dispatchEvent(new Event('offline')); });

    // Create a new Action while offline (optimistic + queued)
    await page.getByRole('button', { name: 'New Action' }).click();
    await expect(page.getByRole('dialog', { name: 'Create New Action' })).toBeVisible();
    await page.getByLabel('Action Title').fill('Offline Action');
    await page.getByRole('button', { name: 'Create Action' }).click();

    // Optimistic increment locally
    await expect(async () => {
      const current = Number(await totalLocator.textContent());
      expect(current).toBeGreaterThanOrEqual(before + 1);
    }).toPass();

  // Back online -> queue processes
  await page.evaluate(() => { window.dispatchEvent(new Event('online')); });

  // Navigate away and back to force server fetch on mount
  await openMenu(page, 'Analytics Hub');
  await expect(page.getByRole('heading', { name: 'Analytics & Reporting Hub' })).toBeVisible();
  await openMenu(page, 'Action Hub');
  await expect(page.getByRole('heading', { name: 'Action & Task Hub' })).toBeVisible();
  // Explicitly force queue processing and reload via test hook for determinism
  await page.evaluate(async () => {
    // @ts-ignore
    if (window.__forceQueueProcess) { await window.__forceQueueProcess(); }
  });

    // Assert server-backed total increases by at least 1 within timeout
    await expect(async () => {
      const after = Number(await totalLocator.textContent());
      expect(after).toBeGreaterThanOrEqual(before + 1);
    }).toPass({ timeout: 25_000 });
  });
});
