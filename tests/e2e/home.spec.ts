
import { test, expect } from '@playwright/test';

test('home page should load correctly', async ({ page }) => {
  await page.goto('/');
  
  // Wait for the page to fully load
  await page.waitForLoadState('networkidle');
  
  // Check for key elements that should be present on home page
  const title = await page.locator('h1').first();
  
  // Verify page loaded correctly
  expect(await title.isVisible()).toBeTruthy();
});
