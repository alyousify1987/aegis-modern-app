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

    // Go to Analytics first and capture the initial total
    await page.getByRole('button', { name: 'Analytics Hub' }).click();
    await expect(page.getByRole('heading', { name: 'Analytics & Reporting Hub' })).toBeVisible();
    const parseIntSafe = async (locator) => parseInt(((await locator.textContent()) || '').replace(/[^0-9]/g,'') || '0', 10);
    const totalBefore = await parseIntSafe(page.getByTestId('metric-total-value'));

    // Create via Audit Hub One-Click (we trigger UI; server creates immediately)
    await page.getByRole('button', { name: 'Audit Hub' }).click();
    await expect(page.getByRole('heading', { name: 'Audit Hub' })).toBeVisible();
    await page.getByRole('button', { name: '🚀 One Click Audit', exact: true }).click();

    // Wait for dialog, then allow progress to complete
    await expect(page.getByText('One-Click Audit')).toBeVisible();
    await page.waitForTimeout(500);

    // Navigate to Analytics and verify the total increased by at least 1
    await page.getByRole('button', { name: 'Analytics Hub' }).click();
    await expect(page.getByRole('heading', { name: 'Analytics & Reporting Hub' })).toBeVisible();
    await expect(async () => {
      const totalAfter = await parseIntSafe(page.getByTestId('metric-total-value'));
      expect(totalAfter).toBeGreaterThanOrEqual(totalBefore + 1);
    }).toPass({ timeout: 20_000 });
  });
});
