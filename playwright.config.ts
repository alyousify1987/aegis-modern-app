import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// Emulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Provide a default folder of files for the One-Click Audit test if not set by user
const defaultUploadDir = path.resolve(__dirname, 'public');
if (!process.env.E2E_UPLOAD_DIR && fs.existsSync(defaultUploadDir)) {
  process.env.E2E_UPLOAD_DIR = defaultUploadDir;
}

export default defineConfig({
  testDir: 'tests/e2e',
  // Run sequentially to avoid cross-test interference with shared dev API state
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:1420',
    headless: true,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'npm run -s dev:server',
      url: 'http://localhost:3001/health',
      reuseExistingServer: true,
      timeout: 20_000,
    },
    {
      command: 'npm run -s dev:web',
      url: 'http://localhost:1420',
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
