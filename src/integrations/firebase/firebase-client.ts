
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
    const messaging = await getMessagingInstance();
    if (!messaging) {
      return { success: false, reason: 'messaging-not-supported' };
    }

    // Get token with vapid key
    const currentToken = await getToken(messaging, {
      vapidKey: firebaseConfig.vapidKey,
    });

    if (!currentToken) {
      console.log('No registration token available');
      return { success: false, reason: 'no-token' };
    }

    // Save token to database
    await saveTokenToDatabase(currentToken);
    
    return { success: true, token: currentToken };
  } catch (error) {
    console.error('Error getting token:', error);
    return { success: false, reason: 'token-error', error };
  }
};

// Save token to database
const saveTokenToDatabase = async (token: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.log('User not authenticated, not saving token');
      return false;
    }
    
    const userId = session.user.id;
    
    // Save the token to the "device_tokens" table in Supabase
    // Using the raw query to bypass the TypeScript error until the types are regenerated
    const { error } = await supabase
      .from('device_tokens')
      .upsert({
        user_id: userId,
        token: token,
        device_type: 'web',
        created_at: new Date().toISOString(),
        last_used: new Date().toISOString()
      }, {
        onConflict: 'user_id, token'
      }) as any; // Type assertion as any to bypass the temporary type error
      
    if (error) {
      console.error('Error saving token:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveTokenToDatabase:', error);
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
