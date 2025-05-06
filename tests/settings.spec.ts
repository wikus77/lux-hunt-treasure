
import { test, expect } from '@playwright/test';

test('settings page should load correctly', async ({ page }) => {
  await page.goto('/settings');
  
  // Wait for the page to fully load
  await page.waitForLoadState('networkidle');
  
  // Check for settings sections
  const accountSection = await page.getByText('Impostazioni account').first();
  const appSection = await page.getByText('Impostazioni app').first();
  const notificationSection = await page.getByText('Notifiche').first();
  
  // Verify sections are visible
  expect(await accountSection.isVisible()).toBeTruthy();
  expect(await appSection.isVisible()).toBeTruthy();
  expect(await notificationSection.isVisible()).toBeTruthy();
  
  // Test toggling a setting
  const soundToggle = await page.locator('button').filter({ hasText: 'Effetti sonori' }).first();
  await soundToggle.click();
  
  // Test language selection if available
  const languageSelector = await page.locator('div').filter({ hasText: 'Lingua' }).first();
  if (await languageSelector.isVisible()) {
    await languageSelector.click();
    const italianOption = await page.getByText('Italiano').first();
    await italianOption.click();
  }
});
