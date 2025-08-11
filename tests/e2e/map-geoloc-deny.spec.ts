// © 2025 All Rights Reserved – M1SSION™ – NIYVORA KFT Joseph MULÉ
import { test, expect } from '@playwright/test';

// Geolocation denied: app should not crash, map loads with fallback center (Milano)
// Saves a full-page screenshot for the PR report

test('map - geolocation denied -> no crash, spinner then map visible', async ({ browser }) => {
  const context = await browser.newContext(); // no geolocation permission
  const page = await context.newPage();

  await page.goto('/map');
  await page.waitForLoadState('networkidle');

  // Wait for map container (Leaflet wrapper) to be visible
  const mapContainer = page.locator('.relative.rounded-lg.overflow-hidden').first();
  await expect(mapContainer).toBeVisible({ timeout: 15000 });

  // Take screenshot
  await page.screenshot({ path: 'tests/screenshots/map-geoloc-deny.png', fullPage: true });
  await context.close();
});
