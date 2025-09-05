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

export const detectPlatform = (): 'ios' | 'android' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  
  // Try to get Capacitor platform first
  try {
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
    console.debug('[PUSH] Capacitor not available, using user agent detection');
  }
  
  const userAgent = navigator.userAgent.toLowerCase();
  if (/ipad|iphone|ipod/.test(userAgent)) return 'ios';
  if (/android/.test(userAgent)) return 'android';
  
  // Default to desktop for unknown platforms 
  return 'desktop';
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
 * Validate FCM token format - RELAXED: accept any non-empty string (NO REGEX/PATTERN)
 */
function validateToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    console.debug(`🔍 [PUSH] Token validation: FAILED - empty or non-string`);
    return false;
  }
  
  // VERY RELAXED: Just check minimum length, no pattern/regex validation
  const TOKEN_OK = token.length >= 20;
  console.debug(`🔍 [PUSH] Token validation: length=${token.length}, prefix=${token.substring(0, 8)}..., valid=${TOKEN_OK}`);
  return TOKEN_OK;
}

/**
 * Validate UUID format - STRICT for user_id
 */
function validateUUID(uuid: string): boolean {
  const isValid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
  console.debug(`🔍 [PUSH] UUID validation: ${uuid.substring(0, 8)}... = ${isValid}`);
  return isValid;
}

/**
 * Register service worker and get FCM token
 */
