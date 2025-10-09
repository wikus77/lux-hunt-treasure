import {
  enableWebPush as coreEnableWebPush,
  getNotificationStatus,
  type UnifiedSubscription,
} from '@/lib/push/webPushManager';

/** Facade sottile: delega al manager core senza logica VAPID qui. */
export type { UnifiedSubscription };

export type EnablePushOptions = Parameters<typeof coreEnableWebPush>[0];

export async function enablePush(opts?: EnablePushOptions) {
  return coreEnableWebPush(opts);
}

export { getNotificationStatus };
