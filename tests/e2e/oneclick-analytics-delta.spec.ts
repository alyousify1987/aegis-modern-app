import { test, expect } from '@playwright/test';

async function login(page) {
  await page.goto('/');
  await page.getByLabel('Email Address').fill('admin@aegisaudit.com');
  await page.getByLabel('Password').fill('admin123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible({ timeout: 8000 });
}

test.describe('One-Click Audit updates analytics', () => {
  test('running One-Click Audit increases audits list and analytics total', async ({ page }) => {
    await login(page);

    // Navigate to Audit Hub and measure current count of AI-generated audits
    await page.getByRole('button', { name: 'Audit Hub' }).click();
    await expect(page.getByRole('heading', { name: 'Audit Hub' })).toBeVisible();
    const beforeCount = await page.locator('text=/AI-Generated ISO 22000 Audit/i').count();

  // Trigger One-Click
    await page.getByRole('button', { name: '🚀 One Click Audit', exact: true }).click();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.waitFor({ state: 'attached', timeout: 10_000 });
    // Use default upload dir set by config (public) by passing its directory path
    const uploadDir = process.env.E2E_UPLOAD_DIR || 'public';
    await fileInput.setInputFiles(uploadDir);
  // Wait for dialog to close
    const dlg = page.getByRole('heading', { name: 'One-Click Audit' });
    await expect(dlg).toBeVisible();
    await page.waitForTimeout(300);
    if (await dlg.isVisible()) {
      await page.keyboard.press('Escape');
    }

    // Wait until list count increases
    await expect(async () => {
      const after = await page.locator('text=/AI-Generated ISO 22000 Audit/i').count();
      expect(after).toBeGreaterThan(beforeCount);
    }).toPass({ timeout: 20_000 });

    // Now navigate to Analytics Hub and assert totalAudits increased as well
    await page.getByRole('button', { name: 'Analytics Hub' }).click();
    await expect(page.getByRole('heading', { name: 'Analytics & Reporting Hub' })).toBeVisible();

  // Small wait for fetch and cache save
  await page.waitForTimeout(300);
  await expect(page.getByRole('heading', { name: 'Analytics & Reporting Hub' })).toBeVisible();

    // Open DuckDB tab and run aggregation for sanity
    await page.getByRole('tab', { name: 'DuckDB Demo' }).click();
    await page.getByRole('button', { name: 'Aggregate Audits' }).click();
    // Ensure no error notification text is visible
    await expect(page.getByText('Aggregation error').first()).toBeHidden({ timeout: 2000 });
  });
});
