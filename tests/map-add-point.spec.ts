// © 2025 All Rights Reserved – M1SSION™ – NIYVORA KFT Joseph MULÉ
import { test, expect } from '@playwright/test';

// Add Point flow: toggle "Aggiungi Punto", click on the map → new point popup appears
// Ensures we never access e.latlng.lat directly (no crash) and UI behaves

test('map - add point on click -> no crash, new point popup appears', async ({ page }) => {
  await page.goto('/map');
  await page.waitForLoadState('networkidle');

  // Ensure the sidebar "Punti" tab is active
  const pointsTab = page.getByRole('tab', { name: 'Punti' });
  if (await pointsTab.isVisible()) {
    await pointsTab.click();
  }

  // Click the "Aggiungi Punto" button
  const addPointBtn = page.getByRole('button', { name: /Aggiungi Punto/i });
  await addPointBtn.click();

  // Click somewhere in the map container
  const mapContainer = page.locator('.relative.rounded-lg.overflow-hidden').first();
  await expect(mapContainer).toBeVisible({ timeout: 15000 });
  const box = await mapContainer.boundingBox();
  if (!box) throw new Error('Map container bounding box not found');
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

  // Expect the new point popup with input
  await expect(page.getByPlaceholder('Titolo punto')).toBeVisible({ timeout: 10000 });

  // Screenshot for the report
  await page.screenshot({ path: 'tests/screenshots/map-add-point.png', fullPage: true });
});
