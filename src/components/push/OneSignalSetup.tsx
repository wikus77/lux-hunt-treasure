/**
 * © 2025 Joseph MULÉ – M1SSION™ – OneSignal Push Notifications Setup
 * PWA-optimized OneSignal integration for iOS/Android compatibility
 */

import { useEffect } from 'react';
import OneSignal from 'react-onesignal';
import { supabase } from '@/integrations/supabase/client';

const ONESIGNAL_APP_ID = "50cb75f7-f065-4626-9a63-ce5692fa7e70";

interface OneSignalSetupProps {
  userId?: string;
}

// Save OneSignal Player ID to Supabase
const savePlayerIdToSupabase = async (playerId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('device_tokens')
      .upsert({
        user_id: userId,
        token: playerId,
        device_type: 'onesignal',
        last_used: new Date().toISOString(),
        created_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,device_type'
      });
      
    if (error) {
      console.error('❌ Error saving OneSignal Player ID:', error);
    } else {
      console.log('✅ OneSignal Player ID saved to Supabase:', playerId);
    }
  } catch (error) {
    console.error('❌ Error in savePlayerIdToSupabase:', error);
  }
};

export const OneSignalSetup = ({ userId }: OneSignalSetupProps) => {
  useEffect(() => {
    const initializeOneSignal = async () => {
      try {
        // Prevent double initialization
        if ((window as any).OneSignalInitialized) {
          console.log('🔔 OneSignal already initialized, skipping...');
          return;
        }

        console.log('🔔 Initializing OneSignal for M1SSION™...');
        
        // Initialize OneSignal with simplified config
        await OneSignal.init({
          appId: ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerPath: '/OneSignalSDKWorker.js',
          serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js'
        });

        (window as any).OneSignalInitialized = true;

        console.log('✅ OneSignal initialized successfully');

        // Set user ID if available  
        if (userId) {
          try {
            await OneSignal.login(userId);
            console.log('✅ OneSignal user ID set:', userId);
          } catch (error) {
            console.warn('⚠️ OneSignal login failed:', error);
          }
        }

        // Get current subscription status and save player ID
        try {
          const isSubscribed = await OneSignal.User.PushSubscription.optedIn;
          console.log('🔔 OneSignal current subscription status:', isSubscribed);
          
          if (isSubscribed) {
            const playerId = await OneSignal.User.PushSubscription.id;
            if (playerId && userId) {
              console.log('💾 Saving OneSignal Player ID:', playerId);
              await savePlayerIdToSupabase(playerId, userId);
            }
          }
        } catch (error) {
          console.warn('⚠️ Could not check OneSignal subscription status:', error);
        }

      } catch (error) {
        console.error('❌ OneSignal initialization failed:', error);
      }
    };

    // Only initialize if we're in a browser environment
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      initializeOneSignal();
    }
  }, [userId]);

  // Utility function to request notification permission
  const requestNotificationPermission = async () => {
    try {
      console.log('🔔 Requesting OneSignal notification permission...');
      const permission = await OneSignal.Notifications.requestPermission();
      console.log('🔔 OneSignal permission result:', permission);
      return permission;
    } catch (error) {
      console.error('❌ OneSignal permission request failed:', error);
      return false;
    }
  };

  // Utility function to send a tag
  const sendTag = async (key: string, value: string) => {
    try {
      OneSignal.User.addTag(key, value);
      console.log('🔔 OneSignal tag sent:', { key, value });
    } catch (error) {
      console.error('❌ OneSignal tag send failed:', error);
    }
  };

  // Expose utility functions to window for testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).OneSignalUtils = {
        requestPermission: requestNotificationPermission,
        sendTag: sendTag,
        getPlayerId: async () => {
          try {
            return OneSignal.User.PushSubscription.id || null;
          } catch (error) {
            console.error('❌ Error getting OneSignal Player ID:', error);
            return null;
          }
        },
        isSubscribed: async () => {
          try {
            return OneSignal.User.PushSubscription.optedIn || false;
          } catch (error) {
            console.error('❌ Error checking OneSignal subscription:', error);
            return false;
          }
        }
      };
    }
  }, []);

  return null; // This component doesn't render anything
};

export default OneSignalSetup;