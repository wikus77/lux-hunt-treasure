// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, deleteToken, onMessage, MessagePayload, Messaging } from 'firebase/messaging';
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

// Global Firebase app instance
let globalApp: FirebaseApp | null = null;
let globalMessaging: Messaging | null = null;

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
  
  // Try to get Capacitor platform first
  try {
    // Import Capacitor synchronously if available
    const capacitor = (window as any).Capacitor;
    if (capacitor) {
      const platform = capacitor.getPlatform();
      
      if (platform === 'ios') return 'ios';
      if (platform === 'android') return 'android';
      if (platform === 'web') {
        // On web, check if iOS from user agent
        const userAgent = navigator.userAgent.toLowerCase();
        if (/ipad|iphone|ipod/.test(userAgent)) return 'ios';
        return 'desktop';
      }
    }
  } catch (error) {
    // Capacitor not available, fallback to user agent
    console.log('[M1SSION FCM] Capacitor not available, using user agent detection');
  }
  
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
 * Initialize Firebase app once and return messaging instance
 */
export function getMessagingInstance(): Messaging {
  console.log('🚀 [M1SSION FCM] Getting messaging instance...');
  
  if (!globalApp) {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      globalApp = existingApps[0];
      console.log('✅ [M1SSION FCM] Using existing Firebase app');
    } else {
      globalApp = initializeApp(firebaseConfig);
      console.log('✅ [M1SSION FCM] Initialized new Firebase app');
    }
  }
  
  if (!globalMessaging) {
    globalMessaging = getMessaging(globalApp);
    console.log('✅ [M1SSION FCM] Messaging instance created');
  }
  
  return globalMessaging;
}

/**
 * Validate FCM token format
 */
function validateToken(token: string): boolean {
  const TOKEN_OK = /^[A-Za-z0-9_\-:]+$/.test(token) && token.length > 100;
  console.log(`🔍 [M1SSION FCM] Token validation: length=${token.length}, format=${TOKEN_OK}`);
  return TOKEN_OK;
}

/**
 * Validate UUID format
 */
function validateUUID(uuid: string): boolean {
  const isValid = /^[0-9a-f-]{36}$/i.test(uuid);
  console.log(`🔍 [M1SSION FCM] UUID validation: ${uuid} = ${isValid}`);
  return isValid;
}

/**
 * Register service worker and get FCM token
 */
export async function registerSwAndGetToken({ vapidKey }: { vapidKey: string }): Promise<string> {
  console.log('🔄 [M1SSION FCM] Starting SW registration and token generation...');
  
  // Check service worker support
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers not supported');
  }
  
  try {
    // Register service worker on /firebase-messaging-sw.js
    console.log('🔄 [M1SSION FCM] Registering service worker...');
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
      updateViaCache: 'none'
    });
    
    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;
    console.log(`✅ [M1SSION FCM] Service worker ready: ${registration.scope}`);
    
    // Get messaging instance
    const messaging = getMessagingInstance();
    
    // Generate token with VAPID key and service worker registration
    console.log('🔄 [M1SSION FCM] Generating FCM token...');
    const token = await getToken(messaging, {
      vapidKey: VAPID_PUBLIC_KEY,
      serviceWorkerRegistration: registration
    });
    
    if (!token || token === '') {
      throw new Error('No FCM token generated - may need app installation on iOS');
    }
    
    console.log(`✅ [M1SSION FCM] Token generated: length=${token.length}, prefix=${token.substring(0, 20)}...`);
    
    // Validate token format
    if (!validateToken(token)) {
      throw new Error('Invalid FCM token format');
    }
    
    return token;
    
  } catch (error: any) {
    console.error('❌ [M1SSION FCM] SW registration/token generation failed:', error);
    throw error;
  }
}

/**
 * Save token to Supabase database
 */
export async function saveTokenToDB({ 
  userId, 
  token, 
  platform, 
  deviceInfo 
}: {
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
  deviceInfo: any;
}): Promise<void> {
  console.log('🔄 [M1SSION FCM] Saving token to database...');
  
  // Validate UUID
  if (!validateUUID(userId)) {
    throw new Error(`Invalid userId UUID format: ${userId}`);
  }
  
  // Validate token
  if (!validateToken(token)) {
    throw new Error('Invalid FCM token format');
  }
  
  const payload = {
    user_id: userId,
    token,
    platform,
    device_info: deviceInfo,
    is_active: true
  };
  
  console.log('📤 [M1SSION FCM] Payload:', {
    user_id: userId,
    token_length: token.length,
    token_prefix: token.substring(0, 20) + '...',
    platform,
    device_info_keys: Object.keys(deviceInfo),
    is_active: true
  });
  
  try {
    const { error } = await supabase
      .from('fcm_subscriptions')
      .upsert(payload, {
        onConflict: 'token'
      });
    
    if (error) {
      console.error('❌ [M1SSION FCM] Database error:', error);
      
      // Handle specific PostgREST errors
      let errorMessage = error.message;
      if (errorMessage.includes('uuid')) {
        errorMessage = 'ID utente non valido';
      } else if (errorMessage.includes('check')) {
        errorMessage = 'Token vuoto o formato non valido';
      } else if (errorMessage.includes('platform')) {
        errorMessage = 'Platform non valida (deve essere ios/android/desktop/unknown)';
      }
      
      throw new Error(errorMessage);
    }
    
    console.log('✅ [M1SSION FCM] Token saved successfully');
    
  } catch (error: any) {
    console.error('❌ [M1SSION FCM] Save token failed:', error);
    throw error;
  }
}

