import { test, expect } from '@playwright/test';

async function login(page) {
  await page.goto('/');
  await page.getByLabel('Email Address').fill('admin@aegisaudit.com');
  await page.getByLabel('Password').fill('admin123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible({ timeout: 8000 });
}

async function parseIntSafe(locator) {
  return parseInt(((await locator.textContent()) || '').replace(/[^0-9]/g,'') || '0', 10);
}

test.describe('Analytics stability', () => {
  test('back-to-back audits increase total deterministically', async ({ page }) => {
    await login(page);
  // Navigate to Analytics and ensure metrics loaded
  await page.getByRole('button', { name: 'Analytics Hub' }).click();
  await expect(page.getByRole('heading', { name: 'Analytics & Reporting Hub' })).toBeVisible();
  await page.waitForResponse(r => r.url().includes('/api/analytics') && r.status() === 200, { timeout: 15000 });
  const totalMetric = page.getByTestId('metric-total-value');
  await expect(totalMetric).toBeVisible({ timeout: 15000 });
    const before = await parseIntSafe(totalMetric);

  // Navigate to Audit hub via sidebar (avoid FAB ambiguity)
  await page.getByRole('button', { name: 'Audit Hub' }).click();
  await expect(page.getByRole('heading', { name: 'Audit Hub' })).toBeVisible();
  // Create two audits via the explicit Audit Hub One-Click button
  const uploadDir = process.env.E2E_UPLOAD_DIR || 'public';
  for (let i = 0; i < 2; i++) {
    const oneClick = page.getByRole('button', { name: '🚀 One Click Audit', exact: true });
    await expect(oneClick).toBeVisible();
    await oneClick.click();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.waitFor({ state: 'attached', timeout: 10000 });
    await fileInput.setInputFiles(uploadDir);
    await page.waitForTimeout(300);
  }

    // Wait for /api/analytics to reflect
  // Return to Analytics and wait for API to reflect changes
  await page.getByRole('button', { name: 'Analytics Hub' }).click();
  await expect(page.getByRole('heading', { name: 'Analytics & Reporting Hub' })).toBeVisible();
  const waitAnalytics = page.waitForResponse(r => r.url().includes('/api/analytics') && r.status() === 200, { timeout: 15000 }).catch(() => null);
  await page.waitForTimeout(300);
  await waitAnalytics;
    await expect(async () => {
      const after = await parseIntSafe(totalMetric);
      expect(after).toBeGreaterThanOrEqual(before + 2);
  }).toPass({ timeout: 20000 });
  });
});
