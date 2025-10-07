// Unified Web Push configuration for frontend
// © 2025 M1SSION™ – Single source of truth for VAPID

import { VAPID_PUBLIC_KEY, getAppServerKey } from '@/lib/vapid';

let cachedVapidB64: string | null = null;
let cachedVapidUint8: Uint8Array | null = null;

// Returns the base64url VAPID public key used by the whole app
export function getVAPIDPublicWeb(): string {
  if (!cachedVapidB64) cachedVapidB64 = VAPID_PUBLIC_KEY;
  return cachedVapidB64;
}

// Returns the validated Uint8Array for PushManager.subscribe
export async function getVAPIDUint8(): Promise<Uint8Array> {
  if (!cachedVapidUint8) cachedVapidUint8 = await getAppServerKey();
  return cachedVapidUint8;
}
