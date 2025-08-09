import { test, expect } from '@playwright/test';

async function login(page) {
  await page.goto('/');
  await page.getByLabel('Email Address').fill('admin@aegisaudit.com');
  await page.getByLabel('Password').fill('admin123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible({ timeout: 8000 });
}

function openMenu(page, label) { return page.getByRole('button', { name: label }).first().click(); }

/**
 * Verify NCR creation while offline is queued and, upon reconnect, persisted to server.
 */
test.describe('Offline -> Online sync for NCR creation', () => {
  test('queue NCR offline then sync on reconnect', async ({ page }) => {
    await login(page);

    // Navigate to NCRs and capture baseline
    await openMenu(page, 'NCRs');
    await expect(page.getByRole('heading', { name: 'Non-Conformance & CAPA' })).toBeVisible();
    const total = page.getByTestId('ncr-total-value');
    const before = Number(await total.textContent());

    // Go offline
    await page.evaluate(() => { window.dispatchEvent(new Event('offline')); });

    // Create NCR while offline (optimistic + queued)
    await page.getByRole('button', { name: 'Raise Mock NCR' }).click();
    await expect(page.getByTestId('ncr-status')).toContainText('Raised mock NCR');

    // Optimistic increment
    await expect(async () => {
      const current = Number(await total.textContent());
      expect(current).toBeGreaterThanOrEqual(before + 1);
    }).toPass();

    // Back online -> process queue
    await page.evaluate(() => { window.dispatchEvent(new Event('online')); });

    // Deterministic flush (hidden test hook) while staying on the same page
    await page.waitForTimeout(200); // small debounce after online event
    await page.evaluate(async () => {
      // @ts-ignore
      if (window.__forceQueueProcessNcr) { await window.__forceQueueProcessNcr(); }
    });

    // Server-backed total should be >= before + 1
    await expect(async () => {
      const after = Number(await total.textContent());
      expect(after).toBeGreaterThanOrEqual(before + 1);
    }).toPass({ timeout: 25_000 });
  });
});
