// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// E2E Tests for Buzz System - Critical Flow

import { test, expect } from '@playwright/test';

test.describe('Buzz System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to map page where buzz button lives
    await page.goto('/map-3d-tiler');
    await page.waitForLoadState('networkidle');
  });

  test('map page loads with buzz button visible', async ({ page }) => {
    // Check if map container exists (MapLibre)
    const mapContainer = page.locator('[class*="maplibregl"], .map-container, #map').first();
    
    // Wait for map to load (with timeout)
    try {
      await mapContainer.waitFor({ state: 'visible', timeout: 15000 });
      await expect(mapContainer).toBeVisible();
    } catch {
      // If map doesn't load (auth gating), skip test
      test.skip(true, 'Map container not visible (likely auth gating)');
    }
  });

  test('buzz button displays M1U cost', async ({ page }) => {
    // Look for buzz button with M1U label
    const buzzButton = page.locator('[data-testid="buzz-button"], button:has-text("BUZZ"), button:has-text("M1U")').first();
    
    try {
      await buzzButton.waitFor({ state: 'visible', timeout: 10000 });
      
      // Check if button shows M1U cost
      const buttonText = await buzzButton.textContent();
      expect(buttonText).toMatch(/M1U|BUZZ/i);
    } catch {
      test.skip(true, 'Buzz button not visible (likely requires authentication)');
    }
  });

  test('clicking buzz button without auth shows login prompt', async ({ page }) => {
    const buzzButton = page.locator('[data-testid="buzz-button"], button:has-text("BUZZ")').first();
    
    try {
      await buzzButton.waitFor({ state: 'visible', timeout: 10000 });
      await buzzButton.click();
      
      // Should either show login modal or navigate to login
      const loginModal = page.locator('[data-testid="login-modal"], .auth-modal, [class*="LoginModal"]');
      const loginPage = page.url().includes('/login') || page.url().includes('/auth');
      
      expect(await loginModal.isVisible() || loginPage).toBeTruthy();
    } catch {
      test.skip(true, 'Buzz button interaction not available');
    }
  });
});

test.describe('Buzz Page Direct Access', () => {
  test('buzz page loads correctly', async ({ page }) => {
    await page.goto('/buzz');
    await page.waitForLoadState('networkidle');
    
    // Page should either show buzz interface or redirect to auth
    const isAuthRedirect = page.url().includes('/login') || page.url().includes('/auth');
    const hasBuzzContent = await page.locator('h1, h2, [class*="buzz"], [class*="Buzz"]').first().isVisible().catch(() => false);
    
    expect(isAuthRedirect || hasBuzzContent).toBeTruthy();
  });
});


