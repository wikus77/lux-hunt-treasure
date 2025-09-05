// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, deleteToken, onMessage, MessagePayload } from 'firebase/messaging';
import { supabase } from '@/integrations/supabase/client';

// Firebase configuration for M1SSION app
const firebaseConfig = {
  apiKey: "AIzaSyDgY_2prLtVvme616VpfBgTyCJV1aW7mXs",
  authDomain: "m1ssion-app.firebaseapp.com",
  projectId: "m1ssion-app",
  storageBucket: "m1ssion-app.firebasestorage.app",
  messagingSenderId: "21417361168",
  appId: "1:21417361168:web:58841299455ee4bcc7af95"
};

// VAPID Public Key - NON CAMBIARE (invaliderebbe tutti i token esistenti)
const VAPID_PUBLIC_KEY = "BBjgzWK_1_PBZXGLQb-xQjSEUH5jLsNNgx8N0LgOcKUkZeCUaNV_gRE-QM5pKS2bPKUhVJLn0Q-H3BNGnOOjy8Q";

export interface PushEnableResult {
  success: boolean;
  token?: string;
  error?: string;
  requiresInstall?: boolean;
  permission?: NotificationPermission;
}

// Platform detection utilities
export const isStandalone = (): boolean => {
  return (
    typeof window !== 'undefined' && 
    (window.matchMedia('(display-mode: standalone)').matches ||
     (window.navigator as any).standalone === true)
  );
};

export const isIOS = (): boolean => {
  return typeof window !== 'undefined' && 
         /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const detectPlatform = (): 'ios' | 'android' | 'desktop' | 'unknown' => {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/ipad|iphone|ipod/.test(userAgent)) return 'ios';
  if (/android/.test(userAgent)) return 'android';
  if (/windows|macintosh|linux/.test(userAgent)) return 'desktop';
  
  return 'unknown';
};

export const isPushSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'Notification' in window &&
    'PushManager' in window
  );
};

export const needsInstallGuide = (): boolean => {
  return isIOS() && !isStandalone();
};

/**
 * Registers the Firebase messaging service worker with no-cache headers
 */
async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('🚫 [M1SSION FCM] Service workers not supported');
    return null;
  }

  try {
    console.log('🔄 [M1SSION FCM] Registering service worker at root...');
    
    // Register at root with no cache to ensure updates
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
      updateViaCache: 'none'
    });
    
    console.log('✅ [M1SSION FCM] Service worker registered:', registration.scope);
    
    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;
    console.log('✅ [M1SSION FCM] Service worker ready');
    
    return registration;
  } catch (error) {
    console.error('❌ [M1SSION FCM] Service worker registration failed:', error);
    return null;
  }
}

/**
 * Generates and returns an FCM token
 */
async function getFCMToken(): Promise<string | null> {
  try {
    console.log('🔄 [M1SSION FCM] Generating FCM token...');
    
    // Initialize Firebase app
    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);
    
    // Register service worker
    const registration = await registerServiceWorker();
    
    // Get token with VAPID key and service worker registration
    const token = await getToken(messaging, {
      vapidKey: VAPID_PUBLIC_KEY,
      serviceWorkerRegistration: registration || undefined
    });
    
    if (!token) {
      console.warn('⚠️ [M1SSION FCM] No registration token available');
      return null;
    }
    
    console.log('✅ [M1SSION FCM] Token generated:', token.substring(0, 20) + '...');
    return token;
    
  } catch (error: any) {
    console.error('❌ [M1SSION FCM] Token generation failed:', error);
    return null;
  }
}

/**
 * Regenerates FCM token (deletes old one first)
 */
export async function regenerateFCMToken(): Promise<string | null> {
  try {
    console.log('🔄 [M1SSION FCM] Regenerating token...');
    
    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);
    
    // Delete existing token
    await deleteToken(messaging);
    console.log('🗑️ [M1SSION FCM] Old token deleted');
    
    // Generate new token
    return await getFCMToken();
    
  } catch (error) {
    console.error('❌ [M1SSION FCM] Token regeneration failed:', error);
    return null;
  }
}

/**
 * Sets up foreground message listener
 */
export function setupForegroundMessageListener(): void {
  try {
    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);
    
    onMessage(messaging, (payload: MessagePayload) => {
      console.log('📨 [M1SSION FCM] Foreground message received:', payload);
      
      // Show notification manually for foreground messages
      const { title, body } = payload.notification || {};
      if (title && body) {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'mission-notification'
        });
      }
    });
    
    console.log('✅ [M1SSION FCM] Foreground message listener setup complete');
  } catch (error) {
    console.error('❌ [M1SSION FCM] Foreground listener setup failed:', error);
  }
}

