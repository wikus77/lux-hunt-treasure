// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// OneSignal Initializer for iOS PWA Push Notifications

import { useEffect } from 'react';
import OneSignal from 'react-onesignal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

const ONESIGNAL_APP_ID = "50cb75f7-f065-4626-9a63-ce5692fa7e70";

export const OneSignalInitializer = () => {
  const { user } = useAuth();

  useEffect(() => {
    const initializeOneSignal = async () => {
      try {
        console.log('🔔 CRITICAL: Initializing OneSignal for M1SSION™...');
        
        // Check if already initialized
        if ((window as any).OneSignalInitialized) {
          console.log('🔔 OneSignal already initialized');
          return;
        }

        // Check if running in production environment
        const isProduction = !import.meta.env.DEV && window.location.hostname !== 'localhost';
        
        if (!isProduction) {
          console.log('🔔 OneSignal skipped in development mode');
          return;
        }

        console.log('🔔 OneSignal production initialization starting...');

        await OneSignal.init({
          appId: ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerPath: '/OneSignalSDKWorker.js',
          serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js'
        });

        (window as any).OneSignalInitialized = true;
        console.log('✅ OneSignal initialized successfully');

        // Auto-register if user is authenticated
        if (user) {
          await registerUserForPushNotifications(user.id);
        }

      } catch (error) {
        console.error('❌ OneSignal initialization failed:', error);
      }
    };

    initializeOneSignal();
  }, [user]);

  return null; // This is a utility component, renders nothing
};

// Function to register user for push notifications
const registerUserForPushNotifications = async (userId: string) => {
  try {
    console.log('🔔 CRITICAL: Attempting to register user for push notifications:', userId);

    if (!(window as any).OneSignalInitialized) {
      console.warn('🔔 OneSignal not initialized yet');
      return;
    }

    // Check current permission status
    const permission = await OneSignal.Notifications.permission;
    console.log('🔔 Current notification permission:', permission);

    if (permission === false) {
      console.log('🔔 Push notifications permission denied');
      toast.error('Notifiche push bloccate. Abilita nelle impostazioni del browser.');
      return;
    }

    // Request permission if not granted
    if (permission !== true) {
      console.log('🔔 Requesting notification permission...');
      
      const isSubscribed = await OneSignal.User.PushSubscription.optedIn;
      if (!isSubscribed) {
        await OneSignal.Notifications.requestPermission();
      }
    }

    // Get the OneSignal Player ID
    const playerId = await OneSignal.User.PushSubscription.id;
    console.log('🔔 CRITICAL: OneSignal Player ID:', playerId);

    if (!playerId) {
      console.error('🔔 CRITICAL: No OneSignal Player ID received');
      toast.error('Errore nella registrazione delle notifiche push');
      return;
    }

    // Save to Supabase device_tokens table
    console.log('🔐 CRITICAL: Saving OneSignal Player ID to database...');
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
      console.error('❌ CRITICAL: Error saving OneSignal Player ID:', error);
      toast.error('Errore nel salvataggio token notifiche');
    } else {
      console.log('✅ CRITICAL: OneSignal Player ID saved successfully:', playerId);
      toast.success('✅ Notifiche push attivate!', {
        description: 'Riceverai aggiornamenti su missioni e premi'
      });
    }

  } catch (error) {
    console.error('❌ CRITICAL: Push registration failed:', error);
    toast.error('Errore nell\'attivazione delle notifiche push');
  }
};

export { registerUserForPushNotifications };