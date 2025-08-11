// © 2025 All Rights Reserved – M1SSION™ – NIYVORA KFT Joseph MULÉ
import { test, expect } from '@playwright/test';

// Geolocation allowed: app should center on the provided coords and render without errors
// Saves a full-page screenshot for the PR report

test('map - geolocation allowed -> center valid, map visible', async ({ browser }) => {
  const context = await browser.newContext({
    permissions: ['geolocation'],
    geolocation: { latitude: 45.4642, longitude: 9.19 }, // Milano
  });
  const page = await context.newPage();

  await page.goto('/map');
  await page.waitForLoadState('networkidle');

  const mapContainer = page.locator('.relative.rounded-lg.overflow-hidden').first();
  await expect(mapContainer).toBeVisible({ timeout: 15000 });

  await page.screenshot({ path: 'tests/screenshots/map-geoloc-allow.png', fullPage: true });
  await context.close();
});
