import type { WebPushSubscriptionPayload } from '@/lib/push/webPushManager';
import { subscribeWebPushAndSave } from '@/lib/push/webPushManager';

/**
 * iOS Web Push helper (Guard-safe):
 * nessun riferimento a VAPID; delega la subscription al manager canonico.
 */
export async function ensureIOSWebPushSubscription(): Promise<WebPushSubscriptionPayload> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push non supportato sul browser corrente');
  }
  const reg = await navigator.serviceWorker.ready;
  return subscribeWebPushAndSave(reg);
}
