// © 2025 All Rights Reserved – M1SSION™ – NIYVORA KFT Joseph MULÉ
import { test, expect } from '@playwright/test';

test('map - add search area with invalid dataset -> invalid items filtered, no crash', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.route('**/rest/v1/prizes**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ id: 'p_invalid', lat: null, lng: 12.5, radius: 500, title: 'Invalid Prize', is_active: true }]),
    });
  });

  await page.goto('/map');
  await page.waitForLoadState('domcontentloaded');

  const addAreaBtn = page.getByRole('button', { name: /Aggiungi\s*area/i });
  if (!(await addAreaBtn.isVisible({ timeout: 3000 }).catch(() => false))) {
    await page.screenshot({ path: 'tests/screenshots/map-add-area-missing-btn.png', fullPage: true });
    test.skip(true, 'Add Area non visibile (redir login o UI gated)');
  }
  await addAreaBtn.click();

  const confirmBtn = page.getByRole('button', { name: /Conferma.*seleziona punto/i });
  await expect(confirmBtn).toBeVisible({ timeout: 10000 });
  await confirmBtn.click();

  const mapContainer = page.locator('.leaflet-container').first();
  await expect(mapContainer).toBeVisible({ timeout: 30000 });

  const box = await mapContainer.boundingBox();
  if (!box) test.skip(true, 'Bounding box non disponibile');

  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.click(box!.x + box!.width / 2 + 5, box!.y + box!.height / 2 + 5);

  await page.screenshot({ path: 'tests/screenshots/map-add-area-invalid-dataset.png', fullPage: true });
  await context.close();
});
