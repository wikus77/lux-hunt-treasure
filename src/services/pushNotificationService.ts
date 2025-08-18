// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Unified Push Notification Service - Firebase FCM + APNs

import { supabase } from '@/integrations/supabase/client';

interface PushNotificationConfig {
  title: string;
  body: string;
  data?: Record<string, any>;
  url?: string;
}

class PushNotificationService {
  private vapidKey = 'BECYJp0aTJt5S4zKz3Z9s6tZ_L6VLdXJ8WxXqG9GJZ1G7TZzNxTZfJZgU8X9J7X';
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      // Check browser support
      if (!('serviceWorker' in navigator && 'PushManager' in window)) {
        console.warn('Push notifications not supported');
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered:', registration);
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Push service initialization failed:', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    let permission = Notification.permission;
    
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    return permission;
  }

  async subscribeToNotifications(userId: string): Promise<boolean> {
    try {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return false;
      }

      await this.initialize();
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.vapidKey
      });

      // Store subscription in Supabase
      const { error } = await supabase
        .from('device_tokens')
        .upsert({
          user_id: userId,
          token: JSON.stringify(subscription),
          device_type: this.getDeviceType(),
          last_used: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to store subscription:', error);
        return false;
      }

      console.log('✅ Push notifications subscribed successfully');
      return true;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return false;
    }
  }

  async sendNotification(config: PushNotificationConfig): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: config.title,
          body: config.body,
          data: config.data,
          url: config.url
        }
      });

      if (error) {
        console.error('Failed to send notification:', error);
        return false;
      }

      return data?.success || false;
    } catch (error) {
      console.error('Notification send error:', error);
      return false;
    }
  }

  private getDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(userAgent)) return 'ios';
    if (/Android/.test(userAgent)) return 'android';
    if (/Windows/.test(userAgent)) return 'windows';
    if (/Macintosh/.test(userAgent)) return 'macos';
    return 'web';
  }

  async unsubscribe(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Push notifications unsubscribed');
      }
      
      return true;
    } catch (error) {
      console.error('Unsubscribe failed:', error);
      return false;
    }
  }

  async getSubscriptionStatus(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator)) return false;
      
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      return !!subscription;
    } catch (error) {
      console.error('Subscription status check failed:', error);
      return false;
    }
  }
}

export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;