import { test, expect } from '@playwright/test';

async function login(page) {
  await page.goto('/');
  await page.getByLabel('Email Address').fill('admin@aegisaudit.com');
  await page.getByLabel('Password').fill('admin123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible({ timeout: 8000 });
}

test.describe('One-Click Audit updates analytics', () => {
  test('creating one audit increases analytics total', async ({ page }) => {
    await login(page);

  // Navigate to Analytics via sidebar button (no dialog yet, so this is stable)
  await page.getByRole('button', { name: 'Analytics Hub' }).click();
  await expect(page.getByRole('heading', { name: 'Analytics & Reporting Hub' })).toBeVisible();
  await page.waitForLoadState('networkidle');
  const parseIntSafe = async (locator) => parseInt(((await locator.textContent()) || '').replace(/[^0-9]/g,'') || '0', 10);
  const metric = page.getByTestId('metric-total-value');
  await expect(metric).toBeVisible();
  const totalBefore = await parseIntSafe(metric);

  // Create via Audit Hub One-Click using sidebar and upload directory (same pattern as other tests)
  await page.getByRole('button', { name: 'Audit Hub' }).click();
  await expect(page.getByRole('heading', { name: 'Audit Hub' })).toBeVisible();
  await page.getByRole('button', { name: '🚀 One Click Audit', exact: true }).click();
  const fileInput = page.locator('input[type="file"]');
  await fileInput.waitFor({ state: 'attached', timeout: 10_000 });
  const uploadDir = process.env.E2E_UPLOAD_DIR || 'public';
  await fileInput.setInputFiles(uploadDir);

    // Wait for progress dialog to show and then disappear (success path closes it)
    const dlg = page.getByRole('heading', { name: 'One-Click Audit' });
    await expect(dlg).toBeVisible();
    // Some environments keep the dialog visible while toast shows; try to close gracefully
    await page.waitForTimeout(300);
    if (await dlg.isVisible()) {
      await page.keyboard.press('Escape');
    }
    // Don't hard fail if still visible; continue and rely on navigation waits

    // Navigate back to Analytics using button (dialog was closed). Add a short debounce.
    await page.getByRole('button', { name: 'Analytics Hub' }).click();
    await expect(page.getByRole('heading', { name: 'Analytics & Reporting Hub' })).toBeVisible();
    const waitAnalytics = page.waitForResponse(r => r.url().includes('/api/analytics') && r.status() === 200, { timeout: 10_000 }).catch(() => null);
    await page.waitForTimeout(250);
    await waitAnalytics;

  await expect(async () => {
      const totalAfter = await parseIntSafe(page.getByTestId('metric-total-value'));
      expect(totalAfter).toBeGreaterThanOrEqual(totalBefore + 1);
    }).toPass({ timeout: 20_000 });
  });
});
