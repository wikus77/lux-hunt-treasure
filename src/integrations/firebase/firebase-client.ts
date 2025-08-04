
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

    // Get FCM token directly - Firebase handles Service Worker registration
    let currentToken: string;
    try {
      currentToken = await getToken(messaging, {
        vapidKey: firebaseConfig.vapidKey,
      });
      
      if (!currentToken) {
        console.error('❌ No FCM registration token available');
        return { success: false, reason: 'no-fcm-token' };
      }
      
      console.log('✅ FCM token retrieved:', currentToken.substring(0, 20) + '...');
      
      // Save FCM token directly to database (as string, not JSON)
      const saved = await saveFCMTokenToDatabase(currentToken);
      if (!saved) {
        console.warn('⚠️ Failed to save FCM token to database');
        return { success: false, reason: 'save-failed' };
      }
      
      console.log('✅ FCM token saved to database successfully');
      
    } catch (tokenError) {
      console.error('❌ FCM token retrieval failed:', tokenError);
      return { success: false, reason: 'fcm-token-failed', error: tokenError };
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
    
    const { error } = await supabase
      .from('device_tokens')
      .upsert({
        user_id: userId,
        token: token, // Save as pure string - no JSON
        device_type: deviceType,
        created_at: new Date().toISOString(),
        last_used: new Date().toISOString()
      }, {
        onConflict: 'user_id, device_type'
      }) as any;
      
    if (error) {
      console.error('❌ Error saving FCM token:', error);
      return false;
    }
    
    console.log('✅ FCM token saved successfully');
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