/**
 * Delete token from database
 */
export async function deleteTokenFromDB({ userId, token }: { userId: string; token?: string }): Promise<void> {
  console.log('🔄 [M1SSION FCM] Deleting token from database...');
  
  // Validate UUID
  if (!validateUUID(userId)) {
    throw new Error(`Invalid userId UUID format: ${userId}`);
  }
  
  try {
    let query = supabase
      .from('fcm_subscriptions')
      .delete()
      .eq('user_id', userId);
    
    if (token) {
      query = query.eq('token', token);
      console.log(`🗑️ [M1SSION FCM] Deleting specific token for user ${userId}`);
    } else {
      console.log(`🗑️ [M1SSION FCM] Deleting all tokens for user ${userId}`);
    }
    
    const { error } = await query;
    
    if (error) {
      console.error('❌ [M1SSION FCM] Database delete error:', error);
      throw new Error(`Database delete failed: ${error.message}`);
    }
    
    console.log('✅ [M1SSION FCM] Token(s) deleted successfully');
    
  } catch (error: any) {
    console.error('❌ [M1SSION FCM] Delete token failed:', error);
    throw error;
  }
}


/**
 * Regenerates FCM token (deletes old one first)
 */
export async function regenerateFCMToken(): Promise<string | null> {
  try {
    console.log('🔄 [M1SSION FCM] Regenerating token...');
    
    const messaging = getMessagingInstance();
    
    // Delete existing token
    await deleteToken(messaging);
    console.log('🗑️ [M1SSION FCM] Old token deleted');
    
    // Generate new token
    return await registerSwAndGetToken({ vapidKey: VAPID_PUBLIC_KEY });
    
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
    const messaging = getMessagingInstance();
    
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


/**
 * Main function to enable push notifications with clear permission handling
 */
export async function enablePushNotifications(): Promise<PushEnableResult> {
  try {
    console.log('🚀 [M1SSION FCM] Starting push notification setup...');

    // 1. Get authenticated user
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;
    if (!userId) {
      console.error('❌ [M1SSION FCM] User not authenticated');
      return { success: false, error: 'Non sei autenticato' };
    }
    console.log('✅ [M1SSION FCM] User authenticated:', userId);

    // 2. Check if push is supported
    if (!isPushSupported()) {
      const error = 'Push notifications not supported in this browser';
      console.error('❌ [M1SSION FCM]', error);
      return { success: false, error };
    }

    // 3. Check current permission status
    const currentPermission = Notification.permission;
    console.log('🔔 [M1SSION FCM] Current permission:', currentPermission);

    if (currentPermission === 'denied') {
      const error = 'Notifications blocked. Please enable in browser settings.';
      console.warn('🚫 [M1SSION FCM]', error);
      return { success: false, error, permission: currentPermission };
    }

    // 4. Request permission if not already granted
    let permission: NotificationPermission = currentPermission;
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

    // 5. Check if iOS user needs installation guide
    if (needsInstallGuide()) {
      console.log('📱 [M1SSION FCM] iOS user needs installation guide');
      return { 
        success: false, 
        requiresInstall: true,
        error: 'Su iOS installa l\'app nella Home (Aggiungi a Home) e riapri da Home per generare il token.',
        permission
      };
    }

    // 6. Generate FCM token
    const token = await registerSwAndGetToken({ vapidKey: VAPID_PUBLIC_KEY });
    
    if (!token || token === '') {
      console.error('❌ [M1SSION FCM] No token generated');
      return { 
        success: false, 
        error: 'Su iOS installa l\'app nella Home (Aggiungi a Home) e riapri da Home per generare il token.',
        permission
      };
    }

    // 7. Get platform and device info
    const platform = detectPlatform();
    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform,
      timestamp: new Date().toISOString(),
      isStandalone: isStandalone(),
      url: window.location.href
    };
    
    // 8. Log before save
    console.log('[M1SSION FCM] saving', { userId, token: token.substring(0, 20) + '...', platform });
    
    // 9. Save token to database
    await saveTokenToDB({ userId, token, platform, deviceInfo });

    // 10. Setup foreground message listener
    setupForegroundMessageListener();

    console.log('🎉 [M1SSION FCM] Push notifications enabled successfully!');
    return { 
      success: true, 
      token,
      permission
    };

  } catch (error: any) {
    console.error('💥 [M1SSION FCM] Enable push notifications failed:', error);
    
    // Handle PostgREST errors
    let errorMessage = error.message || 'Unknown error occurred';
    if (errorMessage.includes('uuid')) {
      errorMessage = 'ID utente non valido';
    } else if (errorMessage.includes('check')) {
      errorMessage = 'Token o dati non validi';
    }
    
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