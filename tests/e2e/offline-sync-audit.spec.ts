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

test.describe('Offline -> Online sync for Audit creation', () => {
  test('queue Custom Audit offline then sync on reconnect', async ({ page }) => {
    await login(page);

    // Go to Audit Hub and capture baseline count of AI-generated audits
    await openMenu(page, 'Audit Hub');
    await expect(page.getByRole('heading', { name: 'Audit Hub' })).toBeVisible();
    const aiAuditLocator = page.locator('text=/AI-Generated ISO 22000 Audit/i');
    const before = await aiAuditLocator.count();

    // Go offline for the app logic (toggle internal online flag)
    await page.evaluate(() => { window.dispatchEvent(new Event('offline')); });

    // Create a Custom Audit while offline (optimistic + queued)
    await page.getByRole('button', { name: 'Custom Audit' }).click();
    await expect(page.getByRole('dialog', { name: 'Create New Audit' })).toBeVisible();
    await page.getByRole('button', { name: 'Create Audit' }).click();

    // Confirm optimistic appears locally
    await expect(page.getByText('New Audit').first()).toBeVisible({ timeout: 5000 });

    // Go back online (triggers queue processing)
    await page.evaluate(() => { window.dispatchEvent(new Event('online')); });

    // Navigate away and back to force server fetch on mount
    await openMenu(page, 'Analytics Hub');
    await expect(page.getByRole('heading', { name: 'Analytics & Reporting Hub' })).toBeVisible();
    await openMenu(page, 'Audit Hub');
    await expect(page.getByRole('heading', { name: 'Audit Hub' })).toBeVisible();

    // Assert server-backed AI audit count increases by at least 1
    await expect(async () => {
      const after = await aiAuditLocator.count();
      expect(after).toBeGreaterThanOrEqual(before + 1);
    }).toPass({ timeout: 25_000 });
  });
});
