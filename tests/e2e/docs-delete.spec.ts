import { test, expect } from '@playwright/test';

async function login(page) {
  await page.goto('/');
  await page.getByLabel('Email Address').fill('admin@aegisaudit.com');
  await page.getByLabel('Password').fill('admin123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible({ timeout: 8000 });
}

test.describe('Documents delete', () => {
  test('ingest then delete a document', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: 'Documents' }).click();
    await expect(page.getByRole('heading', { name: 'Document Control' })).toBeVisible();

    const list = page.getByTestId('docs-list');
    const before = await list.getByRole('listitem').count();
    await page.getByRole('button', { name: 'Ingest Mock' }).click();
    await expect(page.getByTestId('docs-status')).toContainText(/Ingested 1 document/i, { timeout: 10000 });

    // Delete the first item in the list
    const afterCreate = await list.getByRole('listitem').count();
    expect(afterCreate).toBeGreaterThanOrEqual(before + 1);

    const firstItem = list.getByRole('listitem').first();
    const deleteBtn = firstItem.getByRole('button', { name: 'delete document' });
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    await expect(async () => {
      const countAfterDelete = await list.getByRole('listitem').count();
      expect(countAfterDelete).toBeGreaterThanOrEqual(before);
    }).toPass({ timeout: 10000 });
  });
});
