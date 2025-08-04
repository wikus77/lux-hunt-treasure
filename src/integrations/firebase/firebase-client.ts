
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { getFirebaseConfig } from './firebase-config';
import { supabase } from '@/integrations/supabase/client';

// Initialize Firebase with dynamic config
let app: any = null;
let messaging: any = null;

// Check if Firebase Messaging is supported
const isFCMSupported = async () => {
  try {
    return await isSupported();
  } catch (error) {
    console.error('FCM support check failed:', error);
    return false;
  }
};

// Get Firebase Messaging instance if supported
export const getMessagingInstance = async () => {
  if (await isFCMSupported()) {
    try {
      // Initialize Firebase app with dynamic config if not already done
      if (!app) {
        const config = await getFirebaseConfig();
        app = initializeApp(config);
        console.log('✅ Firebase app initialized with dynamic config');
      }
      
      if (!messaging) {
        messaging = getMessaging(app);
        console.log('✅ Firebase messaging instance created');
      }
      
      return messaging;
    } catch (error) {
      console.error('Failed to get messaging instance:', error);
      return null;
    }
  }
  return null;
};

// Request permission and get token
export const requestNotificationPermission = async () => {
  try {
    // Check if the browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return { success: false, reason: 'browser-not-supported' };
    }

    // Check if permission is already granted
    if (Notification.permission === 'granted') {
      return await registerDeviceForNotifications();
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      return await registerDeviceForNotifications();
    } else {
      return { 
        success: false, 
        reason: permission === 'denied' ? 'permission-denied' : 'permission-default' 
      };
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return { success: false, reason: 'error', error };
  }
};

// Return type for registerDeviceForNotifications
interface RegistrationResult {
  success: boolean;
  token?: string;
  reason?: string;
  error?: any;
}

// ✅ CRITICAL FIX: Simplified and corrected token registration
export const registerDeviceForNotifications = async (): Promise<RegistrationResult> => {
  try {
    console.log('🔄 Starting FCM token registration for notifications...');
    
    // ✅ Step 1: Check Firebase messaging support
    const messaging = await getMessagingInstance();
    if (!messaging) {
      console.error('❌ Firebase messaging not supported on this browser');
      return { success: false, reason: 'messaging-not-supported' };
    }

    console.log('✅ Firebase messaging instance ready');

    // ✅ Step 2: Check Service Worker registration 
    if (!('serviceWorker' in navigator)) {
      console.error('❌ Service Worker not supported');
      return { success: false, reason: 'service-worker-not-supported' };
    }

    // ✅ Step 3: Register firebase-messaging-sw.js service worker
    try {
      let registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      
      if (!registration) {
        console.log('🔄 Registering Firebase messaging service worker...');
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('✅ Firebase messaging service worker registered');
      } else {
        console.log('✅ Firebase messaging service worker already registered');
      }
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('✅ Service worker is ready');
      
      // ✅ CRITICAL FIX: Send Firebase config to service worker
      if (registration && registration.active) {
        console.log('🔄 Sending dynamic Firebase config to service worker...');
        const currentConfig = await getFirebaseConfig();
        registration.active.postMessage({
          type: 'UPDATE_FIREBASE_CONFIG',
          config: {
            apiKey: currentConfig.apiKey,
            authDomain: currentConfig.authDomain,
            projectId: currentConfig.projectId,
            storageBucket: currentConfig.storageBucket,
            messagingSenderId: currentConfig.messagingSenderId,
            appId: currentConfig.appId
          }
        });
        console.log('✅ Dynamic Firebase config sent to service worker');
        
        // Initialize messaging in service worker
        registration.active.postMessage({ type: 'INIT_MESSAGING' });
      }
      
    } catch (swError) {
      console.error('❌ Service worker registration failed:', swError);
      return { success: false, reason: 'service-worker-failed', error: swError };
    }

    // ✅ Step 4: Get FCM token with dynamic config
    let currentToken: string;
    try {
      console.log('🔄 Requesting FCM token with dynamic VAPID key...');
      
      // Get the current Firebase config
      const currentConfig = await getFirebaseConfig();
      
      currentToken = await getToken(messaging, {
        vapidKey: currentConfig.vapidKey,
        serviceWorkerRegistration: await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')
      });
      
      if (!currentToken) {
        console.error('❌ No FCM registration token available - Check permissions and VAPID key');
        return { success: false, reason: 'no-fcm-token' };
      }
      
      console.log('✅ FCM token retrieved successfully:', currentToken.substring(0, 20) + '...');
      
    } catch (tokenError) {
      console.error('❌ FCM token retrieval failed:', tokenError);
      return { success: false, reason: 'fcm-token-failed', error: tokenError };
    }

    // ✅ Step 5: Save token to database as pure string
    try {
      const saved = await saveFCMTokenToDatabase(currentToken);
      if (!saved) {
        console.warn('⚠️ Failed to save FCM token to database');
        return { success: false, reason: 'save-failed' };
      }
      
      console.log('✅ FCM token saved to database successfully');
    } catch (saveError) {
      console.error('❌ Database save failed:', saveError);
      return { success: false, reason: 'db-save-failed', error: saveError };
    }
    
    console.log('✅ Device registration completed successfully');
    return { success: true, token: currentToken };
    
  } catch (error) {
    console.error('❌ CRITICAL: Device registration failed completely:', error);
    return { success: false, reason: 'registration-failed', error };
  }
};

