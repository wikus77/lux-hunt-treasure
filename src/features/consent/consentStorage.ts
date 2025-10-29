// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import type { ConsentData, ConsentPreferences } from './types';
import { CONSENT_STORAGE_KEY, CONSENT_TTL_DAYS, DEFAULT_PREFERENCES } from './types';

/**
 * Get stored consent data from localStorage
 */
export function getStoredConsent(): ConsentData | null {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return null;

    const data: ConsentData = JSON.parse(stored);
    
    // Check if consent has expired (if TTL is set)
    if (CONSENT_TTL_DAYS) {
      const timestamp = new Date(data.timestamp);
      const now = new Date();
      const daysSince = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSince > CONSENT_TTL_DAYS) {
        // Expired, clear it
        localStorage.removeItem(CONSENT_STORAGE_KEY);
        return null;
      }
    }

    return data;
  } catch (error) {
    console.error('[Consent] Failed to read stored consent:', error);
    return null;
  }
}

/**
 * Save consent data to localStorage
 */
export function saveConsent(status: 'accepted' | 'rejected' | 'granular', preferences?: ConsentPreferences): void {
  try {
    const data: ConsentData = {
      status,
      timestamp: new Date().toISOString(),
      preferences: status === 'granular' ? preferences : undefined,
      version: '1.0',
    };

    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(data));
    
    // Apply script loading based on consent
    applyConsentToScripts(data);
    
    console.info('[Consent] Saved:', data);
  } catch (error) {
    console.error('[Consent] Failed to save consent:', error);
  }
}

/**
 * Clear stored consent (for testing or user revocation)
 */
export function clearConsent(): void {
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    console.info('[Consent] Cleared');
  } catch (error) {
    console.error('[Consent] Failed to clear consent:', error);
  }
}

/**
 * Apply consent preferences to script loading
 */
function applyConsentToScripts(consent: ConsentData): void {
  const shouldLoadAnalytics = 
    consent.status === 'accepted' || 
    (consent.status === 'granular' && consent.preferences?.analytics);
  
  const shouldLoadMarketing = 
    consent.status === 'accepted' || 
    (consent.status === 'granular' && consent.preferences?.marketing);

  // Load analytics scripts if consented
  if (shouldLoadAnalytics) {
    loadAnalyticsScripts();
  }

  // Load marketing scripts if consented
  if (shouldLoadMarketing) {
    loadMarketingScripts();
  }

  console.info('[Consent] Scripts applied:', {
    analytics: shouldLoadAnalytics,
    marketing: shouldLoadMarketing,
  });
}

/**
 * Load analytics scripts (Google Analytics, etc.)
 */
function loadAnalyticsScripts(): void {
  // Example: Google Analytics
  // Uncomment and configure when needed
  /*
  if (!document.querySelector('script[src*="googletagmanager"]')) {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
  }
  */
  console.info('[Consent] Analytics scripts loaded');
}

/**
 * Load marketing scripts (Facebook Pixel, etc.)
 */
function loadMarketingScripts(): void {
  // Example: Facebook Pixel
  // Uncomment and configure when needed
  /*
  if (!document.querySelector('script[src*="connect.facebook.net"]')) {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);

    window.fbq = function(...args: any[]) {
      window.fbq.queue.push(args);
    };
    window.fbq.queue = [];
    window.fbq('init', 'FB_PIXEL_ID');
    window.fbq('track', 'PageView');
  }
  */
  console.info('[Consent] Marketing scripts loaded');
}

/**
 * Get effective preferences from consent data
 */
export function getEffectivePreferences(consent: ConsentData | null): ConsentPreferences {
  if (!consent) return DEFAULT_PREFERENCES;

  if (consent.status === 'accepted') {
    return {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
    };
  }

  if (consent.status === 'rejected') {
    return DEFAULT_PREFERENCES;
  }

  if (consent.status === 'granular' && consent.preferences) {
    return {
      ...DEFAULT_PREFERENCES,
      ...consent.preferences,
      necessary: true, // Always true
    };
  }

  return DEFAULT_PREFERENCES;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
