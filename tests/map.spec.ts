
import { test, expect } from '@playwright/test';

test('map page should load correctly', async ({ page }) => {
  await page.goto('/map');
  
  // Wait for the page to fully load and map to initialize
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Give extra time for map to load
  
  // Check for map container
  const mapContainer = await page.locator('.w-full.h-[60vh]').first();
  
  // Verify map container is visible
  expect(await mapContainer.isVisible()).toBeTruthy();
  
  // Test map controls if available
  const mapControls = await page.locator('button').filter({ hasText: 'Aggiungi' }).first();
  if (await mapControls.isVisible()) {
    await mapControls.click();
    
    // Close any dialogs that might have opened
    const closeButton = await page.locator('button').filter({ hasText: 'Chiudi' }).first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }
});