export async function registerSwAndGetToken({ vapidKey }: { vapidKey: string }): Promise<string> {
  console.debug('[PUSH] Starting SW registration and token generation...');
  
  // Check service worker support
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers not supported');
  }
  
  try {
    // Ensure single SW registration
    console.debug('[PUSH] Ensuring single SW registration...');
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
      updateViaCache: 'none'
    });
    
    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;
    console.debug(`[PUSH] Service worker ready: scope=${registration.scope}, controller=${!!navigator.serviceWorker.controller}`);
    
    // Get messaging instance
    const messaging = getMessagingInstance();
    
    // Generate token with VAPID key and service worker registration  
    console.debug('[PUSH] Generating FCM token with hardcoded VAPID...');
    const token = await getToken(messaging, {
      vapidKey: VAPID_PUBLIC_KEY, // use hardcoded VAPID
      serviceWorkerRegistration: registration
    });
    
    if (!token || token === '') {
      throw new Error('No FCM token generated - may need app installation on iOS');
    }
    
    console.debug(`[PUSH] Token generated: length=${token.length}, prefix=${token.substring(0, 8)}..., suffix=...${token.slice(-8)}`);
    
    // Validate token format (relaxed)
    if (!validateToken(token)) {
      throw new Error('Invalid FCM token format');
    }
    
    return token;
    
  } catch (error: any) {
    console.error('[PUSH] SW registration/token generation failed:', error);
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
  platform: 'ios' | 'android' | 'desktop';
  deviceInfo: any;
}): Promise<void> {
  console.debug('[PUSH] Saving token to database...');
  
  // Validate UUID - STRICT requirement for user_id
  if (!validateUUID(userId)) {
    throw new Error(`Invalid userId UUID format: ${userId}`);
  }
  
  // Validate token - RELAXED: accept any non-empty string
  if (!validateToken(token)) {
    throw new Error('Invalid FCM token format');
  }
  
  // Normalize platform to exactly 'ios', 'android', or 'desktop'
  const normalizedPlatform = platform.toLowerCase() as 'ios' | 'android' | 'desktop';
  
  console.debug('[PUSH] DB upsert request:', {
    user_id: userId.substring(0, 8) + '...',
    token_length: token.length,
    token_prefix: token.substring(0, 8) + '...',
    token_suffix: '...' + token.slice(-8),
    platform: normalizedPlatform,
    device_info_keys: Object.keys(deviceInfo || {}),
    is_active: true
  });
  
  try {
    // Use new RPC function for reliable upsert
    const { data, error } = await supabase.rpc('upsert_fcm_subscription', {
      p_user_id: userId,
      p_token: token,
      p_platform: normalizedPlatform,
      p_device_info: deviceInfo || {}
    });
    
    if (error) {
      console.error('[PUSH] Database RPC error:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.debug('[PUSH] RPC response:', data);
    
    if (data && typeof data === 'object' && 'success' in data && !data.success) {
      const errorMsg = typeof data === 'object' && 'error' in data ? data.error : 'Database operation failed';
      throw new Error(errorMsg as string);
    }
    
    console.debug('[PUSH] Token saved successfully via RPC');
    
  } catch (error: any) {
    console.error('[PUSH] Save token failed:', error);
    
    // Improve error messages for user (FIXED: no more pattern errors)
    let userMessage = error.message;
    if (userMessage.includes('uuid')) {
      userMessage = 'Serve login per attivare le notifiche';
    } else if (userMessage.includes('The string did not match the expected pattern')) {
      userMessage = 'Token FCM non valido - riprova l\'attivazione';
    } else if (userMessage.includes('pattern') || userMessage.includes('regex')) {
      userMessage = 'Errore validazione token - contatta supporto';
    }
    
    throw new Error(userMessage);
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
    console.debug('[PUSH] Starting push notification setup...');

    // 1. Get authenticated user with UUID validation
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;
    if (!userId) {
      console.error('[PUSH] User not authenticated');
      return { success: false, error: 'Serve login' };
    }
    
    // Guard: ensure userId is proper UUID
    if (!validateUUID(userId)) {
      console.error('[PUSH] Invalid user UUID format:', userId);
      return { success: false, error: 'Serve login per attivare le notifiche' };
    }
    
    console.debug('[PUSH] User authenticated:', userId.substring(0, 8) + '...');

    // 2. Log current environment state
    const isStandaloneMode = isStandalone();
    const currentPermission = Notification.permission;
    const swController = navigator.serviceWorker?.controller;
    
    console.debug('[PUSH] Environment state:', {
      isStandalone: isStandaloneMode,
      permission: currentPermission,
      hasSwController: !!swController,
      swControllerScope: swController?.scriptURL,
      userAgent: navigator.userAgent.substring(0, 50) + '...'
    });

    // 3. Check if push is supported
    if (!isPushSupported()) {
      const error = 'Push notifications not supported in this browser';
      console.error('[PUSH]', error);
      return { success: false, error };
    }

    if (currentPermission === 'denied') {
      const error = 'Notifications blocked. Please enable in browser settings.';
      console.warn('[PUSH]', error);
      return { success: false, error, permission: currentPermission };
    }

    // 4. Request permission if not already granted
    let permission: NotificationPermission = currentPermission;
    if (permission === 'default') {
      console.debug('[PUSH] Requesting notification permission...');
      permission = await Notification.requestPermission();
      console.debug('[PUSH] Permission result:', permission);
    }
    
    if (permission !== 'granted') {
      const error = `Notification permission ${permission}`;
      console.warn('[PUSH]', error);
      return { success: false, error, permission };
    }

    // 5. Check if iOS user needs installation guide
    if (needsInstallGuide()) {
      console.debug('[PUSH] iOS user needs installation guide');
      return { 
        success: false, 
        requiresInstall: true,
        error: 'Su iOS installa l\'app nella Home (Aggiungi a Home) e riapri da Home per generare il token.',
        permission
      };
    }

    // 6. Generate FCM token with comprehensive logging
    console.debug('[PUSH] Generating FCM token...');
    const token = await registerSwAndGetToken({ vapidKey: VAPID_PUBLIC_KEY });
    
    if (!token || token === '') {
      console.error('[PUSH] No token generated');
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
      isStandalone: isStandaloneMode,
      url: window.location.href
    };
    
    console.debug('[PUSH] Token details before save:', {
      userId: userId.substring(0, 8) + '...',
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 8) + '...',
      tokenSuffix: '...' + token.slice(-8),
      platform,
      isStandalone: isStandaloneMode
    });
    
    // 8. Save token to database using RPC
    await saveTokenToDB({ userId, token, platform, deviceInfo });

    // 9. Setup foreground message listener
    setupForegroundMessageListener();

    console.debug('[PUSH] Push notifications enabled successfully!');
    return { 
      success: true, 
      token,
      permission
    };

  } catch (error: any) {
    console.error('[M1SSION FCM][Enable] Full error:', error);
    
    // Enhanced error message processing
    let userMessage = error.message || 'Unknown error occurred';
    
    // Handle specific error patterns
    if (userMessage.includes('pattern') || userMessage.includes('regex')) {
      userMessage = 'Formato token non valido - riprova';
    } else if (userMessage.includes('uuid')) {
      userMessage = 'Serve login per attivare le notifiche';
    } else if (userMessage.includes('permission')) {
      userMessage = 'Permessi notifiche richiesti';
    }
    
    console.debug('[M1SSION FCM] User-friendly error:', userMessage);
    
    return { 
      success: false, 
      error: userMessage,
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