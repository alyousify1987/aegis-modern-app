import { test, expect } from '@playwright/test';

async function login(page) {
  await page.goto('/');
  await page.getByLabel('Email Address').fill('admin@aegisaudit.com');
  await page.getByLabel('Password').fill('admin123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible({ timeout: 8000 });
}

test.describe('Risk edit flow', () => {
  test('create then edit a risk title', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: 'Risk Hub' }).click();
    await expect(page.getByRole('heading', { name: 'Risk Hub' })).toBeVisible();

    // Create
    const before = await page.locator('tbody tr').count();
    await page.getByRole('button', { name: 'New Risk' }).click();
    await expect(page.getByRole('dialog', { name: 'Create New Risk' })).toBeVisible();
    await page.getByLabel('Risk Title').fill('E2E Edit Risk');
    await page.getByLabel('Description').fill('E2E description');
    await page.getByRole('button', { name: 'Create Risk' }).click();

    await expect(async () => {
      const after = await page.locator('tbody tr').count();
      expect(after).toBeGreaterThanOrEqual(before + 1);
    }).toPass({ timeout: 10000 });

    // Edit first row
    const firstRow = page.locator('tbody tr').first();
    await firstRow.getByRole('button', { name: 'edit' }).click();
    await expect(page.getByRole('dialog', { name: 'Edit Risk' })).toBeVisible();
    await page.getByLabel('Risk Title').fill('E2E Edit Risk UPDATED');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(firstRow.getByText('E2E Edit Risk UPDATED')).toBeVisible({ timeout: 10000 });
  });
});
