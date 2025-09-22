/* M1SSION™ AG-X0197 */
// FCM Token Generation Utility
export interface FcmTokenResult {
  token: string | null;
  error: string | null;
  success: boolean;
}

// TypeScript declarations for Firebase globals
declare global {
  interface Window {
    firebase?: any;
    __FIREBASE_CFG__?: {
      apiKey: string;
      authDomain: string;
      projectId: string;
      storageBucket: string;
      messagingSenderId: string;
      appId: string;
      vapidKey: string;
    };
  }
}

/**
 * Gets FCM token with proper error handling and logging
 */
export async function getFcmToken(): Promise<FcmTokenResult> {
  try {
    console.log('[M1SSION FCM] Starting token generation...');

    // Check notification support
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    // Request permission
    console.log('[M1SSION FCM] Requesting notification permission...');
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.log('[M1SSION FCM] Permission denied:', permission);
      return {
        token: null,
        error: `Permission ${permission}`,
        success: false
      };
    }

    console.log('[M1SSION FCM] Permission granted');

    // BLINDATA: Use existing main SW registration only
    if ('serviceWorker' in navigator) {
      console.log('[M1SSION FCM] Using BLINDATA main SW registration...');
      
      const existingReg = await navigator.serviceWorker.getRegistration('/');
      if (existingReg) {
        console.log('[M1SSION FCM] Using existing BLINDATA SW registration');
      } else {
        console.warn('[M1SSION FCM] No main SW registration found - PWA Stabilizer should handle this');
      }
      
      await navigator.serviceWorker.ready;
    }

    // Load Firebase if not already loaded
    if (!window.firebase) {
      console.log('[M1SSION FCM] Loading Firebase compat...');
      
      await Promise.all([
        loadScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js'),
        loadScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')
      ]);
      
      await loadScript('/firebase-init.js');
      console.log('[M1SSION FCM] Firebase compat loaded');
    }

    // Initialize Firebase
    if (!window.firebase.apps.length && window.__FIREBASE_CFG__) {
      window.firebase.initializeApp(window.__FIREBASE_CFG__);
      console.log('[M1SSION FCM] Firebase app initialized');
    }

    // Check messaging support
    if (!window.firebase.messaging.isSupported()) {
      throw new Error('FCM not supported in this browser');
    }

    // Get messaging instance
    const messaging = window.firebase.messaging();
    const swRegistration = await navigator.serviceWorker.ready;

    // Get token
    console.log('[M1SSION FCM] Requesting FCM token...');
    const token = await messaging.getToken({
      vapidKey: window.__FIREBASE_CFG__?.vapidKey,
      serviceWorkerRegistration: swRegistration
    });

    if (!token) {
      throw new Error('No token received from FCM');
    }

    console.log('[M1SSION FCM] Token generated successfully:', token.substring(0, 20) + '...');
    
    return {
      token,
      error: null,
      success: true
    };

  } catch (error: any) {
    console.error('[M1SSION FCM] Token generation failed:', error);
    
    // Handle specific VAPID key errors
    if (error.code === 'messaging/invalid-vapid-key' || error.name === 'InvalidCharacterError') {
      console.error('[M1SSION FCM] VAPID key is not valid base64url format');
      return {
        token: null,
        error: 'Invalid VAPID key format (not base64url)',
        success: false
      };
    }

    return {
      token: null,
      error: error.message || 'Unknown error',
      success: false
    };
  }
}

/**
 * Dynamically load script
 */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}