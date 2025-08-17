// © 2025 M1SSION™ – Joseph MULÉ – NIYVORA KFT
// E2E Test: Marker Claim Flow

import { test, expect } from '@playwright/test';

test.describe('Marker Claim Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login with test user
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@m1ssion.eu');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/home');
  });

  test('should open popup when clicking marker', async ({ page }) => {
    await page.goto('/map');
    
    // Wait for map to load
    await page.waitForSelector('.leaflet-container');
    
    // Click on a marker (assuming test marker exists)
    await page.click('.qr-marker');
    
    // Check popup opens
    await expect(page.locator('.leaflet-popup')).toBeVisible();
    await expect(page.locator('text=M1SSION™')).toBeVisible();
    await expect(page.getByTestId('claim-reward-cta')).toBeVisible();
  });

  test('should claim reward successfully', async ({ page }) => {
    await page.goto('/map');
    
    // Click marker and open modal
    await page.click('.qr-marker');
    
    // Wait for CTA button
    const claimButton = page.locator('[data-testid="claim-reward-cta"]');
    await expect(claimButton).toBeVisible();
    await expect(claimButton).toHaveText('Riscatta');
    
    // Mock successful claim response
    await page.route('**/functions/v1/claim-marker-reward', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, nextRoute: '/buzz' })
      });
    });
    
    // Click claim button
    await claimButton.click();
    
    // Verify redirect to buzz page
    await page.waitForURL('/buzz');
  });

  test('should handle already claimed scenario', async ({ page }) => {
    await page.goto('/map');
    
    // Click marker
    await page.click('.qr-marker');
    
    // Mock already claimed response
    await page.route('**/functions/v1/claim-marker-reward', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, code: 'ALREADY_CLAIMED' })
      });
    });
    
    // Click claim button
    await page.click('[data-testid="claim-reward-cta"]');
    
    // Verify toast message
    await expect(page.locator('text=Premio già riscattato')).toBeVisible();
  });

  test('should handle unauthorized scenario', async ({ page }) => {
    // Logout first
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    await page.goto('/map');
    
    // Should redirect to login
    await page.waitForURL('/login');
  });
});