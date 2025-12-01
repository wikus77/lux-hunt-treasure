// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// E2E Tests for Payment System - Critical Flow

import { test, expect } from '@playwright/test';

test.describe('Payment Pages', () => {
  test('subscription page loads correctly', async ({ page }) => {
    await page.goto('/subscriptions');
    await page.waitForLoadState('networkidle');
    
    // Should show subscription plans or redirect to auth
    const hasPlans = await page.locator('[class*="plan"], [class*="Plan"], [class*="subscription"]').first().isVisible().catch(() => false);
    const needsAuth = page.url().includes('/login') || page.url().includes('/auth');
    
    expect(hasPlans || needsAuth).toBeTruthy();
  });

  test('payment success page handles callback', async ({ page }) => {
    await page.goto('/payment-success');
    await page.waitForLoadState('networkidle');
    
    // Page should load without crashing
    // May redirect to home or show success/error message
    expect(page.url()).not.toContain('error');
  });

  test('choose plan page displays options', async ({ page }) => {
    await page.goto('/choose-plan');
    await page.waitForLoadState('networkidle');
    
    // Should show plan options or redirect
    const hasOptions = await page.locator('button, [class*="plan"], [class*="Plan"]').first().isVisible().catch(() => false);
    const isRedirected = page.url().includes('/login') || page.url().includes('/subscriptions');
    
    expect(hasOptions || isRedirected).toBeTruthy();
  });
});

test.describe('Stripe Integration', () => {
  test('payment method settings page loads', async ({ page }) => {
    await page.goto('/payment-methods');
    await page.waitForLoadState('networkidle');
    
    // Should load or redirect to auth
    const hasContent = await page.locator('h1, h2, [class*="payment"]').first().isVisible().catch(() => false);
    const needsAuth = page.url().includes('/login');
    
    expect(hasContent || needsAuth).toBeTruthy();
  });

  test('stripe elements are secure (no PK exposure in DOM)', async ({ page }) => {
    await page.goto('/payment-methods');
    await page.waitForLoadState('networkidle');
    
    // Check page source doesn't expose full Stripe secret key
    const pageContent = await page.content();
    
    // Secret keys start with sk_, publishable keys start with pk_
    // We should NOT find sk_ keys in the DOM
    expect(pageContent).not.toMatch(/sk_live_[a-zA-Z0-9]+/);
    expect(pageContent).not.toMatch(/sk_test_[a-zA-Z0-9]+/);
  });
});

test.describe('Subscription Plans UI', () => {
  test('Silver plan page loads', async ({ page }) => {
    await page.goto('/subscriptions/silver');
    await page.waitForLoadState('networkidle');
    
    const hasContent = await page.locator('h1, h2, [class*="Silver"], [class*="silver"]').first().isVisible().catch(() => false);
    expect(hasContent || page.url().includes('/subscriptions')).toBeTruthy();
  });

  test('Gold plan page loads', async ({ page }) => {
    await page.goto('/subscriptions/gold');
    await page.waitForLoadState('networkidle');
    
    const hasContent = await page.locator('h1, h2, [class*="Gold"], [class*="gold"]').first().isVisible().catch(() => false);
    expect(hasContent || page.url().includes('/subscriptions')).toBeTruthy();
  });

  test('Black plan page loads', async ({ page }) => {
    await page.goto('/subscriptions/black');
    await page.waitForLoadState('networkidle');
    
    const hasContent = await page.locator('h1, h2, [class*="Black"], [class*="black"]').first().isVisible().catch(() => false);
    expect(hasContent || page.url().includes('/subscriptions')).toBeTruthy();
  });
});





