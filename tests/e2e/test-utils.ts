import { test, expect } from '@playwright/test';

export { test, expect };

// Helper functions for tests
export async function login(page: any) {
  await page.goto('http://localhost:1420/');
  await page.getByLabel('Email Address').fill('admin@aegisaudit.com');
  await page.getByLabel('Password').fill('admin123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  // Wait for dashboard to load
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible({ timeout: 10000 });
}

export function openMenu(page: any, label: string) {
  return page.getByRole('button', { name: label }).first().click();
}

export async function waitForServer() {
  const maxRetries = 10;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const response = await fetch('http://localhost:3001/health');
      if (response.ok) {
        console.log('✅ Server is ready for tests');
        return;
      }
    } catch (error) {
      // Server not ready yet
    }
    retries++;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error('Server failed to become ready for tests');
}
