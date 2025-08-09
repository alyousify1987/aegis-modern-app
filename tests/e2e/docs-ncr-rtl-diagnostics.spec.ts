import { test, expect } from '@playwright/test';

async function login(page) {
  await page.goto('/');
  await page.getByLabel('Email Address').fill('admin@aegisaudit.com');
  await page.getByLabel('Password').fill('admin123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible({ timeout: 8000 });
}

test.describe('Documents, NCR, RTL, Diagnostics', () => {
  test('Documents: ingest mock and see it listed', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: 'Documents' }).click();
    await expect(page.getByRole('heading', { name: 'Document Control' })).toBeVisible();
    const before = await page.getByTestId('docs-list').getByRole('listitem').count();
    await page.getByRole('button', { name: 'Ingest Mock' }).click();
    await expect(async () => {
      const after = await page.getByTestId('docs-list').getByRole('listitem').count();
      expect(after).toBeGreaterThanOrEqual(before + 1);
    }).toPass({ timeout: 10_000 });
    await expect(page.getByText(/Quality Manual v1\.pdf/i)).toBeVisible();
  });

  test('NCR: raise mock NCR and see it listed', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: 'NCRs' }).click();
    await expect(page.getByRole('heading', { name: 'Non-Conformance & CAPA' })).toBeVisible();
    const before = await page.getByTestId('ncr-list').getByRole('listitem').count();
    await page.getByRole('button', { name: 'Raise Mock NCR' }).click();
    // Wait for status text to confirm the action completed and UI refreshed
    await expect(page.getByTestId('ncr-status')).toContainText('Raised mock NCR', { timeout: 10_000 });
    await expect(async () => {
      const after = await page.getByTestId('ncr-list').getByRole('listitem').count();
      expect(after).toBeGreaterThanOrEqual(before + 1);
    }).toPass({ timeout: 10_000 });
  await expect(page.getByTestId('ncr-list').getByText('Mock NCR', { exact: false })).toBeVisible();
  });

  test('RTL toggle: switch to Arabic and back', async ({ page }) => {
    await login(page);
  // Open Settings → Language selector
  await page.getByRole('button', { name: /account of current user/i }).click();
  await page.getByRole('menuitem', { name: 'Settings' }).click();
  await page.getByLabel('Language').click();
  // Select Arabic by its localized label
  const arabicOption = page.getByRole('option', { name: 'العربية' });
  await expect(arabicOption).toBeVisible();
  await arabicOption.click();
    await page.waitForTimeout(300); // allow direction to flip
    const dir = await page.evaluate(() => document.documentElement.getAttribute('dir'));
    expect(dir).toBe('rtl');
    // Switch back to English
  await page.getByLabel('Language').click();
  const optionEn = page.getByRole('option', { name: 'English' });
  await expect(optionEn).toBeVisible();
  await optionEn.click();
    await page.waitForTimeout(300);
    const dir2 = await page.evaluate(() => document.documentElement.getAttribute('dir'));
    expect(dir2).toBe('ltr');
  });

  test('Diagnostics: AI Services and Dexie DB tests', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: 'Diagnostics' }).click();
    await expect(page.getByRole('heading', { name: 'Diagnostics' })).toBeVisible();
    // Buttons may be labeled like 'AI Services Test' and 'Dexie DB Test'
    const aiBtn = page.getByRole('button', { name: /AI Services/i });
    if (await aiBtn.isVisible().catch(() => false)) await aiBtn.click();
    const dexieBtn = page.getByRole('button', { name: /Dexie DB/i });
    if (await dexieBtn.isVisible().catch(() => false)) await dexieBtn.click();
    // Ensure no error text appears
    await expect(page.getByText(/error/i).first()).toBeHidden({ timeout: 1000 });
  });
});
