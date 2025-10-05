// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Unified Web Push Manager - W3C Standard

import { supabase } from '@/integrations/supabase/client';
import { hapticManager } from '@/utils/haptics';

// Convert base64url VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Check if browser supports Web Push
export function isWebPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

// Check if running as PWA (iOS requires this)
export function isPWAMode(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

// Get VAPID public key from environment
export function getVAPIDKey(): string {
  const key = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!key) {
    throw new Error('VITE_VAPID_PUBLIC_KEY not configured in .env');
  }
  return key;
}

// Subscribe to Web Push notifications
export async function subscribeToWebPush(userId?: string): Promise<PushSubscription> {
  console.log('[WEBPUSH] Starting subscription process...');
  
  // Check support
  if (!isWebPushSupported()) {
    throw new Error('Web Push not supported in this browser');
  }
  
  // iOS requires PWA mode
  const isIOS = /iphone|ipod|ipad/i.test(navigator.userAgent);
  if (isIOS && !isPWAMode()) {
    throw new Error('On iOS, add this app to your home screen first');
  }
  
  // Request permission
  console.log('[WEBPUSH] Requesting notification permission...');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error(`Notification permission ${permission}`);
  }
  console.log('[WEBPUSH] ✅ Permission granted');
  
  // Trigger haptic feedback on permission granted
  hapticManager.trigger('success');
  
  // Register service worker
  console.log('[WEBPUSH] Registering service worker...');
  let registration: ServiceWorkerRegistration;
  
  try {
    registration = await navigator.serviceWorker.register('/sw.js', { 
      scope: '/' 
    });
    await navigator.serviceWorker.ready;
    console.log('[WEBPUSH] ✅ Service worker registered');
  } catch (error) {
    console.error('[WEBPUSH] ❌ Service worker registration failed:', error);
    throw new Error('Failed to register service worker');
  }
  
  // Wait for controller (important for iOS)
  if (!navigator.serviceWorker.controller) {
    console.log('[WEBPUSH] Waiting for service worker controller...');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Get VAPID key
  const vapidKey = getVAPIDKey();
  const applicationServerKey = urlBase64ToUint8Array(vapidKey);
  
  // Subscribe to push
  console.log('[WEBPUSH] Subscribing to push...');
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey as unknown as BufferSource,
  });
  
  console.log('[WEBPUSH] ✅ Push subscription created');
  console.log('[WEBPUSH] Endpoint:', subscription.endpoint.substring(0, 50) + '...');
  
  // Save to database
  await saveSubscriptionToDatabase(subscription, userId);
  
  // Trigger haptic feedback on successful subscription
  hapticManager.trigger('success');
  
  return subscription;
}

// Unsubscribe from Web Push
export async function unsubscribeFromWebPush(): Promise<boolean> {
  console.log('[WEBPUSH] Unsubscribing...');
  
  if (!isWebPushSupported()) {
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      const endpoint = subscription.endpoint;
      
      // Unsubscribe from browser
      await subscription.unsubscribe();
      console.log('[WEBPUSH] ✅ Browser unsubscribed');
      
      // Delete from database
      await deleteSubscriptionFromDatabase(endpoint);
      console.log('[WEBPUSH] ✅ Database record deleted');
      
      // Trigger haptic feedback
      hapticManager.trigger('error');
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[WEBPUSH] ❌ Unsubscribe error:', error);
    throw error;
  }
}

// Get current subscription status
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!isWebPushSupported()) {
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('[WEBPUSH] Error getting subscription:', error);
    return null;
  }
}

// Save subscription to database
async function saveSubscriptionToDatabase(
  subscription: PushSubscription, 
  userId?: string
): Promise<void> {
  console.log('[WEBPUSH] Saving subscription to database...');
  
  const { data: { user } } = await supabase.auth.getUser();
  const finalUserId = userId || user?.id;
  
  if (!finalUserId) {
    console.warn('[WEBPUSH] No user ID, skipping database save');
    return;
  }
  
  const subscriptionJson = subscription.toJSON();
  const keys = subscriptionJson.keys as { p256dh: string; auth: string };
  
  // Determine platform from endpoint
  let platform = 'web';
  if (subscription.endpoint.includes('web.push.apple.com')) {
    platform = 'ios';
  } else if (subscription.endpoint.includes('android.googleapis.com')) {
    platform = 'android';
  }
  
  const { error } = await supabase
    .from('push_tokens')
    .upsert({
      user_id: finalUserId,
      token: subscription.endpoint,
      platform,
      endpoint: subscription.endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      is_active: true,
    }, {
      onConflict: 'token',
      ignoreDuplicates: false
    });
  
  if (error) {
    console.error('[WEBPUSH] ❌ Database save error:', error);
    throw new Error(`Failed to save subscription: ${error.message}`);
  }
  
  console.log('[WEBPUSH] ✅ Subscription saved to database');
}

// Delete subscription from database
async function deleteSubscriptionFromDatabase(endpoint: string): Promise<void> {
  const { error } = await supabase
    .from('push_tokens')
    .delete()
    .eq('endpoint', endpoint);
  
  if (error) {
    console.error('[WEBPUSH] ❌ Database delete error:', error);
    throw error;
  }
}

// Export for backward compatibility
export const webPushManager = {
  isSupported: isWebPushSupported,
  isPWA: isPWAMode,
  subscribe: subscribeToWebPush,
  unsubscribe: unsubscribeFromWebPush,
  getCurrent: getCurrentSubscription,
};