async function saveFCMToken(token: string, userId: string): Promise<void> {
  const platform = detectPlatform();
  const deviceInfo = {
    userAgent: navigator.userAgent,
    platform,
    timestamp: new Date().toISOString(),
    isStandalone: isStandalone(),
    url: window.location.href
  };

  try {
    console.log('🔄 [M1SSION FCM] Saving token to Supabase...', { 
      userId, 
      tokenPrefix: token.substring(0, 20) + '...', 
      platform 
    });
    
    // Upsert via REST API for better error handling
    const { error } = await supabase
      .from('fcm_subscriptions')
      .upsert({
        user_id: userId,
        token,
        platform,
        device_info: deviceInfo,
        is_active: true
      }, {
        onConflict: 'user_id,token'
      });

    if (error) {
      console.error('❌ [M1SSION FCM] Database error:', error);
      throw error;
    }

    console.log('✅ [M1SSION FCM] Token saved successfully');
  } catch (error: any) {
    console.error('❌ [M1SSION FCM] Failed to save token:', error);
    throw new Error(`Database save failed: ${error.message}`);
  }
}

/**
 * Main function to enable push notifications with clear permission handling
 */
export async function enablePushNotifications(userId: string): Promise<PushEnableResult> {
  try {
    console.log('🚀 [M1SSION FCM] Starting push notification setup for user:', userId);

    // 1. Check if push is supported
    if (!isPushSupported()) {
      const error = 'Push notifications not supported in this browser';
      console.error('❌ [M1SSION FCM]', error);
      return { success: false, error };
    }

    // 2. Check current permission status
    const currentPermission = Notification.permission;
    console.log('🔔 [M1SSION FCM] Current permission:', currentPermission);

    if (currentPermission === 'denied') {
      const error = 'Notifications blocked. Please enable in browser settings.';
      console.warn('🚫 [M1SSION FCM]', error);
      return { success: false, error, permission: currentPermission };
    }

    // 3. Request permission if not already granted
    let permission = currentPermission;
    if (permission === 'default') {
      console.log('🔔 [M1SSION FCM] Requesting notification permission...');
      permission = await Notification.requestPermission();
      console.log('🔔 [M1SSION FCM] Permission result:', permission);
    }
    
    if (permission !== 'granted') {
      const error = `Notification permission ${permission}`;
      console.warn('⚠️ [M1SSION FCM]', error);
      return { success: false, error, permission };
    }

    // 4. Check if iOS user needs installation guide
    if (needsInstallGuide()) {
      console.log('📱 [M1SSION FCM] iOS user needs installation guide');
      return { 
        success: false, 
        requiresInstall: true,
        error: 'Please add this app to your Home Screen to enable notifications',
        permission
      };
    }

    // 5. Generate FCM token
    const token = await getFCMToken();
    if (!token) {
      const error = 'Failed to generate FCM token';
      console.error('❌ [M1SSION FCM]', error);
      return { success: false, error, permission };
    }

    // 6. Save token to database
    await saveFCMToken(token, userId);

    // 7. Setup foreground message listener
    setupForegroundMessageListener();

    console.log('🎉 [M1SSION FCM] Push notifications enabled successfully!');
    return { 
      success: true, 
      token,
      permission
    };

  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error occurred';
    console.error('💥 [M1SSION FCM] Enable push notifications failed:', error);
    return { 
      success: false, 
      error: errorMessage,
      permission: Notification.permission as 'granted' | 'denied' | 'default'
    };
  }
}

/**
 * Get current notification status
 */
export function getNotificationStatus() {
  return {
    permission: Notification.permission,
    supported: isPushSupported(),
    needsInstall: needsInstallGuide(),
    platform: detectPlatform()
  };
}

/**
 * Check if user has active FCM subscription
 */
export async function hasActiveFCMSubscription(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('fcm_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1);

    if (error) {
      console.error('❌ [M1SSION FCM] Error checking subscription:', error);
      return false;
    }

    return (data && data.length > 0);
  } catch (error) {
    console.error('❌ [M1SSION FCM] Error checking subscription:', error);
    return false;
  }
}

/**
 * Get user's FCM tokens
 */
export async function getUserFCMTokens(userId: string) {
  try {
    const { data, error } = await supabase
      .from('fcm_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [M1SSION FCM] Error fetching tokens:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ [M1SSION FCM] Error fetching tokens:', error);
    return [];
  }
}

/**
 * Test notification with current token
 */
export async function testNotification(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🧪 [M1SSION FCM] Testing notification...');
    
    const { data, error } = await supabase.functions.invoke('fcm-test', {
      body: {
        token,
        title: 'M1SSION™ Test',
        body: 'Push notification working correctly! 🎉',
        data: { screen: '/notifications' }
      }
    });

    if (error) {
      console.error('❌ [M1SSION FCM] Test failed:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [M1SSION FCM] Test notification sent');
    return { success: true };
  } catch (error: any) {
    console.error('❌ [M1SSION FCM] Test error:', error);
    return { success: false, error: error.message };
  }
}