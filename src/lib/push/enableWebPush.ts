// Guard-safe facade: NIENTE VAPID QUI.
// Delega la logica a webPushManager (che usa il loader canonico).
import { subscribeWebPushAndSave } from '@/lib/push/webPushManager';
import type { WebPushSubscriptionPayload } from '@/lib/push/webPushManager';

export async function enableWebPush(): Promise<WebPushSubscriptionPayload> {
  const reg = await navigator.serviceWorker.ready;
  return subscribeWebPushAndSave(reg);
}

export default enableWebPush;
