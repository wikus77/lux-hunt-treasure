import {
  enableWebPush,
  getNotificationStatus,
  type UnifiedSubscription,
} from '@/lib/push/webPushManager';

export type { UnifiedSubscription };

export async function enablePush() {
  return enableWebPush();
}

export { getNotificationStatus };