// Convert VAPID key to Uint8Array
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// Save FCM token directly to database (clean string format)
const saveFCMTokenToDatabase = async (token: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.log('User not authenticated, not saving FCM token');
      return false;
    }
    
    const userId = session.user.id;
    
    // Determine device type
    const isCapacitor = (window as any).Capacitor?.isNativePlatform();
    const isAndroid = (window as any).Capacitor?.getPlatform() === 'android';
    const isIOS = (window as any).Capacitor?.getPlatform() === 'ios';
    
    let deviceType = 'web_push';
    
    if (isCapacitor && isAndroid) {
      deviceType = 'android';
      console.log('🤖 Saving Android FCM token');
    } else if (isCapacitor && isIOS) {
      deviceType = 'ios';
      console.log('🍎 Saving iOS FCM token');
    } else {
      console.log('🌐 Saving Web FCM token');
    }
    
    console.log('🔄 Saving FCM token to database...', { userId, deviceType, tokenPreview: token.substring(0, 20) + '...' });
    
    // ✅ CRITICAL FIX: Use manual upsert logic instead of onConflict 
    // First, try to update existing token
    const { data: updateResult, error: updateError } = await supabase
      .from('device_tokens')
      .update({
        token: token,
        last_used: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('device_type', deviceType);
    
    console.log('🔄 Update attempt result:', { updateResult, updateError });
    
    // If no rows updated, insert new token
    if (!updateError && !updateResult) {
      console.log('🔄 No existing token found, inserting new one...');
      const { data: insertResult, error: insertError } = await supabase
        .from('device_tokens')
        .insert({
          user_id: userId,
          token: token,
          device_type: deviceType,
          created_at: new Date().toISOString(),
          last_used: new Date().toISOString()
        });
      
      console.log('📊 Insert result:', { insertResult, insertError });
      
      if (insertError) {
        console.error('❌ Error inserting FCM token:', insertError);
        return false;
      }
    } else if (updateError) {
      console.error('❌ Error updating FCM token:', updateError);
      return false;
    }
    
    console.log('✅ FCM token saved/updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error in saveFCMTokenToDatabase:', error);
    return false;
  }
};

// Setup message listener for foreground notifications
export const setupMessageListener = async (callback: (payload: any) => void) => {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return false;
    
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      callback(payload);
    });
    
    return true;
  } catch (error) {
    console.error('Error setting up message listener:', error);
    return false;
  }
};
