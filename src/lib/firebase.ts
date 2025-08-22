// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// Firebase Cloud Messaging Configuration

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import type { MessagePayload } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDt7BJ9kV8Jm9aH3GbS6kL4fP2eR9xW7qZ",
  authDomain: "lux-hunt-treasure.firebaseapp.com",
  projectId: "lux-hunt-treasure", 
  storageBucket: "lux-hunt-treasure.appspot.com",
  messagingSenderId: "987654321098",
  appId: "1:987654321098:web:1a2b3c4d5e6f7g8h9i0j1k2l"
};

// VAPID Key for Web Push - CHIAVE P-256 VALIDA GENERATA CORRETTAMENTE
const VAPID_KEY = "BHW33etXfpUnlLl5FwwsF1z7W48tPnlyJrF52zwEEEHiSIw0ED19ReIhFNm2DOiMTbJU_mPlFtqLGPboP6U-HHA";

// Initialize Firebase - Check if app already exists to prevent duplicate error
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Cloud Messaging
let messaging: any = null;

try {
  if (typeof window !== 'undefined') {
    messaging = getMessaging(app);
    console.log('🔥 Firebase Cloud Messaging initialized successfully');
  }
} catch (error) {
  console.error('❌ Firebase Cloud Messaging initialization failed:', error);
}

// Get FCM Token
export const getFCMToken = async (): Promise<string | null> => {
  if (!messaging) {
    console.error('❌ FCM not initialized');
    return null;
  }

  try {
    console.log('🔥 FCM-TRACE: Requesting token with VAPID key...');
    console.log('🔥 FCM-TRACE: VAPID Key being used:', VAPID_KEY.substring(0, 20) + '...');
    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
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
      messaging: !!messaging
    });
    return null;
  }
};

// Setup message listener for foreground messages
export const setupFCMMessageListener = (
  onMessageReceived: (payload: MessagePayload) => void
) => {
  if (!messaging) {
    console.error('❌ FCM not initialized');
    return;
  }

  return onMessage(messaging, (payload) => {
    console.log('📨 FCM Message received in foreground:', payload);
    onMessageReceived(payload);
  });
};

// Check if FCM is supported
export const isFCMSupported = (): boolean => {
  return typeof window !== 'undefined' && 
         'serviceWorker' in navigator && 
         'Notification' in window;
};

export { messaging };