// property of team joseph & aldo, M1SSION devtools, generative ai code-signed via Lovable by Joseph G. for user J.A.
// FCM Push Notifications Enable - Request permission and manage tokens

import { getToken } from 'firebase/messaging';
import { supabase } from '@/integrations/supabase/client';
import { getMessagingInstance } from '@/lib/firebase';

export interface PushEnableResult {
  success: boolean;
  token?: string;
  error?: string;
  requiresInstall?: boolean;
}

// Detect if running in standalone mode (iOS PWA)
export const isStandalone = (): boolean => {
  return (
    typeof window !== 'undefined' && 
    (window.matchMedia('(display-mode: standalone)').matches ||
     (window.navigator as any).standalone === true)
  );
};

// Detect iOS
export const isIOS = (): boolean => {
  return typeof window !== 'undefined' && 
         /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// Detect browser platform
export const detectPlatform = (): 'ios' | 'android' | 'desktop' | 'unknown' => {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/ipad|iphone|ipod/.test(userAgent)) return 'ios';
  if (/android/.test(userAgent)) return 'android';
  if (/windows|macintosh|linux/.test(userAgent)) return 'desktop';
  
  return 'unknown';
};

// Check if push notifications are supported
export const isPushSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'Notification' in window &&
    'PushManager' in window
  );
};

// Check if needs "Add to Home Screen" guide (iOS only)
export const needsInstallGuide = (): boolean => {
  return isIOS() && !isStandalone();
};

// Register service worker
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker not supported');
  }

  try {
    // Ensure firebase-messaging-sw.js is registered
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });
    
    await navigator.serviceWorker.ready;
    console.log('🔥 Service Worker registered for FCM');
    
    return registration;
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
    throw error;
  }
};

// Get FCM token with VAPID key
export const getFCMToken = async (): Promise<string | null> => {
  const messaging = await getMessagingInstance();
  if (!messaging) {
    throw new Error('Firebase messaging not initialized');
  }

  try {
    // Ensure service worker is registered
    const registration = await registerServiceWorker();
    
    // Get token with VAPID key and service worker registration
    const vapidKey = import.meta.env.VITE_FCM_VAPID_PUBLIC_KEY || 
                    "BBjgzWK_1_PBZXGLQb-xQjSEUH5jLsNNgx8N0LgOcKUkZeCUaNV_gRE-QM5pKS2bPKUhVJLn0Q-H3BNGnOOjy8Q";
    
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration
    });

    if (!token) {
      throw new Error('No FCM token received - check VAPID key and browser support');
    }

    console.log('✅ FCM Token generated:', token.substring(0, 20) + '...');
    return token;

  } catch (error) {
    console.error('❌ FCM Token generation failed:', error);
    throw error;
  }
};

// Save FCM token to Supabase
export const saveFCMToken = async (token: string, userId: string): Promise<void> => {
  const platform = detectPlatform();
  const deviceInfo = {
    userAgent: navigator.userAgent,
    standalone: isStandalone(),
    platform,
    timestamp: new Date().toISOString()
  };

  try {
    // Upsert token (insert or update if exists)
    const { error } = await supabase
      .from('fcm_subscriptions')
      .upsert({
        user_id: userId,
        token,
        platform,
        device_info: deviceInfo,
        is_active: true
      }, {
        onConflict: 'token'
      });

    if (error) {
      throw error;
    }

    console.log('✅ FCM Token saved to database');
  } catch (error) {
    console.error('❌ Error saving FCM token:', error);
    throw error;
  }
};

// Request notification permission and enable push
export const enablePushNotifications = async (userId: string): Promise<PushEnableResult> => {
  try {
    // Check support
    if (!isPushSupported()) {
      return {
        success: false,
        error: 'Push notifications not supported in this browser'
      };
    }

    // Check if iOS needs install guide
    if (needsInstallGuide()) {
      return {
        success: false,
        requiresInstall: true,
        error: 'Please add M1SSION to Home Screen first (iOS requirement)'
      };
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      return {
        success: false,
        error: `Notification permission ${permission}`
      };
    }

    // Get FCM token
    const token = await getFCMToken();
    
    if (!token) {
      return {
        success: false,
        error: 'Failed to generate FCM token'
      };
    }

    // Save to database
    await saveFCMToken(token, userId);

    return {
      success: true,
      token
    };

  } catch (error) {
    console.error('❌ Enable push notifications failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Get current notification permission status
export const getNotificationStatus = () => {
  if (!isPushSupported()) {
    return {
      supported: false,
      permission: 'unsupported' as NotificationPermission,
      needsInstall: false
    };
  }

  return {
    supported: true,
    permission: Notification.permission,
    needsInstall: needsInstallGuide()
  };
};

// Check if user has active FCM subscription
export const hasActiveFCMSubscription = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('fcm_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1);

    if (error) {
      console.error('Error checking FCM subscription:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Error checking FCM subscription:', error);
    return false;
  }
};