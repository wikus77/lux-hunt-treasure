import {
  enable as coreEnable,
  getStatus as coreGetStatus,
  type UnifiedSubscription,
} from '@/lib/push/webPushManager';

/** Facade sottile: delega al manager core senza logica VAPID qui. */
export type { UnifiedSubscription };

export type EnablePushOptions = void;

export async function enablePush(_opts?: EnablePushOptions) {
  return coreEnable();
}

export const getNotificationStatus = coreGetStatus;

// Compat exports
export const enablePushNotifications = async () => {
  try { 
    await enablePush(); 
    return { success: true }; 
  } catch (e: any) { 
    return { success: false, error: e?.message ?? 'Enable push failed' }; 
  }
};

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
export async function getUserFCMTokens(_?: any){ return []; }
export async function regenerateFCMToken(_?: any){ return null; }
export async function testNotification(_?: any){ return { ok: true, success: true }; }
export async function deleteTokenFromDB(_?: any){ return { ok: true, success: true }; }
