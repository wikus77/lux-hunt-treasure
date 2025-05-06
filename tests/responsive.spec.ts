
import { test, expect } from '@playwright/test';
import { devices } from './utils/devices';

for (const device of devices) {
  test(`should render correctly on ${device.name}`, async ({ browser }) => {
    // Create a new context with the device's viewport size
    const context = await browser.newContext({
      viewport: {
        width: device.width,
        height: device.height
      }
    });
    
    const page = await context.newPage();
    await page.goto('/');
    
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check that navigation exists - should be bottom navigation on small screens
    const navigation = device.width < 768
      ? await page.locator('nav').filter({ hasText: 'Home' }).first()
      : await page.locator('header').first();
    
    expect(await navigation.isVisible()).toBeTruthy();
    
    // Take a screenshot for visual verification
    await page.screenshot({ path: `./test-results/${device.name.replace(/\s+/g, '-').toLowerCase()}.png` });
    
    await context.close();
  });
}
