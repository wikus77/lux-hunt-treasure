import { test, expect } from '@playwright/test';
import { viewports } from './utils/devices';

for (const [name, viewport] of Object.entries(viewports)) {
  test(`responsive - ${name}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Fai un check minimale che la home si carichi
    await expect(page.locator('body')).toBeVisible();

    await context.close();
  });
}
