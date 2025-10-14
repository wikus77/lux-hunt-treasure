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

// Compat exports
export const enablePushNotifications = enablePush;

export function needsInstallGuide(): boolean {
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isPWA = window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone === true;
  return isIOS && !isPWA;
}
export function isIOS(): boolean { return /iPhone|iPad|iPod/.test(navigator.userAgent); }
export function isStandalone(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone === true;
}

// Segnaposto compat (NO token/URL nel FE, nessun hardcode)
export async function getUserFCMTokens(_userId: string){ return []; }
export async function regenerateFCMToken(_userId: string){ return null; }
export async function testNotification(_userId: string){ return { ok: true }; }
export async function deleteTokenFromDB(_token: string){ return { ok: true }; }
