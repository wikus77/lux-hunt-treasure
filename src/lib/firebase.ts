// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// Firebase Cloud Messaging Configuration

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import type { MessagePayload } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBsGDMrE9vZjY8pLqZxj_nRhT5MdJ7X3kQ",
  authDomain: "m1ssion-notifications.firebaseapp.com",
  projectId: "m1ssion-notifications", 
  storageBucket: "m1ssion-notifications.appspot.com",
  messagingSenderId: "654321987654",
  appId: "1:654321987654:web:abcd1234efgh5678ijkl90"
};

// VAPID Key for Web Push - NUOVA CHIAVE VALIDA 2025  
const VAPID_KEY = "BGpT3b3wYCGGCw3HZpnzgNhS5oMePa7X7KhE2x1ZGvD_QrJ4rAmI7J9T3QNTQ4oKlJQmPKhL5w8wTHhIUf8RoZo";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

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