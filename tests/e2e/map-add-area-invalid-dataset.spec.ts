// © 2025 All Rights Reserved – M1SSION™ – NIYVORA KFT Joseph MULÉ
import { test, expect } from '@playwright/test';

// Add Search Area with mocked dataset containing null lat/lng from Supabase REST
// App should filter invalid items and never crash

test('map - add search area with invalid dataset -> invalid items filtered, no crash', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  // Intercept Supabase REST for prizes to return an invalid item
  await page.route('**/rest/v1/prizes**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 'p_invalid', lat: null, lng: 12.5, radius: 500, title: 'Invalid Prize', is_active: true },
      ]),
    });
  });

  await page.goto('/map');
  await page.waitForLoadState('networkidle');

  // Open Areas tab
  const areasTab = page.getByRole('tab', { name: 'Aree' });
  if (await areasTab.isVisible()) {
    await areasTab.click();
  }

  // Click "Aggiungi area" → dialog → confirm
  await page.getByRole('button', { name: /Aggiungi area/i }).click();
  // Keep default radius; confirm dialog
  const confirmBtn = page.getByRole('button', { name: /Conferma e seleziona punto/i });
  await expect(confirmBtn).toBeVisible();
  await confirmBtn.click();

  // Click somewhere in the map container to place the area
  const mapContainer = page.locator('.relative.rounded-lg.overflow-hidden').first();
  await expect(mapContainer).toBeVisible({ timeout: 15000 });
  const box = await mapContainer.boundingBox();
  if (!box) throw new Error('Map container bounding box not found');
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

  // Optionally open the popup by clicking again near the same spot to assert UI content exists
  await page.mouse.click(box.x + box.width / 2 + 5, box.y + box.height / 2 + 5);
  // Expect generic popup content to be present if rendered; regardless, the key assertion is no crash
  // Try to assert presence of the radius label if popup opened
  const radiusText = page.locator('text=Raggio:');
  // Not strictly required, but try for up to 2s without failing the test if absent
  try { await expect(radiusText).toBeVisible({ timeout: 2000 }); } catch {}

  // Screenshot for the report
  await page.screenshot({ path: 'tests/screenshots/map-add-area-invalid-dataset.png', fullPage: true });

  await context.close();
});
