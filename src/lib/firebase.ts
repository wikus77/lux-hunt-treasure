// property of team joseph & aldo, M1SSION devtools, generative ai code-signed via Lovable by Joseph G. for user J.A.
// Firebase Cloud Messaging Configuration - PWA Ready

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import type { MessagePayload } from 'firebase/messaging';

// M1SSION™ Firebase Configuration - UNIFIED
const firebaseConfig = {
  apiKey: "AIzaSyDgY_2prLtVvme616VpfBgTyCJV1aW7mXs",
  authDomain: "m1ssion-app.firebaseapp.com",
  projectId: "m1ssion-app",
  storageBucket: "m1ssion-app.firebasestorage.app",
  messagingSenderId: "21417361168",
  appId: "1:21417361168:web:58841299455ee4bcc7af95"
};

// M1SSION™ VAPID Key - UNIFIED FROM ENV ACROSS ALL COMPONENTS
const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_PUBLIC_KEY || 
                  import.meta.env.VITE_VAPID_PUBLIC_KEY || 
                  "BBjgzWK_1_PBZXGLQb-xQjSEUH5jLsNNgx8N0LgOcKUkZeCUaNV_gRE-QM5pKS2bPKUhVJLn0Q-H3BNGnOOjy8Q";

// Initialize Firebase - Check if app already exists to prevent duplicate error
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Cloud Messaging (lazy initialization)
let messagingInstance: any = null;

const initializeMessaging = () => {
  if (messagingInstance) return messagingInstance;
  
  try {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      messagingInstance = getMessaging(app);
      console.log('🔥 Firebase Cloud Messaging initialized successfully');
      return messagingInstance;
    }
  } catch (error) {
    console.error('❌ Firebase Cloud Messaging initialization failed:', error);
  }
  
  return null;
};

// Get FCM Token with service worker registration
export const getFCMToken = async (serviceWorkerRegistration?: ServiceWorkerRegistration): Promise<string | null> => {
  const messagingInstance = initializeMessaging();
  
  if (!messagingInstance) {
    console.error('❌ FCM not initialized');
    return null;
  }

  try {
    console.log('🔥 FCM-TRACE: Requesting token with VAPID key...');
    console.log('🔥 FCM-TRACE: VAPID Key being used:', VAPID_KEY.substring(0, 20) + '...');
    
    const tokenOptions: any = { vapidKey: VAPID_KEY };
    
    // Use provided service worker registration or get default
    if (serviceWorkerRegistration) {
      tokenOptions.serviceWorkerRegistration = serviceWorkerRegistration;
    } else if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js') ||
                          await navigator.serviceWorker.getRegistration('/');
      if (registration) {
        tokenOptions.serviceWorkerRegistration = registration;
      }
    }
    
    const currentToken = await getToken(messagingInstance, tokenOptions);
    
    if (currentToken) {
      console.log('✅ FCM Token retrieved:', currentToken.substring(0, 20) + '...');
      console.log('🔥 FCM-TRACE: Token details:', {
        length: currentToken.length,
        prefix: currentToken.substring(0, 10),
        generatedAt: new Date().toISOString()
      });
      return currentToken;
    } else {
      console.warn('⚠️ No FCM registration token available');
      console.log('🔥 FCM-TRACE: Token generation failed - check VAPID key and browser support');
      return null;
    }
  } catch (error) {
    console.error('❌ Error retrieving FCM token:', error);
    console.log('🔥 FCM-TRACE: Token error details:', {
      error: error,
      vapidKey: VAPID_KEY.substring(0, 10) + '...',
      messaging: !!messagingInstance
    });
    return null;
  }
};

// Setup message listener for foreground messages
export const setupFCMMessageListener = (
  onMessageReceived: (payload: MessagePayload) => void
) => {
  const messagingInstance = initializeMessaging();
  
  if (!messagingInstance) {
    console.error('❌ FCM not initialized');
    return;
  }

  return onMessage(messagingInstance, (payload) => {
    console.log('📨 FCM Message received in foreground:', payload);
    onMessageReceived(payload);
  });
};

// Check if FCM is supported
export const isFCMSupported = (): boolean => {
  return typeof window !== 'undefined' && 
         'serviceWorker' in navigator && 
         'Notification' in window &&
         'PushManager' in window;
};

// Get messaging instance (lazy initialization)
export const getMessagingInstance = () => {
  return initializeMessaging();
};

// Export messaging for backward compatibility
export { messagingInstance as messaging };