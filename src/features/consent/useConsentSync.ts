// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// @ts-nocheck

import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import type { ConsentData } from './types';
import { getStoredConsent, saveConsent } from './consentStorage';

/**
 * Sync consent preferences across devices via Supabase profiles
 * 
 * Flow:
 * 1. On mount (if authenticated): fetch remote consent, merge with local
 * 2. On consent change: save both locally and remotely
 * 
 * Only runs if user is authenticated.
 */
export function useConsentSync(onConsentChange?: (consent: ConsentData | null) => void) {
  const { user } = useUnifiedAuth();

  // Sync from remote on mount
  useEffect(() => {
    if (!user?.id) return;

    const syncFromRemote = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('cookie_consent')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('[Consent Sync] Failed to fetch remote consent:', error);
          return;
        }

        // Type assertion: cookie_consent column exists but types haven't regenerated yet
        const rawData = data as any;
        const remoteConsent = rawData?.cookie_consent ? (rawData.cookie_consent as unknown as ConsentData) : null;
        if (!remoteConsent) {
          console.info('[Consent Sync] No remote consent found');
          return;
        }

        const localConsent = getStoredConsent();

        // If remote is newer, use it
        if (!localConsent || new Date(remoteConsent.timestamp) > new Date(localConsent.timestamp)) {
          console.info('[Consent Sync] Applying remote consent (newer):', remoteConsent);
          
          // Save locally
          if (remoteConsent.status === 'granular' && remoteConsent.preferences) {
            saveConsent('granular', remoteConsent.preferences);
          } else {
            saveConsent(remoteConsent.status as 'accepted' | 'rejected');
          }

          onConsentChange?.(remoteConsent);
        } else {
          console.info('[Consent Sync] Local consent is newer, keeping it');
        }
      } catch (error) {
        console.error('[Consent Sync] Sync error:', error);
      }
    };

    syncFromRemote();
  }, [user?.id, onConsentChange]);

  return {
    /**
     * Save consent both locally and remotely
     */
    syncConsent: async (consent: ConsentData) => {
      if (!user?.id) {
        console.info('[Consent Sync] Not authenticated, skipping remote save');
        return;
      }

      try {
        const { error } = await supabase
          .from('profiles')
          .update({ cookie_consent: consent as any })
          .eq('id', user.id);

        if (error) {
          console.error('[Consent Sync] Failed to save remote consent:', error);
        } else {
          console.info('[Consent Sync] Saved to remote:', consent);
        }
      } catch (error) {
        console.error('[Consent Sync] Remote save error:', error);
      }
    },
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
