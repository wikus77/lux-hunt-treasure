// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// E2E Tests for Authentication Flow - Critical Flow

import { test, expect } from '@playwright/test';

test.describe('Authentication System', () => {
  test('login page loads correctly', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Check for login form elements
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Accedi")').first();
    
    // At least one of these should exist
    const hasLoginForm = await emailInput.isVisible().catch(() => false) ||
                        await passwordInput.isVisible().catch(() => false) ||
                        await submitButton.isVisible().catch(() => false);
    
    expect(hasLoginForm).toBeTruthy();
  });

  test('register page loads correctly', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    
    // Should have registration form or redirect to auth
    const hasRegisterContent = await page.locator('form, [class*="register"], [class*="Register"]').first().isVisible().catch(() => false);
    const isRedirected = page.url().includes('/login') || page.url().includes('/auth');
    
    expect(hasRegisterContent || isRedirected).toBeTruthy();
  });

  test('protected routes redirect to login', async ({ page }) => {
    // Try accessing protected route without auth
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Should redirect to login or show auth gate
    const isAuthPage = page.url().includes('/login') || 
                       page.url().includes('/auth') || 
                       page.url().includes('/register');
    const hasAuthGate = await page.locator('[class*="auth-gate"], [class*="login"], button:has-text("Accedi")').first().isVisible().catch(() => false);
    
    expect(isAuthPage || hasAuthGate).toBeTruthy();
  });

  test('landing page is accessible without auth', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Landing page should load without redirects
    expect(page.url()).not.toContain('/login');
    
    // Should have main content
    const hasContent = await page.locator('h1, [class*="hero"], [class*="landing"]').first().isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();
  });

  test('settings page requires authentication', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    // Should redirect or show auth requirement
    const needsAuth = page.url().includes('/login') || 
                      page.url().includes('/auth') ||
                      await page.locator('[class*="login"], button:has-text("Accedi")').first().isVisible().catch(() => false);
    
    expect(needsAuth).toBeTruthy();
  });
});

test.describe('Anonymous User Flow', () => {
  test('can access public pages', async ({ page }) => {
    const publicPages = ['/', '/how-it-works', '/contacts'];
    
    for (const pagePath of publicPages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Should not redirect to login
      expect(page.url()).not.toMatch(/\/login$/);
    }
  });
});





