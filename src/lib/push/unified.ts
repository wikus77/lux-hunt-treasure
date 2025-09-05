/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Unified Push Manager - Complete Push System
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { supabase } from '@/integrations/supabase/client';
import { initFcmAndGetToken } from './initFcm';
import { ensureWebPushSubscription } from './subscribe';

export interface UnifiedPushSubscription {
  type: 'web_push' | 'fcm' | 'native';
  subscription: PushSubscription | string | null;
  platform: 'web' | 'ios' | 'android' | 'desktop';
  success: boolean;
  error?: string;
}

/**
 * Universal push subscription manager
 * Handles Web Push API, FCM, and native subscriptions
 */
export class UnifiedPushManager {
  private static instance: UnifiedPushManager;
  private isInitialized = false;
  private currentSubscription: UnifiedPushSubscription | null = null;

  static getInstance(): UnifiedPushManager {
    if (!UnifiedPushManager.instance) {
      UnifiedPushManager.instance = new UnifiedPushManager();
    }
    return UnifiedPushManager.instance;
  }

  /**
   * Initialize and subscribe based on platform capabilities
   */
  async subscribe(): Promise<UnifiedPushSubscription> {
    console.log('🚀 [UnifiedPushManager] Starting subscription process...');

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn('❌ User not authenticated');
      return {
        type: 'web_push',
        subscription: null,
        platform: 'web',
        success: false,
        error: 'User not authenticated'
      };
    }

    // Platform detection
    const platform = this.detectPlatform();
    console.log(`📱 Platform detected: ${platform}`);

    try {
      let result: UnifiedPushSubscription;

      switch (platform) {
        case 'ios':
          result = await this.subscribeIOS();
          break;
        case 'android':
          result = await this.subscribeAndroid();
          break;
        case 'desktop':
        default:
          result = await this.subscribeDesktop();
          break;
      }

      // Save subscription to database
      if (result.success && result.subscription) {
        await this.saveToDatabase(result);
      }

      this.currentSubscription = result;
      this.isInitialized = true;

      console.log('✅ [UnifiedPushManager] Subscription completed:', result);
      return result;

    } catch (error) {
      console.error('❌ [UnifiedPushManager] Subscription failed:', error);
      const errorResult: UnifiedPushSubscription = {
        type: 'web_push',
        subscription: null,
        platform,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      this.currentSubscription = errorResult;
      return errorResult;
    }
  }

  /**
   * iOS Push Subscription (Web Push API)
   */
  private async subscribeIOS(): Promise<UnifiedPushSubscription> {
    console.log('🍎 [iOS] Starting subscription...');

    try {
      const subscription = await ensureWebPushSubscription();
      
      return {
        type: 'web_push',
        subscription,
        platform: 'ios',
        success: subscription !== null
      };
    } catch (error) {
      console.error('❌ [iOS] Subscription failed:', error);
      return {
        type: 'web_push',
        subscription: null,
        platform: 'ios',
        success: false,
        error: error instanceof Error ? error.message : 'iOS subscription failed'
      };
    }
  }

  /**
   * Android Push Subscription (FCM)
   */
  private async subscribeAndroid(): Promise<UnifiedPushSubscription> {
    console.log('🤖 [Android] Starting subscription...');

    try {
      const token = await initFcmAndGetToken();
      
      return {
        type: 'fcm',
        subscription: token,
        platform: 'android',
        success: token !== null
      };
    } catch (error) {
      console.error('❌ [Android] Subscription failed:', error);
      return {
        type: 'fcm',
        subscription: null,
        platform: 'android',
        success: false,
        error: error instanceof Error ? error.message : 'Android subscription failed'
      };
    }
  }

