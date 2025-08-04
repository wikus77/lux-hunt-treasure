
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { firebaseConfig } from './firebase-config';
import { supabase } from '@/integrations/supabase/client';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

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
      return getMessaging(app);
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

// Register device for notifications  
export const registerDeviceForNotifications = async (): Promise<RegistrationResult> => {
  try {
    console.log('🔄 Starting device registration for notifications...');
    
    const messaging = await getMessagingInstance();
    if (!messaging) {
      console.error('❌ Firebase messaging not supported');
      return { success: false, reason: 'messaging-not-supported' };
    }

    console.log('✅ Firebase messaging instance ready');

    // ENHANCED token retrieval with better error handling
    let currentToken: string;
    try {
      currentToken = await getToken(messaging, {
        vapidKey: firebaseConfig.vapidKey,
      });
      
      if (!currentToken) {
        console.error('❌ No FCM registration token available - check Firebase config');
        return { success: false, reason: 'no-fcm-token' };
      }
      
      console.log('✅ FCM token retrieved successfully:', currentToken.substring(0, 20) + '...');
    } catch (tokenError) {
      console.error('❌ FCM token retrieval failed:', tokenError);
      return { success: false, reason: 'fcm-token-failed', error: tokenError };
    }

    // Web Push subscription with enhanced error handling
    try {
      console.log('🔄 Creating Web Push subscription...');
      
      const registration = await navigator.serviceWorker.ready;
      console.log('✅ Service Worker ready');
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(firebaseConfig.vapidKey)
      });
      
      console.log('✅ Web Push subscription created successfully');

      // Save subscription to database
      const saved = await saveSubscriptionToDatabase(subscription);
      if (!saved) {
        console.warn('⚠️ Failed to save subscription to database, but continuing...');
      }
    } catch (webPushError) {
      console.warn('⚠️ Web Push subscription failed, but FCM token available:', webPushError);
      // Continue with FCM token only
    }
    
    // SUCCESS: Return FCM token regardless of Web Push status
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

// Save real subscription to database
const saveSubscriptionToDatabase = async (subscription: PushSubscription) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.log('User not authenticated, not saving subscription');
      return false;
    }
    
    const userId = session.user.id;
    
    console.log('🔔 Saving real subscription:', subscription);
    
    // Determine device type
    const isCapacitor = (window as any).Capacitor?.isNativePlatform();
    const isAndroid = (window as any).Capacitor?.getPlatform() === 'android';
    const isIOS = (window as any).Capacitor?.getPlatform() === 'ios';
    
    let deviceType = 'web_push';
    let tokenData = JSON.stringify(subscription);
    
    // Handle native device types
    if (isCapacitor && isAndroid) {
      deviceType = 'android';
      // For Android FCM, extract token from endpoint
      if (subscription.endpoint?.includes('fcm.googleapis.com/fcm/send/')) {
        tokenData = subscription.endpoint.replace('https://fcm.googleapis.com/fcm/send/', '');
        console.log('🤖 Android FCM token extracted for device_tokens');
      } else {
        tokenData = JSON.stringify(subscription);
      }
    } else if (isCapacitor && isIOS) {
      // For iOS, token registration is handled by Capacitor listener in usePushNotifications
      console.log('🍎 iOS detected - token will be saved by Capacitor registration listener');
      return true; // Skip web registration for iOS
    }
    
    const { error } = await supabase
      .from('device_tokens')
      .upsert({
        user_id: userId,
        token: tokenData,
        device_type: deviceType,
        created_at: new Date().toISOString(),
        last_used: new Date().toISOString()
      }, {
        onConflict: 'user_id, device_type'
      }) as any;
      
    if (error) {
      console.error('Error saving subscription:', error);
      return false;
    }
    
    console.log('✅ Real subscription saved successfully');
    return true;
  } catch (error) {
    console.error('Error in saveSubscriptionToDatabase:', error);
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
