
import { test, expect } from '@playwright/test';

test('map page should load correctly', async ({ page }) => {
  await page.goto('/map');
  
  // Wait for the page to fully load and map to initialize
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Give extra time for map to load
  
  // Check for map container
  const mapContainer = await page.locator('.rounded-lg.overflow-hidden').first();
  
  // Verify map container is visible
  expect(await mapContainer.isVisible()).toBeTruthy();
  
  // Verify the page title
  const pageTitle = await page.locator('h1.gradient-text-cyan').textContent();
  expect(pageTitle).toContain('MAPPA');
  
  // Verify the footer message
  const footerMessage = await page.locator('.glass-card.mx-4.p-4.text-center').textContent();
  expect(footerMessage).toContain('area stimata');
});
