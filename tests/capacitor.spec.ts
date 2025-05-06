
import { test, expect } from '@playwright/test';

// Tests specific to Capacitor mobile functionality
test('mobile-specific features should be available', async ({ page, isMobile }) => {
  // Skip test if not running in mobile mode
  test.skip(!isMobile, 'This test is only relevant for mobile devices');
  
  await page.goto('/');
  
  // Check for bottom navigation which should be present on mobile
  const bottomNav = await page.locator('nav').first();
  expect(await bottomNav.isVisible()).toBeTruthy();
  
  // Test notification permissions (simulated)
  // In a real device we'd test actual permissions, but here we just check the UI
  await page.goto('/settings');
  const notificationToggle = await page.locator('button').filter({ hasText: 'Notifiche push' }).first();
  if (await notificationToggle.isVisible()) {
    await notificationToggle.click();
    // Toggle back
    await notificationToggle.click();
  }
});
