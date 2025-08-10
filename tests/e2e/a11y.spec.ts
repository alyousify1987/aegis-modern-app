import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('a11y smoke', () => {
  test('dashboard has no critical violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze();
    const critical = results.violations.filter(v => (v.impact || '').toLowerCase() === 'critical');
    expect(critical, JSON.stringify(critical, null, 2)).toHaveLength(0);
  });
});
