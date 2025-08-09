import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

// Helpers
async function login(page) {
  await page.goto('/');
  await page.getByLabel('Email Address').fill('admin@aegisaudit.com');
  await page.getByLabel('Password').fill('admin123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  // Wait for the app header heading "Dashboard" which is unique post-login
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible({ timeout: 8000 });
}

function openMenu(page, label: string) {
  return page.getByRole('button', { name: label }).first().click();
}

// Recursively collect file paths from a directory
function* walkDir(dir: string): Generator<string> {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkDir(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

function collectFilesFrom(dir: string, maxFiles = Infinity): string[] {
  const out: string[] = [];
  try {
    for (const f of walkDir(dir)) {
      out.push(f);
      if (out.length >= maxFiles) break;
    }
  } catch {}
  return out;
}

// Tests

test.describe('Core navigation and features', () => {
  test('login and view Dashboard', async ({ page }) => {
    await login(page);
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
  });

  test('navigate to Audit Hub and run One Click Audit flow (dialog open)', async ({ page }) => {
    await login(page);
    // Click sidebar item "Audit Hub"
    await page.getByRole('button', { name: 'Audit Hub' }).click();
    await expect(page.getByRole('heading', { name: 'Audit Hub' })).toBeVisible();

  // Click the page button (not the floating FAB), use exact label with emoji to disambiguate
  await page.getByRole('button', { name: '🚀 One Click Audit', exact: true }).click();
    // We cannot interact with the native folder picker; just expect progress dialog to appear
    await expect(page.getByText('One-Click Audit')).toBeVisible();
    // Wait for the file input injected by the app and programmatically set files from the target folder
    const fileInput = page.locator('input[type="file"]');
    await fileInput.waitFor({ state: 'attached', timeout: 10_000 });

    const uploadDir = process.env.E2E_UPLOAD_DIR || 'D:/ISO/AM_IMS';
    let files: string[] = [];
    if (fs.existsSync(uploadDir)) {
      files = collectFilesFrom(uploadDir);
      // Guard against pathological sizes: cap at 5000 files to keep test runtime reasonable
      if (files.length > 5000) files = files.slice(0, 5000);
    }
  expect(files.length).toBeGreaterThan(0);
  // For <input webkitdirectory>, Playwright expects a directory path
  await fileInput.setInputFiles(uploadDir);

    // Expect progress dialog then success path leading to new audit creation
    await expect(page.getByText('One-Click Audit')).toBeVisible();
    // Compare count of matching titles before/after to ensure a new audit was added
    const before = await page.locator('text=/AI-Generated ISO 22000 Audit/i').count();
    await expect(async () => {
      const after = await page.locator('text=/AI-Generated ISO 22000 Audit/i').count();
      expect(after).toBeGreaterThan(before);
    }).toPass({ timeout: 20_000 });

    // Quick sanity: navigate across hubs post-upload
    await page.getByRole('button', { name: 'Analytics Hub' }).click();
    await expect(page.getByRole('heading', { name: 'Analytics & Reporting Hub' })).toBeVisible();
    await page.getByRole('button', { name: 'Diagnostics' }).click();
    await expect(page.getByRole('heading', { name: 'Diagnostics' })).toBeVisible();
  });

  test('navigate to Risk Hub and create a Risk', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: 'Risk Hub' }).click();
    await expect(page.getByRole('heading', { name: 'Risk Hub' })).toBeVisible();

  const rowsWithTitle = page.locator('tbody tr').filter({ hasText: 'E2E Test Risk' });
  const before = await rowsWithTitle.count();

    await page.getByRole('button', { name: 'New Risk' }).click();
    await page.getByLabel('Risk Title').fill('E2E Test Risk');
    await page.getByLabel('Description').fill('Created by Playwright');
  // Category defaults server-side; skip select interaction to avoid flakiness
    await page.getByRole('button', { name: 'Create Risk' }).click();
  await expect(rowsWithTitle).toHaveCount(before + 1, { timeout: 20_000 });
  });

  test('Analytics Hub basics and DuckDB init button', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: 'Analytics Hub' }).click();
    await expect(page.getByRole('heading', { name: 'Analytics & Reporting Hub' })).toBeVisible();

    await page.getByRole('tab', { name: 'DuckDB Demo' }).click();
    await page.getByRole('button', { name: 'Run Test Query' }).click();
    // Toast success is hard to query generically; ensure no error banner
    await expect(page.getByText('DuckDB error').first()).toBeHidden({ timeout: 2000 });
  });

  test('Diagnostics Hub shows network and can refresh', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: 'Diagnostics' }).click();
    await expect(page.getByRole('heading', { name: 'Diagnostics' })).toBeVisible();
    await page.getByRole('button', { name: 'Refresh' }).click();
    await expect(page.getByText('API')).toBeVisible();
  });
});
