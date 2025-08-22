// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
// FCM Push Registration & Token Management

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { supabase } from '@/integrations/supabase/client';
import { messaging } from '@/lib/firebase';
import type { MessagePayload } from 'firebase/messaging';

// VAPID Key from environment - NO FALLBACK
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_PUBLIC_KEY;

if (!VAPID_KEY) {
  throw new Error('VITE_FIREBASE_VAPID_PUBLIC_KEY environment variable is required');
}

// Service Worker registration with proper scope validation
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  try {
    if (!('serviceWorker' in navigator)) {
      console.warn('❌ FCM-REGISTER: Service Workers not supported');
      return null;
    }

    // Register or get existing FCM service worker with explicit scope
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });
    
    console.log('✅ FCM-REGISTER: Service Worker registered with scope:', registration.scope);
    
    // Wait for service worker to be ready
    if (registration.installing) {
      await new Promise(resolve => {
        registration.installing!.addEventListener('statechange', function() {
          if (this.state === 'activated') resolve(true);
        });
      });
    }
    
    // Ensure service worker is active
    if (!registration.active) {
      await new Promise(resolve => {
        const checkActive = () => {
          if (registration.active) {
            resolve(true);
          } else {
            setTimeout(checkActive, 100);
          }
        };
        checkActive();
      });
    }
    
    console.log('✅ FCM-REGISTER: Service Worker is active and ready');
    return registration;
    
  } catch (error) {
    console.error('❌ FCM-REGISTER: Service Worker registration failed:', error);
    return null;
  }
};

// Request notification permissions
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  try {
    if (!('Notification' in window)) {
      console.warn('❌ FCM-REGISTER: Notifications not supported');
      return 'denied';
    }

    // Check current permission
    let permission = Notification.permission;
    
    // Request permission if not granted
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    
    console.log(`📋 FCM-REGISTER: Permission status: ${permission}`);
    return permission;
  } catch (error) {
    console.error('❌ FCM-REGISTER: Permission request failed:', error);
    return 'denied';
  }
};

// Generate FCM token
export const generateFCMToken = async (serviceWorkerRegistration?: ServiceWorkerRegistration): Promise<string | null> => {
  try {
    if (!messaging) {
      console.error('❌ FCM-REGISTER: Firebase messaging not initialized');
      return null;
    }

    if (!VAPID_KEY) {
      console.error('❌ FCM-REGISTER: VAPID key not configured');
      return null;
    }

    console.log('🔄 FCM-REGISTER: Generating token with ENV VAPID key...');
    const tokenOptions: any = { vapidKey: VAPID_KEY };
    if (serviceWorkerRegistration) {
      tokenOptions.serviceWorkerRegistration = serviceWorkerRegistration;
    }
    
    const token = await getToken(messaging, tokenOptions);
    
    if (token) {
      console.log('✅ FCM-REGISTER: Token generated successfully', token.substring(0, 20) + '...');
      return token;
    } else {
      console.warn('⚠️ FCM-REGISTER: No registration token available');
      return null;
    }
  } catch (error) {
    console.error('❌ FCM-REGISTER: Token generation failed:', error);
    return null;
  }
};

// Save token to Supabase
export const saveTokenToDatabase = async (token: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const tokenData = {
      token,
      platform: 'web' as const,
      user_id: user?.id || null,
    };

    console.log('💾 FCM-REGISTER: Saving token to database...', { 
      hasUser: !!user, 
      tokenPrefix: token.substring(0, 20) + '...' 
    });

    const { error } = await supabase
      .from('push_tokens')
      .upsert(tokenData, { 
        onConflict: 'token',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('❌ FCM-REGISTER: Database save failed:', error);
      return false;
    }

    console.log('✅ FCM-REGISTER: Token saved to database successfully');
    return true;
  } catch (error) {
    console.error('❌ FCM-REGISTER: Database operation failed:', error);
    return false;
  }
};

// Setup foreground message listener
export const setupForegroundListener = (
  onMessageReceived?: (payload: MessagePayload) => void
) => {
  try {
    if (!messaging) {
      console.error('❌ FCM-REGISTER: Firebase messaging not initialized for foreground listener');
      return null;
    }

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('📨 FCM-REGISTER: Foreground message received:', payload);
      
      // Default toast notification
      if (payload.notification) {
        // You can integrate with your toast system here
        console.log(`🔔 Notification: ${payload.notification.title} - ${payload.notification.body}`);
      }
      
      // Call custom handler if provided
      if (onMessageReceived) {
        onMessageReceived(payload);
      }
    });

    console.log('✅ FCM-REGISTER: Foreground listener setup');
    return unsubscribe;
  } catch (error) {
    console.error('❌ FCM-REGISTER: Foreground listener setup failed:', error);
    return null;
  }
};

// Main registration function
export const registerPush = async (
  onMessageReceived?: (payload: MessagePayload) => void
): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> => {
  try {
    console.log('🚀 FCM-REGISTER: Starting push registration process...');

    // Step 1: Register Service Worker with explicit registration return
    const swRegistration = await registerServiceWorker();
    if (!swRegistration) {
      return { 
        success: false, 
        error: 'Service Worker registration failed' 
      };
    }

    // Step 2: Request Permission
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      return { 
        success: false, 
        error: `Notification permission ${permission}` 
      };
    }

    // Step 3: Generate Token with explicit SW registration
    const token = await generateFCMToken(swRegistration);
    if (!token) {
      return { 
        success: false, 
        error: 'Failed to generate FCM token - check VAPID key configuration' 
      };
    }

    // Step 4: Save to Database
    const saved = await saveTokenToDatabase(token);
    if (!saved) {
      return { 
        success: false, 
        error: 'Failed to save token to database' 
      };
    }

    // Step 5: Setup Foreground Listener
    setupForegroundListener(onMessageReceived);

    console.log('🎉 FCM-REGISTER: Push registration completed successfully!');
    return { 
      success: true, 
      token 
    };

  } catch (error) {
    console.error('❌ FCM-REGISTER: Registration process failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Check if FCM is supported
export const isFCMSupported = (): boolean => {
  return typeof window !== 'undefined' && 
         'serviceWorker' in navigator && 
         'Notification' in window;
};

// Get current permission status
export const getPermissionStatus = (): NotificationPermission => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
};

// Check if user has saved tokens
export const getUserTokens = async (): Promise<number> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from('push_tokens')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (error) {
      console.error('❌ FCM-REGISTER: Failed to get user tokens:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('❌ FCM-REGISTER: Failed to check user tokens:', error);
    return 0;
  }
};