  /**
   * Desktop Push Subscription (Web Push API + FCM hybrid)
   */
  private async subscribeDesktop(): Promise<UnifiedPushSubscription> {
    console.log('💻 [Desktop] Starting subscription...');

    try {
      // Try FCM first for better reliability
      const fcmToken = await initFcmAndGetToken();
      
      if (fcmToken) {
        console.log('✅ [Desktop] FCM subscription successful');
        return {
          type: 'fcm',
          subscription: fcmToken,
          platform: 'desktop',
          success: true
        };
      }

      // Fallback to Web Push API
      console.log('⚡ [Desktop] Falling back to Web Push API...');
      const webPushSubscription = await ensureWebPushSubscription();
      
      return {
        type: 'web_push',
        subscription: webPushSubscription,
        platform: 'desktop',
        success: webPushSubscription !== null
      };

    } catch (error) {
      console.error('❌ [Desktop] Subscription failed:', error);
      return {
        type: 'web_push',
        subscription: null,
        platform: 'desktop',
        success: false,
        error: error instanceof Error ? error.message : 'Desktop subscription failed'
      };
    }
  }

  /**
   * Save subscription to database
   */
  private async saveToDatabase(subscription: UnifiedPushSubscription): Promise<void> {
    try {
      console.log('💾 [Database] Saving subscription...');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      if (subscription.type === 'fcm' && typeof subscription.subscription === 'string') {
        // Save FCM token
        const result = await supabase.functions.invoke('upsert_fcm_subscription', {
          body: {
            user_id: session.user.id,
            token: subscription.subscription,
            platform: subscription.platform,
            device_info: {
              ua: navigator.userAgent,
              lang: navigator.language,
              platform: navigator.platform,
              timestamp: new Date().toISOString()
            }
          }
        });

        if (result.error) {
          throw new Error(`FCM save failed: ${result.error.message}`);
        }

        console.log('✅ [Database] FCM subscription saved');

      } else if (subscription.type === 'web_push' && subscription.subscription) {
        // Save Web Push subscription
        const webSub = subscription.subscription as PushSubscription;
        
        const { error } = await supabase.functions.invoke('push_register', {
          body: {
            subscription: {
              endpoint: webSub.endpoint,
              keys: {
                p256dh: this.arrayBufferToBase64(webSub.getKey('p256dh')),
                auth: this.arrayBufferToBase64(webSub.getKey('auth'))
              }
            },
            device_info: {
              ua: navigator.userAgent,
              lang: navigator.language,
              platform: navigator.platform,
              timestamp: new Date().toISOString()
            }
          }
        });

        if (error) {
          throw new Error(`Web Push save failed: ${error.message}`);
        }

        console.log('✅ [Database] Web Push subscription saved');
      }

    } catch (error) {
      console.error('❌ [Database] Save failed:', error);
      // Don't throw here - subscription can work without database save
    }
  }

  /**
   * Detect platform based on user agent and capabilities
   */
  private detectPlatform(): 'web' | 'ios' | 'android' | 'desktop' {
    const ua = navigator.userAgent.toLowerCase();
    
    // iOS detection
    if (/ipad|iphone|ipod/.test(ua)) {
      return 'ios';
    }
    
    // Android detection
    if (/android/.test(ua)) {
      return 'android';
    }
    
    // Desktop/Web
    return 'desktop';
  }

  /**
   * Utility: Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) return '';
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Get current subscription status
   */
  getCurrentSubscription(): UnifiedPushSubscription | null {
    return this.currentSubscription;
  }

  /**
   * Check if manager is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Unsubscribe from all push notifications
   */
  async unsubscribe(): Promise<boolean> {
    try {
      console.log('🚫 [UnifiedPushManager] Unsubscribing...');

      // Unsubscribe from browser
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            await subscription.unsubscribe();
          }
        }
      }

      // Clear database entries
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', session.user.id);

        await supabase
          .from('fcm_subscriptions')
          .delete()
          .eq('user_id', session.user.id);
      }

      this.currentSubscription = null;
      this.isInitialized = false;

      console.log('✅ [UnifiedPushManager] Unsubscribed successfully');
      return true;

    } catch (error) {
      console.error('❌ [UnifiedPushManager] Unsubscribe failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const unifiedPushManager = UnifiedPushManager.getInstance();

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */