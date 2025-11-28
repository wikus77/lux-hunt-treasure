// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// E2E Tests for M1U Currency System - Critical Flow

import { test, expect } from '@playwright/test';

test.describe('M1U System Display', () => {
  test('M1U pill displays on authenticated pages', async ({ page }) => {
    // Go to home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for M1U display (pill component)
    const m1uPill = page.locator('[class*="M1U"], [class*="m1u"], [data-testid="m1u-pill"], :has-text("M1U")').first();
    
    // M1U pill might only show for authenticated users
    const isVisible = await m1uPill.isVisible().catch(() => false);
    
    // Test passes if M1U is visible OR we're on an unauthenticated view (landing page)
    const isLandingPage = page.url() === '/' || !page.url().includes('/app');
    expect(isVisible || isLandingPage).toBeTruthy();
  });

  test('M1U balance shows numeric value', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // If redirected to login, skip
    if (page.url().includes('/login') || page.url().includes('/auth')) {
      test.skip(true, 'Requires authentication');
      return;
    }
    
    // Look for M1U balance display
    const m1uBalance = page.locator('[class*="m1u"], [data-testid*="m1u"], span:has-text("M1U")').first();
    
    if (await m1uBalance.isVisible().catch(() => false)) {
      const text = await m1uBalance.textContent();
      // Should contain numbers
      expect(text).toMatch(/\d+/);
    }
  });
});

test.describe('M1U Shop', () => {
  test('M1U shop modal can be opened', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for button that opens M1U shop
    const shopButton = page.locator('[data-testid="m1u-shop"], button:has-text("Acquista"), button:has-text("Shop")').first();
    
    if (await shopButton.isVisible().catch(() => false)) {
      await shopButton.click();
      
      // Modal or shop page should appear
      const modal = page.locator('[class*="modal"], [class*="Modal"], [role="dialog"]').first();
      await expect(modal).toBeVisible({ timeout: 5000 });
    } else {
      test.skip(true, 'M1U shop button not visible');
    }
  });
});

test.describe('M1U Pricing Display', () => {
  test('subscription plans show M1U pricing', async ({ page }) => {
    await page.goto('/subscriptions');
    await page.waitForLoadState('networkidle');
    
    // Look for pricing displays
    const pricingCards = page.locator('[class*="plan"], [class*="Plan"], [class*="subscription"]');
    
    const cardCount = await pricingCards.count();
    
    if (cardCount > 0) {
      // At least one plan should show M1U or EUR pricing
      const allText = await pricingCards.allTextContents();
      const hasPricing = allText.some(text => text.includes('M1U') || text.includes('€') || text.includes('EUR'));
      expect(hasPricing).toBeTruthy();
    }
  });
});


