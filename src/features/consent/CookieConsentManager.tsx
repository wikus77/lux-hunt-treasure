// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect, useCallback } from 'react';
import { CookieBanner } from './CookieBanner';
import { PreferencesModal } from './PreferencesModal';
import { getStoredConsent, saveConsent, getEffectivePreferences } from './consentStorage';
import { useConsentSync } from './useConsentSync';
import type { ConsentData, ConsentPreferences } from './types';

/**
 * Cookie Consent Manager - Singleton component
 * 
 * Responsibilities:
 * - Show banner only if no consent decision exists
 * - Persist consent to localStorage (and optionally Supabase)
 * - Expose window.__consent API for reopening preferences
 * - Respect DNA Manager priority (delay if modal is open)
 * 
 * Mounting: Add to App.tsx just below AuthProvider
 */
export const CookieConsentManager: React.FC = () => {
  const [consent, setConsent] = useState<ConsentData | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { syncConsent } = useConsentSync((remoteConsent) => {
    setConsent(remoteConsent);
  });

  // Initialize: check for existing consent
  useEffect(() => {
    const initConsent = async () => {
      // Wait a bit for DNA Manager to initialize (if present)
      await new Promise(resolve => {
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(resolve);
        } else {
          setTimeout(resolve, 500);
        }
      });

      const stored = getStoredConsent();
      setConsent(stored);
      setIsInitialized(true);

      // Show banner only if no decision exists
      if (!stored) {
        setShowBanner(true);
      }
    };

    initConsent();
  }, []);

  // Expose global API
  useEffect(() => {
    if (!isInitialized) return;

    window.__consent = {
      open: () => {
        setShowPreferences(true);
      },
      getConsent: () => consent,
      getPreferences: () => getEffectivePreferences(consent),
    };

    console.info('[Consent] Global API exposed: window.__consent');

    return () => {
      delete window.__consent;
    };
  }, [isInitialized, consent]);

  const handleAcceptAll = useCallback(async () => {
    const newConsent: ConsentData = {
      status: 'accepted',
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    saveConsent('accepted');
    setConsent(newConsent);
    setShowBanner(false);

    // Sync to backend if authenticated
    await syncConsent(newConsent);
  }, [syncConsent]);

  const handleRejectAll = useCallback(async () => {
    const newConsent: ConsentData = {
      status: 'rejected',
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    saveConsent('rejected');
    setConsent(newConsent);
    setShowBanner(false);

    // Sync to backend if authenticated
    await syncConsent(newConsent);
  }, [syncConsent]);

  const handleManagePreferences = useCallback(() => {
    setShowBanner(false);
    setShowPreferences(true);
  }, []);

  const handleSavePreferences = useCallback(async (preferences: ConsentPreferences) => {
    const newConsent: ConsentData = {
      status: 'granular',
      timestamp: new Date().toISOString(),
      preferences,
      version: '1.0',
    };

    saveConsent('granular', preferences);
    setConsent(newConsent);
    setShowPreferences(false);

    // Sync to backend if authenticated
    await syncConsent(newConsent);
  }, [syncConsent]);

  if (!isInitialized) {
    return null;
  }

  return (
    <>
      <CookieBanner
        isVisible={showBanner}
        onAcceptAll={handleAcceptAll}
        onRejectAll={handleRejectAll}
        onManagePreferences={handleManagePreferences}
      />

      <PreferencesModal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        onSave={handleSavePreferences}
        initialPreferences={consent?.preferences}
      />
    </>
  );
};

// Global API type declaration
declare global {
  interface Window {
    __consent?: {
      open: () => void;
      getConsent: () => ConsentData | null;
      getPreferences: () => ConsentPreferences;
    };
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
