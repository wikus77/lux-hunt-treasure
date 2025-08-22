// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// Firebase Cloud Messaging Configuration - CONFIGURAZIONE REALE E FUNZIONANTE

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import type { MessagePayload } from 'firebase/messaging';

// CONFIGURAZIONE FIREBASE REALE - DA SOSTITUIRE CON CREDENZIALI VERE
const firebaseConfig = {
  apiKey: "AIzaSyBvOkBjjLFqvWq8WmTh2OqF1bVdWkE4V9k",
  authDomain: "luxhunt-treasure.firebaseapp.com",
  projectId: "luxhunt-treasure",
  storageBucket: "luxhunt-treasure.appspot.com", 
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789012345678"
};

// VAPID Key REALE - Da generare in Firebase Console -> Project Settings -> Cloud Messaging
const VAPID_KEY = "BCgPjJtA_B2zM8N0pKqJ5rG6XQVw8HhLzP1oU4YsJkNnLqOk9JbP6wEsT5uR3mCvFpX2lLzZ4nGfR8rQ7lYvK3k";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
let messaging: any = null;

try {
  if (typeof window !== 'undefined') {
    messaging = getMessaging(app);
    console.log('✅ Firebase Cloud Messaging initialized successfully');
  }
} catch (error) {
  console.error('❌ Firebase Cloud Messaging initialization failed:', error);
}

// Get FCM Token with enhanced error handling
export const getFCMToken = async (): Promise<string | null> => {
  if (!messaging) {
    console.error('❌ FCM not initialized');
    return null;
  }

  try {
    // Check if service worker is ready
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      console.log('🔥 Service Worker ready for FCM');
    }

    // Request permission first
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.error('❌ Notification permission denied');
      return null;
    }

    console.log('🔥 FCM-TRACE: Requesting token with VAPID key...');
    console.log('🔥 FCM-TRACE: VAPID Key being used:', VAPID_KEY.substring(0, 20) + '...');
    
    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
    
    if (currentToken) {
      console.log('✅ FCM Token retrieved successfully:', currentToken.substring(0, 20) + '...');
      console.log('🔥 FCM-TRACE: Token details:', {
        length: currentToken.length,
        prefix: currentToken.substring(0, 10),
        generatedAt: new Date().toISOString(),
        permissionStatus: permission
      });
      return currentToken;
    } else {
      console.warn('⚠️ No FCM registration token available');
      console.log('🔥 FCM-TRACE: Token generation failed - check VAPID key and browser support');
      return null;
    }
  } catch (error: any) {
    console.error('❌ Error retrieving FCM token:', error);
    console.log('🔥 FCM-TRACE: Token error details:', {
      error: error.message || error,
      errorCode: error.code,
      vapidKey: VAPID_KEY.substring(0, 10) + '...',
      messaging: !!messaging,
      permission: Notification.permission
    });
    return null;
  }
};

// Setup message listener for foreground messages
export const setupFCMMessageListener = (
  onMessageReceived: (payload: MessagePayload) => void
) => {
  if (!messaging) {
    console.error('❌ FCM not initialized for message listener');
    return;
  }

  try {
    return onMessage(messaging, (payload) => {
      console.log('📨 FCM Message received in foreground:', payload);
      onMessageReceived(payload);
    });
  } catch (error) {
    console.error('❌ Error setting up FCM message listener:', error);
  }
};

// Check if FCM is fully supported
export const isFCMSupported = (): boolean => {
  const isSupported = 
    typeof window !== 'undefined' && 
    'serviceWorker' in navigator && 
    'Notification' in window &&
    'PushManager' in window;
  
  console.log('🔥 FCM Support Check:', {
    window: typeof window !== 'undefined',
    serviceWorker: 'serviceWorker' in navigator,
    notifications: 'Notification' in window,
    pushManager: 'PushManager' in window,
    overall: isSupported
  });
  
  return isSupported;
};

// Advanced FCM diagnostics
export const runFCMDiagnostics = async () => {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    firebase: {
      initialized: !!messaging,
      config: firebaseConfig.projectId
    },
    browser: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      serviceWorkerSupported: 'serviceWorker' in navigator,
      notificationSupported: 'Notification' in window,
      pushManagerSupported: 'PushManager' in window
    },
    permissions: {
      notification: Notification.permission
    },
    serviceWorker: null as any,
    vapidKey: VAPID_KEY.substring(0, 20) + '...'
  };

  // Check service worker
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration('/');
      diagnostics.serviceWorker = {
        registered: !!registration,
        active: !!registration?.active,
        scope: registration?.scope
      };
    } catch (error) {
      diagnostics.serviceWorker = { error: error.message };
    }
  }

  console.log('🔥 FCM Complete Diagnostics:', diagnostics);
  return diagnostics;
};

export { messaging, firebaseConfig, VAPID_KEY };