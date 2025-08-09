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

  // Create an audit while offline (optimistic + queued)
  // Prefer One Click button path which is always visible and works offline with optimistic entry
  await page.getByRole('button', { name: '🚀 One Click Audit', exact: true }).click();
  const fileInput = page.locator('input[type="file"]');
  await fileInput.waitFor({ state: 'attached', timeout: 10_000 });
  // Provide the directory but offline will take optimistic path regardless of files
  const uploadDir = process.env.E2E_UPLOAD_DIR || 'public';
  await fileInput.setInputFiles(uploadDir);

  // Confirm optimistic appears locally (title contains AI-Generated)
  await expect(page.locator('text=/AI-Generated ISO 22000 Audit/i').first()).toBeVisible({ timeout: 10_000 });

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
